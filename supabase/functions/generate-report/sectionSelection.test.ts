/**
 * Tests for MES-234 honour-section-selection decision helpers. Run: `npm test`.
 *
 * Pins the upsell-safe invariants: core sections and above-tier (gated) sections are
 * NEVER skipped; flag-off / empty deselection is byte-identical D2; only accessible,
 * deselected, non-core sections are skipped. `section_selection` stores the REMOVED keys.
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
  assert.equal(isSectionDeselected("events_resources", null, true), false);
});

test("isSectionDeselected: core sections are NEVER skipped, even if present in the removed set", () => {
  const removed = new Set(["executive_summary", "action_plan", "events_resources"]);
  for (const core of CORE_SECTIONS) {
    assert.equal(isSectionDeselected(core, removed, true), false);
  }
});

test("isSectionDeselected: an accessible, removed, non-core section IS skipped", () => {
  const removed = new Set(["events_resources"]);
  assert.equal(isSectionDeselected("events_resources", removed, true), true);   // removed + accessible → skip
  assert.equal(isSectionDeselected("service_providers", removed, true), false); // not removed → keep
});

test("isSectionDeselected: an ABOVE-TIER section is NEVER skipped — its teaser must remain (upsell-safe)", () => {
  const removed = new Set(["mentor_recommendations"]); // even if it somehow got into the set
  // willBeVisible = false ⇒ the viewer can't access it (gated) ⇒ keep it for the teaser.
  assert.equal(isSectionDeselected("mentor_recommendations", removed, false), false);
  // Same section, viewer CAN access it (paid tier) and removed it → skip.
  assert.equal(isSectionDeselected("mentor_recommendations", removed, true), true);
});
