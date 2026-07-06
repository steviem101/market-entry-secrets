import { test } from "node:test";
import assert from "node:assert/strict";
import { expandTargetRegions } from "./targetRegion.ts";

test("expandTargetRegions: 'Sydney/NSW' keeps BOTH the city and the state (full + code)", () => {
  assert.deepEqual(expandTargetRegions(["Sydney/NSW"]), ["sydney", "new south wales", "nsw"]);
});

test("expandTargetRegions: generic nation-wide words are dropped", () => {
  assert.deepEqual(expandTargetRegions(["National"]), []);
  assert.deepEqual(expandTargetRegions(["Australia"]), []);
  assert.deepEqual(expandTargetRegions(["Sydney/NSW", "National"]), ["sydney", "new south wales", "nsw"]);
});

test("expandTargetRegions: intake placeholders ('Not Sure') are dropped, not treated as a region", () => {
  // Real submitted values: {"Not Sure",National} → no location signal at all.
  assert.deepEqual(expandTargetRegions(["Not Sure", "National"]), []);
  assert.deepEqual(expandTargetRegions(["Perth/WA", "Not Sure"]), ["perth", "western australia"]);
});

test("expandTargetRegions: 2-letter states survive only as full name (no includes() false-match)", () => {
  // "sa" must NOT appear (would match "Pasadena, USA"); "south australia" is safe.
  assert.deepEqual(expandTargetRegions(["Adelaide/SA"]), ["adelaide", "south australia"]);
  assert.deepEqual(expandTargetRegions(["Perth/WA"]), ["perth", "western australia"]);
  assert.ok(!expandTargetRegions(["Adelaide/SA"]).includes("sa"));
});

test("expandTargetRegions: full state name given directly is kept; Melbourne/VIC expands", () => {
  assert.deepEqual(expandTargetRegions(["Melbourne/VIC"]), ["melbourne", "victoria", "vic"]);
  assert.deepEqual(expandTargetRegions(["New South Wales"]), ["new south wales"]);
});

test("expandTargetRegions: dedupes across regions and splits on comma/ampersand", () => {
  assert.deepEqual(
    expandTargetRegions(["Sydney, NSW", "Sydney/NSW & Melbourne"]),
    ["sydney", "new south wales", "nsw", "melbourne"],
  );
});

test("expandTargetRegions: empty / null / whitespace inputs are safe", () => {
  assert.deepEqual(expandTargetRegions([]), []);
  assert.deepEqual(expandTargetRegions(null), []);
  assert.deepEqual(expandTargetRegions(undefined), []);
  assert.deepEqual(expandTargetRegions(["", "  ", "/"]), []);
});
