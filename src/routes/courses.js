const { Hono } = require('hono');
const { db } = require('../db');
const { requireAuth } = require('../auth');
const { isNonEmptyString, isOptionalString } = require('../validate');

const router = new Hono({ strict: false });

async function videoIdsFor(d, courseId) {
  const rows = await d.prepare('SELECT id FROM videos WHERE course_id = ? ORDER BY created_at DESC').all(courseId);
  return rows.map((r) => r.id);
}

async function toPublic(d, course) {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    videoIds: await videoIdsFor(d, course.id),
  };
}

router.get('/', async (c) => {
  const d = db(c.env.DB);
  const rows = await d.prepare('SELECT * FROM courses ORDER BY created_at DESC').all();
  return c.json(await Promise.all(rows.map((row) => toPublic(d, row))));
});

router.post('/', requireAuth, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { title, description } = body || {};
  if (!isNonEmptyString(title, 200)) {
    return c.json({ error: 'title must be a non-empty string (max 200 chars)' }, 400);
  }
  if (!isOptionalString(description, 5000)) {
    return c.json({ error: 'description must be a string (max 5000 chars)' }, 400);
  }

  const d = db(c.env.DB);
  const result = await d
    .prepare('INSERT INTO courses (instructor_id, title, description) VALUES (?, ?, ?)')
    .run(c.get('instructorId'), title, description || '');

  const course = await d.prepare('SELECT * FROM courses WHERE id = ?').get(result.lastInsertRowid);
  return c.json(await toPublic(d, course), 201);
});

router.put('/:id', requireAuth, async (c) => {
  const d = db(c.env.DB);
  const course = await d
    .prepare('SELECT * FROM courses WHERE id = ? AND instructor_id = ?')
    .get(c.req.param('id'), c.get('instructorId'));
  if (!course) return c.json({ error: 'Course not found' }, 404);

  const body = await c.req.json().catch(() => ({}));
  const { title, description } = body || {};
  if (title !== undefined && !isNonEmptyString(title, 200)) {
    return c.json({ error: 'title must be a non-empty string (max 200 chars)' }, 400);
  }
  if (!isOptionalString(description, 5000)) {
    return c.json({ error: 'description must be a string (max 5000 chars)' }, 400);
  }

  await d
    .prepare('UPDATE courses SET title = ?, description = ? WHERE id = ?')
    .run(title ?? course.title, description ?? course.description, course.id);

  return c.json(await toPublic(d, await d.prepare('SELECT * FROM courses WHERE id = ?').get(course.id)));
});

router.delete('/:id', requireAuth, async (c) => {
  const d = db(c.env.DB);
  const course = await d
    .prepare('SELECT * FROM courses WHERE id = ? AND instructor_id = ?')
    .get(c.req.param('id'), c.get('instructorId'));
  if (!course) return c.json({ error: 'Course not found' }, 404);

  await d.prepare('DELETE FROM courses WHERE id = ?').run(course.id);
  return c.body(null, 204);
});

module.exports = router;
