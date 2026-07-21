// rq-slack-actions — Slack interactivity receiver for the report-quality review queue.
//
// The report-quality-loop digests in #report-quality carry ✅ Accept / ❌ Reject buttons
// per proposal. Clicking one sends a signed Slack interaction payload here; we verify the
// Slack request signature (SLACK_SIGNING_SECRET), flip the proposal's status in
// report_quality_proposals, and post an in-channel confirmation via response_url.
//
// Scope is deliberately narrow: this endpoint ONLY updates proposal review status
// (new → accepted/rejected, re-decisions allowed, shipped is immutable). It never touches
// prompts, matching logic, or directory data — the loop stays propose-only and accepted
// proposals still ship through normal PRs.
//
// Auth: Slack request signing (v0 HMAC-SHA256 + 5-min replay window), verify_jwt=false.
// Optional RQ_SLACK_REVIEWERS (comma-separated Slack user IDs) restricts who may click;
// unset, channel membership is the gate (anyone who can see the message can review).
//
// Slack expects the interaction POST acked within 3s; we validate, ack immediately, and
// do the DB work + confirmation in the background via EdgeRuntime.waitUntil (confirmation
// goes through response_url, which stays valid for 30 minutes).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { escapeSlack } from "../_shared/slack.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SIGNING_SECRET = Deno.env.get("SLACK_SIGNING_SECRET") ?? "";
const ALLOWED_REVIEWERS = (Deno.env.get("RQ_SLACK_REVIEWERS") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const AGENT_ACTIONS_SECRET = Deno.env.get("AGENT_ACTIONS_SECRET") ?? Deno.env.get("EMAIL_INTERNAL_SECRET") ?? "";
const RESPOND_TIMEOUT_MS = 5000;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const enc = new TextEncoder();

// Module scope persists across warm invocations — build the client and HMAC key once.
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
const hmacKey = SIGNING_SECRET
  ? crypto.subtle.importKey("raw", enc.encode(SIGNING_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  : null;

function log(msg: string, data?: unknown): void {
  console.log(`[${new Date().toISOString()}] [rq-slack-actions] ${msg}`, data !== undefined ? JSON.stringify(data) : "");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

async function verifySlackSignature(req: Request, rawBody: string): Promise<boolean> {
  if (!hmacKey) { log("missing SLACK_SIGNING_SECRET"); return false; }
  const ts = req.headers.get("x-slack-request-timestamp") ?? "";
  const sig = req.headers.get("x-slack-signature") ?? "";
  if (!ts || !sig) return false;
  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum)) return false;
  if (Math.abs(Date.now() / 1000 - tsNum) > 300) return false; // replay guard
  const mac = await crypto.subtle.sign("HMAC", await hmacKey, enc.encode(`v0:${ts}:${rawBody}`));
  const hex = Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return timingSafeEqual(`v0=${hex}`, sig);
}

// Post a message back via Slack's response_url. Decisions go in_channel (they're the
// audit trail); errors/permission notices go ephemeral (only the clicker cares — and
// channel-wide ⚠️ noise trains reviewers to ignore the warnings that matter).
// Never throws, and bounded: the DB work has already committed, so a hung Slack
// connection must not pin the background task alive.
async function respond(responseUrl: string | undefined, text: string, visibility: "in_channel" | "ephemeral" = "in_channel"): Promise<void> {
  // response_url is signature-covered (Slack-controlled), but pin the host anyway so a
  // leaked signing secret can never turn this into an arbitrary-URL POST primitive.
  if (!responseUrl || !responseUrl.startsWith("https://hooks.slack.com/")) return;
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), RESPOND_TIMEOUT_MS);
    await fetch(responseUrl, {
      method: "POST",
      signal: ctrl.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response_type: visibility, replace_original: false, text }),
    });
    clearTimeout(to);
  } catch (e) {
    log("response_url post failed", String(e));
  }
}

