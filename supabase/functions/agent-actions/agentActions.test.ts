import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SOURCE_CONFIG, parseProposalKey, resolveAction, isActionRefusal, MAX_KEYS,
} from "./agentActions.ts";

const NOW = "2026-07-20T00:00:00.000Z";

test("bulk cap is 100", () => assert.equal(MAX_KEYS, 100));

test("parseProposalKey splits source:uuid, rejects malformed", () => {
  assert.deepEqual(parseProposalKey("report_quality_proposals:abc"), { source: "report_quality_proposals", id: "abc" });
  assert.equal(parseProposalKey("bad"), null);
});

test("only agent_content_proposals is applyable", () => {
  const applyable = Object.entries(SOURCE_CONFIG).filter(([, c]) => c.applyable).map(([k]) => k);
  assert.deepEqual(applyable, ["agent_content_proposals"]);
});

test("unknown source is refused", () => {
  const r = resolveAction("mystery_table", "approve", "1", NOW, "admin1");
  assert.ok(isActionRefusal(r) && /unknown source/.test(r.reason));
});

test("approve on a content proposal writes approved + reviewer and flags applyAfter", () => {
  const r = resolveAction("agent_content_proposals", "approve", "p1", NOW, "admin1");
  assert.deepEqual(r, {
    table: "agent_content_proposals", id: "p1",
    set: { status: "approved", reviewed_at: NOW, reviewed_by: "admin1" }, applyAfter: true,
  });
});

test("approve maps to each source's native status, no apply for legacy sources", () => {
  const rq = resolveAction("report_quality_proposals", "approve", "r1", NOW, "admin1");
  assert.ok(!isActionRefusal(rq) && rq.set.status === "accepted" && rq.applyAfter === false && rq.set.reviewed_by === "admin1");
  const steward = resolveAction("directory_steward_staging", "approve", "s1", NOW, "admin1");
  // steward has no reviewed_by column -> not written
  assert.ok(!isActionRefusal(steward) && steward.set.status === "approved" && !("reviewed_by" in steward.set) && steward.applyAfter === false);
  const demand = resolveAction("directory_demand_signals", "approve", "d1", NOW, "admin1");
  assert.ok(!isActionRefusal(demand) && demand.set.status === "ack");
});

test("reject maps to each source's native rejected value", () => {
  assert.equal((resolveAction("directory_steward_staging", "reject", "s1", NOW, null) as { set: { status: string } }).set.status, "dismissed");
  assert.equal((resolveAction("prompt_ab_proposals", "reject", "a1", NOW, null) as { set: { status: string } }).set.status, "dismissed");
  assert.equal((resolveAction("trade_agencies_enrichment_staging", "reject", "t1", NOW, null) as { set: { status: string } }).set.status, "rejected");
});

test("internal actor (null reviewer) omits reviewed_by even where the column exists", () => {
  const r = resolveAction("agent_content_proposals", "approve", "p1", NOW, null);
  assert.ok(!isActionRefusal(r) && !("reviewed_by" in r.set));
});

test("retry resets applyable rows to approved and re-applies; refused for legacy sources", () => {
  const r = resolveAction("agent_content_proposals", "retry", "p1", NOW, "admin1");
  assert.ok(!isActionRefusal(r) && r.set.status === "approved" && r.applyAfter === true);
  const bad = resolveAction("report_quality_proposals", "retry", "r1", NOW, "admin1");
  assert.ok(isActionRefusal(bad) && /retry not supported/.test(bad.reason));
});
