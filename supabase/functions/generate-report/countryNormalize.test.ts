/**
 * Tests for the Phase E country corridor normaliser. Run: `npm test`.
 * Guards that intake Title-Case names fold to the same token as the
 * lower/underscore directory column values.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeCountry, isInternationalOrigin } from "./countryNormalize.ts";

test("intake names fold to the same token as origin_country column values", () => {
  // intake "United Kingdom" must match community_members.origin_country "uk"
  assert.equal(normalizeCountry("United Kingdom"), normalizeCountry("uk"));
  assert.equal(normalizeCountry("United States"), normalizeCountry("usa"));
  assert.equal(normalizeCountry("South Korea"), normalizeCountry("korea"));
  assert.equal(normalizeCountry("Singapore"), normalizeCountry("singapore"));
  assert.equal(normalizeCountry("Ireland"), normalizeCountry("ireland"));
  assert.equal(normalizeCountry("France"), normalizeCountry("france"));
});

test("underscore tokens fold to the same key as spaced names", () => {
  assert.equal(normalizeCountry("hong_kong"), normalizeCountry("Hong Kong"));
  assert.equal(normalizeCountry("south_africa"), normalizeCountry("South Africa"));
});

test("MES-233: verbose Irish origin folds to the same key as 'Ireland'", () => {
  // "Republic of Ireland" previously slugged to "republic-of-ireland" and never
  // matched an Irish-origin mentor/agency ("ireland") — the corridor disarmed.
  assert.equal(normalizeCountry("Republic of Ireland"), "ireland");
  assert.equal(normalizeCountry("Republic of Ireland"), normalizeCountry("Ireland"));
  assert.equal(normalizeCountry("Eire"), "ireland");
  assert.equal(normalizeCountry("eire"), normalizeCountry("ireland"));
  // Guard: still distinct from an unrelated origin.
  assert.notEqual(normalizeCountry("Republic of Ireland"), normalizeCountry("Iceland"));
});

test("non-matching origins do not collide", () => {
  assert.notEqual(normalizeCountry("Ireland"), normalizeCountry("Japan"));
  assert.notEqual(normalizeCountry("United Kingdom"), normalizeCountry("usa"));
});

test("blank / nullish input yields empty string", () => {
  assert.equal(normalizeCountry(""), "");
  assert.equal(normalizeCountry(null), "");
  assert.equal(normalizeCountry(undefined), "");
});

test("isInternationalOrigin distinguishes Australian from foreign founders", () => {
  assert.equal(isInternationalOrigin("Australia"), false);
  assert.equal(isInternationalOrigin("australia"), false);
  assert.equal(isInternationalOrigin("Ireland"), true);
  assert.equal(isInternationalOrigin("United States"), true);
  assert.equal(isInternationalOrigin(""), false);
  assert.equal(isInternationalOrigin(null), false);
});
