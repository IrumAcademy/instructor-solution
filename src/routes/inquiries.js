const { Hono } = require('hono');
const { db } = require('../db');
const { requireAuth } = require('../auth');
const { isNonEmptyString, isPositiveInt } = require('../validate');

const router = new Hono();

router.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { name, contact, message, courseId } = body || {};
  if (!isNonEmptyString(name, 100) || !isNonEmptyString(contact, 200) || !isNonEmptyString(message, 5000)) {
    return c.json({ error: 'name, contact and message must be non-empty strings' }, 400);
  }
  if (courseId !== undefined && courseId !== null && !isPositiveInt(courseId)) {
    return c.json({ error: 'courseId must be a positive integer' }, 400);
  }

  const d = db(c.env.DB);
  const instructor = await d.prepare('SELECT id FROM instructors ORDER BY id LIMIT 1').get();
  if (!instructor) return c.json({ error: 'No instructor found' }, 404);

  let resolvedCourseId = null;
  if (courseId) {
    const course = await d
      .prepare('SELECT id FROM courses WHERE id = ? AND instructor_id = ?')
      .get(courseId, instructor.id);
    if (!course) return c.json({ error: 'courseId does not reference an existing course' }, 404);
    resolvedCourseId = course.id;
  }

  await d
    .prepare('INSERT INTO inquiries (instructor_id, name, contact, message, course_id) VALUES (?, ?, ?, ?, ?)')
    .run(instructor.id, name, contact, message, resolvedCourseId);

  return c.body(null, 201);
});

router.get('/', requireAuth, async (c) => {
  const d = db(c.env.DB);
  const rows = await d
    .prepare('SELECT * FROM inquiries WHERE instructor_id = ? ORDER BY created_at DESC')
    .all(c.get('instructorId'));

  return c.json(
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