// MES agent loops (Workstream D): Approve/Reject buttons on the agent-notifier digest cards.
// The button value is "agent:<approve|reject>:<proposal_key>" (proposal_key is "source:uuid", so
// it carries colons — split on the first two only). This receiver just verifies Slack signing +
// the reviewer allowlist, then delegates to agent-actions (x-internal-secret), which flips the
// proposal's status and, for applyable ones, invokes apply-proposal. So the Slack button and the
// dashboard share the exact same apply path.
async function processAgentDecision(agentAction: "approve" | "reject", buttonValue: string, slackUser: string, slackUserId: string, responseUrl: string | undefined): Promise<void> {
  const parts = buttonValue.split(":");
  if (parts[0] !== "agent" || parts.length < 3) {
    log("malformed agent button value", { buttonValue });
    return await respond(responseUrl, "⚠️ That button carried a malformed proposal reference — see function logs.", "ephemeral");
  }
  const proposalKey = parts.slice(2).join(":");
  if (!AGENT_ACTIONS_SECRET) {
    log("AGENT_ACTIONS_SECRET not configured");
    return await respond(responseUrl, "⚠️ Agent actions are not configured yet — see function logs.", "ephemeral");
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/agent-actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-internal-secret": AGENT_ACTIONS_SECRET },
      body: JSON.stringify({ action: agentAction, proposal_keys: [proposalKey] }),
    });
    const j = await res.json().catch(() => ({}));
    const row = (j.results ?? [])[0];
    if (row?.ok) {
      log("agent proposal actioned", { proposalKey, agentAction, by: slackUserId });
      const verb = agentAction === "approve" ? "✅ Approved" : "❌ Rejected";
      const applied = row.applied ? " and applied" : "";
      return await respond(responseUrl, `${verb}${applied} \`${escapeSlack(proposalKey)}\` (by ${escapeSlack(slackUser)}).`, "in_channel");
    }
    return await respond(responseUrl, `⚠️ Could not ${agentAction} \`${escapeSlack(proposalKey)}\`: ${escapeSlack(String(row?.error ?? "unknown error"))}.`, "ephemeral");
  } catch (e) {
    log("agent-actions call failed", String(e));
    return await respond(responseUrl, "⚠️ Failed to reach agent-actions — see function logs.", "ephemeral");
  }
}

// MES-148 Phase 4 (PR-B): the same propose-only pattern for prompt A/B
// recommendations (prompt-ab-rollup posts Accept/Dismiss buttons). Accepting only
// flips prompt_ab_proposals.status → the actual prompt promotion still ships as a
// human migration/PR (copy the candidate body into report_templates, retire the
// prompt_versions row). This endpoint never writes the active prompt.
async function processAbDecision(decision: "accepted" | "dismissed", proposalId: string, slackUser: string, slackUserId: string, responseUrl: string | undefined): Promise<void> {
  const ref = proposalId.slice(0, 8);
  const { data: row, error: readErr } = await supabase.from("prompt_ab_proposals")
    .select("id, section_name, candidate_version, verdict, status, evidence").eq("id", proposalId).maybeSingle();
  if (readErr) { log("ab read error", readErr.message); return await respond(responseUrl, `⚠️ \`[${ref}]\` lookup failed — see function logs.`, "ephemeral"); }
  if (!row) return await respond(responseUrl, `⚠️ Prompt A/B proposal \`[${ref}]\` not found.`, "ephemeral");
  if (row.status === "shipped") return await respond(responseUrl, `ℹ️ \`[${ref}]\` is already *shipped* — not changing it.`, "ephemeral");
  if (row.status === decision) return await respond(responseUrl, `ℹ️ \`[${ref}]\` was already ${decision}.`, "ephemeral");

  const evidence = { ...(row.evidence ?? {}), slack_review: { decision, by: slackUser, by_id: slackUserId, at: new Date().toISOString() } };
  const { data: updated, error: updErr } = await supabase.from("prompt_ab_proposals")
    .update({ status: decision, reviewed_at: new Date().toISOString(), evidence })
    .eq("id", proposalId).eq("status", row.status).select("id");
  if (updErr) { log("ab update error", updErr.message); return await respond(responseUrl, `⚠️ Failed to update \`[${ref}]\` — see function logs.`, "ephemeral"); }
  if (!updated?.length) return await respond(responseUrl, `ℹ️ \`[${ref}]\` changed while you clicked — no change made. Re-check its current status before deciding again.`, "ephemeral");

  log("ab proposal reviewed", { ref, decision });
  const label = `${escapeSlack(String(row.section_name ?? ""))} v${row.candidate_version} (${escapeSlack(String(row.verdict ?? ""))})`;
  const suffix = decision === "accepted"
    ? "\n_Ship it via a migration/PR — copy the candidate body into report_templates and retire the version._"
    : "";
  await respond(responseUrl, `${decision === "accepted" ? "✅" : "❌"} \`[${ref}]\` *${label}* — *${decision}* by ${escapeSlack(slackUser)}.${suffix}`);
}

