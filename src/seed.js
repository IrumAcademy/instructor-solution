const db = require('./db');
const { hashPassword } = require('./auth');

const email = process.env.SEED_INSTRUCTOR_EMAIL || 'demo@instructor-solution.test';
const password = process.env.SEED_INSTRUCTOR_PASSWORD;

if (!password) {
  console.error('SEED_INSTRUCTOR_PASSWORD env var is required to seed the demo instructor.');
  process.exit(1);
}

const existing = db.prepare('SELECT id FROM instructors WHERE email = ?').get(email);
if (existing) {
  console.log(`Instructor ${email} already exists (id=${existing.id}), skipping.`);
  process.exit(0);
}

const passwordHash = hashPassword(password);
const result = db
  .prepare(
    `INSERT INTO instructors (email, password_hash, name, bio, avatar_url, tagline)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
  .run(email, passwordHash, '데모 강사', '', '', '');

console.log(`Seeded instructor ${email} (id=${result.lastInsertRowid}).`);
