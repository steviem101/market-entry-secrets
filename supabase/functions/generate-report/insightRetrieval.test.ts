import { test } from "node:test";
import assert from "node:assert/strict";
import { goalIdsToIntents, toCanonicalSectors, buildInsightNote, specificityScore, SECTION_LANES, MAX_CARDS_PER_SECTION, type InsightCard } from "./insightRetrieval.ts";
import { isCanonicalSector } from "../_shared/kbTaxonomy.ts";

function card(over: Partial<InsightCard> = {}): InsightCard {
  return { claim: "A durable ANZ insight.", topic_lane: "regulatory", sectors: ["general"], answers_intents: [], is_proprietary: false, ...over };
}

test("goalIdsToIntents inverts the crosswalk (one-to-many)", () => {
  assert.deepEqual(goalIdsToIntents(["grants"]).sort(), ["funding_and_grants"]);
  // "compliance" fans out to three canonical intents
  assert.deepEqual(goalIdsToIntents(["compliance"]).sort(), ["entity_setup", "regulatory_compliance", "visas_immigration"]);
  // "find_providers" -> find_service_provider + hiring_talent
  assert.deepEqual(goalIdsToIntents(["find_providers"]).sort(), ["find_service_provider", "hiring_talent"]);
});

test("goalIdsToIntents: empty / unknown / non-array -> []", () => {
  assert.deepEqual(goalIdsToIntents([]), []);
  assert.deepEqual(goalIdsToIntents(["not_a_goal"]), []);
  assert.deepEqual(goalIdsToIntents(null), []);
  assert.deepEqual(goalIdsToIntents(undefined), []);
});

test("goalIdsToIntents dedupes across overlapping goals", () => {
  // both map to canonical ids; the union is distinct
  const out = goalIdsToIntents(["grants", "investors"]);
  assert.equal(new Set(out).size, out.length);
  assert.ok(out.includes("funding_and_grants"));
});

test("buildInsightNote filters to the section's lanes only", () => {
  const cards = [
    card({ topic_lane: "funding", claim: "Funding insight." }),
    card({ topic_lane: "regulatory", claim: "Regulatory insight." }),
  ];
  // investor_recommendations => funding lane only
  const note = buildInsightNote(cards, "investor_recommendations");
  assert.match(note, /Funding insight\./);
  assert.doesNotMatch(note, /Regulatory insight\./);
});

test("buildInsightNote carries the strict provenance guardrail + figure-free rule", () => {
  const note = buildInsightNote([card({ topic_lane: "market" })], "competitor_landscape");
  assert.match(note, /BACKGROUND ONLY — STRICT RULES/);
  assert.match(note, /NEVER attribute/);
  assert.match(note, /NEVER cite/);
  assert.match(note, /figure-free/);          // the no-numbers rule
  assert.match(note, /uncited background, not evidence/);
});

test("buildInsightNote: proprietary cards rank first, capped at MAX_CARDS_PER_SECTION", () => {
  const cards: InsightCard[] = [];
  for (let i = 0; i < 8; i++) cards.push(card({ topic_lane: "playbook", claim: `Public ${i}.`, is_proprietary: false }));
  cards.push(card({ topic_lane: "playbook", claim: "PROPRIETARY EDGE.", is_proprietary: true }));
  const note = buildInsightNote(cards, "action_plan");
  const bulletCount = (note.match(/\n- /g) || []).length;
  assert.equal(bulletCount, MAX_CARDS_PER_SECTION);
  assert.match(note, /PROPRIETARY EDGE\./); // proprietary survives the cap because it sorts first
});

test("specificityScore ranks proprietary > sector-specific > general-only", () => {
  const proprietary = specificityScore(card({ is_proprietary: true, sectors: ["general"] }));
  const specific = specificityScore(card({ is_proprietary: false, sectors: ["financial-services"] }));
  const general = specificityScore(card({ is_proprietary: false, sectors: ["general"] }));
  assert.ok(proprietary > specific, "proprietary outranks sector-specific");
  assert.ok(specific > general, "sector-specific outranks general-only");
});

