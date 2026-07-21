import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildDigestSummary, buildDigestBlocks, buildProposalCardBlocks, encodeButtonValue, detectAnomaly,
  type RunLite, type ProposalLite,
} from "./agentDigest.ts";

function prop(over: Partial<ProposalLite> = {}): ProposalLite {
  return { proposal_key: "agent_content_proposals:e1", loop_name: "content-refresh", action_type: "archive_event", status: "pending", reason: "past event", ...over };
}

test("buildDigestSummary counts runs, failures, and proposals by loop", () => {
  const runs: RunLite[] = [
    { loop: "content-refresh", status: "success", proposed: 3 },
    { loop: "directory-steward", status: "failed", proposed: 0 },
  ];
  const props: ProposalLite[] = [prop(), prop({ loop_name: "directory-steward" }), prop()];
  const s = buildDigestSummary(runs, props, 42);
  assert.equal(s.totalRuns, 2);
  assert.equal(s.failedRuns, 1);
  assert.equal(s.totalProposed, 3);
  assert.equal(s.pendingTotal, 42);
  assert.deepEqual(s.proposedByLoop[0], { loop: "content-refresh", count: 2 }); // most first
});

test("encodeButtonValue round-trips action + proposal_key (colon-safe)", () => {
  const v = encodeButtonValue("approve", "agent_content_proposals:uuid-123");
  assert.equal(v, "agent:approve:agent_content_proposals:uuid-123");
  // decode as rq-slack-actions will: split, [0]=agent, [1]=action, rest=key
  const parts = v.split(":");
  assert.equal(parts[0], "agent");
  assert.equal(parts[1], "approve");
  assert.equal(parts.slice(2).join(":"), "agent_content_proposals:uuid-123");
});

test("digest blocks carry the dashboard deep link and counts", () => {
  const s = buildDigestSummary([], [], 7);
  const blocks = buildDigestBlocks(s, "https://marketentrysecrets.com/admin/agents") as any[];
  const json = JSON.stringify(blocks);
  assert.match(json, /daily digest/);
  assert.match(json, /admin\/agents/);
  assert.match(json, /No new proposals/); // empty-state copy
  assert.doesNotMatch(json, /[—–]/); // no em/en dashes in Slack copy
});

test("proposal card has approve + reject buttons with encoded values", () => {
  const blocks = buildProposalCardBlocks(prop()) as any[];
  const actions = blocks.find((b) => b.type === "actions");
  assert.equal(actions.elements.length, 2);
  assert.equal(actions.elements[0].value, "agent:approve:agent_content_proposals:e1");
  assert.equal(actions.elements[1].value, "agent:reject:agent_content_proposals:e1");
});

test("long reasons are truncated in cards", () => {
  const blocks = buildProposalCardBlocks(prop({ reason: "x".repeat(500) })) as any[];
  const section = blocks.find((b) => b.type === "section");
  assert.ok(section.text.text.includes("..."));
  assert.ok(section.text.text.length < 400);
});

test("detectAnomaly flags a spike only above floor and factor", () => {
  assert.equal(detectAnomaly(5, 1), null);            // below floor (20)
  assert.equal(detectAnomaly(25, 0), null);           // no baseline
  assert.equal(detectAnomaly(25, 20), null);          // 25 < 3x20
  assert.match(detectAnomaly(70, 20) ?? "", /spike/); // 70 >= 3x20 and >= floor
});
