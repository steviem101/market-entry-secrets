import { test } from "node:test";
import assert from "node:assert/strict";
import { filterOrganisations, type OrganisationLike } from "./innovationFilters.ts";

const DATA: OrganisationLike[] = [
  { name: "Stone & Chalk", description: "Fintech hub", location: "Sydney", services: ["Incubator", "Coworking"], type: ["Incubator", "Coworking Space"], sector_tags: ["financial-services", "technology-information-and-media"] },
  { name: "Melbourne Accelerator", description: "Startup programs", location: "Melbourne", services: ["Accelerator"], type: ["Accelerator"], sector_tags: ["technology-information-and-media"] },
  { name: "CSIRO Lab", description: "Research institute", location: "Sydney", services: ["Research"], type: ["Research Institute"] },
];
const base = { search: "", location: "all", service: "all", type: "all", sector: "all" };

test("no filters → all", () => {
  assert.equal(filterOrganisations(DATA, base).length, 3);
});
test("location filter (exact)", () => {
  assert.deepEqual(filterOrganisations(DATA, { ...base, location: "Sydney" }).map((o) => o.name), ["Stone & Chalk", "CSIRO Lab"]);
});
test("service filter (case-insensitive membership)", () => {
  assert.deepEqual(filterOrganisations(DATA, { ...base, service: "accelerator" }).map((o) => o.name), ["Melbourne Accelerator"]);
});
test("search matches name, description, services", () => {
  assert.equal(filterOrganisations(DATA, { ...base, search: "fintech" }).length, 1);
  assert.equal(filterOrganisations(DATA, { ...base, search: "research" }).length, 1);
  assert.equal(filterOrganisations(DATA, { ...base, search: "coworking" }).length, 1);
});
test("tolerates null services", () => {
  const withNull = [{ name: "X", description: "y", location: "Perth", services: null }];
  assert.doesNotThrow(() => filterOrganisations(withNull, { ...base, service: "Incubator" }));
  assert.equal(filterOrganisations(withNull, { ...base, service: "Incubator" }).length, 0);
});

test("type tab: 'all' returns everything", () => {
  assert.equal(filterOrganisations(DATA, { ...base, type: "all" }).length, 3);
});
test("type tab: filters by array membership", () => {
  assert.deepEqual(filterOrganisations(DATA, { ...base, type: "Accelerator" }).map((o) => o.name), ["Melbourne Accelerator"]);
  assert.deepEqual(filterOrganisations(DATA, { ...base, type: "Research Institute" }).map((o) => o.name), ["CSIRO Lab"]);
});
test("type tab: a multi-type org surfaces under EACH of its tabs", () => {
  // Stone & Chalk is both an Incubator and a Coworking Space.
  assert.deepEqual(filterOrganisations(DATA, { ...base, type: "Incubator" }).map((o) => o.name), ["Stone & Chalk"]);
  assert.deepEqual(filterOrganisations(DATA, { ...base, type: "Coworking Space" }).map((o) => o.name), ["Stone & Chalk"]);
});
test("type tab: untyped org (null type) only shows under 'all'", () => {
  const withNull = [{ name: "VC Firm", description: "y", location: "Perth", services: ["Venture Capital"], type: null }];
  assert.equal(filterOrganisations(withNull, { ...base, type: "all" }).length, 1);
  assert.equal(filterOrganisations(withNull, { ...base, type: "Accelerator" }).length, 0);
});

test("sector filter matches canonical sector_tags membership", () => {
  assert.deepEqual(
    filterOrganisations(DATA, { ...base, sector: "technology-information-and-media" }).map((o) => o.name),
    ["Stone & Chalk", "Melbourne Accelerator"],
  );
  assert.deepEqual(
    filterOrganisations(DATA, { ...base, sector: "financial-services" }).map((o) => o.name),
    ["Stone & Chalk"],
  );
});
test("sector filter: untagged org only shows under 'all'", () => {
  assert.equal(filterOrganisations(DATA, { ...base, sector: "all" }).length, 3);
  assert.equal(
    filterOrganisations(DATA, { ...base, sector: "manufacturing" }).length,
    0,
  );
});
