/**
 * MES-230 — industry picker search: sectors selectable alongside their breakout
 * groups, and everyday synonyms ("banking", "fintech", "saas") resolve to
 * canonical taxonomy labels. Guards the exact gap that motivated the ticket:
 * "financial services" / "banking" previously returned NOTHING because the
 * picker searched only the 152 group labels. Run: `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  LINKEDIN_SECTORS,
  LINKEDIN_TAXONOMY,
  INDUSTRY_GROUP_OPTIONS,
  INDUSTRY_PICKER_OPTIONS,
  INDUSTRY_SEARCH_ALIASES,
  isCanonicalIndustry,
  searchIndustryOptions,
} from "./linkedinTaxonomy.ts";

test("picker options = 20 sectors + 152 groups, deduped", () => {
  assert.equal(LINKEDIN_SECTORS.length, 20);
  assert.equal(INDUSTRY_GROUP_OPTIONS.length, 152);
  // "Holding Companies" is both a sector and its sole group → one dedup.
  assert.equal(INDUSTRY_PICKER_OPTIONS.length, 20 + 152 - 1);
  assert.ok(INDUSTRY_PICKER_OPTIONS.includes("Financial Services"));
  assert.ok(INDUSTRY_PICKER_OPTIONS.includes("Insurance"));
});

test("every search alias resolves to exact canonical picker options", () => {
  const options = new Set<string>(INDUSTRY_PICKER_OPTIONS);
  for (const { labels } of INDUSTRY_SEARCH_ALIASES) {
    for (const label of labels) {
      assert.ok(options.has(label), `alias label "${label}" is not canonical`);
    }
  }
});

test('"financial services" surfaces the sector heading AND its breakouts (MES-230)', () => {
  const results = searchIndustryOptions("financial services");
  assert.equal(results[0], "Financial Services");
  for (const g of LINKEDIN_TAXONOMY["Financial Services"]) {
    assert.ok(results.includes(g), `breakout ${g} missing`);
  }
});

test('"banking" (not a taxonomy node) resolves via aliases to Financial Services + breakouts', () => {
  const results = searchIndustryOptions("banking");
  assert.equal(results[0], "Financial Services");
  assert.ok(results.includes("Credit Intermediation"));
  // Sanity: the old behaviour (strict group substring) found nothing for this.
  assert.ok(!INDUSTRY_GROUP_OPTIONS.some((o) => o.toLowerCase().includes("banking")));
});

test("synonyms resolve: fintech, saas, cyber, healthcare, hr", () => {
  assert.equal(searchIndustryOptions("fintech")[0], "Financial Services");
  assert.ok(searchIndustryOptions("saas").includes("Software Development"));
  assert.ok(searchIndustryOptions("cyber").includes("Software Development"));
  assert.equal(searchIndustryOptions("healthcare")[0], "Hospitals and Health Care");
  assert.ok(searchIndustryOptions("hr").includes("Staffing and Recruiting"));
});

test("plain group substring search still works and respects exclusions + cap", () => {
  // The direct name hit leads; the "credit" alias expands the FS family behind it.
  const credit = searchIndustryOptions("credit interme");
  assert.equal(credit[0], "Credit Intermediation");
  assert.ok(credit.includes("Financial Services"));
  // Excluded values are omitted.
  const excl = searchIndustryOptions("financial services", ["Insurance"]);
  assert.ok(!excl.includes("Insurance"));
  assert.equal(excl[0], "Financial Services");
  // Cap respected.
  assert.ok(searchIndustryOptions("a", [], 8).length <= 8);
  // Empty query → no results.
  assert.deepEqual(searchIndustryOptions("   "), []);
});

test("isCanonicalIndustry: sectors and groups are canonical, everyday terms are not", () => {
  assert.ok(isCanonicalIndustry("Financial Services"));
  assert.ok(isCanonicalIndustry("insurance")); // case-insensitive
  assert.ok(!isCanonicalIndustry("Banking"));
  assert.ok(!isCanonicalIndustry(""));
});