// MES-148 Phase 5 (P5-3a): directory steward class-B review. The nightly steward
// posts Approve/Dismiss buttons for substantive scraped changes it staged rather
// than auto-applied. Approving flips directory_steward_staging.status → the actual
// apply to the live directory row still ships as a reviewed action, never from this
// click. 'applied' (a class-A auto-apply audit row) is immutable.
async function processStewardDecision(decision: "approved" | "dismissed", proposalId: string, slackUser: string, slackUserId: string, responseUrl: string | undefined): Promise<void> {
  const ref = proposalId.slice(0, 8);
  const { data: row, error: readErr } = await supabase.from("directory_steward_staging")
    .select("id, directory_table, record_id, change_class, status, evidence").eq("id", proposalId).maybeSingle();
  if (readErr) { log("steward read error", readErr.message); return await respond(responseUrl, `⚠️ \`[${ref}]\` lookup failed — see function logs.`, "ephemeral"); }
  if (!row) return await respond(responseUrl, `⚠️ Steward proposal \`[${ref}]\` not found.`, "ephemeral");
  if (row.status === "applied") return await respond(responseUrl, `ℹ️ \`[${ref}]\` was already *applied* — not changing it.`, "ephemeral");
  if (row.status === decision) return await respond(responseUrl, `ℹ️ \`[${ref}]\` was already ${decision}.`, "ephemeral");

  const evidence = { ...(row.evidence ?? {}), slack_review: { decision, by: slackUser, by_id: slackUserId, at: new Date().toISOString() } };
  const { data: updated, error: updErr } = await supabase.from("directory_steward_staging")
    .update({ status: decision, reviewed_at: new Date().toISOString(), evidence })
    .eq("id", proposalId).eq("status", row.status).select("id");
  if (updErr) { log("steward update error", updErr.message); return await respond(responseUrl, `⚠️ Failed to update \`[${ref}]\` — see function logs.`, "ephemeral"); }
  if (!updated?.length) return await respond(responseUrl, `ℹ️ \`[${ref}]\` changed while you clicked — no change made. Re-check its current status before deciding again.`, "ephemeral");

  log("steward proposal reviewed", { ref, decision });
  const label = `${escapeSlack(String(row.directory_table ?? ""))} row ${escapeSlack(String(row.record_id ?? "").slice(0, 8))} (class ${escapeSlack(String(row.change_class ?? "?"))})`;
  const suffix = decision === "approved"
    ? "\n_Approved — the change applies via a reviewed action, not from this click._"
    : "";
  await respond(responseUrl, `${decision === "approved" ? "✅" : "❌"} \`[${ref}]\` *${label}* — *${decision}* by ${escapeSlack(slackUser)}.${suffix}`);
}

