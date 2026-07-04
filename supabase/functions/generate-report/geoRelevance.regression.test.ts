/**
 * Bug-regression test for Stage 7 B3/B4 — runs the geo/origin gate against the
 * REAL production rows that leaked into the Kota report (Irish company → Australia),
 * pulled verbatim from `trade_investment_agencies` / `service_providers` on
 * xhziwveaiuhzdoutpgrh. Synthetic unit tests live in geoRelevance.test.ts; this file
 * pins the actual defect so it can't silently return.
 *
 * Scenario: country_of_origin = "Ireland", target_regions = ["Australia"].
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildGeoMatcher, geoOriginTerms, isGeoRelevant, isAgencyInCorridor } from "./geoRelevance.ts";

const geoMatcher = buildGeoMatcher({ targetRegions: ["Australia"] });
const originTerms = geoOriginTerms("Ireland");

// Real service_providers rows (verbatim name/location from prod).
const PROVIDERS: Array<{ name: string; location: string; expect: boolean }> = [
  { name: "SIS International Research", location: "New York City, NY, USA", expect: false }, // B3 offender
  { name: "Sodali & Co", location: "New York, NY", expect: false },
  { name: "Liquid Digital", location: "Sydney, NSW", expect: true },
  { name: "Marsh Australia", location: "Sydney, NSW", expect: true },
  { name: "Absolute Immigration", location: "Melbourne, VIC", expect: true },
  { name: "Airwallex", location: "Melbourne, VIC", expect: true },
];

// Real trade_investment_agencies rows (verbatim structured columns from prod).
const AGENCIES: Array<Record<string, unknown> & { expect: boolean }> = [
  { name: "Austrade", organisation_type: "federal_agency", location_country: "australia", jurisdiction: ["australia", "global"], expect: true },
  { name: "Investment NSW", organisation_type: "state_body", location_country: "australia", jurisdiction: ["nsw", "australia"], expect: true },
  { name: "Australia-United Kingdom Chamber of Commerce", organisation_type: "bilateral", location_country: "australia", jurisdiction: ["australia", "united_kingdom"], expect: true },
  { name: "Enterprise Ireland", organisation_type: "foreign_trade_agency", location_country: "ireland", jurisdiction: ["Australia", "New Zealand"], expect: true }, // origin
  { name: "Invest Northern Ireland", organisation_type: "federal_agency", location_country: "united_kingdom", jurisdiction: ["Northern Ireland", "United Kingdom"], expect: true }, // origin (name)
  // B4 offenders — all physically in Australia, all say "Australia" in their text:
  { name: "UK Department for International Trade", organisation_type: "foreign_trade_agency", location_country: "australia", jurisdiction: ["United Kingdom", "Australia"], description: "supports UK companies entering Australia and Australian companies in the UK", expect: false },
  { name: "Canadian Consulate / Global Affairs Canada", organisation_type: "foreign_trade_agency", location_country: "australia", jurisdiction: ["Canada", "Australia"], description: "The High Commission of Canada in Australia, supports trade, investment and bilateral", expect: false },
  { name: "British Consulate General Brisbane", organisation_type: "foreign_trade_agency", location_country: "australia", jurisdiction: ["United Kingdom", "Australia", "Queensland", "Northern Territory"], expect: false },
  { name: "Consulate General of Malaysia, Perth", organisation_type: "foreign_trade_agency", location_country: "australia", jurisdiction: ["Malaysia", "Australia - Western Australia"], expect: false },
  { name: "Export Development Canada", organisation_type: "foreign_trade_agency", location_country: "canada", jurisdiction: ["CA", "AU"], expect: false },
  { name: "Trade Commissioner Service (Canada)", organisation_type: "foreign_trade_agency", location_country: "canada", jurisdiction: ["Canada"], expect: false },
];

test("B3 regression: real providers — foreign dropped, AU kept (Irish → Australia)", () => {
  for (const p of PROVIDERS) {
    assert.equal(isGeoRelevant(p, geoMatcher), p.expect, `provider "${p.name}" (${p.location})`);
  }
});

test("B4 regression: real agencies — wrong-origin missions dropped, AU + Irish kept", () => {
  for (const a of AGENCIES) {
    assert.equal(isAgencyInCorridor(a, originTerms), a.expect, `agency "${a.name}"`);
  }
});

test("B4 regression: no wrong-origin agency survives, at least one AU + the Irish body do", () => {
  const kept = AGENCIES.filter((a) => isAgencyInCorridor(a, originTerms));
  const keptNames = kept.map((a) => a.name);
  // The exact Kota leaks are gone:
  assert.ok(!keptNames.includes("UK Department for International Trade"));
  assert.ok(!keptNames.includes("Canadian Consulate / Global Affairs Canada"));
  // The report still has real corridor support:
  assert.ok(keptNames.includes("Austrade"));
  assert.ok(keptNames.includes("Enterprise Ireland"));
});
