// agent-notifier — the daily Slack surface for the MES agent loops. Rolls up the last 24h of runs
// and proposals into a digest in #mes-agents-digest (with a deep link to /admin/agents), posts
// Approve/Reject cards for the proposals that still need a human, and raises alerts (failed runs,
// volume spikes) in #mes-agents-alerts. The dashboard is the source of truth; this is a
// notification layer, so a proposal resolved here or there reflects in both (state lives in
// agent_proposals). Buttons are handled by rq-slack-actions -> agent-actions -> apply-proposal.
//
// Auth: x-webhook-secret == SLACK_NOTIFY_WEBHOOK_SECRET (cron pattern). verify_jwt false.
// Self-skips until the channels exist: reads SLACK_AGENTS_DIGEST_CHANNEL /
// SLACK_AGENTS_ALERTS_CHANNEL from env; if the digest channel is unset it no-ops, so this is safe
// to schedule before the channels are created.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/http.ts";
import { log, logError } from "../_shared/log.ts";
import {
  buildDigestSummary, buildDigestBlocks, buildProposalCardBlocks, detectAnomaly,
  type RunLite, type ProposalLite,
} from "./agentDigest.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("SLACK_NOTIFY_WEBHOOK_SECRET") ?? "";
const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN") ?? "";
const DIGEST_CHANNEL = Deno.env.get("SLACK_AGENTS_DIGEST_CHANNEL") ?? "";
const ALERTS_CHANNEL = Deno.env.get("SLACK_AGENTS_ALERTS_CHANNEL") ?? "";
const FRONTEND_URL = Deno.env.get("FRONTEND_URL") ?? "https://marketentrysecrets.com";
const MAX_CARDS = 10;   // cap the per-proposal cards so the digest never floods the channel
const LOOP_NAME = "agent-notifier";

async function slackPost(channel: string, blocks: unknown[], text: string): Promise<void> {
  if (!SLACK_BOT_TOKEN || !channel) return;
  try {
    const res = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${SLACK_BOT_TOKEN}` },
      body: JSON.stringify({ channel, blocks, text }),
    });
    const d = await res.json();
    if (!d.ok) log(LOOP_NAME, "slack post failed", d.error);
  } catch (e) { logError(LOOP_NAME, "slack post threw", e); }
}

Deno.serve(async (req) => {
  const cors = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method not allowed" }), { status: 405, headers: { ...cors, "Content-Type": "application/json" } });
  }
  const secret = req.headers.get("x-webhook-secret");
  if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
  }

  let body: { dry_run?: boolean } = {};
  try { body = await req.json(); } catch { /* cron default */ }
  const dryRun = body.dry_run === true;

  if (!DIGEST_CHANNEL && !dryRun) {
    return new Response(JSON.stringify({ skipped: true, reason: "SLACK_AGENTS_DIGEST_CHANNEL not set" }), { headers: { ...cors, "Content-Type": "application/json" } });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
  const now = Date.now();
  const since24 = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const since7d = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

  try {
    const [runsR, propsR, pendingR, weekR, todayR] = await Promise.all([
      supabase.from("automation_runs").select("loop,status,proposed").gte("started_at", since24).order("started_at", { ascending: false }).limit(1000),
      supabase.from("agent_proposals").select("proposal_key,loop_name,action_type,status,reason,created_at").gte("created_at", since24).order("created_at", { ascending: false }).limit(1000),
      supabase.from("agent_proposals").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("agent_proposals").select("*", { count: "exact", head: true }).gte("created_at", since7d),
      supabase.from("agent_proposals").select("*", { count: "exact", head: true }).gte("created_at", since24),
    ]);

    // supabase-js RESOLVES (does not throw) on a query error, so the surrounding try/catch would miss
    // it and we'd post a misleading all-clear "0 proposals" digest. Fail loudly instead.
    const qErr = runsR.error || propsR.error || pendingR.error || weekR.error || todayR.error;
    if (qErr) {
      logError(LOOP_NAME, "digest query failed", qErr);
      if (!dryRun && ALERTS_CHANNEL) {
        await slackPost(ALERTS_CHANNEL, [{ type: "section", text: { type: "mrkdwn", text: `:warning: agent-notifier could not build the digest: ${qErr.message}. Check /admin/agents.` } }], "agent-notifier query failed");
      }
      return new Response(JSON.stringify({ error: `digest query failed: ${qErr.message}` }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const runs24h = (runsR.data ?? []) as RunLite[];
    const proposals24h = (propsR.data ?? []) as (ProposalLite & { created_at: string })[];
    const pendingTotal = pendingR.count ?? 0;
    const weekCount = weekR.count ?? 0;
    const today24hCount = todayR.count ?? 0; // exact, not capped by the 1000-row array

    const summary = buildDigestSummary(runs24h, proposals24h, pendingTotal);
    summary.totalProposed = today24hCount; // the array is capped at 1000; the count is exact
    const dashboardUrl = `${FRONTEND_URL.replace(/\/$/, "")}/admin/agents`;
    const digestBlocks = buildDigestBlocks(summary, dashboardUrl);

    // Cards for the proposals that still need a human: pending (auto_approved is already approved).
    const cardable = proposals24h.filter((p) => p.status === "pending").slice(0, MAX_CARDS);

    // Anomaly: today (exact count) vs the trailing 7-day daily average (excluding today's slice).
    const trailingAvg = Math.max(0, (weekCount - today24hCount)) / 6;
    const anomaly = detectAnomaly(today24hCount, trailingAvg);
    const alerts: string[] = [];
    if (summary.failedRuns > 0) alerts.push(`${summary.failedRuns} loop run(s) failed in the last 24 hours. See /admin/agents.`);
    if (anomaly) alerts.push(anomaly);

    if (dryRun) {
      return new Response(JSON.stringify({ dry_run: true, summary, cards: cardable.length, alerts, dashboardUrl }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    await slackPost(DIGEST_CHANNEL, digestBlocks, "MES agent loops, daily digest");
    for (const p of cardable) {
      await slackPost(DIGEST_CHANNEL, buildProposalCardBlocks(p), `Proposal from ${p.loop_name}: ${p.action_type}`);
    }
    if (alerts.length > 0 && ALERTS_CHANNEL) {
      await slackPost(ALERTS_CHANNEL, [
        { type: "header", text: { type: "plain_text", text: "MES agent loops, alert", emoji: true } },
        { type: "section", text: { type: "mrkdwn", text: alerts.map((a) => `• ${a}`).join("\n") } },
      ], "MES agent loops alert");
    }

    log(LOOP_NAME, "digest posted", { proposed: summary.totalProposed, pending: pendingTotal, cards: cardable.length, alerts: alerts.length });
    return new Response(JSON.stringify({ ok: true, summary, cards: cardable.length, alerts: alerts.length }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError(LOOP_NAME, "digest failed", err);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
