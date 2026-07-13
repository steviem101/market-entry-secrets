import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildTermIndex,
  gapScore,
  mapToTerm,
  MIN_DEMAND,
  normalizeTag,
  SUPPLY_TARGET,
  tallyDemand,
  topKeys,
  type ServiceTerm,
} from "./demand.ts";

const TERMS: ServiceTerm[] = [
  { slug: "legal", label: "Legal", synonyms: ["Legal", "Legal Services", "Tax & Legal", "Employment Law"] },
  { slug: "tax", label: "Tax", synonyms: ["Tax", "Tax & Legal", "Accounting / Tax"] },
  { slug: "hr", label: "HR", synonyms: ["HR", "HR / Talent", "Talent Acquisition"] },
];

test("normalizeTag lowercases, trims, and collapses whitespace", () => {
  assert.equal(normalizeTag("  Legal   Services "), "legal services");
  assert.equal(normalizeTag(null), "");
  assert.equal(normalizeTag(42), "");
});

test("buildTermIndex maps slug, label, and every synonym to the term", () => {
  const idx = buildTermIndex(TERMS);
  assert.equal(idx.get("legal")?.slug, "legal");
  assert.equal(idx.get("legal services")?.slug, "legal");
  assert.equal(idx.get("employment law")?.slug, "legal");
  assert.equal(idx.get("hr / talent")?.slug, "hr");
});

test("buildTermIndex: a shared synonym goes to the first term that claims it", () => {
  // "Tax & Legal" appears on both legal (first) and tax (second) → legal wins.
  const idx = buildTermIndex(TERMS);
  assert.equal(idx.get("tax & legal")?.slug, "legal");
});

test("mapToTerm returns null for an unknown tag", () => {
  const idx = buildTermIndex(TERMS);
  assert.equal(mapToTerm("Underwater Basket Weaving", idx), null);
  assert.equal(mapToTerm("Legal", idx)?.slug, "legal");
});

test("tallyDemand counts a form once per term even with several matching tags", () => {
  const idx = buildTermIndex(TERMS);
  // both tags map to `legal` → the form contributes 1, not 2.
  const out = tallyDemand([{ services_needed: ["Legal Services", "Employment Law"] }], idx);
  const legal = out.find((t) => t.slug === "legal");
  assert.equal(legal?.demand, 1);
});

test("tallyDemand aggregates across forms and collects regions/sectors", () => {
  const idx = buildTermIndex(TERMS);
  const out = tallyDemand([
    { services_needed: ["Legal"], target_regions: ["NSW"], industry_sector: ["Fintech"] },
    { services_needed: ["Legal Services"], target_regions: ["NSW", "VIC"], industry_sector: ["Fintech"] },
    { services_needed: ["HR"], target_regions: ["QLD"] },
  ], idx);
  const legal = out.find((t) => t.slug === "legal");
  assert.equal(legal?.demand, 2);
  assert.equal(legal?.regions[0], "NSW"); // demanded twice → first
  assert.deepEqual(legal?.sectors, ["Fintech"]);
  // sorted by demand desc: legal (2) before hr (1)
  assert.equal(out[0].slug, "legal");
});

test("tallyDemand ignores unknown tags and tolerates null fields", () => {
  const idx = buildTermIndex(TERMS);
  const out = tallyDemand([
    { services_needed: ["Nonsense"], target_regions: null, industry_sector: null },
    { services_needed: null },
    // deno-lint-ignore no-explicit-any
    null as any,
  ], idx);
  assert.equal(out.length, 0);
});

test("topKeys returns most-common first, ties broken alphabetically", () => {
  const m = new Map([["VIC", 1], ["NSW", 2], ["QLD", 1]]);
  assert.deepEqual(topKeys(m, 3), ["NSW", "QLD", "VIC"]);
  assert.deepEqual(topKeys(m, 1), ["NSW"]);
});

test("gapScore is full demand at zero supply, zero once supply hits the target", () => {
  assert.equal(gapScore(10, 0), 10);
  assert.equal(gapScore(10, SUPPLY_TARGET), 0);
  assert.equal(gapScore(10, SUPPLY_TARGET + 3), 0); // clamped, never negative
});

test("gapScore scales linearly with the shortfall", () => {
  // target 5, supply 2 → unmet 0.6 → 10 * 0.6 = 6
  assert.equal(gapScore(10, 2), 6);
});

test("gapScore is total against garbage inputs", () => {
  assert.equal(gapScore(NaN, 3), 0);
  assert.equal(gapScore(5, -4), 5); // negative supply floors to 0 → full weight
  assert.equal(gapScore(-5, 0), 0);
});

test("MIN_DEMAND and SUPPLY_TARGET are sane constants", () => {
  assert.ok(MIN_DEMAND >= 1);
  assert.ok(SUPPLY_TARGET >= 1);
});
