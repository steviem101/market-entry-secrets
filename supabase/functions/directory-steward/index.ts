// directory-steward — nightly directory freshness/health pass (MES-148 Phase 5 P5-3b).
//
// For the stalest rows in each stewarded directory table (oldest last_verified first),
// it checks the source URL's reachability, scores 0–100 data_health (reachability +
// completeness + freshness), and writes ONLY metadata back to the live row
// (last_verified + data_health) — it NEVER changes content. A dead/unreachable source
// is staged as a propose-only class-B row (directory_steward_staging) + a Slack card
// (rq-slack-actions Approve/Dismiss); a human decides, and the apply ships as a
// reviewed action. Content-drift auto-apply is a deliberate later increment.
//
// Doubly disabled by default: requires DIRECTORY_STEWARD_ENABLED=on AND an enabled
// activity_event_routing 'directory.steward' row. Auth: x-webhook-secret ==
// SLACK_NOTIFY_WEBHOOK_SECRET (verify_jwt=false). PII: community_members is scored
// but its content is never diffed/staged (mentors are anonymised).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateExternalUrl } from "../_shared/url.ts";
import { computeDataHealth, completeness, STALE_DAYS } from "../generate-report/dataHealth.ts";
import { STEWARD_TABLES, ageInDays, type StewardTableConfig } from "./tables.ts";
import { classifyReachabilityStatus, isTimeoutError, PROBE_HEADERS } from "./reachability.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN") ?? "";
const WEBHOOK_SECRET = Deno.env.get("SLACK_NOTIFY_WEBHOOK_SECRET") ?? "";
const ROUTING_EVENT = "directory.steward";
const LOOP_NAME = "directory-steward";
const DEFAULT_BATCH = 15;          // rows per table per run
const MAX_BATCH = 100;
const DEFAULT_MAX_RUN_MS = 120000; // wall-clock budget (edge runtime hard-caps well above)
const FETCH_TIMEOUT_MS = 8000;
const FETCH_GAP_MS = 150;          // polite delay between external fetches

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(b: unknown, s = 200): Response {
  return new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });
}
function log(msg: string, data?: unknown): void {
  console.log(`[${new Date().toISOString()}] [directory-steward] ${msg}`, data !== undefined ? JSON.stringify(data) : "");
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// deno-lint-ignore no-explicit-any
async function postToSlack(channel: string, text: string, blocks: unknown[]): Promise<void> {
  if (!SLACK_BOT_TOKEN || !channel) return;
  try {
    const resp = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8", Authorization: `Bearer ${SLACK_BOT_TOKEN}` },
      body: JSON.stringify({ channel, text, attachments: [{ color: "#6b46c1", blocks }] }),
    });
    const d = await resp.json();
    if (!d.ok) log("slack post failed", d.error);
  } catch (e) { log("slack post threw", String(e)); }
}

/** Reachability of a source URL, as a three-state verdict (see reachability.ts):
 *  true = alive (2xx/3xx); false = definitively dead (404/410 or a DNS/connection
 *  failure) — the only signal that stages a row; null = not checkable / alive-but-
 *  blocked (no URL, SSRF-guarded address, WAF/bot-block status, or a timeout) →
 *  neutral, never staged. Biased toward false-negatives so a live-but-bot-blocking
 *  source (LinkedIn 999, WAF 403) is never mis-staged as dead. */
async function checkReachable(rawUrl: unknown): Promise<boolean | null> {
  if (typeof rawUrl !== "string" || !rawUrl.trim()) return null;
  let url: string;
  try { url = validateExternalUrl(rawUrl); } catch { return null; } // SSRF/invalid → not checkable
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    // GET (many sites 405 a HEAD); we only read status, not the body — cancel it so
    // the connection isn't held open downloading a page we don't read. Browser-like
    // headers so a benign uptime check isn't itself the reason for a WAF 403.
    const res = await fetch(url, { method: "GET", redirect: "follow", signal: ctrl.signal, headers: PROBE_HEADERS });
    try { await res.body?.cancel(); } catch { /* ignore */ }
    return classifyReachabilityStatus(res.status);
  } catch (e) {
    // Timeout = ambiguous (slow origin / bot-tarpit) → don't penalise; a real
    // DNS/connection/TLS failure = genuinely unreachable.
    return isTimeoutError(e) ? null : false;
  } finally {
    clearTimeout(to);
  }
}

