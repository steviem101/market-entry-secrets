/**
 * Tests for MES-234 honour-section-selection decision helpers. Run: `npm test`.
 *
 * Pins the upsell-safe invariants: core sections and GATED sections are NEVER dropped
 * (so no teaser / empty-shell / regenerate-CTA render path can fire); flag-off / empty
 * deselection is byte-identical D2; only always-free, non-core, deselected sections are
 * dropped. `section_selection` stores the REMOVED keys.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseDeselectedSections, isSectionDeselected, CORE_SECTIONS } from "./sectionSelection.ts";

test("parseDeselectedSections: null unless the flag is on AND a non-empty string array is given", () => {
  assert.equal(parseDeselectedSections(false, ["events_resources"]), null);   // flag off → D2
  assert.equal(parseDeselectedSections(true, null), null);                     // nothing → D2
  assert.equal(parseDeselectedSections(true, "events_resources"), null);       // not an array → D2
  assert.equal(parseDeselectedSections(true, []), null);                       // empty → D2 (nothing removed)
  assert.equal(parseDeselectedSections(true, ["", "  "]), null);               // only blanks → D2
  const sel = parseDeselectedSections(true, ["events_resources", "swot_analysis", 7, ""]);
  assert.ok(sel instanceof Set);
  assert.deepEqual([...sel!], ["events_resources", "swot_analysis"]);          // non-strings dropped
});

test("isSectionDeselected: false whenever deselection is inactive (flag off / D2)", () => {
  assert.equal(isSectionDeselected("events_resources", null, false), false);
});

test("isSectionDeselected: core sections are NEVER dropped, even if present in the removed set", () => {
  const removed = new Set(["executive_summary", "action_plan", "events_resources"]);
  for (const core of CORE_SECTIONS) {
    assert.equal(isSectionDeselected(core, removed, false), false);
  }
});

test("isSectionDeselected: an always-free, removed, non-core section IS dropped", () => {
  const removed = new Set(["events_resources"]);
  assert.equal(isSectionDeselected("events_resources", removed, false), true);   // removed + free → drop
  assert.equal(isSectionDeselected("service_providers", removed, false), false); // not removed → keep
});

test("isSectionDeselected: a GATED section is NEVER dropped — teaser/upgrade path needs it present (upsell-safe)", () => {
  const removed = new Set(["mentor_recommendations"]); // even if it somehow got into the set
  // isGatedSection = true (requires a tier above base) ⇒ never dropped, for any viewer.
  assert.equal(isSectionDeselected("mentor_recommendations", removed, true), false);
  // A plain-free section with the same removal → dropped.
  assert.equal(isSectionDeselected("events_resources", new Set(["events_resources"]), false), true);
});
