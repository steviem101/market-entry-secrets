import { test } from "node:test";
import assert from "node:assert/strict";
import { buildGeoMatcher, geoOriginTerms, isGeoRelevant, isAgencyInCorridor } from "./geoRelevance.ts";

test("geoOriginTerms: intl origin kept, AU/blank/short dropped, underscores normalised", () => {
  assert.deepEqual(geoOriginTerms("Ireland"), ["ireland"]);
  assert.deepEqual(geoOriginTerms("United States"), ["united states"]);
  assert.deepEqual(geoOriginTerms("united_kingdom"), ["united kingdom"]);
  assert.deepEqual(geoOriginTerms("Australia"), []);
  assert.deepEqual(geoOriginTerms(""), []);
  assert.deepEqual(geoOriginTerms(null), []);
  assert.deepEqual(geoOriginTerms("US"), []); // too short → avoids "contact us" false-match
});

// ── Providers / innovation (location-based) — B3 ──────────────────────────
test("isGeoRelevant: foreign location dropped, AU kept (B3)", () => {
  const m = buildGeoMatcher({ targetRegions: ["Australia"] });
  assert.equal(isGeoRelevant({ name: "SIS International Research", location: "New York City, NY, USA" }, m), false);
  assert.equal(isGeoRelevant({ name: "Sodali & Co", location: "New York, NY" }, m), false);
  assert.equal(isGeoRelevant({ name: "Marsh Australia", location: "Sydney, NSW" }, m), true);
  assert.equal(isGeoRelevant({ name: "Airwallex", location: "Melbourne, VIC" }, m), true);
});

test("isGeoRelevant: blank + ambiguous locations kept; bare ', AU' kept", () => {
  const m = buildGeoMatcher({ targetRegions: ["Australia"] });
  assert.equal(isGeoRelevant({ name: "No Location Co", location: "" }, m), true);
  assert.equal(isGeoRelevant({ name: "No Location Co" }, m), true); // undefined location
  assert.equal(isGeoRelevant({ name: "Global Co", location: "Global" }, m), true);
  assert.equal(isGeoRelevant({ name: "Postcode Co", location: "6000, AU" }, m), true); // ", AU" country code
});

test("isGeoRelevant: word boundaries — 'software'/'international' don't false-match", () => {
  const m = buildGeoMatcher({ targetRegions: ["Australia"] });
  assert.equal(isGeoRelevant({ name: "X", location: "Software House, Berlin" }, m), false);
  assert.equal(isGeoRelevant({ name: "X", location: "Perth, WA" }, m), true); // standalone WA
  // 'usa' must not match the bare 'au' token
  assert.equal(isGeoRelevant({ name: "X", location: "Austin, USA" }, m), false);
});

test("isGeoRelevant: target region beyond ANZ is honoured", () => {
  const m = buildGeoMatcher({ targetRegions: ["Singapore"] });
  assert.equal(isGeoRelevant({ name: "SG Co", location: "Singapore" }, m), true);
  assert.equal(isGeoRelevant({ name: "AU Co", location: "Brisbane" }, m), true); // ANZ still in scope
});

// ── Trade / government agencies (structured columns) — B4 ─────────────────
test("isAgencyInCorridor: Australian bodies always kept", () => {
  const irish = geoOriginTerms("Ireland");
  assert.equal(isAgencyInCorridor({ name: "Austrade", organisation_type: "federal_agency", location_country: "australia" }, irish), true);
  assert.equal(isAgencyInCorridor({ name: "Investment NSW", organisation_type: "state_body", location_country: "australia" }, irish), true);
  assert.equal(isAgencyInCorridor({ name: "Australia-United Kingdom Chamber of Commerce", organisation_type: "bilateral", location_country: "australia" }, irish), true);
});

test("isAgencyInCorridor: wrong-origin foreign missions dropped even though located in AU (B4)", () => {
  const irish = geoOriginTerms("Ireland");
  // These render "Australia" all over their text (they're AU-based missions) — only the
  // structured signal (foreign_trade_agency + non-Irish jurisdiction) catches them.
  assert.equal(isAgencyInCorridor({ name: "UK Department for International Trade", organisation_type: "foreign_trade_agency", location_country: "australia", jurisdiction: ["United Kingdom", "Australia"], description: "supports UK companies entering Australia" }, irish), false);
  assert.equal(isAgencyInCorridor({ name: "Canadian Consulate / Global Affairs Canada", organisation_type: "foreign_trade_agency", location_country: "australia", jurisdiction: ["Canada", "Australia"] }, irish), false);
  assert.equal(isAgencyInCorridor({ name: "Consulate General of Malaysia, Perth", organisation_type: "foreign_trade_agency", location_country: "australia", jurisdiction: ["Malaysia", "Australia - Western Australia"] }, irish), false);
});

test("isAgencyInCorridor: origin-country trade bodies kept", () => {
  const irish = geoOriginTerms("Ireland");
  // Enterprise Ireland: foreign_trade_agency, HQ in Ireland, jurisdiction is its target markets [Australia, NZ].
  assert.equal(isAgencyInCorridor({ name: "Enterprise Ireland", organisation_type: "foreign_trade_agency", location_country: "ireland", jurisdiction: ["Australia", "New Zealand"] }, irish), true);
  // Invest Northern Ireland: federal_agency located in the UK; name carries "Northern Ireland".
  assert.equal(isAgencyInCorridor({ name: "Invest Northern Ireland", organisation_type: "federal_agency", location_country: "united_kingdom", jurisdiction: ["Northern Ireland", "United Kingdom"] }, irish), true);
});

