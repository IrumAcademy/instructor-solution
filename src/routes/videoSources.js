const { Hono } = require('hono');
const { db } = require('../db');
const { requireAuth } = require('../auth');
const youtube = require('../services/youtube');
const vimeo = require('../services/vimeo');
const { isNonEmptyString } = require('../validate');

const router = new Hono({ strict: false });

const PROVIDERS = { youtube, vimeo };

// Workers Paid caps D1 queries at 1,000 per invocation (QA finding, PR #9).
// Leaves headroom for the route's own lookup/update queries across one or
// more sources in a single /sync call.
const MAX_D1_WRITES_PER_INVOCATION = 900;

// Only writes videos not already stored for this instructor+provider, so a
// channel bigger than one invocation's write budget makes forward progress
// across repeated /sync calls instead of re-processing the same slice every
// time. Trade-off: metadata (title/thumbnail) for already-synced videos is
// not refreshed until they'd otherwise need re-inserting.
async function syncSource(env, d, instructorId, source, budget) {
  const provider = PROVIDERS[source.provider];
  const videos = await provider.fetchVideos(source.channel_id, env);

  const existing = await d
    .prepare('SELECT external_id FROM videos WHERE instructor_id = ? AND provider = ?')
    .all(instructorId, source.provider);
  budget.remaining -= 1;
  const existingIds = new Set(existing.map((r) => r.external_id));
  const pending = videos.filter((v) => !existingIds.has(v.externalId));

  // -1 reserves the last_synced_at update below.
  const writeCount = Math.max(0, Math.min(pending.length, budget.remaining - 1));
  const toWrite = pending.slice(0, writeCount);

  if (toWrite.length > 0) {
    const upsert = d.prepare(`
      INSERT INTO videos (instructor_id, provider, external_id, title, thumbnail_url, embed_url)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT (instructor_id, provider, external_id)
      DO UPDATE SET title = excluded.title, thumbnail_url = excluded.thumbnail_url, embed_url = excluded.embed_url
    `);
    for (const v of toWrite) {
      await upsert.run(instructorId, source.provider, v.externalId, v.title, v.thumbnailUrl, v.embedUrl);
      budget.remaining -= 1;
    }
  }

  await d.prepare("UPDATE video_sources SET last_synced_at = datetime('now') WHERE id = ?").run(source.id);
  budget.remaining -= 1;

  return {
    syncedVideoCount: toWrite.length,
    totalVideoCount: videos.length,
    remainingVideoCount: pending.length - toWrite.length,
  };
}

router.get('/', requireAuth, async (c) => {
  const d = db(c.env.DB);
  const rows = await d
    .prepare('SELECT provider, channel_id, last_synced_at FROM video_sources WHERE instructor_id = ? ORDER BY provider')
    .all(c.get('instructorId'));

  return c.json(
    rows.map((r) => ({
      provider: r.provider,
      channelId: r.channel_id,
      lastSyncedAt: r.last_synced_at,
    }))
  );
});

router.post('/', requireAuth, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { provider, channelId } = body || {};
  if (!['youtube', 'vimeo'].includes(provider) || !isNonEmptyString(channelId, 200)) {
    return c.json(
      { error: 'provider must be "youtube" or "vimeo", channelId must be a non-empty string' },
      400
    );
  }

  const d = db(c.env.DB);
  const instructorId = c.get('instructorId');

  await d
    .prepare(
      `INSERT INTO video_sources (instructor_id, provider, channel_id)
       VALUES (?, ?, ?)
       ON CONFLICT (instructor_id, provider) DO UPDATE SET channel_id = excluded.channel_id`
    )
    .run(instructorId, provider, channelId);

  const source = await d
    .prepare('SELECT * FROM video_sources WHERE instructor_id = ? AND provider = ?')
    .get(instructorId, provider);

  // The video_sources row above is already committed at this point -- the
  // channel is connected regardless of whether the first sync succeeds.
  // Always answer 201 (a row really was created/updated) and surface a sync
  // failure via `syncError` in the body instead of an HTTP error status, so
  // the status code doesn't contradict what's actually in the database
  // (PM-Bee finding: a bad channelId returned 502 but still left a
  // connected row, which callers reasonably read as "connection failed").
  const budget = { remaining: MAX_D1_WRITES_PER_INVOCATION };
  try {
    const { syncedVideoCount, totalVideoCount, remainingVideoCount } = await syncSource(
      c.env,
      d,
      instructorId,
      source,
      budget
    );
    return c.json({ provider, channelId, syncedVideoCount, totalVideoCount, remainingVideoCount }, 201);
  } catch (err) {
    return c.json({ provider, channelId, syncedVideoCount: 0, syncError: err.message }, 201);
  }
});

router.post('/sync', requireAuth, async (c) => {
  const d = db(c.env.DB);
  const instructorId = c.get('instructorId');
  const sources = await d.prepare('SELECT * FROM video_sources WHERE instructor_id = ?').all(instructorId);
  if (sources.length === 0) {
    return c.json({ error: 'No video sources connected yet' }, 404);
  }

  const budget = { remaining: MAX_D1_WRITES_PER_INVOCATION };
  const results = [];
  for (const source of sources) {
    if (budget.remaining <= 2) {
      results.push({
        provider: source.provider,
        skipped: true,
        reason: 'D1 write budget exhausted for this call; call /sync again to continue',
      });
      continue;
    }
    try {
      const { syncedVideoCount, totalVideoCount, remainingVideoCount } = await syncSource(
        c.env,
        d,
        instructorId,
        source,
        budget
      );
      results.push({ provider: source.provider, syncedVideoCount, totalVideoCount, remainingVideoCount });
    } catch (err) {
      results.push({ provider: source.provider, error: err.message });
    }
  }

  return c.json({ results });
});

module.exports = router;
