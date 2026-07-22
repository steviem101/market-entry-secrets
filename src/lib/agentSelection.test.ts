import { test } from "node:test";
import assert from "node:assert/strict";
import {
  toggleKey, selectAll, allSelected, summariseSelection, partitionResults,
  type ProposalLike, type RowResultLike,
} from "./agentSelection.ts";

const CAP = 3; // small cap keeps the tests readable; the page passes MAX_BULK (100)

test("toggleKey adds, removes, and refuses beyond the cap", () => {
  let s = toggleKey([], "a", CAP);
  assert.deepEqual(s, { selection: ["a"], capped: false });
  s = toggleKey(s.selection, "a", CAP);
  assert.deepEqual(s, { selection: [], capped: false }); // toggle off
  const full = ["a", "b", "c"];
  s = toggleKey(full, "d", CAP);
  assert.deepEqual(s, { selection: full, capped: true }); // refused, unchanged
  s = toggleKey(full, "b", CAP);
  assert.deepEqual(s.selection, ["a", "c"]); // removal always allowed at cap
});

test("selectAll merges up to the cap, keeps existing, reports capped", () => {
  const r = selectAll(["a"], ["a", "b", "c", "d"], CAP);
  assert.deepEqual(r.selection, ["a", "b", "c"]);
  assert.equal(r.capped, true);
  const r2 = selectAll([], ["x", "y"], CAP);
  assert.deepEqual(r2, { selection: ["x", "y"], capped: false });
});

test("allSelected is true only when every page key is selected, false for an empty page", () => {
  assert.equal(allSelected(["a", "b"], ["a", "b"]), true);
  assert.equal(allSelected(["a"], ["a", "b"]), false);
  assert.equal(allSelected(["a"], []), false);
});

test("summariseSelection counts only selected rows, grouped by action type, most-frequent first", () => {
  const rows: ProposalLike[] = [
    { proposal_key: "k1", action_type: "archive_event" },
    { proposal_key: "k2", action_type: "set_logo_url" },
    { proposal_key: "k3", action_type: "archive_event" },
    { proposal_key: "k4", action_type: "flag_dead_link" }, // not selected
  ];
  const s = summariseSelection(rows, ["k1", "k2", "k3"]);
  assert.equal(s.total, 3);
  assert.deepEqual(s.byActionType, [
    { actionType: "archive_event", count: 2 },
    { actionType: "set_logo_url", count: 1 },
  ]);
});

test("partitionResults never drops a row and splits on ok", () => {
  const results: RowResultLike[] = [
    { proposal_key: "k1", ok: true, applied: true },
    { proposal_key: "k2", ok: false, error: "already applied or not found; no change made" },
    { proposal_key: "k3", ok: true },
  ];
  const p = partitionResults(results);
  assert.equal(p.ok.length + p.failed.length, results.length);
  assert.deepEqual(p.failed.map((r) => r.proposal_key), ["k2"]);
});
