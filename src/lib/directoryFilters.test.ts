/**
 * Unit tests for the pure directory-filter state/URL helpers.
 * Run: `npm test` (node --test, Node 22+ strips types natively).
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  type FilterSpec,
  defaultFilters,
  parseFilters,
  parsePage,
  serialiseFilters,
  hasActiveFilters,
} from "./directoryFilters.ts";

const SPEC: FilterSpec = {
  search: { param: "search", default: "" },
  type: { param: "type", default: "all" },
  location: { param: "location", default: "all" },
};

test("defaultFilters returns every dimension at its default", () => {
  assert.deepEqual(defaultFilters(SPEC), { search: "", type: "all", location: "all" });
});

test("parseFilters falls back to defaults for absent params", () => {
  const values = parseFilters(SPEC, new URLSearchParams("type=vc"));
  assert.deepEqual(values, { search: "", type: "vc", location: "all" });
});

test("parseFilters treats an empty-string param as the default", () => {
  const values = parseFilters(SPEC, new URLSearchParams("search=&type=vc"));
  assert.equal(values.search, "");
  assert.equal(values.type, "vc");
});

test("serialiseFilters omits defaults and keeps only active dimensions", () => {
  const params = serialiseFilters(SPEC, { search: "acme", type: "all", location: "Sydney" });
  assert.equal(params.get("search"), "acme");
  assert.equal(params.get("location"), "Sydney");
  assert.equal(params.has("type"), false); // default omitted
});

test("serialiseFilters writes page only when > 1", () => {
  assert.equal(serialiseFilters(SPEC, defaultFilters(SPEC), 1).has("page"), false);
  assert.equal(serialiseFilters(SPEC, defaultFilters(SPEC), 3).get("page"), "3");
});

test("parse → serialise round-trips a non-default state", () => {
  const url = "search=acme&type=vc&page=2";
  const values = parseFilters(SPEC, new URLSearchParams(url));
  const page = parsePage(new URLSearchParams(url));
  const out = serialiseFilters(SPEC, values, page);
  assert.equal(out.get("search"), "acme");
  assert.equal(out.get("type"), "vc");
  assert.equal(out.get("page"), "2");
  assert.equal(out.has("location"), false);
});

test("parsePage clamps to 1 for missing, zero, and negative values", () => {
  assert.equal(parsePage(new URLSearchParams("")), 1);
  assert.equal(parsePage(new URLSearchParams("page=0")), 1);
  assert.equal(parsePage(new URLSearchParams("page=-4")), 1);
  assert.equal(parsePage(new URLSearchParams("page=5")), 5);
});

test("hasActiveFilters reflects whether any dimension differs from default", () => {
  assert.equal(hasActiveFilters(SPEC, defaultFilters(SPEC)), false);
  assert.equal(hasActiveFilters(SPEC, { search: "", type: "vc", location: "all" }), true);
});
