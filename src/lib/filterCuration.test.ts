import { test } from "node:test";
import assert from "node:assert/strict";
import { countValues, curateOptions, curateValues } from "./filterCuration.ts";

test("countValues tallies scalars and ignores null/empty", () => {
  const counted = countValues(["Sydney", "Sydney", "Melbourne", null, "", undefined]);
  const map = Object.fromEntries(counted.map((o) => [o.value, o.count]));
  assert.deepEqual(map, { Sydney: 2, Melbourne: 1 });
  // null/empty never become an option
  assert.equal(counted.length, 2);
});

test("curateOptions ranks by count desc, then label A→Z on ties", () => {
  const out = curateOptions([
    { value: "b", label: "Beta", count: 5 },
    { value: "a", label: "Alpha", count: 5 },
    { value: "c", label: "Gamma", count: 9 },
  ]);
  assert.deepEqual(out.map((o) => o.value), ["c", "a", "b"]);
});

test("curateOptions hides zero-count by default, keeps counts on output", () => {
  const out = curateOptions([
    { value: "x", label: "X", count: 3 },
    { value: "z", label: "Z", count: 0 },
  ]);
  assert.deepEqual(out.map((o) => o.value), ["x"]);
  assert.equal(out[0].count, 3);
});

test("curateOptions respects a higher minCount threshold", () => {
  const out = curateOptions(
    [
      { value: "big", label: "Big", count: 10 },
      { value: "small", label: "Small", count: 1 },
    ],
    { minCount: 2 },
  );
  assert.deepEqual(out.map((o) => o.value), ["big"]);
});

test("pinned values float to the front in pin order, regardless of count", () => {
  const out = curateOptions(
    [
      { value: "popular", label: "Popular", count: 100 },
      { value: "tam", label: "TAM Map", count: 1 },
      { value: "lead", label: "Lead Database", count: 50 },
    ],
    { pin: ["lead", "tam"] },
  );
  // pinned first, in pin order; then the ranked rest
  assert.deepEqual(out.map((o) => o.value), ["lead", "tam", "popular"]);
});

test("tie-break is deterministic (stable) across equal counts", () => {
  const input = [
    { value: "d", label: "Delta", count: 2 },
    { value: "a", label: "Alpha", count: 2 },
    { value: "c", label: "Charlie", count: 2 },
    { value: "b", label: "Bravo", count: 2 },
  ];
  const a = curateOptions(input).map((o) => o.value);
  const b = curateOptions([...input].reverse()).map((o) => o.value);
  assert.deepEqual(a, ["a", "b", "c", "d"]);
  assert.deepEqual(a, b); // input order does not change the result
});

test("curateValues maps array-field contents with a label lookup", () => {
  const labels: Record<string, string> = {
    "technology-information-and-media": "Technology, Information and Media",
    "financial-services": "Financial Services",
  };
  const out = curateValues(
    [
      "technology-information-and-media",
      "technology-information-and-media",
      "financial-services",
    ],
    { labelFor: (v) => labels[v] ?? v },
  );
  assert.deepEqual(out.map((o) => o.label), [
    "Technology, Information and Media",
    "Financial Services",
  ]);
  assert.equal(out[0].count, 2);
});

test("full ranked list is returned — nothing is capped away (tail stays reachable)", () => {
  const many = Array.from({ length: 40 }, (_, i) => ({
    value: `v${i}`,
    label: `V${String(i).padStart(2, "0")}`,
    count: 40 - i,
  }));
  const out = curateOptions(many);
  assert.equal(out.length, 40); // curation ranks + hides zero; capping is a display concern
  assert.equal(out[0].value, "v0"); // highest count first
});
