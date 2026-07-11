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
  type CaseStudyLike,
} from "./caseStudyFilters.ts";

const cs = (
  title: string,
  p: Partial<{ company_name: string; industry: string; origin_country: string; outcome: string; monthly_revenue: string; startup_costs: string }>,
  view_count = 0,
): CaseStudyLike => ({ title, view_count, content_company_profiles: [p] });

const DATA: CaseStudyLike[] = [
  cs("Acme enters AU", { company_name: "Acme", industry: "SaaS", origin_country: "United States", outcome: "successful", monthly_revenue: "$40,000", startup_costs: "$60,000" }, 100),
  cs("Beta pivots", { company_name: "Beta", industry: "Fintech", origin_country: "United Kingdom", outcome: "unsuccessful", monthly_revenue: "$5,000", startup_costs: "$200,000" }, 50),
  cs("Gamma grows", { company_name: "Gamma", industry: "SaaS", origin_country: "Canada", outcome: "successful", monthly_revenue: "$120,000", startup_costs: "$10,000" }, 200),
];

const base = { search: "", outcome: "all", industry: "all", country: "all", revenue: "all", costs: "all", sort: "recent" };

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

test("industry and country filters", () => {
  assert.deepEqual(filterAndSortCaseStudies(DATA, { ...base, industry: "SaaS" }).map((c) => c.title), ["Acme enters AU", "Gamma grows"]);
  assert.deepEqual(filterAndSortCaseStudies(DATA, { ...base, country: "Canada" }).map((c) => c.title), ["Gamma grows"]);
});

test("revenue + costs range filters combine (AND)", () => {
  // revenue 10k-50k AND costs 50k-100k → only Acme ($40k rev, $60k cost)
  const out = filterAndSortCaseStudies(DATA, { ...base, revenue: "10k-50k", costs: "50k-100k" });
  assert.deepEqual(out.map((c) => c.title), ["Acme enters AU"]);
});

test("search matches title and company name, case-insensitively", () => {
  assert.equal(filterAndSortCaseStudies(DATA, { ...base, search: "gamma" }).length, 1);
  assert.equal(filterAndSortCaseStudies(DATA, { ...base, search: "BETA" }).length, 1);
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
