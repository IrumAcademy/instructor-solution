// Public demo backend (issue #2 API spec) — no secrets, safe to inline as a default.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://instructor-solution-api.irumacademy.workers.dev";

// Course IDs come from URL query params and <select> option values, which are
// always strings even when the underlying id is numeric — the backend rejects
// anything but a positive integer, so convert (and drop invalid values) right
// before they cross the HTTP boundary.
export function toPositiveIntId(value: string): number | undefined {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}
