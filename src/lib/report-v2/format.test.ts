import { test } from "node:test";
import assert from "node:assert/strict";
import { formatEventWindow } from "./format.ts";

test("formatEventWindow: spans two months across a year boundary", () => {
  // en-GB renders September's short form as "Sept" (4 letters), uppercased here.
  assert.equal(formatEventWindow("2026-09-01", "2027-06-01"), "SEPT 2026 – JUN 2027");
});

test("formatEventWindow: collapses to a single month when start and end share it", () => {
  assert.equal(formatEventWindow("2026-11-03", "2026-11-27"), "NOV 2026");
});

test("formatEventWindow: unparseable bound → empty string (no 'Invalid Date')", () => {
  assert.equal(formatEventWindow("", "2026-11-01"), "");
  assert.equal(formatEventWindow("2026-11-01", "not-a-date"), "");
});
