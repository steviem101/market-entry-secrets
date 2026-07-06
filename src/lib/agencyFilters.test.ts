import { test } from "node:test";
import assert from "node:assert/strict";
import { filterAgencies, type AgencyLike } from "./agencyFilters.ts";

const DATA: AgencyLike[] = [
  { name: "Austrade", description: "Government trade agency", services: ["export"], location: "Sydney", organisation_type: "government_agency", sectors_supported: ["all"], category_slug: "government" },
  { name: "British Chamber", description: "Bilateral chamber", tagline: "UK-AU trade", services: [], location: "Melbourne", organisation_type: "chamber_of_commerce", sectors_supported: ["fintech", "saas"], category_slug: "chambers" },
  { name: "Fintech Australia", description: "Industry body", services: [], location: "Sydney", organisation_type: "industry_association", sectors_supported: ["fintech"], category_slug: "associations" },
];
const base = { search: "", category: "all", location: "all", type: "all", sector: "all" };

test("no filters → all", () => {
  assert.equal(filterAgencies(DATA, base).length, 3);
});
test("category tab filters by category_slug", () => {
  assert.deepEqual(filterAgencies(DATA, { ...base, category: "chambers" }).map((a) => a.name), ["British Chamber"]);
});
test("location filter (substring, case-insensitive)", () => {
  assert.deepEqual(filterAgencies(DATA, { ...base, location: "sydney" }).map((a) => a.name), ["Austrade", "Fintech Australia"]);
});
test("type filter matches raw slug", () => {
  assert.deepEqual(filterAgencies(DATA, { ...base, type: "chamber_of_commerce" }).map((a) => a.name), ["British Chamber"]);
});
test("type filter honours old prettified-label links via normalise fallback", () => {
  assert.deepEqual(filterAgencies(DATA, { ...base, type: "Chamber Of Commerce" }).map((a) => a.name), ["British Chamber"]);
});
test("sector filter: explicit match, 'all' wildcard row, and normalise fallback", () => {
  // Austrade supports "all" → always matches
  assert.deepEqual(filterAgencies(DATA, { ...base, sector: "fintech" }).map((a) => a.name), ["Austrade", "British Chamber", "Fintech Australia"]);
});
test("search matches name, description, tagline, services", () => {
  assert.equal(filterAgencies(DATA, { ...base, search: "bilateral" }).length, 1);
  assert.equal(filterAgencies(DATA, { ...base, search: "uk-au" }).length, 1); // tagline
  assert.equal(filterAgencies(DATA, { ...base, search: "export" }).length, 1); // services
});
