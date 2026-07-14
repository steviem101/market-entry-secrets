/**
 * Unit tests for the pure Case Studies filter/sort logic.
 * Run: `npm test` (node --test, Node 22+ strips types natively).
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  filterAndSortCaseStudies,
  matchesRevenueRange,
  matchesCostsRange,
  parseMoneyToNumber,
  isPositiveOutcome,
  isFailureOutcome,
  outcomeTone,
  OUTCOME_LABELS,
  type CaseStudyLike,
} from "./caseStudyFilters.ts";

const cs = (
  title: string,
  p: Partial<{ company_name: string; industry: string; origin_country: string; outcome: string; monthly_revenue: string; startup_costs: string }>,
  view_count = 0,
  sector_tags: string[] = [],
): CaseStudyLike => ({ title, view_count, sector_tags, content_company_profiles: [p] });

const DATA: CaseStudyLike[] = [
  cs("Acme enters AU", { company_name: "Acme", industry: "SaaS", origin_country: "United States", outcome: "successful", monthly_revenue: "$40,000", startup_costs: "$60,000" }, 100, ["technology-information-and-media"]),
  cs("Beta pivots", { company_name: "Beta", industry: "Fintech", origin_country: "United Kingdom", outcome: "unsuccessful", monthly_revenue: "$5,000", startup_costs: "$200,000" }, 50, ["financial-services"]),
  cs("Gamma grows", { company_name: "Gamma", industry: "SaaS", origin_country: "Canada", outcome: "successful", monthly_revenue: "$120,000", startup_costs: "$10,000" }, 200, ["technology-information-and-media"]),
];

const base = { search: "", outcome: "all", sector: "all", country: "all", revenue: "all", costs: "all", sort: "recent" };

test("parseMoneyToNumber strips $ and commas; blank → 0", () => {
  assert.equal(parseMoneyToNumber("$40,000"), 40000);
  assert.equal(parseMoneyToNumber(null), 0);
  assert.equal(parseMoneyToNumber(""), 0);
});

test("range matchers treat both 'all' and legacy 'any' as unfiltered", () => {
  assert.equal(matchesRevenueRange("$5,000", "all"), true);
  assert.equal(matchesRevenueRange("$5,000", "any"), true);
  assert.equal(matchesCostsRange("$5,000", "all"), true);
});

test("revenue range boundaries", () => {
  assert.equal(matchesRevenueRange("$40,000", "10k-50k"), true);
  assert.equal(matchesRevenueRange("$40,000", "50k-100k"), false);
  assert.equal(matchesRevenueRange("$120,000", "100k+"), true);
});

test("no filters → all case studies (recent order preserved)", () => {
  assert.deepEqual(filterAndSortCaseStudies(DATA, base).map((c) => c.title), ["Acme enters AU", "Beta pivots", "Gamma grows"]);
});

test("outcome filter", () => {
  assert.deepEqual(filterAndSortCaseStudies(DATA, { ...base, outcome: "successful" }).map((c) => c.title), ["Acme enters AU", "Gamma grows"]);
  assert.deepEqual(filterAndSortCaseStudies(DATA, { ...base, outcome: "unsuccessful" }).map((c) => c.title), ["Beta pivots"]);
});

test("the successful tab includes every positive outcome (scaling/ipo/acquired)", () => {
  const rich: CaseStudyLike[] = [
    cs("Scaler", { outcome: "scaling" }),
    cs("Floated", { outcome: "ipo" }),
    cs("Bought", { outcome: "acquired" }),
    cs("Won", { outcome: "successful" }),
    cs("Lost", { outcome: "unsuccessful" }),
    cs("Unclassified", {}),
  ];
  assert.deepEqual(
    filterAndSortCaseStudies(rich, { ...base, outcome: "successful" }).map((c) => c.title),
    ["Scaler", "Floated", "Bought", "Won"],
  );
  assert.deepEqual(
    filterAndSortCaseStudies(rich, { ...base, outcome: "unsuccessful" }).map((c) => c.title),
    ["Lost"],
  );
  // A direct deep link to a specific positive outcome still matches by equality.
  assert.deepEqual(
    filterAndSortCaseStudies(rich, { ...base, outcome: "scaling" }).map((c) => c.title),
    ["Scaler"],
  );
});

test("outcome helpers: positive vs failure vs unknown", () => {
  for (const o of ["successful", "scaling", "ipo", "acquired"]) {
    assert.equal(isPositiveOutcome(o), true, o);
    assert.equal(outcomeTone(o), "positive", o);
    assert.notEqual(OUTCOME_LABELS[o], "Failure", o);
  }
  assert.equal(isFailureOutcome("unsuccessful"), true);
  assert.equal(outcomeTone("unsuccessful"), "negative");
  assert.equal(OUTCOME_LABELS.unsuccessful, "Failure");
  // NULL / unknown values: no tone → no badge.
  assert.equal(outcomeTone(null), null);
  assert.equal(outcomeTone(undefined), null);
  assert.equal(outcomeTone("pivoted"), null);
});

test("sector (canonical sector_tags) and country filters", () => {
  assert.deepEqual(filterAndSortCaseStudies(DATA, { ...base, sector: "technology-information-and-media" }).map((c) => c.title), ["Acme enters AU", "Gamma grows"]);
  assert.deepEqual(filterAndSortCaseStudies(DATA, { ...base, sector: "financial-services" }).map((c) => c.title), ["Beta pivots"]);
  assert.deepEqual(filterAndSortCaseStudies(DATA, { ...base, country: "Canada" }).map((c) => c.title), ["Gamma grows"]);
});

test("revenue + costs range filters combine (AND)", () => {
  // revenue 10k-50k AND costs 50k-100k → only Acme ($40k rev, $60k cost)
  const out = filterAndSortCaseStudies(DATA, { ...base, revenue: "10k-50k", costs: "50k-100k" });
  assert.deepEqual(out.map((c) => c.title), ["Acme enters AU"]);
});

test("search matches title, company name, and free-text industry, case-insensitively", () => {
  assert.equal(filterAndSortCaseStudies(DATA, { ...base, search: "gamma" }).length, 1);
  assert.equal(filterAndSortCaseStudies(DATA, { ...base, search: "BETA" }).length, 1);
  // free-text industry stays searchable even though it is no longer a facet (MES-177 B3)
  assert.equal(filterAndSortCaseStudies(DATA, { ...base, search: "fintech" }).length, 1);
});

test("sort by views (desc) and alphabetical, without mutating input", () => {
  const byViews = filterAndSortCaseStudies(DATA, { ...base, sort: "views" });
  assert.deepEqual(byViews.map((c) => c.title), ["Gamma grows", "Acme enters AU", "Beta pivots"]);
  const alpha = filterAndSortCaseStudies(DATA, { ...base, sort: "alphabetical" });
  assert.deepEqual(alpha.map((c) => c.title), ["Acme enters AU", "Beta pivots", "Gamma grows"]);
  // input array order untouched
  assert.deepEqual(DATA.map((c) => c.title), ["Acme enters AU", "Beta pivots", "Gamma grows"]);
});

test("old-style deep link (outcome=successful & revenue=10k-50k) filters correctly", () => {
  const out = filterAndSortCaseStudies(DATA, { ...base, outcome: "successful", revenue: "10k-50k" });
  assert.deepEqual(out.map((c) => c.title), ["Acme enters AU"]);
});
