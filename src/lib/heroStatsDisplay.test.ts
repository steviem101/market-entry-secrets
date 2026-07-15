import { test } from "node:test";
import assert from "node:assert/strict";
import { displayCount } from "./heroStatsDisplay.ts";

test("floors values >= 20 to the nearest 10", () => {
  assert.equal(displayCount(132), 130);
  assert.equal(displayCount(499), 490);
  assert.equal(displayCount(146), 140);
  assert.equal(displayCount(20), 20);
  assert.equal(displayCount(29), 20);
});

test("leaves small raw counts (< 20) untouched rather than rounding to 10", () => {
  assert.equal(displayCount(12), 12);
  assert.equal(displayCount(19), 19);
  assert.equal(displayCount(1), 1);
});

test("returns 0 for zero, negative, or non-finite input (truthful zero, no fabrication)", () => {
  assert.equal(displayCount(0), 0);
  assert.equal(displayCount(-5), 0);
  assert.equal(displayCount(Number.NaN), 0);
  assert.equal(displayCount(Number.POSITIVE_INFINITY), 0);
});

test("truncates fractional counts", () => {
  assert.equal(displayCount(15.9), 15);
  assert.equal(displayCount(44.6), 40);
});
