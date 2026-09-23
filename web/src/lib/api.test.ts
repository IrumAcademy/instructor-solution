import { test } from "node:test";
import assert from "node:assert/strict";
import { toPositiveIntId } from "./api.ts";

test("toPositiveIntId converts a numeric string id (select value / URL query) to a number", () => {
  assert.equal(toPositiveIntId("1"), 1);
});

test("toPositiveIntId rejects non-positive-integer values instead of forwarding them", () => {
  assert.equal(toPositiveIntId(""), undefined);
  assert.equal(toPositiveIntId("0"), undefined);
  assert.equal(toPositiveIntId("-1"), undefined);
  assert.equal(toPositiveIntId("1.5"), undefined);
  assert.equal(toPositiveIntId("abc"), undefined);
});
