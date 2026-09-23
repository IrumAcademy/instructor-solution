const express = require('express');
const db = require('../db');
const { requireAuth } = require('../auth');
const { isNonEmptyString, isOptionalString } = require('../validate');

const router = express.Router();

function videoIdsFor(courseId) {
  return db
    .prepare('SELECT id FROM videos WHERE course_id = ? ORDER BY created_at DESC')
    .all(courseId)
    .map((r) => r.id);
}

function toPublic(course) {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    videoIds: videoIdsFor(course.id),
  };
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM courses ORDER BY created_at DESC').all();
  res.json(rows.map(toPublic));
});

router.post('/', requireAuth, (req, res) => {
  const { title, description } = req.body || {};
  if (!isNonEmptyString(title, 200)) {
    return res.status(400).json({ error: 'title must be a non-empty string (max 200 chars)' });
  }
  if (!isOptionalString(description, 5000)) {
    return res.status(400).json({ error: 'description must be a string (max 5000 chars)' });
  }

  const result = db
    .prepare('INSERT INTO courses (instructor_id, title, description) VALUES (?, ?, ?)')
    .run(req.instructorId, title, description || '');

  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(toPublic(course));
});

router.put('/:id', requireAuth, (req, res) => {
  const course = db
    .prepare('SELECT * FROM courses WHERE id = ? AND instructor_id = ?')
    .get(req.params.id, req.instructorId);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const { title, description } = req.body || {};
  if (title !== undefined && !isNonEmptyString(title, 200)) {
    return res.status(400).json({ error: 'title must be a non-empty string (max 200 chars)' });
  }
  if (!isOptionalString(description, 5000)) {
    return res.status(400).json({ error: 'description must be a string (max 5000 chars)' });
  }

  db.prepare('UPDATE courses SET title = ?, description = ? WHERE id = ?').run(
    title ?? course.title,
    description ?? course.description,
    course.id
  );

  res.json(toPublic(db.prepare('SELECT * FROM courses WHERE id = ?').get(course.id)));
});

router.delete('/:id', requireAuth, (req, res) => {
  const course = db
    .prepare('SELECT * FROM courses WHERE id = ? AND instructor_id = ?')
    .get(req.params.id, req.instructorId);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  db.prepare('DELETE FROM courses WHERE id = ?').run(course.id);
  res.status(204).end();
});

module.exports = router;
