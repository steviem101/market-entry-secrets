/**
 * Acceptance test for the P0.1 goal-label shim fix.
 *
 * Run: `npm test` (node --test, Node 22+ strips types natively).
 *
 * Guards the regression where the v2 shim wrote SHORT goal labels into
 * services_needed while the edge map was keyed by OLD LONG labels → exact-string
 * lookup missed → zero service tags → provider/mentor/lead matching fell back to
 * location-only.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  expandGoalsToServiceTags,
  GOAL_SERVICE_TAGS_BY_ID,
  GOAL_SERVICE_TAGS_BY_LABEL,
  goalsToPrioritisedSections,
  GOAL_SECTION_MAP,
} from "./goalServiceTags.ts";

test("goalsToPrioritisedSections maps selected goals to the report sections they feed", () => {
  assert.deepEqual(
    goalsToPrioritisedSections({ goal_ids: ["mentors_intl", "lead_lists_intl", "find_providers"] }).sort(),
    ["lead_list", "mentor_recommendations", "service_providers"],
  );
  // two goals feeding the same section dedupe
  assert.deepEqual(
    goalsToPrioritisedSections({ goal_ids: ["find_providers", "trade_agencies", "associations"] }),
    ["service_providers"],
  );
  // legacy / empty -> no emphasis (graceful)
  assert.deepEqual(goalsToPrioritisedSections({ goal_ids: null }), []);
  assert.deepEqual(goalsToPrioritisedSections({}), []);
  // every mapped section must be a real report_templates section
  const valid = new Set(["executive_summary", "swot_analysis", "competitor_landscape", "service_providers", "mentor_recommendations", "events_resources", "action_plan", "lead_list", "investor_recommendations"]);
  for (const secs of Object.values(GOAL_SECTION_MAP)) for (const s of secs) assert.ok(valid.has(s), `unknown section: ${s}`);
});

test("v2 goal_ids expand to non-empty service tags", () => {
  // The default international selection from rc-data DEFAULT_GOALS.
  const tags = expandGoalsToServiceTags({
    goal_ids: ["lead_lists_intl", "mentors_intl", "find_providers"],
  });

  assert.ok(tags.length > 0, "expected non-empty service tags for a known goal_ids set");
  // Spot-check tags each selected goal must contribute.
  assert.ok(tags.includes("Legal"), "find_providers → Legal");
  assert.ok(tags.includes("Mentorship"), "mentors_intl → Mentorship");
  assert.ok(tags.includes("Lead Generation"), "lead_lists_intl → Lead Generation");
});

test("startup default goal_ids expand to non-empty service tags", () => {
  const tags = expandGoalsToServiceTags({
    goal_ids: ["investors", "mentors_startup", "grants"],
  });

  assert.ok(tags.length > 0);
  assert.ok(tags.includes("Investment"));
  assert.ok(tags.includes("Funding"));
  assert.ok(tags.includes("Mentorship"));
});

test("every goal_id maps to at least one service tag", () => {
  for (const id of Object.keys(GOAL_SERVICE_TAGS_BY_ID)) {
    const tags = expandGoalsToServiceTags({ goal_ids: [id] });
    assert.ok(tags.length > 0, `goal_id "${id}" produced no service tags`);
  }
});

test("legacy long labels still resolve when goal_ids is absent", () => {
  // Historical rows / pre-v2 form: only services_needed[] long labels exist.
  const tags = expandGoalsToServiceTags({
    services_needed: [
      "Find vetted service providers (legal, tax, HR, finance)",
      "Find experienced mentors and advisors",
    ],
  });

  assert.ok(tags.length > 0, "legacy labels must still resolve via the fallback map");
  assert.ok(tags.includes("Legal"));
  assert.ok(tags.includes("Mentorship"));
});

test("goal_ids take precedence over services_needed", () => {
  const tags = expandGoalsToServiceTags({
    goal_ids: ["investors"],
    services_needed: ["Find vetted service providers (legal, tax, HR, finance)"],
  });

  // Resolved from goal_ids only — the legacy label fallback must not fire.
  assert.ok(tags.includes("Venture Capital"));
  assert.ok(!tags.includes("Tax"), "legacy fallback should not run when goal_ids resolves");
});

test("empty / unknown input yields an empty tag set (no throw)", () => {
  assert.deepEqual(expandGoalsToServiceTags({}), []);
  assert.deepEqual(expandGoalsToServiceTags({ goal_ids: [] }), []);
  assert.deepEqual(expandGoalsToServiceTags({ goal_ids: ["not_a_real_goal"] }), []);
  assert.deepEqual(expandGoalsToServiceTags({ goal_ids: null, services_needed: null }), []);
});

test("legacy label map stays a subset of the id map's tags (consistency)", () => {
  // Sanity: the legacy fallback should never invent tags the id map can't produce.
  const idTags = new Set(Object.values(GOAL_SERVICE_TAGS_BY_ID).flat());
  for (const tags of Object.values(GOAL_SERVICE_TAGS_BY_LABEL)) {
    for (const t of tags) {
      assert.ok(idTags.has(t), `legacy tag "${t}" missing from the id-keyed map`);
    }
  }
});
