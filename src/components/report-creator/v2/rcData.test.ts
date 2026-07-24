/**
 * MES-110/MES-230 guard: the intake quick-pick chips must be exact canonical
 * INDUSTRY_PICKER_OPTIONS values (the 20 sectors + 152 groups). Non-canonical
 * chip labels ("Medical Devices", "Architecture & Planning", ...) were stored
 * verbatim in user_intake_forms and silently resolved to zero sectors in the
 * report matcher. MES-230 widened the canonical set to include sector headings
 * ("Financial Services") — the matcher resolves those to their sector slug
 * directly (generate-report/sectorTaxonomy.test.ts covers that side).
 * Run: `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { TOP_INDUSTRIES, MORE_INDUSTRIES } from "./rcData.ts";
import { INDUSTRY_PICKER_OPTIONS } from "../../../constants/linkedinTaxonomy.ts";

test("every quick-pick chip is an exact canonical picker option (sector or group)", () => {
  const options = new Set<string>(INDUSTRY_PICKER_OPTIONS);
  for (const chip of [...TOP_INDUSTRIES, ...MORE_INDUSTRIES]) {
    assert.ok(options.has(chip), `chip "${chip}" is not a canonical picker option`);
  }
});

test("chips are unique across TOP and MORE", () => {
  const all = [...TOP_INDUSTRIES, ...MORE_INDUSTRIES];
  assert.equal(new Set(all).size, all.length);
  assert.equal(TOP_INDUSTRIES.length, 10);
  assert.equal(MORE_INDUSTRIES.length, 17);
});

test("Financial Services is a TOP chip and its breakouts remain reachable in MORE", () => {
  assert.ok(TOP_INDUSTRIES.includes("Financial Services"));
  for (const breakout of ["Capital Markets", "Credit Intermediation", "Funds and Trusts", "Insurance"]) {
    assert.ok(MORE_INDUSTRIES.includes(breakout), `${breakout} missing from MORE`);
  }
});