test("buildInsightNote: sector-specific cards win the 6-cap over generic ones", () => {
  const cards: InsightCard[] = [];
  for (let i = 0; i < 6; i++) cards.push(card({ topic_lane: "regulatory", sectors: ["general"], claim: `General ${i}.` }));
  cards.push(card({ topic_lane: "regulatory", sectors: ["financial-services"], claim: "SECTOR SPECIFIC EDGE." }));
  const note = buildInsightNote(cards, "setup_compliance"); // regulatory lane
  assert.match(note, /SECTOR SPECIFIC EDGE\./); // survives the cap because it outranks the 6 generals
  assert.equal((note.match(/\n- /g) || []).length, MAX_CARDS_PER_SECTION);
});

test("buildInsightNote returns '' for unknown section, empty cards, or no lane match", () => {
  assert.equal(buildInsightNote([card()], "not_a_section"), "");
  assert.equal(buildInsightNote([], "executive_summary"), "");
  // executive_summary lanes = market/playbook/regulatory; a pure 'cost' card doesn't match
  assert.equal(buildInsightNote([card({ topic_lane: "cost" })], "executive_summary"), "");
});

test("buildInsightNote skips blank claims", () => {
  const note = buildInsightNote([card({ topic_lane: "market", claim: "   " }), card({ topic_lane: "market", claim: "Real one." })], "competitor_landscape");
  assert.match(note, /Real one\./);
  const bulletCount = (note.match(/\n- /g) || []).length;
  assert.equal(bulletCount, 1);
});

test("toCanonicalSectors bridges divergent slugs to the KB vocabulary", () => {
  // display-derived slugs the cards would never match directly
  assert.deepEqual(toCanonicalSectors(["technology-information-and-media"]), ["technology"]);
  assert.deepEqual(toCanonicalSectors(["hospitals-and-health-care"]), ["healthcare"]);
  assert.deepEqual(toCanonicalSectors(["oil-gas-and-mining"]), ["mining-resources"]);
});

test("toCanonicalSectors passes already-canonical slugs through, dedupes, drops unknowns", () => {
  assert.deepEqual(toCanonicalSectors(["financial-services"]), ["financial-services"]); // identical in both vocabs
  // fintech alias -> ['financial-services','technology-information-and-media'] -> both canonicalise
  assert.deepEqual(toCanonicalSectors(["financial-services", "technology-information-and-media"]).sort(), ["financial-services", "technology"]);
  assert.deepEqual(toCanonicalSectors(["not-a-slug"]), []);
  assert.deepEqual(toCanonicalSectors(null), []);
  // two display-slugs that both map to consumer-goods dedupe
  assert.deepEqual(toCanonicalSectors(["consumer-services", "wholesale"]), ["consumer-goods"]);
});

test("every DISPLAY_SLUG_TO_CANONICAL target is a real CANONICAL_SECTOR (drift guard)", () => {
  // Exercise the map through the public function across all 20 report-side slugs.
  const reportSlugs = [
    "accommodation-and-food-services", "administrative-and-support-services", "construction",
    "consumer-services", "education", "entertainment-providers", "farming-ranching-forestry",
    "financial-services", "government-administration", "holding-companies", "hospitals-and-health-care",
    "manufacturing", "oil-gas-and-mining", "professional-services",
    "real-estate-and-equipment-rental-services", "retail", "technology-information-and-media",
    "transportation-logistics-supply-chain-and-storage", "utilities", "wholesale",
  ];
  for (const s of reportSlugs) {
    for (const c of toCanonicalSectors([s])) {
      assert.ok(isCanonicalSector(c), `${s} -> ${c} must be a canonical sector`);
    }
  }
});

test("SECTION_LANES only references valid kbTaxonomy lanes", () => {
  const valid = new Set(["regulatory", "market", "playbook", "cost", "funding"]);
  for (const lanes of Object.values(SECTION_LANES)) {
    for (const l of lanes) assert.ok(valid.has(l), `${l} is a valid lane`);
  }
});
