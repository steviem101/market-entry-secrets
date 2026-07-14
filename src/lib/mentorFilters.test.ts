import { test } from "node:test";
import assert from "node:assert/strict";
import { filterMentors, archetypeToSlug, type MentorLike } from "./mentorFilters.ts";

const m = (p: Partial<MentorLike> & { name: string }): MentorLike => ({
  title: "", description: "", location: "Sydney", ...p,
});

const DATA: MentorLike[] = [
  m({ name: "Alice", category_slug: "legal", location: "Sydney", sector_tags: ["fintech"], market_corridors: ["uk-to-au"], is_featured: true, view_count: 10, years_experience: 5 }),
  m({ name: "Bob", category_slug: "finance", location: "Melbourne", sector_tags: ["saas"], market_corridors: ["usa-to-au"], view_count: 100, years_experience: 20 }),
  m({ name: "Carol", category_slug: "legal", location: "Sydney", sector_tags: ["fintech"], market_corridors: ["uk-to-nz"], view_count: 50, years_experience: 12 }),
];
const base = { search: "", category: "all", sector: "all", corridor: "all", location: "all", sort: "featured" };

test("category filter by legacy category_slug still works", () => {
  assert.deepEqual(filterMentors(DATA, { ...base, category: "legal" }).map((x) => x.name).sort(), ["Alice", "Carol"]);
});

test("archetypeToSlug slugifies archetype labels", () => {
  assert.equal(archetypeToSlug("International Founder"), "international-founder");
  assert.equal(archetypeToSlug("Trade & Government"), "trade-government");
  assert.equal(archetypeToSlug("Active Advisor"), "active-advisor");
  assert.equal(archetypeToSlug(null), null);
  assert.equal(archetypeToSlug(""), null);
});

test("category filter matches slugified archetype (the MES-130 primary dimension)", () => {
  const byArchetype: MentorLike[] = [
    m({ name: "Dana", archetype: "International Founder" }),
    m({ name: "Evan", archetype: "Trade & Government" }),
    m({ name: "Fran", archetype: "International Founder" }),
  ];
  assert.deepEqual(
    filterMentors(byArchetype, { ...base, category: "international-founder" }).map((x) => x.name).sort(),
    ["Dana", "Fran"],
  );
  assert.deepEqual(
    filterMentors(byArchetype, { ...base, category: "trade-government" }).map((x) => x.name),
    ["Evan"],
  );
});
test("a stale ?persona= value is ignored (dimension retired with the audience pill)", () => {
  assert.equal(filterMentors(DATA, { ...base, persona: "international_entrant" }).length, DATA.length);
});
test("corridor matches origin prefix", () => {
  assert.deepEqual(filterMentors(DATA, { ...base, corridor: "uk" }).map((x) => x.name).sort(), ["Alice", "Carol"]);
  assert.deepEqual(filterMentors(DATA, { ...base, corridor: "usa" }).map((x) => x.name), ["Bob"]);
});
test("sector + location filters", () => {
  assert.deepEqual(filterMentors(DATA, { ...base, sector: "fintech" }).map((x) => x.name).sort(), ["Alice", "Carol"]);
  assert.deepEqual(filterMentors(DATA, { ...base, location: "Melbourne" }).map((x) => x.name), ["Bob"]);
});
test("sort by experience and az", () => {
  assert.deepEqual(filterMentors(DATA, { ...base, sort: "experience" }).map((x) => x.name), ["Bob", "Carol", "Alice"]);
  assert.deepEqual(filterMentors(DATA, { ...base, sort: "az" }).map((x) => x.name), ["Alice", "Bob", "Carol"]);
});
test("search matches name/title/description/location", () => {
  assert.equal(filterMentors(DATA, { ...base, search: "bob" }).length, 1);
  assert.equal(filterMentors(DATA, { ...base, search: "melbourne" }).length, 1);
});
