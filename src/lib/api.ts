// Public demo backend (issue #2 API spec) — no secrets, safe to inline as a default.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://instructor-solution-api.irumacademy.workers.dev";
