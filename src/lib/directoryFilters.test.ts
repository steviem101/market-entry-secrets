/**
 * Unit tests for the pure directory-filter state/URL helpers.
 * Run: `npm test` (node --test, Node 22+ strips types natively).
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  type FilterSpec,
  clearedFilters,
  coerceFilters,
  coerceValue,
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

// Spec with presentation-only dimensions (sort/view).
const PRES_SPEC: FilterSpec = {
  search: { param: "search", default: "" },
  outcome: { param: "outcome", default: "all" },
  sort: { param: "sort", default: "recent", presentation: true },
  view: { param: "view", default: "grid", presentation: true },
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

test("hasActiveFilters ignores presentation dimensions (sort/view)", () => {
  // Only sort + view changed → not considered "active filters".
  const values = { search: "", outcome: "all", sort: "views", view: "list" };
  assert.equal(hasActiveFilters(PRES_SPEC, values), false);
  // A real filter changed → active.
  assert.equal(hasActiveFilters(PRES_SPEC, { ...values, outcome: "successful" }), true);
});

test("clearedFilters resets filters but preserves presentation dimensions", () => {
  const current = { search: "acme", outcome: "successful", sort: "views", view: "list" };
  assert.deepEqual(clearedFilters(PRES_SPEC, current), {
    search: "",
    outcome: "all",
    sort: "views", // preserved
    view: "list", // preserved
  });
});

test("presentation dimensions still serialise to the URL when non-default", () => {
  const params = serialiseFilters(PRES_SPEC, { search: "", outcome: "all", sort: "views", view: "list" });
  assert.equal(params.get("sort"), "views");
  assert.equal(params.get("view"), "list");
  assert.equal(params.has("outcome"), false); // default omitted
});

test("coerceValue: keeps default, keeps a valid value, drops stale to default", () => {
  assert.equal(coerceValue("all", ["fintech", "saas"], "all"), "all");
  assert.equal(coerceValue("fintech", ["fintech", "saas"], "all"), "fintech");
  assert.equal(coerceValue("manufacturing", ["fintech", "saas"], "all"), "all");
});

test("coerceValue: case-insensitive match returns the list's canonical casing", () => {
  // So the coerced value is valid whether the predicate compares case-sensitively or not.
  assert.equal(coerceValue("Fintech", ["fintech", "saas"], "all"), "fintech");
  assert.equal(coerceValue("SAAS", ["fintech", "saas"], "all"), "saas");
});

test("coerceValue: empty/undefined allow-list passes through (data still loading)", () => {
  assert.equal(coerceValue("fintech", [], "all"), "fintech");
  assert.equal(coerceValue("fintech", undefined, "all"), "fintech");
});

test("coerceFilters: only coerces dimensions with an allow-list; returns same ref when unchanged", () => {
  const values = { search: "acme", type: "vc", location: "Sydney" };
  // No allowed map → identity (same reference).
  assert.equal(coerceFilters(SPEC, values), values);
  // location has an allow-list that includes Sydney; type not listed → left as-is.
  const out = coerceFilters(SPEC, values, { location: ["Sydney", "Melbourne"] });
  assert.equal(out, values); // nothing changed → same ref
});

test("coerceFilters: a stale listed value is coerced to that dimension's default", () => {
  const values = { search: "", type: "all", location: "Perth" };
  const out = coerceFilters(SPEC, values, { location: ["Sydney", "Melbourne"] });
  assert.notEqual(out, values);
  assert.equal(out.location, "all");
  // Case-variant valid value is normalised to canonical casing.
  const out2 = coerceFilters(SPEC, { search: "", type: "all", location: "sydney" }, { location: ["Sydney"] });
  assert.equal(out2.location, "Sydney");
});
