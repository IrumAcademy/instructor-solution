const { Hono } = require('hono');
const { db } = require('../db');
const { requireAuth } = require('../auth');
const { isOptionalString } = require('../validate');

const router = new Hono({ strict: false });

function toPublic(instructor) {
  return {
    name: instructor.name,
    bio: instructor.bio,
    avatarUrl: instructor.avatar_url,
    tagline: instructor.tagline,
  };
}

router.get('/', async (c) => {
  const d = db(c.env.DB);
  const instructor = await d.prepare('SELECT * FROM instructors ORDER BY id LIMIT 1').get();
  if (!instructor) return c.json({ error: 'No instructor found' }, 404);
  return c.json(toPublic(instructor));
});

router.put('/', requireAuth, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { name, bio, avatarUrl, tagline } = body || {};
  if (
    !isOptionalString(name, 100) ||
    !isOptionalString(bio, 5000) ||
    !isOptionalString(avatarUrl, 2000) ||
    !isOptionalString(tagline, 200)
  ) {
    return c.json({ error: 'name, bio, avatarUrl, tagline must be strings within length limits' }, 400);
  }

  const instructorId = c.get('instructorId');
  const d = db(c.env.DB);
  const instructor = await d.prepare('SELECT * FROM instructors WHERE id = ?').get(instructorId);
  if (!instructor) return c.json({ error: 'Instructor not found' }, 404);

  await d
    .prepare('UPDATE instructors SET name = ?, bio = ?, avatar_url = ?, tagline = ? WHERE id = ?')
    .run(
      name ?? instructor.name,
      bio ?? instructor.bio,
      avatarUrl ?? instructor.avatar_url,
      tagline ?? instructor.tagline,
      instructorId
    );

  const updated = await d.prepare('SELECT * FROM instructors WHERE id = ?').get(instructorId);
  return c.json(toPublic(updated));
});

module.exports = router;
