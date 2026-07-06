import { test } from "node:test";
import assert from "node:assert/strict";
import { filterOrganisations, type OrganisationLike } from "./innovationFilters.ts";

const DATA: OrganisationLike[] = [
  { name: "Stone & Chalk", description: "Fintech hub", location: "Sydney", services: ["Incubator", "Coworking"] },
  { name: "Melbourne Accelerator", description: "Startup programs", location: "Melbourne", services: ["Accelerator"] },
  { name: "CSIRO Lab", description: "Research institute", location: "Sydney", services: ["Research"] },
];
const base = { search: "", location: "all", service: "all" };

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
