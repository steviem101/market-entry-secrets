import { test } from "node:test";
import assert from "node:assert/strict";
import { filterAndSortLeads, type LeadLike } from "./leadFilters.ts";

const DATA: LeadLike[] = [
  { title: "AU Fintech Founders", description: "", short_description: "", tags: ["fintech"], list_type: "Lead Database", location: "Sydney", sector: "Fintech", sector_tags: ["financial-services"], record_count: 500, created_at: "2026-01-01" },
  { title: "ANZ Market Data", description: "", short_description: "market sizing", tags: [], list_type: "Market Data", location: "Melbourne", sector: "SaaS", sector_tags: ["technology-information-and-media"], record_count: 50, created_at: "2026-03-01" },
  { title: "TAM Map Health", description: "", short_description: "", tags: ["health"], list_type: "TAM Map", location: "Sydney", sector: "Health", sector_tags: ["hospitals-and-health-care"], record_count: 1000, created_at: "2026-02-01" },
];
const base = { search: "", type: "all", location: "all", sector: "all", sort: "newest" };

test("no filters → all, newest first", () => {
  assert.deepEqual(filterAndSortLeads(DATA, base).map((l) => l.title), ["ANZ Market Data", "TAM Map Health", "AU Fintech Founders"]);
});
test("type tab filters by list_type", () => {
  assert.deepEqual(filterAndSortLeads(DATA, { ...base, type: "TAM Map" }).map((l) => l.title), ["TAM Map Health"]);
});
test("location + sector (canonical sector_tags) filters", () => {
  assert.deepEqual(filterAndSortLeads(DATA, { ...base, location: "Sydney" }).map((l) => l.title), ["TAM Map Health", "AU Fintech Founders"]);
  assert.deepEqual(filterAndSortLeads(DATA, { ...base, sector: "technology-information-and-media" }).map((l) => l.title), ["ANZ Market Data"]);
  assert.deepEqual(filterAndSortLeads(DATA, { ...base, sector: "financial-services" }).map((l) => l.title), ["AU Fintech Founders"]);
});
test("search matches title, short_description, tags, and free-text sector", () => {
  assert.equal(filterAndSortLeads(DATA, { ...base, search: "fintech" }).length, 1);
  assert.equal(filterAndSortLeads(DATA, { ...base, search: "sizing" }).length, 1);
  // free-text sector stays searchable even though the facet is now sector_tags (MES-177 C1)
  assert.equal(filterAndSortLeads(DATA, { ...base, search: "saas" }).length, 1);
});
test("sort by most_records (desc) without mutating input", () => {
  assert.deepEqual(filterAndSortLeads(DATA, { ...base, sort: "most_records" }).map((l) => l.title), ["TAM Map Health", "AU Fintech Founders", "ANZ Market Data"]);
  assert.deepEqual(DATA.map((l) => l.title), ["AU Fintech Founders", "ANZ Market Data", "TAM Map Health"]);
});
