import { test } from "node:test";
import assert from "node:assert/strict";
import {
  scoreRelevance,
  isHardExcluded,
  summariseRelevanceShadow,
  type RelevanceGates,
  type RelevanceProfile,
} from "./scoreRelevance.ts";
import { buildGeoMatcher, geoOriginTerms } from "./geoRelevance.ts";
import type { MatchContext } from "./matchScoring.ts";

// Minimal context — the scoreRow maths is exercised by matchScoring.test.ts; here
// we only assert the hard-exclusion wiring, so a neutral ctx is enough.
const ctx: MatchContext = {
  userSectors: ["financial-services"],
  sellsToSectors: [],
  serviceTags: [],
  locationPatterns: ["sydney"],
  userCountry: "united kingdom",
  userIsIntl: true,
  countryTerm: "united kingdom",
};

const ukGates: RelevanceGates = {
  geoMatcher: buildGeoMatcher({ targetRegions: ["sydney"] }),
  agencyOriginTerms: geoOriginTerms("United Kingdom"), // ["united kingdom"]
  targetRegions: ["sydney"],
  icpTokens: ["fintech", "payments"],
  excludeImmigration: false,
};

const ALL: RelevanceProfile = {
  geo: true, agencyCorridor: true, stateRegion: true, chamber: true, leadIcp: true, immigration: true,
};

test("scoreRelevance: an in-market, on-corridor row trips no hard gate and keeps its score", () => {
  const row = { id: "1", name: "Sydney FinTech Advisory", location: "Sydney, NSW", sector_tags: ["financial-services"] };
  const res = scoreRelevance(row, {}, ctx, ukGates, { geo: true });
  assert.deepEqual(res.hard_exclusions, []);
  assert.equal(isHardExcluded(res), false);
  assert.equal(typeof res.score, "number");
  assert.ok(res.score > 0); // specialist/industry match still scored via scoreRow
});

test("scoreRelevance: a clearly-foreign provider location → geo_out_of_market", () => {
  const row = { id: "2", name: "Manhattan Capital", location: "New York City, NY, USA", sector_tags: ["financial-services"] };
  const res = scoreRelevance(row, {}, ctx, ukGates, { geo: true });
  assert.deepEqual(res.hard_exclusions, ["geo_out_of_market"]);
});

test("scoreRelevance: geo check is off unless the profile enables it", () => {
  const row = { id: "2", name: "Manhattan Capital", location: "New York City, NY, USA" };
  const res = scoreRelevance(row, {}, ctx, ukGates, { agencyCorridor: true });
  assert.deepEqual(res.hard_exclusions, []); // geo not in profile → not evaluated
});

test("scoreRelevance: a foreign mission off the founder's corridor → agency_out_of_corridor", () => {
  const usMission = { id: "3", name: "US Commercial Service", organisation_type: "foreign trade agency", country_iso2: "us" };
  const res = scoreRelevance(usMission, {}, ctx, ukGates, { agencyCorridor: true });
  assert.deepEqual(res.hard_exclusions, ["agency_out_of_corridor"]);

  // A domestic ANZ government body stays in corridor for everyone.
  const auBody = { id: "4", name: "Austrade", organisation_type: "government", location_country: "australia" };
  assert.deepEqual(scoreRelevance(auBody, {}, ctx, ukGates, { agencyCorridor: true }).hard_exclusions, []);
});

test("scoreRelevance: a wrong-state state body → state_mismatch (target Sydney/NSW)", () => {
  const vicBody = { id: "5", name: "Global Victoria", organisation_type: "state body", location_state: "VIC", location_country: "australia" };
  const res = scoreRelevance(vicBody, {}, ctx, ukGates, { stateRegion: true });
  assert.deepEqual(res.hard_exclusions, ["state_mismatch"]);

  // A NSW body for a Sydney target is fine.
  const nswBody = { id: "6", name: "Investment NSW", organisation_type: "state body", location_state: "NSW", location_country: "australia" };
  assert.deepEqual(scoreRelevance(nswBody, {}, ctx, ukGates, { stateRegion: true }).hard_exclusions, []);
});

