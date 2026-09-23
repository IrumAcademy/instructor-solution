const { Hono } = require('hono');
const { db } = require('../db');
const { requireAuth } = require('../auth');
const youtube = require('../services/youtube');
const vimeo = require('../services/vimeo');
const { isNonEmptyString } = require('../validate');

const router = new Hono();

const PROVIDERS = { youtube, vimeo };

async function syncSource(env, d, instructorId, source) {
  const provider = PROVIDERS[source.provider];
  const videos = await provider.fetchVideos(source.channel_id, env);

  const upsert = d.prepare(`
    INSERT INTO videos (instructor_id, provider, external_id, title, thumbnail_url, embed_url)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT (instructor_id, provider, external_id)
    DO UPDATE SET title = excluded.title, thumbnail_url = excluded.thumbnail_url, embed_url = excluded.embed_url
  `);
  for (const v of videos) {
    await upsert.run(instructorId, source.provider, v.externalId, v.title, v.thumbnailUrl, v.embedUrl);
  }

  await d.prepare("UPDATE video_sources SET last_synced_at = datetime('now') WHERE id = ?").run(source.id);
  return videos.length;
}

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

  try {
    const count = await syncSource(c.env, d, instructorId, source);
    return c.json({ provider, channelId, syncedVideoCount: count }, 201);
  } catch (err) {
    return c.json({ error: `Connected but sync failed: ${err.message}` }, 502);
  }
});

router.post('/sync', requireAuth, async (c) => {
  const d = db(c.env.DB);
  const instructorId = c.get('instructorId');
  const sources = await d.prepare('SELECT * FROM video_sources WHERE instructor_id = ?').all(instructorId);
  if (sources.length === 0) {
    return c.json({ error: 'No video sources connected yet' }, 404);
  }

  const results = [];
  for (const source of sources) {
    try {
      const count = await syncSource(c.env, d, instructorId, source);
      results.push({ provider: source.provider, syncedVideoCount: count });
    } catch (err) {
      results.push({ provider: source.provider, error: err.message });
    }
  }

  return c.json({ results });
});

module.exports = router;
