import { test } from "node:test";
import assert from "node:assert/strict";
import { computeDataHealth, completeness, STALE_DAYS } from "./dataHealth.ts";

test("computeDataHealth: a live, complete, freshly-verified row scores 100", () => {
  assert.equal(computeDataHealth({ urlReachable: true, requiredPresent: 1, ageDays: 0 }), 100);
});

test("computeDataHealth: a dead-link, empty, ancient row scores 0", () => {
  assert.equal(computeDataHealth({ urlReachable: false, requiredPresent: 0, ageDays: 999 }), 0);
});

test("computeDataHealth: unchecked URL is neutral (half of reachability weight)", () => {
  // reach 20 + complete 40 + fresh 20 = 80
  assert.equal(computeDataHealth({ urlReachable: null, requiredPresent: 1, ageDays: 0 }), 80);
});

test("computeDataHealth: freshness decays linearly to zero at STALE_DAYS", () => {
  // reach 40 + complete 40 + fresh (half-way) 10 = 90
  assert.equal(computeDataHealth({ urlReachable: true, requiredPresent: 1, ageDays: STALE_DAYS / 2 }), 90);
  // at/after STALE_DAYS the freshness term is 0 → 80
  assert.equal(computeDataHealth({ urlReachable: true, requiredPresent: 1, ageDays: STALE_DAYS }), 80);
  assert.equal(computeDataHealth({ urlReachable: true, requiredPresent: 1, ageDays: STALE_DAYS * 2 }), 80);
});

test("computeDataHealth: partial completeness is proportional; dead link caps the rest", () => {
  // reach 40 + complete 20 (0.5) + fresh 20 = 80
  assert.equal(computeDataHealth({ urlReachable: true, requiredPresent: 0.5, ageDays: 0 }), 80);
  // dead link: 0 + 40 + 20 = 60 (a reachable-but-broken source still loses 40)
  assert.equal(computeDataHealth({ urlReachable: false, requiredPresent: 1, ageDays: 0 }), 60);
});

test("computeDataHealth: NaN signals fail SAFE toward a low score, never throw", () => {
  // reach 20 (null → neutral half) + complete 0 (NaN → min) + fresh 0 (NaN age → fully stale) = 20
  assert.equal(computeDataHealth({ urlReachable: null, requiredPresent: NaN, ageDays: NaN }), 20);
});

test("completeness: fraction of populated fields (array/string/number aware)", () => {
  const row = { name: "Acme", website: "", tags: ["x"], employees: 0, note: null };
  // name ✓, website ✗ (empty), tags ✓, employees ✓ (0 is present), note ✗
  assert.equal(completeness(row, ["name", "website", "tags", "employees", "note"]), 3 / 5);
  assert.equal(completeness(row, []), 1); // no required fields → fully complete
  assert.equal(completeness({}, ["a", "b"]), 0);
});
