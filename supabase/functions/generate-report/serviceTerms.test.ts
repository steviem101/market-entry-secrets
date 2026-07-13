import { test } from "node:test";
import assert from "node:assert/strict";
import { buildServiceTermIndex, expandServiceTags, type ServiceTermRow } from "./serviceTerms.ts";

const ROWS: ServiceTermRow[] = [
  { slug: "legal", label: "Legal", synonyms: ["Legal", "Legal Services", "Tax & Legal", "Employment Law"] },
  { slug: "hr", label: "HR", synonyms: ["HR", "HR / Talent", "Talent Acquisition"] },
];

test("expandServiceTags: a goal tag expands to its real directory-cased synonyms", () => {
  const idx = buildServiceTermIndex(ROWS);
  const out = expandServiceTags(["Legal"], idx);
  // Original retained first, then the synonyms that real rows use.
  assert.equal(out[0], "Legal");
  assert.ok(out.includes("Legal Services"));
  assert.ok(out.includes("Employment Law"));
  assert.ok(out.includes("Tax & Legal"));
});

test("expandServiceTags: case-insensitive lookup, real casing returned", () => {
  const idx = buildServiceTermIndex(ROWS);
  const out = expandServiceTags(["legal"], idx); // lowercase goal tag
  assert.ok(out.includes("Legal Services")); // returns the real directory casing
});

test("expandServiceTags: lookup works via slug or any synonym, not just the label", () => {
  const idx = buildServiceTermIndex(ROWS);
  // "Talent Acquisition" is a synonym of hr → expands to the whole hr set.
  const out = expandServiceTags(["Talent Acquisition"], idx);
  assert.ok(out.includes("HR"));
  assert.ok(out.includes("HR / Talent"));
});

test("expandServiceTags: unknown tags pass through untouched (additive superset)", () => {
  const idx = buildServiceTermIndex(ROWS);
  const out = expandServiceTags(["Immigration", "Legal"], idx);
  assert.ok(out.includes("Immigration")); // unknown tag retained
  assert.ok(out.includes("Legal Services")); // known tag expanded
});

test("expandServiceTags: de-dupes across overlapping expansions, originals first", () => {
  const idx = buildServiceTermIndex(ROWS);
  const out = expandServiceTags(["Legal", "Legal Services"], idx);
  const lower = out.map((s) => s.toLowerCase());
  assert.equal(new Set(lower).size, lower.length); // no dupes
  assert.equal(out[0], "Legal");
  assert.equal(out[1], "Legal Services");
});

test("expandServiceTags: empty / missing inputs are safe", () => {
  const idx = buildServiceTermIndex(ROWS);
  assert.deepEqual(expandServiceTags([], idx), []);
  assert.deepEqual(expandServiceTags(["  "], idx), []);
  const emptyIdx = buildServiceTermIndex([]);
  assert.deepEqual(expandServiceTags(["Legal"], emptyIdx), ["Legal"]); // no terms → passthrough
});

test("buildServiceTermIndex: first term claims a colliding key (no silent merge)", () => {
  const idx = buildServiceTermIndex([
    { slug: "a", label: "A", synonyms: ["Shared"] },
    { slug: "b", label: "B", synonyms: ["Shared"] },
  ]);
  const out = expandServiceTags(["Shared"], idx);
  // "Shared" resolves to term A's expansion only (A + Shared), not B's.
  assert.ok(out.includes("A"));
  assert.ok(!out.includes("B"));
});
