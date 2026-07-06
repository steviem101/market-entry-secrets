import { test } from "node:test";
import assert from "node:assert/strict";
import { metaLine, recordCountLabel } from "./cardFields.ts";

test("metaLine: drops nullish/empty/placeholder parts, joins the rest", () => {
  assert.equal(metaLine(["Venture Capital", "Sydney"]), "Venture Capital · Sydney");
  assert.equal(metaLine([null, "Sydney"]), "Sydney");
  assert.equal(metaLine(["Venture Capital", null]), "Venture Capital");
  assert.equal(metaLine([undefined, undefined]), undefined);
  assert.equal(metaLine(["", "  "]), undefined);
  // literal string leaks from an interpolated null/undefined upstream
  assert.equal(metaLine(["null", "Melbourne"]), "Melbourne");
  assert.equal(metaLine(["undefined", "N/A"]), undefined);
});

test("metaLine: trims parts and honours a custom separator", () => {
  assert.equal(metaLine(["  Growth  ", " NSW "]), "Growth · NSW");
  assert.equal(metaLine(["A", "B"], ", "), "A, B");
});

test("metaLine: numeric parts stringify; zero is kept (a real value)", () => {
  assert.equal(metaLine([2026, "Sydney"]), "2026 · Sydney");
  assert.equal(metaLine([0, "x"]), "0 · x");
});

test("recordCountLabel: formats positive counts, drops missing/zero/garbage", () => {
  assert.equal(recordCountLabel(5000), "5,000 records");
  assert.equal(recordCountLabel("1200"), "1,200 records");
  assert.equal(recordCountLabel(0), undefined);
  assert.equal(recordCountLabel(null), undefined);
  assert.equal(recordCountLabel(undefined), undefined);
  assert.equal(recordCountLabel("lots"), undefined);
});

test("metaLine + recordCountLabel compose for the lead-database subtitle", () => {
  // location present, count present
  assert.equal(metaLine(["Australia", recordCountLabel(5000)]), "Australia · 5,000 records");
  // location missing → no dangling separator
  assert.equal(metaLine(["", recordCountLabel(5000)]), "5,000 records");
  // count missing → just the location, no "· ? records"
  assert.equal(metaLine(["Australia", recordCountLabel(null)]), "Australia");
  // both missing → undefined (card hides the line)
  assert.equal(metaLine(["", recordCountLabel(null)]), undefined);
});
