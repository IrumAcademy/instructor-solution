// Regression check for the Hono strict-routing trailing-slash 404 bug
// (PR #9 QA finding). No test framework: Hono apps are directly callable
// via app.request(), so this just asserts /path and /path/ produce
// identical responses. Run with: node scripts/check-routes.js

function makeFakeD1() {
  const chain = {
    bind() {
      return chain;
    },
    async first() {
      return null;
    },
    async all() {
      return { results: [] };
    },
    async run() {
      return { meta: { last_row_id: 1, changes: 0 } };
    },
  };
  return { prepare: () => chain };
}

async function main() {
  const { default: app } = await import('../src/index.mjs');
  const env = { DB: makeFakeD1(), JWT_SECRET: 'check-routes-test-secret' };

  const routes = ['/api/instructor', '/api/courses', '/api/videos'];
  let failed = false;

  for (const path of routes) {
    const [withoutSlash, withSlash] = await Promise.all([
      app.request(path, {}, env),
      app.request(`${path}/`, {}, env),
    ]);
    const [bodyA, bodyB] = await Promise.all([withoutSlash.text(), withSlash.text()]);

    if (withoutSlash.status !== withSlash.status || bodyA !== bodyB) {
      failed = true;
      console.error(
        `FAIL: ${path} vs ${path}/ diverged — status ${withoutSlash.status} vs ${withSlash.status}, body ${bodyA} vs ${bodyB}`
      );
    } else {
      console.log(`OK: ${path} and ${path}/ match (status ${withoutSlash.status})`);
    }
  }

  if (failed) {
    console.error('Trailing-slash routing check FAILED.');
    process.exit(1);
  }
  console.log('All trailing-slash routing checks passed.');
}

main();
