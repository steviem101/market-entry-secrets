import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CANONICAL_INTENTS, CANONICAL_INTENT_IDS, isCanonicalIntent, intentsForLane, coerceIntents,
} from "./kbIntents.ts";
import { isTopicLane } from "./kbTaxonomy.ts";

// The frontend hero-intent GOALS ids (src/lib/intentClassifier.ts). Pinned here so a
// crosswalk that points at a non-existent goal fails loudly.
const KNOWN_GOAL_IDS = new Set([
  "find_providers", "growth_providers", "investors", "accelerators", "mentors_intl",
  "mentors_startup", "grants", "events", "lead_lists_intl", "lead_lists_startup",
  "trade_agencies", "associations", "spaces", "founders", "case_studies", "guides",
  "guides_startup", "market_research", "compliance",
]);

test("canonical intents: ~15, unique ids", () => {
  assert.ok(CANONICAL_INTENTS.length >= 12 && CANONICAL_INTENTS.length <= 16, "roughly 15 intents");
  assert.equal(new Set(CANONICAL_INTENT_IDS).size, CANONICAL_INTENTS.length, "unique ids");
});

test("every intent is well-formed (lane valid, has WHO, non-empty question)", () => {
  for (const i of CANONICAL_INTENTS) {
    assert.ok(isTopicLane(i.primary_lane), `${i.id} primary_lane valid`);
    for (const l of i.secondary_lanes ?? []) assert.ok(isTopicLane(l), `${i.id} secondary_lane valid`);
    assert.ok(i.directory_entity_types.length > 0, `${i.id} has a WHO`);
    assert.ok(i.question.length > 10 && i.keywords.length > 0, `${i.id} has question + keywords`);
  }
});

test("goal_crosswalk only references real intentClassifier GOALS ids", () => {
  for (const i of CANONICAL_INTENTS) {
    for (const g of i.goal_crosswalk) {
      assert.ok(KNOWN_GOAL_IDS.has(g), `${i.id} crosswalk goal '${g}' must exist in intentClassifier`);
    }
  }
});

test("isCanonicalIntent + coerceIntents drop hallucinated ids", () => {
  assert.ok(isCanonicalIntent("entity_setup"));
  assert.ok(!isCanonicalIntent("teleportation"));
  assert.deepEqual(
    coerceIntents(["entity_setup", "teleportation", "cost_of_entry", "entity_setup"]),
    ["entity_setup", "cost_of_entry"],
  );
  assert.deepEqual(coerceIntents("not-an-array"), []);
  assert.deepEqual(coerceIntents(null), []);
});

test("intentsForLane returns primary + secondary matches", () => {
  const regulatory = intentsForLane("regulatory").map((i) => i.id);
  assert.ok(regulatory.includes("regulatory_compliance"));
  assert.ok(regulatory.includes("entity_setup"));
  assert.ok(regulatory.includes("visas_immigration"));
  // hiring_talent has regulatory only as a SECONDARY lane — still matched.
  assert.ok(regulatory.includes("hiring_talent"));
  // cost lane: cost_of_entry (primary) + entity_setup/pricing_localisation (secondary)
  const cost = intentsForLane("cost").map((i) => i.id);
  assert.ok(cost.includes("cost_of_entry"));
  // every lane is answerable by at least one intent (coverage-matrix precondition)
  for (const lane of ["regulatory", "market", "playbook", "cost", "funding"] as const) {
    assert.ok(intentsForLane(lane).length > 0, `lane ${lane} has >=1 intent`);
  }
});
