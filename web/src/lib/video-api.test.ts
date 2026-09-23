import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidVideo } from "./video-api.ts";

const base = {
  provider: "youtube",
  externalId: "dQw4w9WgXcQ",
  title: "Intro",
  thumbnailUrl: "https://example.com/thumb.jpg",
};

test("isValidVideo accepts the D1 API shape: numeric id, numeric courseId", () => {
  assert.equal(isValidVideo({ ...base, id: 1, courseId: 2 }), true);
});

test("isValidVideo accepts a null courseId (video not linked to a course)", () => {
  assert.equal(isValidVideo({ ...base, id: 1, courseId: null }), true);
});

test("isValidVideo rejects the old string id/courseId shape", () => {
  assert.equal(isValidVideo({ ...base, id: "1", courseId: "2" }), false);
});
