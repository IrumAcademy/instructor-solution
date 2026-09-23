const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const rows = db
    .prepare(
      `SELECT id, provider, external_id, title, thumbnail_url, embed_url, course_id
       FROM videos ORDER BY created_at DESC`
    )
    .all();

  res.json(
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