async function stewardTable(
  supabase: any,
  cfg: StewardTableConfig,
  batch: number,
  runId: string,
  nowMs: number,
  deadlineAt: number,
  dryRun: boolean,
): Promise<{ table: string; scored: number; staged: number; deadLinks: Array<{ id: string; url: string; proposalId: string }> }> {
  const out = { table: cfg.table, scored: 0, staged: 0, deadLinks: [] as Array<{ id: string; url: string; proposalId: string }> };
  const cols = [...new Set(["id", "last_verified", cfg.urlField, ...cfg.requiredFields])].join(", ");
  const { data: rows, error } = await supabase.from(cfg.table)
    .select(cols).order("last_verified", { ascending: true, nullsFirst: true }).limit(batch);
  if (error) { log(`fetch ${cfg.table} failed`, error.message); return out; }

  for (const row of rows ?? []) {
    if (Date.now() >= deadlineAt) { log("deadline reached — stopping", { table: cfg.table }); break; }
    const url = row[cfg.urlField];
    const reachable = await checkReachable(url);
    const health = computeDataHealth({
      urlReachable: reachable,
      requiredPresent: completeness(row, cfg.requiredFields),
      ageDays: ageInDays(row.last_verified, nowMs, STALE_DAYS),
    });

    // Metadata-only write to the LIVE row — never content. Safe + reversible.
    if (!dryRun) {
      const { error: upErr } = await supabase.from(cfg.table)
        .update({ last_verified: new Date(nowMs).toISOString(), data_health: health }).eq("id", row.id);
      if (upErr) log(`update ${cfg.table} ${row.id} failed`, upErr.message);
    }
    out.scored += 1;

    // A dead source is the one unambiguous signal worth surfacing in v1. Stage it as
    // a propose-only class-B row (never auto-null the URL). field_diffs holds only the
    // URL (not PII, even for mentors). The partial unique index dedupes an open one.
    if (reachable === false && !dryRun) {
      const proposalId = crypto.randomUUID();
      const { error: insErr } = await supabase.from("directory_steward_staging").insert({
        id: proposalId, run_id: runId, directory_table: cfg.table, record_id: row.id,
        source_url: typeof url === "string" ? url : null, change_class: "B",
        field_diffs: { [cfg.urlField]: { before: url, after: null } },
        computed_health: health, status: "new",
        evidence: { reason: "source_unreachable" },
      });
      if (!insErr) { out.staged += 1; out.deadLinks.push({ id: row.id, url: String(url), proposalId }); }
      // A unique-violation (open proposal already exists for this record) is expected — skip quietly.
    }
    if (Date.now() < deadlineAt) await sleep(FETCH_GAP_MS);
  }
  return out;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!WEBHOOK_SECRET || (req.headers.get("x-webhook-secret") ?? "") !== WEBHOOK_SECRET) return json({ error: "unauthorized" }, 401);

  // Gate 1: explicit env kill-switch (this function writes to LIVE rows).
  if (!["on", "1", "true"].includes((Deno.env.get("DIRECTORY_STEWARD_ENABLED") || "").trim().toLowerCase())) {
    log("disabled (DIRECTORY_STEWARD_ENABLED off) — skipping");
    return json({ ok: true, skipped: "steward_disabled" });
  }

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* defaults */ }
  const batch = Math.min(Math.max(Number(body.batch_size) || DEFAULT_BATCH, 1), MAX_BATCH);
  const maxRunMs = Math.max(Number(body.max_run_ms) || DEFAULT_MAX_RUN_MS, 10000);
  const dryRun = body.dry_run === true;

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

  // Gate 2: data-driven routing kill-switch (also supplies the Slack channel).
  const { data: rt } = await supabase.from("activity_event_routing")
    .select("channel_id,enabled").eq("event_type", ROUTING_EVENT).maybeSingle();
  if (!rt || !rt.enabled || !rt.channel_id) { log("routing disabled — skipping"); return json({ ok: true, skipped: "routing_disabled" }); }
  const channel = rt.channel_id as string;

  const runId = crypto.randomUUID();
  const startedAt = new Date().toISOString();
  const nowMs = Date.parse(startedAt);
  const deadlineAt = Date.now() + maxRunMs;

  let runRowId: string | null = null;
  if (!dryRun) {
    const { data: run } = await supabase.from("automation_runs")
      .insert({ loop: LOOP_NAME, started_at: startedAt, status: "running", metadata: { batch_size: batch } })
      .select("id").maybeSingle();
    runRowId = run?.id ?? null;
  }

  const results = [];
  for (const cfg of STEWARD_TABLES) {
    if (Date.now() >= deadlineAt) { log("deadline reached — stopping table loop"); break; }
    results.push(await stewardTable(supabase, cfg, batch, runId, nowMs, deadlineAt, dryRun));
  }

  const totals = results.reduce((a, r) => ({ scored: a.scored + r.scored, staged: a.staged + r.staged }), { scored: 0, staged: 0 });
  const deadLinks = results.flatMap((r) => r.deadLinks.map((d) => ({ ...d, table: r.table })));

  // ── Slack digest (only when something was staged) ──────────────────────────────
  if (deadLinks.length > 0) {
    // deno-lint-ignore no-explicit-any
    const blocks: any[] = [
      { type: "header", text: { type: "plain_text", text: "🩺 Directory steward — dead sources" } },
      { type: "context", elements: [{ type: "mrkdwn", text: `${totals.scored} rows re-scored · ${deadLinks.length} unreachable source(s) staged for review` }] },
    ];
    for (const d of deadLinks.slice(0, 20)) {
      blocks.push({
        type: "section",
        text: { type: "mrkdwn", text: `⚠️ *${d.table}* row \`${d.id.slice(0, 8)}\` — source unreachable\n<${d.url}|${d.url.slice(0, 80)}>` },
      });
      blocks.push({
        type: "actions",
        elements: [
          { type: "button", style: "primary", text: { type: "plain_text", text: "✅ Approve (flag)" }, action_id: `ds_approve_${d.proposalId}`, value: d.proposalId },
          { type: "button", text: { type: "plain_text", text: "❌ Dismiss" }, action_id: `ds_dismiss_${d.proposalId}`, value: d.proposalId },
        ],
      });
    }
    blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: "_Approve flags the row for a reviewed fix — the steward never edits directory content, only last_verified/data_health._" }] });
    await postToSlack(channel, "Directory steward — dead sources", blocks);
  }

  if (!dryRun && runRowId) {
    await supabase.from("automation_runs").update({
      finished_at: new Date().toISOString(), status: "success",
      reviewed: totals.scored, proposed: totals.staged,
      metadata: { batch_size: batch, per_table: results.map((r) => ({ table: r.table, scored: r.scored, staged: r.staged })) },
    }).eq("id", runRowId);
  }

  log("run complete", { scored: totals.scored, staged: totals.staged, dryRun });
  return json({ ok: true, scored: totals.scored, staged: totals.staged, dry_run: dryRun, per_table: results.map((r) => ({ table: r.table, scored: r.scored, staged: r.staged })) });
});
