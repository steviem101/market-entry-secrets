import { test } from "node:test";
import assert from "node:assert/strict";
import { buildGeoMatcher, geoOriginTerms, isGeoRelevant } from "./geoRelevance.ts";

test("geoOriginTerms: intl origin kept, AU/blank/short dropped", () => {
  assert.deepEqual(geoOriginTerms("Ireland"), ["ireland"]);
  assert.deepEqual(geoOriginTerms("United States"), ["united states"]);
  assert.deepEqual(geoOriginTerms("Australia"), []);
  assert.deepEqual(geoOriginTerms(""), []);
  assert.deepEqual(geoOriginTerms(null), []);
  assert.deepEqual(geoOriginTerms("US"), []); // too short → avoids "contact us" false-match
});

test("non-strict: foreign location dropped, AU kept (B3 — service providers)", () => {
  const m = buildGeoMatcher({ targetRegions: ["Australia"] });
  // The actual B3 leak: a New-York firm on an Australia report.
  assert.equal(isGeoRelevant({ name: "SIS International Research", location: "New York City, USA" }, m), false);
  assert.equal(isGeoRelevant({ name: "Grant Thornton", location: "Sydney, Australia" }, m), true);
  assert.equal(isGeoRelevant({ name: "Local Co", location: "Melbourne" }, m), true);
});

test("non-strict: blank + ambiguous locations are kept", () => {
  const m = buildGeoMatcher({ targetRegions: ["Australia"] });
  assert.equal(isGeoRelevant({ name: "No Location Co", location: "" }, m), true);
  assert.equal(isGeoRelevant({ name: "No Location Co" }, m), true); // undefined location
  assert.equal(isGeoRelevant({ name: "Global Co", location: "Global" }, m), true);
  assert.equal(isGeoRelevant({ name: "Remote Co", location: "Remote / Worldwide" }, m), true);
});

test("non-strict: word boundaries — 'software'/'international' don't false-match WA/NT", () => {
  const m = buildGeoMatcher({ targetRegions: ["Australia"] });
  // "software house, Berlin" must NOT pass via the "wa" inside "software".
  assert.equal(isGeoRelevant({ name: "X", location: "Software House, Berlin" }, m), false);
  // But a standalone "WA" (Western Australia) passes.
  assert.equal(isGeoRelevant({ name: "X", location: "Perth, WA" }, m), true);
});

test("non-strict: target region beyond ANZ is honoured", () => {
  const m = buildGeoMatcher({ targetRegions: ["Singapore"] });
  assert.equal(isGeoRelevant({ name: "SG Co", location: "Singapore" }, m), true);
  assert.equal(isGeoRelevant({ name: "AU Co", location: "Brisbane" }, m), true); // ANZ still in scope
});

test("strict agencies: wrong-origin dropped, AU + origin kept (B4)", () => {
  const m = buildGeoMatcher({ targetRegions: ["Australia"], originTerms: geoOriginTerms("Ireland") });
  // The actual B4 leaks — neither AU nor Irish → dropped, even though location renders "Unknown".
  assert.equal(isGeoRelevant({ name: "UK Department for International Trade", location: "Unknown" }, m, { strict: true }), false);
  assert.equal(isGeoRelevant({ name: "Canadian Consulate / Global Affairs Canada", location: "Unknown" }, m, { strict: true }), false);
  // Origin trade body for an Irish founder — kept via the name.
  assert.equal(isGeoRelevant({ name: "Enterprise Ireland", location: "Unknown" }, m, { strict: true }), true);
  // Australian agency — kept.
  assert.equal(isGeoRelevant({ name: "Austrade (Australian Trade and Investment Commission)", location: "Sydney" }, m, { strict: true }), true);
});

test("strict agencies: 'Global Affairs Canada' not saved by the ambiguous escape", () => {
  // "global" only rescues NON-strict rows; strict agencies must positively match.
  const m = buildGeoMatcher({ targetRegions: ["Australia"], originTerms: geoOriginTerms("Ireland") });
  assert.equal(isGeoRelevant({ name: "Global Affairs Canada", location: "Global" }, m, { strict: true }), false);
});

test("strict agencies: origin-country agency for a US founder is in scope", () => {
  const m = buildGeoMatcher({ targetRegions: ["Australia"], originTerms: geoOriginTerms("United States") });
  assert.equal(isGeoRelevant({ name: "U.S. Commercial Service", description: "helps United States firms export" }, m, { strict: true }), true);
  // A Canadian agency is still out for a US founder.
  assert.equal(isGeoRelevant({ name: "Canadian Trade Commissioner Service", location: "Ottawa" }, m, { strict: true }), false);
});