// The DB read/update + confirmation, run after the 3s ack has been returned.
async function processDecision(decision: "accepted" | "rejected", proposalId: string, slackUser: string, slackUserId: string, responseUrl: string | undefined): Promise<void> {
  const ref = proposalId.slice(0, 8);
  const { data: row, error: readErr } = await supabase.from("report_quality_proposals")
    .select("id, title, status, evidence").eq("id", proposalId).maybeSingle();
  // Post generic errors to the clicker; keep DB internals in the function logs only.
  if (readErr) { log("read error", readErr.message); return await respond(responseUrl, `⚠️ \`[${ref}]\` lookup failed — see function logs.`, "ephemeral"); }
  if (!row) return await respond(responseUrl, `⚠️ Proposal \`[${ref}]\` not found.`, "ephemeral");
  if (row.status === "shipped") return await respond(responseUrl, `ℹ️ \`[${ref}]\` is already *shipped* — not changing it.`, "ephemeral");
  if (row.status === decision) return await respond(responseUrl, `ℹ️ \`[${ref}]\` was already ${decision}.`, "ephemeral");

  const evidence = { ...(row.evidence ?? {}), slack_review: { decision, by: slackUser, by_id: slackUserId, at: new Date().toISOString() } };
  // Compare-and-swap on the status we read: makes shipped-immutability atomic and turns
  // two conflicting clicks racing (Accept vs Reject) into one winner + one clear notice,
  // instead of silent last-write-wins under contradictory confirmations.
  const { data: updated, error: updErr } = await supabase.from("report_quality_proposals")
    .update({ status: decision, reviewed_at: new Date().toISOString(), evidence })
    .eq("id", proposalId).eq("status", row.status).select("id");
  if (updErr) { log("update error", updErr.message); return await respond(responseUrl, `⚠️ Failed to update \`[${ref}]\` — see function logs.`, "ephemeral"); }
  if (!updated?.length) return await respond(responseUrl, `ℹ️ \`[${ref}]\` changed while you clicked — no change made. Re-check its current status before deciding again.`, "ephemeral");

  log("proposal reviewed", { ref, decision });
  const suffix = decision === "accepted"
    ? "\n_It'll be ticketed into Notion on the next sweep; implementation still ships via PRs._"
    : "";
  await respond(responseUrl, `${decision === "accepted" ? "✅" : "❌"} \`[${ref}]\` *${escapeSlack(String(row.title ?? ""))}* — *${decision}* by ${escapeSlack(slackUser)}.${suffix}`);
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") return new Response("method_not_allowed", { status: 405 });
  const rawBody = await req.text();
  if (!(await verifySlackSignature(req, rawBody))) return new Response("bad_signature", { status: 401 });

  // Slack sends application/x-www-form-urlencoded with a `payload` JSON field.
  const payloadStr = new URLSearchParams(rawBody).get("payload");
  if (!payloadStr) return new Response("no_payload", { status: 400 });
  // deno-lint-ignore no-explicit-any
  let payload: any;
  try { payload = JSON.parse(payloadStr); } catch { return new Response("bad_payload", { status: 400 }); }
  if (payload.type !== "block_actions") return new Response("ok", { status: 200 });

  const action = (payload.actions ?? [])[0];
  const actionId: string = action?.action_id ?? "";
  const proposalId: string = action?.value ?? "";
  const decision = actionId.startsWith("rq_accept_") ? "accepted" as const : actionId.startsWith("rq_reject_") ? "rejected" as const : null;
  // Phase 4 (PR-B): prompt A/B promote/retire buttons share this receiver.
  const abDecision = actionId.startsWith("ab_accept_") ? "accepted" as const : actionId.startsWith("ab_dismiss_") ? "dismissed" as const : null;
  // Phase 5 (P5-3a): directory steward class-B Approve/Dismiss buttons share it too.
  const dsDecision = actionId.startsWith("ds_approve_") ? "approved" as const : actionId.startsWith("ds_dismiss_") ? "dismissed" as const : null;
  // MES agent loops (Workstream D): digest-card Approve/Reject buttons.
  const agentAction = actionId === "agent_approve" ? "approve" as const : actionId === "agent_reject" ? "reject" as const : null;
  if (!decision && !abDecision && !dsDecision && !agentAction) return new Response("ok", { status: 200 }); // not one of our buttons
  const responseUrl: string | undefined = payload.response_url;
  const slackUserId: string = payload.user?.id ?? "";
  const slackUser: string = payload.user?.username ?? payload.user?.name ?? (slackUserId || "unknown");

  // Fully caught: a throw after the 200 ack would otherwise be an unhandled rejection,
  // which is fatal to the Deno isolate.
  const work = (async () => {
    try {
      // Reviewer allowlist applies to every button type.
      if (ALLOWED_REVIEWERS.length && !ALLOWED_REVIEWERS.includes(slackUserId)) {
        log("reviewer not in RQ_SLACK_REVIEWERS");
        return await respond(responseUrl, "⛔ You're not in the reviewer allowlist.", "ephemeral");
      }
      // Agent-loop buttons carry a proposal_key ("source:uuid"), not a bare UUID, so handle them
      // before the UUID guard and delegate to agent-actions.
      if (agentAction) return await processAgentDecision(agentAction, proposalId, slackUser, slackUserId, responseUrl);

      if (!UUID_RE.test(proposalId)) {
        log("malformed proposal id on rq button", { actionId });
        return await respond(responseUrl, "⚠️ That button carried a malformed proposal id — see function logs.", "ephemeral");
      }
      if (dsDecision) await processStewardDecision(dsDecision, proposalId, slackUser, slackUserId, responseUrl);
      else if (abDecision) await processAbDecision(abDecision, proposalId, slackUser, slackUserId, responseUrl);
      else await processDecision(decision!, proposalId, slackUser, slackUserId, responseUrl);
    } catch (e) {
      log("background work failed", String(e));
      await respond(responseUrl, "⚠️ Something went wrong handling that click — see function logs.", "ephemeral");
    }
  })();

  // Ack within Slack's 3s window; finish the work in the background where supported.
  // deno-lint-ignore no-explicit-any
  const runtime = (globalThis as any).EdgeRuntime;
  if (runtime?.waitUntil) runtime.waitUntil(work);
  else await work;
  return new Response("ok", { status: 200 });
});
