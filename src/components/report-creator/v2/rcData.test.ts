/**
 * MES-110 guard: the intake quick-pick chips must be exact canonical
 * INDUSTRY_GROUP_OPTIONS values. Non-canonical chip labels ("Financial
 * Services", "Medical Devices", "Architecture & Planning", ...) were stored
 * verbatim in user_intake_forms and silently resolved to zero sectors in the
 * report matcher. Run: `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { TOP_INDUSTRIES, MORE_INDUSTRIES } from "./rcData.ts";
import { INDUSTRY_GROUP_OPTIONS } from "../../../constants/linkedinTaxonomy.ts";

test("every quick-pick chip is an exact canonical industry group", () => {
  const options = new Set<string>(INDUSTRY_GROUP_OPTIONS);
  for (const chip of [...TOP_INDUSTRIES, ...MORE_INDUSTRIES]) {
    assert.ok(options.has(chip), `chip "${chip}" is not a canonical industry group`);
  }
});

test("chips are unique across TOP and MORE", () => {
  const all = [...TOP_INDUSTRIES, ...MORE_INDUSTRIES];
  assert.equal(new Set(all).size, all.length);
  assert.equal(TOP_INDUSTRIES.length, 10);
  assert.equal(MORE_INDUSTRIES.length, 14);
});
