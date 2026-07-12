import { test } from "node:test";
import assert from "node:assert/strict";
import { selectRelevantSurface, applyRelevanceSelection, SURFACE_SELECT } from "./selectRelevant.ts";
import { buildGeoMatcher, geoOriginTerms } from "./geoRelevance.ts";
import type { RelevanceGates } from "./scoreRelevance.ts";
import type { MatchContext } from "./matchScoring.ts";

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
  agencyOriginTerms: geoOriginTerms("United Kingdom"),
  targetRegions: ["sydney"],
  icpTokens: ["fintech", "payments"],
  excludeImmigration: false,
};

test("agencies: hard-drops out-of-corridor + wrong-state, keeps in-corridor", () => {
  const rows = [
    { id: "1", name: "Austrade", organisation_type: "government", location_country: "australia" }, // keep
    { id: "2", name: "US Commercial Service", organisation_type: "foreign trade agency", country_iso2: "us" }, // corridor drop
    { id: "3", name: "Global Victoria", organisation_type: "state body", location_state: "VIC", location_country: "australia" }, // state drop
  ];
  const kept = selectRelevantSurface(rows, ctx, ukGates, SURFACE_SELECT.trade_investment_agencies);
  assert.deepEqual(kept.map((r) => r.id), ["1"]);
});

test("leads: hard-drops off-ICP lists", () => {
  const rows = [
    { id: "a", title: "Australian Fintech Payments Companies", sector: "Fintech", tags: ["payments"] }, // keep
    { id: "b", title: "Recently Funded Startups", sector: "General", tags: ["startups"] }, // off-icp drop
  ];
  const kept = selectRelevantSurface(rows, ctx, ukGates, SURFACE_SELECT.lead_databases);
  assert.deepEqual(kept.map((r) => r.id), ["a"]);
});

test("providers: chamber mismatch hard-drops; geo is floor-guarded", () => {
  const rows = [
    { id: "1", name: "Sydney FinTech Advisory", location: "Sydney, NSW", sector_tags: ["financial-services"] }, // in-market
    { id: "2", name: "American Chamber of Commerce in Australia" }, // chamber drop (hard)
    { id: "3", name: "Manhattan Capital", location: "New York, NY, USA" }, // geo-foreign (soft)
    { id: "4", name: "Melbourne Advisers", location: "Melbourne, VIC" }, // in-market (ANZ)
    { id: "5", name: "Perth Group", location: "Perth, WA" }, // in-market
  ];
  const kept = selectRelevantSurface(rows, ctx, ukGates, SURFACE_SELECT.service_providers);
  // Chamber (2) hard-dropped. Geo floor is 3: with 4 in-market rows (1,4,5 + none foreign needed),
  // the foreign row (3) drops because ≥3 relevant remain.
  assert.ok(!kept.some((r) => r.id === "2"), "chamber dropped");
  assert.ok(!kept.some((r) => r.id === "3"), "foreign geo dropped (enough in-market)");
  assert.deepEqual(kept.map((r) => r.id).sort(), ["1", "4", "5"]);
});

test("providers geo floor backfills when too few in-market rows exist", () => {
  const rows = [
    { id: "1", name: "Sydney FinTech Advisory", location: "Sydney, NSW" }, // in-market
    { id: "2", name: "Manhattan Capital", location: "New York, NY, USA" }, // foreign
    { id: "3", name: "London Advisers", location: "London, UK" }, // foreign
  ];
  // Only 1 in-market but floor is 3 → backfill the two foreign rows to reach the floor.
  const kept = selectRelevantSurface(rows, ctx, ukGates, SURFACE_SELECT.service_providers);
  assert.equal(kept.length, 3);
});

test("mentors: immigration filter only fires when excludeImmigration is set", () => {
  const rows = [
    { id: "1", name: "Jane Expert", title: "Fintech Advisor", specialties: ["payments"] },
    { id: "2", name: "Visa Sam", title: "Immigration & Visa Specialist", specialties: ["work visa sponsorship"] },
    { id: "3", name: "Bob Growth", title: "Growth Advisor" },
    { id: "4", name: "Amy Scale", title: "Scale Advisor" },
  ];
  // excludeImmigration false → nothing dropped.
  assert.equal(selectRelevantSurface(rows, ctx, ukGates, SURFACE_SELECT.community_members).length, 4);
  // excludeImmigration true, floor 3 → with 3 non-immigration rows, the visa mentor drops.
  const domestic = { ...ukGates, excludeImmigration: true };
  const kept = selectRelevantSurface(rows, ctx, domestic, SURFACE_SELECT.community_members);
  assert.ok(!kept.some((r) => r.id === "2"), "visa mentor demoted");
  assert.equal(kept.length, 3);
});

test("applyRelevanceSelection: runs every surface, leaves unconfigured pools untouched", () => {
  const pools = {
    trade_investment_agencies: [
      { id: "1", name: "Austrade", organisation_type: "government", location_country: "australia" },
      { id: "2", name: "US Commercial Service", organisation_type: "foreign trade agency", country_iso2: "us" },
    ],
    events: [{ id: "e1", title: "Some Event" }], // not a relevance surface — untouched
  };
  const out = applyRelevanceSelection(pools, ctx, ukGates);
  assert.deepEqual(out.trade_investment_agencies.map((r: any) => r.id), ["1"]);
  assert.deepEqual(out.events, pools.events); // untouched
});

test("empty / missing pools are safe", () => {
  assert.deepEqual(selectRelevantSurface([], ctx, ukGates, SURFACE_SELECT.lead_databases), []);
  const out = applyRelevanceSelection({}, ctx, ukGates);
  assert.deepEqual(out, {});
});