test("isAgencyInCorridor: domestic AU founder drops all foreign missions", () => {
  const none = geoOriginTerms("Australia"); // []
  assert.equal(isAgencyInCorridor({ name: "Austrade", organisation_type: "federal_agency", location_country: "australia" }, none), true);
  assert.equal(isAgencyInCorridor({ name: "Canadian Consulate", organisation_type: "foreign_trade_agency", location_country: "australia", jurisdiction: ["Canada", "Australia"] }, none), false);
  assert.equal(isAgencyInCorridor({ name: "Enterprise Ireland", organisation_type: "foreign_trade_agency", location_country: "ireland" }, none), false);
});

test("isAgencyInCorridor: US founder keeps US body (underscore-normalised) and drops Canadian", () => {
  const us = geoOriginTerms("United States");
  assert.equal(isAgencyInCorridor({ name: "SelectUSA", organisation_type: "foreign_trade_agency", location_country: "united_states", jurisdiction: ["United States", "Australia"] }, us), true);
  assert.equal(isAgencyInCorridor({ name: "Trade Commissioner Service (Canada)", organisation_type: "foreign_trade_agency", location_country: "canada", jurisdiction: ["Canada"] }, us), false);
});

test("isAgencyInCorridor: NZ body + 'au' location_country variant kept (ANZ market)", () => {
  const irish = geoOriginTerms("Ireland");
  assert.equal(isAgencyInCorridor({ name: "NZTE", organisation_type: "nz_government", location_country: "new_zealand" }, irish), true);
  assert.equal(isAgencyInCorridor({ name: "Some AU Body", organisation_type: "bilateral", location_country: "au" }, irish), true);
});

test("isAgencyInCorridor: HQ-abroad body kept when jurisdiction covers ANZ (any founder)", () => {
  // ALTIOS/Expandys: private trade consultancies HQ'd in France/UK that SERVE Australia.
  const altios = { name: "ALTIOS International", organisation_type: "trade_consultancy", location_country: "france", jurisdiction: ["Australia", "New Zealand", "Global"] };
  const expandys = { name: "Expandys", organisation_type: "trade_consultancy", location_country: "united_kingdom", jurisdiction: ["Australia", "United Kingdom", "India"] };
  for (const terms of [geoOriginTerms("Ireland"), geoOriginTerms("Japan"), geoOriginTerms("Australia")]) {
    assert.equal(isAgencyInCorridor(altios, terms), true);
    assert.equal(isAgencyInCorridor(expandys, terms), true);
  }
  // Mis-tagged AU-Italy chamber (location_country=canada by bad data): the ANZ jurisdiction
  // still places it in-market, and it's now partner-gated — kept for an ITALIAN founder,
  // dropped for others (see the dedicated bilateral test below).
  const itChamber = { name: "Italian Chamber of Commerce in Australia - Melbourne", organisation_type: "bilateral", location_country: "canada", jurisdiction: ["Italy", "Australia - Victoria", "Australia - Tasmania"] };
  assert.equal(isAgencyInCorridor(itChamber, geoOriginTerms("Italy")), true);
  assert.equal(isAgencyInCorridor(itChamber, geoOriginTerms("Ireland")), false);
});

test("isAgencyInCorridor: bilateral chamber gated by its partner country (AmCham/ICCNZ)", () => {
  // AmCham Australia (Australia↔US) — kept only for a US founder; noise for a Singaporean.
  const amcham = { name: "AmCham Australia", organisation_type: "bilateral", location_country: "australia", jurisdiction: ["Australia", "United States"] };
  assert.equal(isAgencyInCorridor(amcham, geoOriginTerms("United States")), true);
  assert.equal(isAgencyInCorridor(amcham, geoOriginTerms("Singapore")), false);
  assert.equal(isAgencyInCorridor(amcham, geoOriginTerms("Ireland")), false);
  // Italian Chamber in NEW ZEALAND (Italy↔NZ) — ANZ-located but partner Italy; dropped for a Singaporean.
  const iccnz = { name: "Italian Chamber of Commerce in New Zealand (ICCNZ)", organisation_type: "bilateral", location_country: "new_zealand", jurisdiction: ["Italy", "New Zealand"] };
  assert.equal(isAgencyInCorridor(iccnz, geoOriginTerms("Singapore")), false);
  assert.equal(isAgencyInCorridor(iccnz, geoOriginTerms("Italy")), true);
  // A generic ANZ chamber with no specific foreign partner stays for everyone.
  const generic = { name: "Australian Chamber of Commerce", organisation_type: "bilateral", location_country: "australia", jurisdiction: ["Australia"] };
  assert.equal(isAgencyInCorridor(generic, geoOriginTerms("Singapore")), true);
});

test("isAgencyInCorridor: foreign mission NOT rescued by an 'Australia' jurisdiction entry", () => {
  // Canadian Consulate has jurisdiction ["Canada","Australia"] — but it's a foreign
  // mission, so the ANZ-jurisdiction escape must NOT apply; it stays origin-gated.
  const irish = geoOriginTerms("Ireland");
  assert.equal(isAgencyInCorridor({ name: "Canadian Consulate", organisation_type: "foreign_trade_agency", location_country: "australia", jurisdiction: ["Canada", "Australia"] }, irish), false);
  // Invest Northern Ireland: non-mission but jurisdiction has NO ANZ → origin-only.
  const invNI = { name: "Invest Northern Ireland", organisation_type: "federal_agency", location_country: "united_kingdom", jurisdiction: ["Northern Ireland", "United Kingdom"] };
  assert.equal(isAgencyInCorridor(invNI, irish), true);                    // Irish founder → kept (name)
  assert.equal(isAgencyInCorridor(invNI, geoOriginTerms("Japan")), false); // Japanese founder → dropped
});
