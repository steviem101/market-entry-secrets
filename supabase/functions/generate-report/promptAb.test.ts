import { test } from "node:test";
import assert from "node:assert/strict";
import { hashToBucket, parseAbPercent, inCandidateBucket } from "./promptAb.ts";

test("hashToBucket: deterministic and in [0, 99]", () => {
  const a = hashToBucket("report-abc");
  const b = hashToBucket("report-abc");
  assert.equal(a, b); // stable for the same id
  assert.ok(Number.isInteger(a) && a >= 0 && a < 100);
  // Different ids generally land differently (not a hard guarantee, but these do).
  assert.notEqual(hashToBucket("report-abc"), hashToBucket("report-xyz"));
});

test("hashToBucket: roughly uniform across the 0–99 space", () => {
  // A crude distribution check — 2000 uuid-ish ids should cover a wide spread
  // and never exceed the bounds. Guards against a hash that collapses to a
  // narrow band (which would make PROMPT_AB_PERCENT meaningless).
  const seen = new Set<number>();
  for (let i = 0; i < 2000; i++) seen.add(hashToBucket(`00000000-0000-4000-8000-${i.toString().padStart(12, "0")}`));
  assert.ok(seen.size > 50, `expected wide bucket spread, got ${seen.size}`);
});

test("parseAbPercent: clamps to [0,100]; blank/garbage → 0 (off)", () => {
  assert.equal(parseAbPercent("10"), 10);
  assert.equal(parseAbPercent(" 25 "), 25);
  assert.equal(parseAbPercent("0"), 0);
  assert.equal(parseAbPercent("100"), 100);
  assert.equal(parseAbPercent("150"), 100); // clamp high
  assert.equal(parseAbPercent("-5"), 0);    // clamp low
  assert.equal(parseAbPercent(""), 0);
  assert.equal(parseAbPercent("  "), 0);
  assert.equal(parseAbPercent(null), 0);
  assert.equal(parseAbPercent(undefined), 0);
  assert.equal(parseAbPercent("abc"), 0);
});

test("inCandidateBucket: 0 → never, 100 → always, empty id → never", () => {
  assert.equal(inCandidateBucket("report-abc", 0), false);   // default: feature off
  assert.equal(inCandidateBucket("report-abc", 100), true);  // full rollout
  assert.equal(inCandidateBucket("", 50), false);            // no id → never
});

test("inCandidateBucket: a report at bucket b is included iff percent > b", () => {
  const id = "report-abc";
  const b = hashToBucket(id);
  assert.equal(inCandidateBucket(id, b), false);     // percent == bucket → excluded (strict <)
  assert.equal(inCandidateBucket(id, b + 1), true);  // percent one above → included
  if (b > 0) assert.equal(inCandidateBucket(id, b - 1), false);
});

test("inCandidateBucket: enrolment share tracks percent", () => {
  // ~30% of ids should enrol at percent=30 (within a loose tolerance).
  let inCount = 0;
  const N = 3000;
  for (let i = 0; i < N; i++) if (inCandidateBucket(`id-${i}`, 30)) inCount++;
  const share = inCount / N;
  assert.ok(share > 0.22 && share < 0.38, `expected ~0.30 enrolment, got ${share.toFixed(3)}`);
});
