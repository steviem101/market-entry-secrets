import { test } from "node:test";
import assert from "node:assert/strict";
import { expandTargetRegions, hasNationWideTarget } from "./targetRegion.ts";

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

// ── hasNationWideTarget (MES-186 B / MES-232) ────────────────────────────────
test("hasNationWideTarget: true when a nation-wide segment is present (even alongside a city)", () => {
  assert.equal(hasNationWideTarget(["National"]), true);
  assert.equal(hasNationWideTarget(["Melbourne/VIC", "National"]), true);
  assert.equal(hasNationWideTarget(["Australia"]), true);
  assert.equal(hasNationWideTarget(["ANZ"]), true);
  assert.equal(hasNationWideTarget(["Global"]), true);
  assert.equal(hasNationWideTarget(["APAC"]), true);
});

test("hasNationWideTarget: false for city-only / state-only / placeholder-only targets", () => {
  assert.equal(hasNationWideTarget(["Sydney/NSW"]), false);
  assert.equal(hasNationWideTarget(["Melbourne/VIC", "Perth/WA"]), false);
  assert.equal(hasNationWideTarget(["New South Wales"]), false);
  // "Not Sure" is a placeholder, NOT a nation-wide scope — must not relax the geo gate.
  assert.equal(hasNationWideTarget(["Not Sure"]), false);
  assert.equal(hasNationWideTarget([]), false);
  assert.equal(hasNationWideTarget(null), false);
  assert.equal(hasNationWideTarget(undefined), false);
});

test("hasNationWideTarget: 'international' as a target scope counts, but never false-matches a city substring", () => {
  assert.equal(hasNationWideTarget(["International"]), true);
  // A city whose name merely CONTAINS a nation-wide word is not itself nation-wide.
  assert.equal(hasNationWideTarget(["Nationalpark Town"]), false);
});
