const { hashPassword } = require('../src/auth.js');

async function main() {
  const email = process.env.SEED_INSTRUCTOR_EMAIL || 'demo@instructor-solution.test';
  const password = process.env.SEED_INSTRUCTOR_PASSWORD;
  if (!password) {
    console.error('SEED_INSTRUCTOR_PASSWORD env var is required to seed the demo instructor.');
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  const esc = (s) => s.replace(/'/g, "''");

  // Idempotent: skips if an instructor with this email already exists.
  console.log(
    `INSERT INTO instructors (email, password_hash, name, bio, avatar_url, tagline) ` +
      `SELECT '${esc(email)}', '${esc(passwordHash)}', '데모 강사', '', '', '' ` +
      `WHERE NOT EXISTS (SELECT 1 FROM instructors WHERE email = '${esc(email)}');`
  );
}

main();
