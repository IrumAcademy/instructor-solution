const express = require('express');
const db = require('../db');
const { requireAuth } = require('../auth');
const youtube = require('../services/youtube');
const vimeo = require('../services/vimeo');

const router = express.Router();

const PROVIDERS = { youtube, vimeo };

async function syncSource(instructorId, source) {
  const provider = PROVIDERS[source.provider];
  const videos = await provider.fetchVideos(source.channel_id);

  const upsert = db.prepare(`
    INSERT INTO videos (instructor_id, provider, external_id, title, thumbnail_url, embed_url)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT (instructor_id, provider, external_id)
    DO UPDATE SET title = excluded.title, thumbnail_url = excluded.thumbnail_url, embed_url = excluded.embed_url
  `);
  for (const v of videos) {
    upsert.run(instructorId, source.provider, v.externalId, v.title, v.thumbnailUrl, v.embedUrl);
  }

  db.prepare('UPDATE video_sources SET last_synced_at = datetime(\'now\') WHERE id = ?').run(source.id);
  return videos.length;
}

router.post('/', requireAuth, async (req, res) => {
  const { provider, channelId } = req.body || {};
  if (!['youtube', 'vimeo'].includes(provider) || !channelId) {
    return res.status(400).json({ error: 'provider must be "youtube" or "vimeo", channelId is required' });
  }

  db.prepare(`
    INSERT INTO video_sources (instructor_id, provider, channel_id)
    VALUES (?, ?, ?)
    ON CONFLICT (instructor_id, provider) DO UPDATE SET channel_id = excluded.channel_id
  `).run(req.instructorId, provider, channelId);

  const source = db
    .prepare('SELECT * FROM video_sources WHERE instructor_id = ? AND provider = ?')
    .get(req.instructorId, provider);

  try {
    const count = await syncSource(req.instructorId, source);
    res.status(201).json({ provider, channelId, syncedVideoCount: count });
  } catch (err) {
    res.status(502).json({ error: `Connected but sync failed: ${err.message}` });
  }
});

router.post('/sync', requireAuth, async (req, res) => {
  const sources = db.prepare('SELECT * FROM video_sources WHERE instructor_id = ?').all(req.instructorId);
  if (sources.length === 0) {
    return res.status(404).json({ error: 'No video sources connected yet' });
  }

  const results = [];
  for (const source of sources) {
    try {
      const count = await syncSource(req.instructorId, source);
      results.push({ provider: source.provider, syncedVideoCount: count });
    } catch (err) {
      results.push({ provider: source.provider, error: err.message });
    }
  }

  res.json({ results });
});

module.exports = router;
