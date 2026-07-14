import { test } from "node:test";
import assert from "node:assert/strict";
import { filterEvents, matchesSource, matchesPersona, COMMUNITY_SOURCE, type EventLike } from "./eventFilters.ts";

const ev = (p: Partial<EventLike>): EventLike => p;

// `type` values are raw events.type; filterEvents matches on the canonical
// bucket (MES-130), so "Summit" and "Conference" both fall under `conference`.
const DATA: EventLike[] = [
  ev({ category: "Conference", type: "Summit", city: "Sydney", sector: "Fintech", tags: ["Investing"], source: "curated", persona: "international_entrant" }),
  ev({ category: "Workshop", type: "Workshop", city: "Melbourne", sector: "SaaS", tags: ["Product"], source: COMMUNITY_SOURCE, persona: "local_founder" }),
  ev({ category: "Conference", type: "Conference", city: "Sydney", sector: "Health", tags: ["AI/ML"], source: "curated", persona: "both" }),
];
const base = { category: "all", type: "all", city: "all", sector: "all", topic: "all", persona: "all" };

test("matchesSource partitions curated vs community", () => {
  assert.equal(matchesSource(DATA[0], "curated"), true);
  assert.equal(matchesSource(DATA[1], "curated"), false);
  assert.equal(matchesSource(DATA[1], "community"), true);
  assert.equal(matchesSource(DATA[0], "all"), true);
});

test("category filter", () => {
  assert.equal(filterEvents(DATA, { ...base, category: "Conference" }).length, 2);
});
test("city + type (canonical bucket) + sector filters", () => {
  assert.equal(filterEvents(DATA, { ...base, city: "Sydney" }).length, 2);
  // "Summit" and "Conference" both map to the `conference` bucket.
  assert.equal(filterEvents(DATA, { ...base, type: "conference" }).length, 2);
  assert.equal(filterEvents(DATA, { ...base, type: "workshop-training" }).length, 1);
  assert.equal(filterEvents(DATA, { ...base, sector: "Fintech" }).length, 1);
});
test("topic filter matches tags", () => {
  assert.equal(filterEvents(DATA, { ...base, topic: "AI/ML" }).length, 1);
});

test("persona: 'both' event matches either audience; unclassified events are not hidden", () => {
  assert.equal(matchesPersona(DATA[2], "international_entrant"), true); // both
  assert.equal(matchesPersona(DATA[2], "local_startup"), true); // both
  assert.equal(matchesPersona(DATA[0], "international_entrant"), true);
  assert.equal(matchesPersona(DATA[0], "local_startup"), false);
  // local_founder persona maps to local_startup filter
  assert.equal(matchesPersona(DATA[1], "local_startup"), true);
  // unclassified (no persona/target) → always shown
  assert.equal(matchesPersona(ev({ category: "X" }), "international_entrant"), true);
});

test("persona filter integrated into filterEvents", () => {
  assert.equal(filterEvents(DATA, { ...base, persona: "local_startup" }).length, 2); // community(local_founder) + both
});
