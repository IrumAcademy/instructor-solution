const { Hono } = require('hono');
const { db } = require('../db');
const { verifyPassword, signToken } = require('../auth');
const { isNonEmptyString } = require('../validate');

const router = new Hono({ strict: false });

router.post('/login', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { email, password } = body || {};
  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    return c.json({ error: 'email and password must be non-empty strings' }, 400);
  }

  const d = db(c.env.DB);
  const instructor = await d.prepare('SELECT * FROM instructors WHERE email = ?').get(email);
  if (!instructor || !(await verifyPassword(password, instructor.password_hash))) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  const token = await signToken(c.env, { sub: instructor.id });
  return c.json({ token });
});

module.exports = router;
