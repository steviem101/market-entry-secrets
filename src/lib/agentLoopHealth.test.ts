import { test } from "node:test";
import assert from "node:assert/strict";
import { buildLoopHealth, buildLoopActivity, type AgentRun, type AgentProposalLite } from "./agentLoopHealth.ts";

function run(over: Partial<AgentRun> = {}): AgentRun {
  return { id: "r", loop: "content-refresh", started_at: "2026-07-20T00:00:00Z", finished_at: "2026-07-20T00:01:00Z", status: "success", proposed: 1, accepted: 1, created_at: "2026-07-20T00:00:00Z", ...over };
}
function prop(over: Partial<AgentProposalLite> = {}): AgentProposalLite {
  return { loop_name: "content-refresh", status: "pending", created_at: "2026-07-20T00:00:00Z", ...over };
}

test("buildLoopHealth surfaces a loop that has proposals but no runs", () => {
  const health = buildLoopHealth([], [prop({ loop_name: "demand-mining", status: "pending" })]);
  assert.equal(health.length, 1);
  assert.equal(health[0].loop_name, "demand-mining");
  assert.equal(health[0].last_run_at, null);
  assert.equal(health[0].pending_count, 1);
});

test("success_streak counts consecutive most-recent successes then stops", () => {
  const runs = [
    run({ started_at: "2026-07-20T03:00:00Z", status: "success" }),
    run({ started_at: "2026-07-20T02:00:00Z", status: "success" }),
    run({ started_at: "2026-07-20T01:00:00Z", status: "failed" }),
    run({ started_at: "2026-07-20T00:00:00Z", status: "success" }),
  ];
  const h = buildLoopHealth(runs, []);
  assert.equal(h[0].success_streak, 2);
  assert.equal(h[0].last_status, "success");
  assert.equal(h[0].last_run_at, "2026-07-20T03:00:00Z");
});

test("a leading failure yields a zero streak", () => {
  const h = buildLoopHealth([run({ started_at: "2026-07-20T05:00:00Z", status: "failed" }), run({ started_at: "2026-07-20T04:00:00Z", status: "success" })], []);
  assert.equal(h[0].success_streak, 0);
  assert.equal(h[0].last_status, "failed");
});

test("grid sorts most-pending first", () => {
  const props = [
    prop({ loop_name: "a", status: "pending" }),
    prop({ loop_name: "b", status: "pending" }),
    prop({ loop_name: "b", status: "pending" }),
  ];
  const h = buildLoopHealth([run({ loop: "a" }), run({ loop: "b" })], props);
  assert.equal(h[0].loop_name, "b"); // 2 pending
  assert.equal(h[1].loop_name, "a"); // 1 pending
});

test("buildLoopActivity computes acceptance rate over resolved only", () => {
  const props = [
    prop({ status: "applied" }), prop({ status: "auto_approved" }),
    prop({ status: "rejected" }), prop({ status: "pending" }), // pending is NOT resolved
  ];
  const a = buildLoopActivity(props);
  assert.equal(a[0].proposed, 4);
  assert.equal(a[0].resolved, 3);              // applied + auto_approved + rejected
  assert.equal(Math.round(a[0].acceptance_rate * 100), 67); // 2/3
});

test("buildLoopActivity acceptance_rate is 0 when nothing resolved", () => {
  const a = buildLoopActivity([prop({ status: "pending" })]);
  assert.equal(a[0].acceptance_rate, 0);
});
