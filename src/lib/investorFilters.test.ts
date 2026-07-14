/**
 * Unit tests for the pure Investors filter predicate.
 * Run: `npm test` (node --test, Node 22+ strips types natively).
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { filterInvestors, type InvestorLike } from "./investorFilters.ts";

const INVESTORS: InvestorLike[] = [
  {
    name: "Acme Ventures",
    description: "Seed-stage fund",
    location: "Sydney",
    investor_type: "vc",
    stage_focus: ["seed", "series_a"],
    sector_focus: ["fintech", "saas"],
    sector_tags: ["financial-services", "technology-information-and-media"],
  },
  {
    name: "Angel Collective",
    description: "Syndicate of angels",
    location: "Melbourne",
    investor_type: "angel",
    stage_focus: ["pre_seed", "seed"],
    sector_focus: ["healthtech"],
    sector_tags: ["hospitals-and-health-care"],
  },
  {
    name: "GrantBody",
    description: "Government grants",
    location: "Sydney",
    investor_type: "grant",
    stage_focus: null,
    sector_focus: null,
  },
];

const base = { search: "", type: "all", location: "all", stage: "all", sector: "all" };

test("returns all investors when every filter is at default", () => {
  assert.equal(filterInvestors(INVESTORS, base).length, 3);
});

test("filters by primary type", () => {
  const out = filterInvestors(INVESTORS, { ...base, type: "vc" });
  assert.deepEqual(out.map((i) => i.name), ["Acme Ventures"]);
});

test("filters by location", () => {
  const out = filterInvestors(INVESTORS, { ...base, location: "Sydney" });
  assert.deepEqual(out.map((i) => i.name), ["Acme Ventures", "GrantBody"]);
});

test("filters by stage against the stage_focus array", () => {
  const out = filterInvestors(INVESTORS, { ...base, stage: "series_a" });
  assert.deepEqual(out.map((i) => i.name), ["Acme Ventures"]);
});

test("filters by sector against the canonical sector_tags (MES-130)", () => {
  const out = filterInvestors(INVESTORS, { ...base, sector: "hospitals-and-health-care" });
  assert.deepEqual(out.map((i) => i.name), ["Angel Collective"]);
  // free-text sector_focus is no longer the sector-filter source
  assert.equal(filterInvestors(INVESTORS, { ...base, sector: "healthtech" }).length, 0);
});

test("search still matches name, description, location, and free-text sector_focus, case-insensitively", () => {
  assert.equal(filterInvestors(INVESTORS, { ...base, search: "acme" }).length, 1);
  assert.equal(filterInvestors(INVESTORS, { ...base, search: "syndicate" }).length, 1); // description
  assert.equal(filterInvestors(INVESTORS, { ...base, search: "melbourne" }).length, 1); // location
  assert.equal(filterInvestors(INVESTORS, { ...base, search: "FINTECH" }).length, 1); // sector_focus, CI
});

test("combines dimensions (AND semantics)", () => {
  const out = filterInvestors(INVESTORS, { ...base, type: "grant", location: "Sydney" });
  assert.deepEqual(out.map((i) => i.name), ["GrantBody"]);
  assert.equal(filterInvestors(INVESTORS, { ...base, type: "grant", location: "Melbourne" }).length, 0);
});

test("tolerates null stage_focus/sector_focus without throwing", () => {
  assert.doesNotThrow(() => filterInvestors(INVESTORS, { ...base, stage: "seed" }));
  const out = filterInvestors(INVESTORS, { ...base, stage: "seed" });
  assert.deepEqual(out.map((i) => i.name), ["Acme Ventures", "Angel Collective"]);
});
