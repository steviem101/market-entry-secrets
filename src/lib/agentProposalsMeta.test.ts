import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AGENT_PROPOSAL_SOURCES, SOURCE_OPTIONS, LOOP_OPTIONS, STATUS_OPTIONS,
  isSelectable, rowActions,
} from "./agentProposalsMeta.ts";

test("source/loop pairing covers all 9 view branches with unique sources", () => {
  assert.equal(AGENT_PROPOSAL_SOURCES.length, 9);
  assert.equal(new Set(SOURCE_OPTIONS).size, 9);
  // The loop names must match what the view emits (and what automation_runs uses where a
  // producing function exists) — the report-quality split bug is the cautionary tale here.
  assert.ok(LOOP_OPTIONS.includes("report-quality-loop"));
  assert.ok(LOOP_OPTIONS.includes("prompt-ab-rollup"));
  assert.ok(LOOP_OPTIONS.includes("content-refresh"));
  assert.ok(!LOOP_OPTIONS.includes("distill-knowledge")); // runs-only loop, no proposals branch
});

test("only the canonical content table is applyable", () => {
  const applyable = AGENT_PROPOSAL_SOURCES.filter((s) => s.applyable).map((s) => s.source);
  assert.deepEqual(applyable, ["agent_content_proposals"]);
});

test("selection is restricted to pending and auto_approved", () => {
  assert.equal(isSelectable("pending"), true);
  assert.equal(isSelectable("auto_approved"), true);
  assert.equal(isSelectable("approved"), false);
  assert.equal(isSelectable("applied"), false);
  assert.equal(isSelectable("rejected"), false);   // bulk re-approving rejected rows was the bug
  assert.equal(isSelectable("apply_failed"), false);
});

test("rowActions matrix matches the server contract", () => {
  assert.deepEqual(rowActions("pending", "report_quality_proposals"), ["approve", "reject"]);
  assert.deepEqual(rowActions("auto_approved", "agent_content_proposals"), ["approve", "reject"]);
  // Stranded approved rows on the applyable source get a retry path (the stranded-apply bug).
  assert.deepEqual(rowActions("approved", "agent_content_proposals"), ["retry", "reject"]);
  assert.deepEqual(rowActions("approved", "directory_steward_staging"), ["reject"]);
  // apply_failed can now be abandoned, not only retried forever.
  assert.deepEqual(rowActions("apply_failed", "agent_content_proposals"), ["retry", "reject"]);
  // Terminal states offer nothing.
  assert.deepEqual(rowActions("applied", "agent_content_proposals"), []);
  assert.deepEqual(rowActions("rejected", "agent_content_proposals"), []);
});

test("STATUS_OPTIONS covers the canonical vocabulary exactly", () => {
  assert.deepEqual([...STATUS_OPTIONS].sort(), ["applied", "apply_failed", "approved", "auto_approved", "pending", "rejected"]);
});
