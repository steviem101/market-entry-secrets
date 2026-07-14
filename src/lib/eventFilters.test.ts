import { test } from "node:test";
import assert from "node:assert/strict";
import { filterEvents, type EventLike } from "./eventFilters.ts";

const ev = (p: Partial<EventLike>): EventLike => p;

// `type` values are raw events.type; filterEvents matches on the canonical
// bucket (MES-130), so "Summit" and "Conference" both fall under `conference`.
const DATA: EventLike[] = [
  ev({ type: "Summit", city: "Sydney", sector: "Fintech" }),
  ev({ type: "Workshop", city: "Melbourne", sector: "SaaS" }),
  ev({ type: "Conference", city: "Sydney", sector: "Health" }),
];
const base = { type: "all", city: "all", sector: "all" };

test("no filters → all", () => {
  assert.equal(filterEvents(DATA, base).length, 3);
});

test("city + type (canonical bucket) + sector filters", () => {
  assert.equal(filterEvents(DATA, { ...base, city: "Sydney" }).length, 2);
  // "Summit" and "Conference" both map to the `conference` bucket.
  assert.equal(filterEvents(DATA, { ...base, type: "conference" }).length, 2);
  assert.equal(filterEvents(DATA, { ...base, type: "workshop-training" }).length, 1);
  assert.equal(filterEvents(DATA, { ...base, sector: "Fintech" }).length, 1);
});

test("type_canonical column wins over the computed bucket when present", () => {
  const withColumn = [ev({ type: "Summit", type_canonical: "networking" })];
  assert.equal(filterEvents(withColumn, { ...base, type: "networking" }).length, 1);
  assert.equal(filterEvents(withColumn, { ...base, type: "conference" }).length, 0);
});

test("retired dimensions (category/topic/persona/source) are ignored if passed", () => {
  const stale = { ...base, category: "Conference", topic: "AI/ML", persona: "local_startup", source: "community" };
  // No predicate consumes them any more — everything still matches.
  assert.equal(filterEvents(DATA, stale).length, 3);
});
