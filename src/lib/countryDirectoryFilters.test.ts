import { test } from "node:test";
import assert from "node:assert/strict";
import {
  filterAndSortCountries,
  distinctStrengths,
  topSectors,
  countryDensity,
  type CountryDirectoryLike,
} from "./countryDirectoryFilters.ts";

const mk = (over: Partial<CountryDirectoryLike> & { name: string }): CountryDirectoryLike => ({
  description: "",
  featured: false,
  sort_order: null,
  key_industries: [],
  trade_relationship_strength: null,
  case_study_count: 0,
  mentor_count: 0,
  agency_count: 0,
  investor_count: 0,
  provider_count: 0,
  ...over,
});

const DATA: CountryDirectoryLike[] = [
  mk({
    name: "Ireland",
    description: "Irish companies expanding to Australia",
    featured: true,
    key_industries: ["Technology", "Pharmaceuticals"],
    trade_relationship_strength: "Strong",
    case_study_count: 11,
    mentor_count: 34,
    agency_count: 5,
  }),
  mk({
    name: "United Kingdom",
    description: "UK trade corridor",
    featured: true,
    key_industries: ["Financial Services", "Technology"],
    trade_relationship_strength: "Strong",
    case_study_count: 12,
  }),
  mk({
    name: "Canada",
    description: "Commonwealth ties",
    key_industries: ["Mining", "Technology"],
    trade_relationship_strength: "Growing",
    case_study_count: 12,
  }),
  mk({
    name: "Japan",
    description: "FAQs only so far",
    key_industries: ["Manufacturing"],
    trade_relationship_strength: "Growing",
  }),
];

const base = { search: "", strength: null, sector: null, sort: "featured" as const };

test("no filters, featured sort: featured first, then density, then name", () => {
  assert.deepEqual(
    filterAndSortCountries(DATA, base).map((c) => c.name),
    ["Ireland", "United Kingdom", "Canada", "Japan"],
  );
});

test("featured sort honours admin sort_order before density", () => {
  // UK has lower density than Ireland but a smaller sort_order -> pinned first.
  const pinned = [
    mk({ name: "Ireland", featured: true, sort_order: 2, mentor_count: 50 }),
    mk({ name: "United Kingdom", featured: true, sort_order: 1, mentor_count: 1 }),
    mk({ name: "Canada", featured: false, sort_order: null, case_study_count: 5 }),
  ];
  assert.deepEqual(
    filterAndSortCountries(pinned, base).map((c) => c.name),
    ["United Kingdom", "Ireland", "Canada"],
  );
});

test("featured sort falls through to density when sort_order is unset", () => {
  assert.deepEqual(
    filterAndSortCountries(DATA, base).map((c) => c.name),
    ["Ireland", "United Kingdom", "Canada", "Japan"],
  );
});

test("density sort ignores featured flag", () => {
  assert.deepEqual(
    filterAndSortCountries(DATA, { ...base, sort: "density" }).map((c) => c.name),
    ["Ireland", "Canada", "United Kingdom", "Japan"],
  );
});

test("alphabetical sort", () => {
  assert.deepEqual(
    filterAndSortCountries(DATA, { ...base, sort: "alphabetical" }).map((c) => c.name),
    ["Canada", "Ireland", "Japan", "United Kingdom"],
  );
});

test("strength filter", () => {
  assert.deepEqual(
    filterAndSortCountries(DATA, { ...base, strength: "Growing" }).map((c) => c.name),
    ["Canada", "Japan"],
  );
});

test("sector filter is an exact industry match", () => {
  assert.deepEqual(
    filterAndSortCountries(DATA, { ...base, sector: "Technology" }).map((c) => c.name),
    ["Ireland", "United Kingdom", "Canada"],
  );
});

test("search matches name, description, and industries, case-insensitively", () => {
  assert.deepEqual(
    filterAndSortCountries(DATA, { ...base, search: "irish" }).map((c) => c.name),
    ["Ireland"],
  );
  assert.deepEqual(
    filterAndSortCountries(DATA, { ...base, search: "MINING" }).map((c) => c.name),
    ["Canada"],
  );
});

test("filters compose", () => {
  assert.deepEqual(
    filterAndSortCountries(DATA, { ...base, strength: "Strong", sector: "Technology", search: "financial" }).map(
      (c) => c.name,
    ),
    ["United Kingdom"],
  );
});

test("does not mutate the input array", () => {
  const before = DATA.map((c) => c.name);
  filterAndSortCountries(DATA, { ...base, sort: "alphabetical" });
  assert.deepEqual(DATA.map((c) => c.name), before);
});

test("distinctStrengths drops nulls and duplicates", () => {
  assert.deepEqual(distinctStrengths([...DATA, mk({ name: "X" })]), ["Strong", "Growing"]);
});

test("topSectors ranks by country coverage and respects the limit", () => {
  assert.deepEqual(topSectors(DATA, 2), ["Technology", "Pharmaceuticals"]);
});

test("countryDensity sums all link and case-study counts", () => {
  assert.equal(countryDensity(DATA[0]), 50);
});
