import { test } from "node:test";
import assert from "node:assert/strict";
import { filterContent, type ContentItemLike } from "./contentFilters.ts";

const DATA: ContentItemLike[] = [
  { title: "Entry Guide", subtitle: "how to enter", content_type: "guide", category_id: "cat-legal", sector_tags: ["financial-services"] },
  { title: "Market Article", subtitle: "trends", content_type: "article", category_id: "cat-market", sector_tags: ["retail", "financial-services"] },
  { title: "Win Story", subtitle: "success", content_type: "success_story", category_id: "cat-legal" },
];
const base = { search: "", type: "all", category: "all", sector: "all" };

test("no filters → all", () => {
  assert.equal(filterContent(DATA, base).length, 3);
});
test("type tab filters by content_type", () => {
  assert.deepEqual(filterContent(DATA, { ...base, type: "guide" }).map((c) => c.title), ["Entry Guide"]);
});
test("category filters by id", () => {
  assert.deepEqual(filterContent(DATA, { ...base, category: "cat-legal" }).map((c) => c.title), ["Entry Guide", "Win Story"]);
});
test("search matches title + subtitle, case-insensitive", () => {
  assert.equal(filterContent(DATA, { ...base, search: "TRENDS" }).length, 1);
  assert.equal(filterContent(DATA, { ...base, search: "guide" }).length, 1);
});
test("type + category combine (AND)", () => {
  assert.deepEqual(filterContent(DATA, { ...base, type: "success_story", category: "cat-legal" }).map((c) => c.title), ["Win Story"]);
});
test("sector filters by canonical sector_tags membership; untagged items only under 'all'", () => {
  assert.deepEqual(filterContent(DATA, { ...base, sector: "financial-services" }).map((c) => c.title), ["Entry Guide", "Market Article"]);
  assert.deepEqual(filterContent(DATA, { ...base, sector: "retail" }).map((c) => c.title), ["Market Article"]);
  assert.equal(filterContent(DATA, { ...base, sector: "manufacturing" }).length, 0);
});
