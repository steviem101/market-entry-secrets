import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TOPIC_LANES, contentTypesToLanes, isTopicLane, CANONICAL_SECTORS, isCanonicalSector,
  coerceSectors, GENERAL_SECTOR,
} from "./kbTaxonomy.ts";

test("content_types map to distinct lanes in canonical order", () => {
  assert.deepEqual(contentTypesToLanes(["Regulatory & Legal"]), ["regulatory"]);
  assert.deepEqual(contentTypesToLanes(["Market Entry"]), ["market", "playbook"]);
  assert.deepEqual(contentTypesToLanes(["Growth & GTM", "Case Study"]), ["playbook"]);
  // dedupe + canonical ordering (regulatory before market before playbook)
  assert.deepEqual(
    contentTypesToLanes(["Case Study", "Regulatory & Legal", "Industry Insight"]),
    ["regulatory", "market", "playbook"],
  );
});

test("content_types matching is case-insensitive and trims", () => {
  assert.deepEqual(contentTypesToLanes(["  regulatory & legal  "]), ["regulatory"]);
  assert.deepEqual(contentTypesToLanes(["MARKET ENTRY"]), ["market", "playbook"]);
});

test("unknown/empty content_types yield no lanes (distiller infers)", () => {
  assert.deepEqual(contentTypesToLanes([]), []);
  assert.deepEqual(contentTypesToLanes(null), []);
  assert.deepEqual(contentTypesToLanes(["Nonexistent Type"]), []);
});

test("cost and funding are never assigned from content_types", () => {
  // No content_type maps to cost/funding — those are distiller-inferred from the claim.
  for (const ct of ["Regulatory & Legal", "Market Entry", "Industry Insight", "Case Study", "ANZ Ecosystem", "Growth & GTM", "Tech & Product"]) {
    const lanes = contentTypesToLanes([ct]);
    assert.ok(!lanes.includes("cost"), `${ct} should not imply cost`);
    assert.ok(!lanes.includes("funding"), `${ct} should not imply funding`);
  }
});

test("isTopicLane validates the five lanes", () => {
  assert.equal(TOPIC_LANES.length, 5);
  for (const l of TOPIC_LANES) assert.ok(isTopicLane(l));
  assert.ok(!isTopicLane("who"));
  assert.ok(!isTopicLane(null));
});

test("canonical sectors: 20-sector taxonomy, validated", () => {
  assert.equal(CANONICAL_SECTORS.length, 20, "must mirror the 20-sector LINKEDIN_SECTORS");
  assert.equal(new Set(CANONICAL_SECTORS).size, 20, "no duplicate sector slugs");
  assert.ok(isCanonicalSector("technology"));
  assert.ok(!isCanonicalSector("made-up-sector"));
});

test("coerceSectors: canonical kept, junk dropped, general sentinel kept alone", () => {
  assert.deepEqual(coerceSectors(["technology", "bogus"], []), ["technology"]);
  assert.deepEqual(coerceSectors([GENERAL_SECTOR], []), [GENERAL_SECTOR]);
  assert.deepEqual(coerceSectors(["a", "b", "c"], []), []);              // none canonical, no fallback
  assert.deepEqual(coerceSectors(null, null), []);
});

test("coerceSectors: >2 canonical capped at 2 and duplicates removed — on BOTH the raw and fallback paths", () => {
  // raw path
  assert.deepEqual(coerceSectors(["technology", "healthcare", "retail"], []), ["technology", "healthcare"]);
  assert.deepEqual(coerceSectors(["technology", "technology"], []), ["technology"]);
  // fallback path must enforce the same cap/dedupe (the pre-fix bug: fallback was uncapped + un-deduped)
  assert.deepEqual(coerceSectors([], ["technology", "healthcare", "retail", "technology"]), ["technology", "healthcare"]);
  assert.deepEqual(coerceSectors(undefined, ["retail", "retail"]), ["retail"]);
});

test("coerceSectors: 'general' never mixes with a specific sector (specifics win)", () => {
  assert.deepEqual(coerceSectors([GENERAL_SECTOR, "technology"], []), ["technology"]);
  assert.deepEqual(coerceSectors(["technology", GENERAL_SECTOR, "healthcare"], []), ["technology", "healthcare"]);
});

test("coerceSectors: values are trimmed and lower-cased before validation", () => {
  assert.deepEqual(coerceSectors(["Healthcare", " Financial-Services "], []), ["healthcare", "financial-services"]);
  assert.deepEqual(coerceSectors(["GENERAL"], []), [GENERAL_SECTOR]);
});

test("coerceSectors: falls back to chunk tags only when raw yields nothing", () => {
  assert.deepEqual(coerceSectors(undefined, ["retail", "legacy-tag"]), ["retail"]); // fallback filtered too
  assert.deepEqual(coerceSectors(["technology"], ["retail"]), ["technology"]);       // raw wins over fallback
  assert.deepEqual(coerceSectors(["bogus"], ["retail"]), ["retail"]);                // raw all-junk -> fallback
});
