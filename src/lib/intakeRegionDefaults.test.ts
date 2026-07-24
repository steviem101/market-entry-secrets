import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultTargetRegions, isSuggestedRegionDefault } from "./intakeRegionDefaults.ts";

test("flag off: both journeys keep the historical Sydney suggestion", () => {
  assert.deepEqual(defaultTargetRegions("international", false), ["Sydney/NSW"]);
  assert.deepEqual(defaultTargetRegions("startup", false), ["Sydney/NSW"]);
});

test("flag on: international pre-fills National, startup starts empty", () => {
  assert.deepEqual(defaultTargetRegions("international", true), ["National"]);
  assert.deepEqual(defaultTargetRegions("startup", true), []);
});

test("isSuggestedRegionDefault matches only the exact untouched default", () => {
  assert.equal(isSuggestedRegionDefault(["Sydney/NSW"], "international", false), true);
  assert.equal(isSuggestedRegionDefault(["National"], "international", true), true);
  assert.equal(isSuggestedRegionDefault(["National", "Sydney/NSW"], "international", true), false);
  assert.equal(isSuggestedRegionDefault(["Sydney/NSW"], "international", true), false);
  assert.equal(isSuggestedRegionDefault([], "international", true), false);
  assert.equal(isSuggestedRegionDefault(undefined, "international", false), false);
});

test("startup + flag on: empty default is never a 'suggestion'", () => {
  assert.equal(isSuggestedRegionDefault([], "startup", true), false);
});
