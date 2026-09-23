const { Hono } = require('hono');
const { db } = require('../db');

const router = new Hono();

router.get('/', async (c) => {
  const d = db(c.env.DB);
  const rows = await d
    .prepare(
      `SELECT id, provider, external_id, title, thumbnail_url, embed_url, course_id
       FROM videos ORDER BY created_at DESC`
    )
    .all();

  return c.json(
    rows.map((v) => ({
      id: v.id,
      provider: v.provider,
      externalId: v.external_id,
      title: v.title,
      thumbnailUrl: v.thumbnail_url,
      embedUrl: v.embed_url,
      courseId: v.course_id,
    }))
  );
});

module.exports = router;
