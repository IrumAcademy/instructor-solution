const { Hono } = require('hono');
const { db } = require('../db');
const { requireAuth } = require('../auth');
const { isNonEmptyString, isOptionalString } = require('../validate');

const router = new Hono({ strict: false });

function toPublic(row) {
  return { id: row.id, quote: row.quote, name: row.name, course: row.course };
}

router.get('/', async (c) => {
  const d = db(c.env.DB);
  const rows = await d.prepare('SELECT * FROM testimonials ORDER BY created_at DESC').all();
  return c.json(rows.map(toPublic));
});

router.post('/', requireAuth, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { quote, name, course } = body || {};
  if (!isNonEmptyString(quote, 2000)) {
    return c.json({ error: 'quote must be a non-empty string (max 2000 chars)' }, 400);
  }
  if (!isNonEmptyString(name, 100)) {
    return c.json({ error: 'name must be a non-empty string (max 100 chars)' }, 400);
  }
  if (!isOptionalString(course, 200)) {
    return c.json({ error: 'course must be a string (max 200 chars)' }, 400);
  }

  const d = db(c.env.DB);
  const result = await d
    .prepare('INSERT INTO testimonials (instructor_id, quote, name, course) VALUES (?, ?, ?, ?)')
    .run(c.get('instructorId'), quote, name, course || '');

  const row = await d.prepare('SELECT * FROM testimonials WHERE id = ?').get(result.lastInsertRowid);
  return c.json(toPublic(row), 201);
});

router.put('/:id', requireAuth, async (c) => {
  const d = db(c.env.DB);
  const row = await d
    .prepare('SELECT * FROM testimonials WHERE id = ? AND instructor_id = ?')
    .get(c.req.param('id'), c.get('instructorId'));
  if (!row) return c.json({ error: 'Testimonial not found' }, 404);

  const body = await c.req.json().catch(() => ({}));
  const { quote, name, course } = body || {};
  if (quote !== undefined && !isNonEmptyString(quote, 2000)) {
    return c.json({ error: 'quote must be a non-empty string (max 2000 chars)' }, 400);
  }
  if (name !== undefined && !isNonEmptyString(name, 100)) {
    return c.json({ error: 'name must be a non-empty string (max 100 chars)' }, 400);
  }
  if (!isOptionalString(course, 200)) {
    return c.json({ error: 'course must be a string (max 200 chars)' }, 400);
  }

  await d
    .prepare('UPDATE testimonials SET quote = ?, name = ?, course = ? WHERE id = ?')
    .run(quote ?? row.quote, name ?? row.name, course ?? row.course, row.id);

  return c.json(toPublic(await d.prepare('SELECT * FROM testimonials WHERE id = ?').get(row.id)));
});

router.delete('/:id', requireAuth, async (c) => {
  const d = db(c.env.DB);
  const row = await d
    .prepare('SELECT * FROM testimonials WHERE id = ? AND instructor_id = ?')
    .get(c.req.param('id'), c.get('instructorId'));
  if (!row) return c.json({ error: 'Testimonial not found' }, 404);

  await d.prepare('DELETE FROM testimonials WHERE id = ?').run(row.id);
  return c.body(null, 204);
});

module.exports = router;
