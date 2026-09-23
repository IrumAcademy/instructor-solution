const express = require('express');
const db = require('../db');
const { requireAuth } = require('../auth');

const router = express.Router();

function toPublic(instructor) {
  return {
    name: instructor.name,
    bio: instructor.bio,
    avatarUrl: instructor.avatar_url,
    tagline: instructor.tagline,
  };
}

router.get('/', (req, res) => {
  const instructor = db.prepare('SELECT * FROM instructors ORDER BY id LIMIT 1').get();
  if (!instructor) return res.status(404).json({ error: 'No instructor found' });
  res.json(toPublic(instructor));
});

router.put('/', requireAuth, (req, res) => {
  const { name, bio, avatarUrl, tagline } = req.body || {};
  const instructor = db.prepare('SELECT * FROM instructors WHERE id = ?').get(req.instructorId);
  if (!instructor) return res.status(404).json({ error: 'Instructor not found' });

  db.prepare(
    `UPDATE instructors SET name = ?, bio = ?, avatar_url = ?, tagline = ? WHERE id = ?`
  ).run(
    name ?? instructor.name,
    bio ?? instructor.bio,
    avatarUrl ?? instructor.avatar_url,
    tagline ?? instructor.tagline,
    req.instructorId
  );

  const updated = db.prepare('SELECT * FROM instructors WHERE id = ?').get(req.instructorId);
  res.json(toPublic(updated));
});

module.exports = router;
