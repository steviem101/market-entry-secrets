import { test } from "node:test";
import assert from "node:assert/strict";
import {
  planApply, parseProposalKey, isApplyableSource, isRefusal, ACTION_WHITELIST,
  type Proposal,
} from "./applyProposal.ts";

function proposal(over: Partial<Proposal> = {}): Proposal {
  return {
    id: "p1", action_type: "archive_event", target_table: "events", target_id: "e1",
    payload: {}, status: "auto_approved", ...over,
  };
}

test("parseProposalKey splits source and uuid, rejects malformed", () => {
  assert.deepEqual(parseProposalKey("agent_content_proposals:abc-123"),
    { source: "agent_content_proposals", id: "abc-123" });
  assert.equal(parseProposalKey("nocolon"), null);
  assert.equal(parseProposalKey(":leading"), null);
  assert.equal(parseProposalKey("trailing:"), null);
});

test("only agent_content_proposals is directly applyable", () => {
  assert.equal(isApplyableSource("agent_content_proposals"), true);
  assert.equal(isApplyableSource("directory_steward_staging"), false);
});

test("auto-approve is limited to the low-risk trio", () => {
  const auto = Object.entries(ACTION_WHITELIST).filter(([, v]) => v.autoApprove).map(([k]) => k).sort();
  assert.deepEqual(auto, ["archive_event", "set_logo_url", "trigger_reembed"]);
});

test("unknown action_type is refused", () => {
  const r = planApply(proposal({ action_type: "delete_everything" }), null);
  assert.ok(isRefusal(r) && /not in whitelist/.test(r.reason));
});

test("non-approved status is not applyable", () => {
  const r = planApply(proposal({ status: "pending" }), null);
  assert.ok(isRefusal(r) && /not applyable/.test(r.reason));
});

test("archive_event sets status=archived, noop when already archived", () => {
  const r = planApply(proposal(), { status: "approved" });
  assert.deepEqual(r, { op: "update", table: "events", id: "e1", set: { status: "archived" } });
  const already = planApply(proposal(), { status: "archived" });
  assert.deepEqual(already, { op: "noop", note: "event already archived" });
});

test("archive_event requires events target", () => {
  const r = planApply(proposal({ target_table: "service_providers" }), null);
  assert.ok(isRefusal(r));
});

test("set_logo_url is COALESCE-protected: fills blank, never overwrites", () => {
  const p = proposal({
    action_type: "set_logo_url", target_table: "service_providers", target_id: "s1",
    payload: { logo_field: "logo", logo_url: "https://logo.dev/x.png" },
  });
  const fill = planApply(p, { logo: null });
  assert.deepEqual(fill, { op: "update", table: "service_providers", id: "s1", set: { logo: "https://logo.dev/x.png" } });
  const existing = planApply(p, { logo: "https://existing.png" });
  assert.equal((existing as { op: string }).op, "noop");
});

test("set_logo_url rejects a non-whitelisted logo field", () => {
  const p = proposal({
    action_type: "set_logo_url", target_table: "service_providers", target_id: "s1",
    payload: { logo_field: "password", logo_url: "https://x" },
  });
  assert.ok(isRefusal(planApply(p, { password: null })));
});

test("set_logo_url refuses a non-curated target_table and non-https urls", () => {
  const offTable = proposal({
    action_type: "set_logo_url", target_table: "user_subscriptions", target_id: "u1",
    payload: { logo_field: "logo", logo_url: "https://logo.dev/x.png" },
  });
  assert.ok(isRefusal(planApply(offTable, { logo: null })));
  const notHttps = proposal({
    action_type: "set_logo_url", target_table: "service_providers", target_id: "s1",
    payload: { logo_field: "logo", logo_url: "http://insecure/x.png" },
  });
  assert.ok(isRefusal(planApply(notHttps, { logo: null })));
});

test("flag_dead_link and queue_enrichment refuse a non-curated target_table", () => {
  const dead = proposal({ action_type: "flag_dead_link", target_table: "profiles", target_id: "x", status: "approved" });
  assert.ok(isRefusal(planApply(dead, {})));
  const enr = proposal({ action_type: "queue_enrichment", target_table: "profiles", target_id: "x", status: "approved", payload: { fields: { description: "y" } } });
  assert.ok(isRefusal(planApply(enr, {})));
});

test("apply_failed is applyable (retry re-runs the same apply)", () => {
  const r = planApply(proposal({ status: "apply_failed" }), { status: "approved" });
  assert.deepEqual(r, { op: "update", table: "events", id: "e1", set: { status: "archived" } });
});

test("queue_enrichment fills only empty curated fields", () => {
  const p = proposal({
    action_type: "queue_enrichment", target_table: "investors", target_id: "i1",
    payload: { fields: { description: "New desc", website: "https://w" } },
  });
  const r = planApply(p, { description: "", website: "https://existing" });
  // description was blank -> filled; website already set -> preserved.
  assert.deepEqual(r, { op: "update", table: "investors", id: "i1", set: { description: "New desc" } });
});

test("queue_enrichment with nothing to fill is a noop", () => {
  const p = proposal({
    action_type: "queue_enrichment", target_table: "investors", target_id: "i1",
    payload: { fields: { description: "x" } },
  });
  const r = planApply(p, { description: "already has one" });
  assert.equal((r as { op: string }).op, "noop");
});

test("trigger_reembed nulls hashes for the given kb ids", () => {
  const p = proposal({ action_type: "trigger_reembed", target_table: null, target_id: null, payload: { kb_ids: ["k1", "k2"] } });
  assert.deepEqual(planApply(p, null), { op: "reembed", kbIds: ["k1", "k2"] });
  assert.ok(isRefusal(planApply(proposal({ action_type: "trigger_reembed", payload: {} }), null)));
});

test("remove_kb_row deletes by target_id; flag_stale_content is review-only noop", () => {
  const del = planApply(proposal({ action_type: "remove_kb_row", target_table: "mes_knowledge_base", target_id: "k9" }), null);
  assert.deepEqual(del, { op: "delete", table: "mes_knowledge_base", id: "k9" });
  const flag = planApply(proposal({ action_type: "flag_stale_content", target_table: "content_items", target_id: "c1" }), null);
  assert.equal((flag as { op: string }).op, "noop");
});
