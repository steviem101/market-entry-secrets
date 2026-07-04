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

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SIGNING_SECRET = Deno.env.get("SLACK_SIGNING_SECRET") ?? "";
const ALLOWED_REVIEWERS = (Deno.env.get("RQ_SLACK_REVIEWERS") ?? "").split(",").map((s) => s.trim()).filter(Boolean);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const enc = new TextEncoder();

function log(msg: string, data?: unknown): void {
  console.log(`[${new Date().toISOString()}] [rq-slack-actions] ${msg}`, data !== undefined ? JSON.stringify(data) : "");
}

// Slack parses &, <, > as control sequences (<!channel>, masked links). Proposal titles
// are AI-generated from user-submitted content, so escape anything we interpolate.
function escapeSlack(s: string): string {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

async function verifySlackSignature(req: Request, rawBody: string): Promise<boolean> {
  if (!SIGNING_SECRET) { log("missing SLACK_SIGNING_SECRET"); return false; }
  const ts = req.headers.get("x-slack-request-timestamp") ?? "";
  const sig = req.headers.get("x-slack-signature") ?? "";
  if (!ts || !sig) return false;
  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum)) return false;
  if (Math.abs(Date.now() / 1000 - tsNum) > 300) return false; // replay guard
  const key = await crypto.subtle.importKey("raw", enc.encode(SIGNING_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode(`v0:${ts}:${rawBody}`));
  const hex = Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return timingSafeEqual(`v0=${hex}`, sig);
}

// Post a message back into the channel via Slack's response_url. Never throws — a failed
// confirmation must not fail the interaction (the DB update already happened).
async function respond(responseUrl: string | undefined, text: string): Promise<void> {
  // response_url is signature-covered (Slack-controlled), but pin the host anyway so a
  // leaked signing secret can never turn this into an arbitrary-URL POST primitive.
  if (!responseUrl || !responseUrl.startsWith("https://hooks.slack.com/")) return;
  await fetch(responseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ response_type: "in_channel", replace_original: false, text }),
  }).catch((e) => log("response_url post failed", String(e)));
}

// The DB read/update + confirmation, run after the 3s ack has been returned.
async function processDecision(decision: "accepted" | "rejected", proposalId: string, slackUser: string, responseUrl: string | undefined): Promise<void> {
  const ref = proposalId.slice(0, 8);
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
  const { data: row, error: readErr } = await supabase.from("report_quality_proposals")
    .select("id, title, status, evidence").eq("id", proposalId).maybeSingle();
  // Post generic errors to the channel; keep DB internals in the function logs only.
  if (readErr) { log("read error", readErr.message); return await respond(responseUrl, `⚠️ \`[${ref}]\` lookup failed — see function logs.`); }
  if (!row) return await respond(responseUrl, `⚠️ Proposal \`[${ref}]\` not found.`);
  if (row.status === "shipped") return await respond(responseUrl, `ℹ️ \`[${ref}]\` is already *shipped* — not changing it.`);
  if (row.status === decision) return await respond(responseUrl, `ℹ️ \`[${ref}]\` was already ${decision}.`);

  const evidence = { ...(row.evidence ?? {}), slack_review: { decision, by: slackUser, at: new Date().toISOString() } };
  const { error: updErr } = await supabase.from("report_quality_proposals")
    .update({ status: decision, reviewed_at: new Date().toISOString(), evidence })
    .eq("id", proposalId);
  if (updErr) { log("update error", updErr.message); return await respond(responseUrl, `⚠️ Failed to update \`[${ref}]\` — see function logs.`); }

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
  if (!decision) return new Response("ok", { status: 200 }); // not one of our buttons
  const responseUrl: string | undefined = payload.response_url;
  const slackUserId: string = payload.user?.id ?? "";
  const slackUser: string = payload.user?.username ?? payload.user?.name ?? (slackUserId || "unknown");

  const work = (async () => {
    if (!UUID_RE.test(proposalId)) {
      log("malformed proposal id on rq button", { actionId });
      return await respond(responseUrl, "⚠️ That button carried a malformed proposal id — see function logs.");
    }
    if (ALLOWED_REVIEWERS.length && !ALLOWED_REVIEWERS.includes(slackUserId)) {
      log("reviewer not in RQ_SLACK_REVIEWERS", { slackUserId });
      return await respond(responseUrl, `⛔ ${escapeSlack(slackUser)} isn't in the reviewer allowlist for report-quality proposals.`);
    }
    await processDecision(decision, proposalId, slackUser, responseUrl);
  })();

  // Ack within Slack's 3s window; finish the work in the background where supported.
  // deno-lint-ignore no-explicit-any
  const runtime = (globalThis as any).EdgeRuntime;
  if (runtime?.waitUntil) runtime.waitUntil(work);
  else await work;
  return new Response("ok", { status: 200 });
});