test("scoreRelevance: a wrong-corridor chamber → chamber_mismatch (US chamber for a UK founder)", () => {
  const amcham = { id: "7", name: "American Chamber of Commerce in Australia" };
  const res = scoreRelevance(amcham, {}, ctx, ukGates, { chamber: true });
  assert.deepEqual(res.hard_exclusions, ["chamber_mismatch"]);

  // The matching-corridor chamber is kept.
  const britcham = { id: "8", name: "Australian British Chamber of Commerce" };
  assert.deepEqual(scoreRelevance(britcham, {}, ctx, ukGates, { chamber: true }).hard_exclusions, []);
});

test("scoreRelevance: an off-ICP lead list → off_icp; a matching one passes", () => {
  const offIcp = { id: "9", title: "Recently Funded Australian Startups", sector: "General", tags: ["startups"] };
  assert.deepEqual(scoreRelevance(offIcp, {}, ctx, ukGates, { leadIcp: true }).hard_exclusions, ["off_icp"]);

  const onIcp = { id: "10", title: "Australian Fintech Payments Companies", sector: "Fintech", tags: ["payments"] };
  assert.deepEqual(scoreRelevance(onIcp, {}, ctx, ukGates, { leadIcp: true }).hard_exclusions, []);
});

test("scoreRelevance: immigration row only excluded when excludeImmigration gate is set", () => {
  const visaMentor = { id: "11", name: "Jane Doe", title: "Immigration & Visa Specialist", specialties: ["work visa sponsorship"] };

  // Domestic company that didn't ask for immigration help → gate on → excluded.
  const domesticGates: RelevanceGates = { ...ukGates, excludeImmigration: true };
  assert.deepEqual(
    scoreRelevance(visaMentor, {}, ctx, domesticGates, { immigration: true }).hard_exclusions,
    ["immigration_for_domestic"],
  );

  // International founder (gate off) → the same mentor is kept.
  assert.deepEqual(
    scoreRelevance(visaMentor, {}, ctx, ukGates, { immigration: true }).hard_exclusions,
    [],
  );
});

test("scoreRelevance: a row can trip more than one gate", () => {
  // A US foreign mission physically in New York: fails corridor AND (if geo profiled) geo.
  const row = { id: "12", name: "US Commercial Service", organisation_type: "foreign trade agency", country_iso2: "us", location: "New York, NY, USA" };
  const res = scoreRelevance(row, {}, ctx, ukGates, { geo: true, agencyCorridor: true });
  assert.ok(res.hard_exclusions.includes("agency_out_of_corridor"));
  assert.ok(res.hard_exclusions.includes("geo_out_of_market"));
});

test("summariseRelevanceShadow: tallies counts by reason, counts-only (no row identifiers)", () => {
  const rows = [
    { id: "a", name: "Sydney FinTech Advisory", location: "Sydney, NSW", sector_tags: ["financial-services"] }, // clean
    { id: "b", name: "Manhattan Capital", location: "New York City, NY, USA" },                                  // geo
    { id: "c", name: "American Chamber of Commerce in Australia" },                                              // chamber
    { id: "d", name: "US Commercial Service", organisation_type: "foreign trade agency", location: "Chicago, USA" }, // geo + (agency not profiled here)
  ];
  const summary = summariseRelevanceShadow(rows, {}, ctx, ukGates, { geo: true, chamber: true });
  assert.equal(summary.evaluated, 4);
  assert.equal(summary.flagged_rows, 3); // b, c, d
  assert.equal(summary.by_reason.geo_out_of_market, 2); // b, d
  assert.equal(summary.by_reason.chamber_mismatch, 1);  // c
  // Serialisable and identifier-free — safe for report_json.metadata.
  assert.equal(JSON.stringify(summary).includes("Manhattan"), false);
});

test("summariseRelevanceShadow: empty / null pool is safe", () => {
  const s = summariseRelevanceShadow([], {}, ctx, ukGates, ALL);
  assert.equal(s.evaluated, 0);
  assert.equal(s.flagged_rows, 0);
  assert.deepEqual(s.by_reason, {});
});
