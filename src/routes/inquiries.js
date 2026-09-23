const express = require('express');
const db = require('../db');
const { requireAuth } = require('../auth');
const { isNonEmptyString, isPositiveInt } = require('../validate');

const router = express.Router();

router.post('/', (req, res) => {
  const { name, contact, message, courseId } = req.body || {};
  if (!isNonEmptyString(name, 100) || !isNonEmptyString(contact, 200) || !isNonEmptyString(message, 5000)) {
    return res.status(400).json({ error: 'name, contact and message must be non-empty strings' });
  }
  if (courseId !== undefined && courseId !== null && !isPositiveInt(courseId)) {
    return res.status(400).json({ error: 'courseId must be a positive integer' });
  }

  const instructor = db.prepare('SELECT id FROM instructors ORDER BY id LIMIT 1').get();
  if (!instructor) return res.status(404).json({ error: 'No instructor found' });

  let resolvedCourseId = null;
  if (courseId) {
    const course = db
      .prepare('SELECT id FROM courses WHERE id = ? AND instructor_id = ?')
      .get(courseId, instructor.id);
    if (!course) return res.status(404).json({ error: 'courseId does not reference an existing course' });
    resolvedCourseId = course.id;
  }

  db.prepare(
    'INSERT INTO inquiries (instructor_id, name, contact, message, course_id) VALUES (?, ?, ?, ?, ?)'
  ).run(instructor.id, name, contact, message, resolvedCourseId);

  res.status(201).end();
});

router.get('/', requireAuth, (req, res) => {
  const rows = db
    .prepare('SELECT * FROM inquiries WHERE instructor_id = ? ORDER BY created_at DESC')
    .all(req.instructorId);

  res.json(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      contact: r.contact,
      message: r.message,
      courseId: r.course_id,
      createdAt: r.created_at,
    }))
  );
});

module.exports = router;
