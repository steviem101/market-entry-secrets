import { test } from "node:test";
import assert from "node:assert/strict";
import { bucketForEventType, EVENT_TYPE_BUCKETS, EVENT_TYPE_BUCKET_LABEL } from "./eventTypeBuckets.ts";

// The 20 raw values present in prod 2026-07-13, with expected bucket + count,
// mirroring docs/audits/mes-130/events-type-value-to-canonical.csv.
const CASES: [string, string, number][] = [
  ["Networking", "networking", 31],
  ["Conference + Exhibition", "conference", 31],
  ["Conference", "conference", 17],
  ["Pitch Night", "pitch-demo-day", 16],
  ["Summit", "conference", 15],
  ["Trade Show + Conference", "expo-trade-show", 9],
  ["Trade Show", "expo-trade-show", 8],
  ["Expo", "expo-trade-show", 5],
  ["Festival + Conference", "festival-showcase", 2],
  ["Workshop", "workshop-training", 2],
  ["Airshow + Trade Exhibition", "expo-trade-show", 1],
  ["Conference + Expo", "conference", 1],
  ["Conference + Investor Presentation", "conference", 1],
  ["Conference + Networking", "conference", 1],
  ["Festival + Conference + Exhibition", "festival-showcase", 1],
  ["Festival + Conference + Startup Expo", "festival-showcase", 1],
  ["Showcase + Networking", "festival-showcase", 1],
  ["Summit + Exhibition", "conference", 1],
  ["Summit + Pitch Night", "conference", 1],
  ["Trade Exhibition", "expo-trade-show", 1],
];

test("every prod raw value maps to its expected canonical bucket", () => {
  for (const [raw, bucket] of CASES) {
    assert.equal(bucketForEventType(raw), bucket, `${raw} → ${bucket}`);
  }
});

test("bucket counts match the audit (buckets sum to 146 approved rows)", () => {
  const counts: Record<string, number> = {};
  for (const [, bucket, n] of CASES) counts[bucket] = (counts[bucket] ?? 0) + n;
  assert.deepEqual(counts, {
    conference: 68,
    networking: 31,
    "expo-trade-show": 24,
    "pitch-demo-day": 16,
    "festival-showcase": 5,
    "workshop-training": 2,
  });
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  assert.equal(total, 146);
});

test("null / unknown values fall back to Other; heuristic catches new compounds", () => {
  assert.equal(bucketForEventType(null), "other");
  assert.equal(bucketForEventType(""), "other");
  assert.equal(bucketForEventType("Hackathon"), "other");
  assert.equal(bucketForEventType("Tech Summit 2027"), "conference"); // lead-token
  assert.equal(bucketForEventType("Virtual Webinar"), "webinar");
  assert.equal(bucketForEventType("Startup Demo Day"), "pitch-demo-day");
});

test("every bucket value has a label", () => {
  for (const [, bucket] of CASES) {
    assert.ok(EVENT_TYPE_BUCKET_LABEL[bucket], `${bucket} has a label`);
  }
  assert.equal(EVENT_TYPE_BUCKETS.length, 8); // 6 populated + Webinar (reserved) + Other
});
