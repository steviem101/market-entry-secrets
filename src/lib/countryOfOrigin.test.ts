/**
 * Tests for the PD-7 country-of-origin resolver. Run: `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveCountryOfOrigin } from "./countryOfOrigin.ts";

test("resolveCountryOfOrigin: a listed country passes through unchanged", () => {
  assert.equal(resolveCountryOfOrigin("Ireland"), "Ireland");
  assert.equal(resolveCountryOfOrigin("United Kingdom", "ignored"), "United Kingdom");
});

test("resolveCountryOfOrigin: 'Other' + free text resolves to the typed country", () => {
  assert.equal(resolveCountryOfOrigin("Other", "Brazil"), "Brazil");
  assert.equal(resolveCountryOfOrigin("Other", "  Nigeria  "), "Nigeria"); // trimmed
});

test("resolveCountryOfOrigin: 'Other' with empty/blank free text falls back to 'Other'", () => {
  assert.equal(resolveCountryOfOrigin("Other", ""), "Other");
  assert.equal(resolveCountryOfOrigin("Other", "   "), "Other");
  assert.equal(resolveCountryOfOrigin("Other", null), "Other");
  assert.equal(resolveCountryOfOrigin("Other", undefined), "Other");
});
