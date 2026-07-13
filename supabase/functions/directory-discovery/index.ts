// directory-discovery — demand-driven directory growth agent (MES-148 Phase 5 P5-4).
//
// Reads the top open unmet-demand signals (directory_demand_signals, P5-5), web-searches
// (Firecrawl) for organisations that could fill each gap, dedupes candidates against the
// live directory + already-staged rows, and lands each as a propose-only candidate
// (directory_discovery_staging) + a Slack Approve/Dismiss card. A human approves; the
// import still ships as a reviewed action — NOTHING is auto-inserted into a directory.
//
// Doubly disabled by default: requires DIRECTORY_DISCOVERY_ENABLED=on AND an enabled
// activity_event_routing 'directory.discovery' row. Cost-bounded: at most MAX_SIGNALS
// gaps per run, each with a capped search. Auth: x-webhook-secret ==
// SLACK_NOTIFY_WEBHOOK_SECRET (verify_jwt=false).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildQueries,
  dedupeAgainstExisting,
  extractCandidates,
  normalizeDomain,
  normalizeName,
  type DemandSignalLike,
  type RawHit,
} from "./discovery.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN") ?? "";
const WEBHOOK_SECRET = Deno.env.get("SLACK_NOTIFY_WEBHOOK_SECRET") ?? "";
const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY") ?? "";
const ROUTING_EVENT = "directory.discovery";
const LOOP_NAME = "directory-discovery";
const DEFAULT_MAX_SIGNALS = 3;    // gaps targeted per run (bounds Firecrawl cost)
const MAX_SIGNALS_CAP = 10;
const SEARCH_LIMIT = 5;           // results per query
const FIRECRAWL_TIMEOUT_MS = 30000;
const SLACK_TOP = 20;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(b: unknown, s = 200): Response {
  return new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });
}
function log(msg: string, data?: unknown): void {
  console.log(`[${new Date().toISOString()}] [directory-discovery] ${msg}`, data !== undefined ? JSON.stringify(data) : "");
}

// deno-lint-ignore no-explicit-any
async function postToSlack(channel: string, text: string, blocks: any[]): Promise<void> {
  if (!SLACK_BOT_TOKEN || !channel) return;
  try {
    const resp = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8", Authorization: `Bearer ${SLACK_BOT_TOKEN}` },
      body: JSON.stringify({ channel, text, attachments: [{ color: "#0b7285", blocks }] }),
    });
    const d = await resp.json();
    if (!d.ok) log("slack post failed", d.error);
  } catch (e) { log("slack post threw", String(e)); }
}

/** One Firecrawl /v1/search call → raw hits. Returns [] on any error (best-effort). */
async function firecrawlSearch(query: string): Promise<RawHit[]> {
  if (!FIRECRAWL_API_KEY) { log("FIRECRAWL_API_KEY missing — skipping search"); return []; }
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), FIRECRAWL_TIMEOUT_MS);
  try {
    const res = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, limit: SEARCH_LIMIT, lang: "en", country: "au" }),
      signal: ctrl.signal,
    });
    if (!res.ok) { log("firecrawl search non-2xx", res.status); return []; }
    const body = await res.json();
    const rows = Array.isArray(body?.data) ? body.data : [];
    // deno-lint-ignore no-explicit-any
    return rows.map((r: any) => ({ title: r?.title ?? r?.metadata?.title ?? null, url: r?.url ?? null, description: r?.description ?? r?.metadata?.description ?? null }));
  } catch (e) {
    log("firecrawl search threw", String(e));
    return [];
  } finally {
    clearTimeout(to);
  }
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!WEBHOOK_SECRET || (req.headers.get("x-webhook-secret") ?? "") !== WEBHOOK_SECRET) return json({ error: "unauthorized" }, 401);

  // Gate 1: explicit env kill-switch (this function spends Firecrawl credits).
  if (!["on", "1", "true"].includes((Deno.env.get("DIRECTORY_DISCOVERY_ENABLED") || "").trim().toLowerCase())) {
    log("disabled (DIRECTORY_DISCOVERY_ENABLED off) — skipping");
    return json({ ok: true, skipped: "discovery_disabled" });
  }

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* defaults */ }
  const maxSignals = Math.min(Math.max(Number(body.max_signals) || DEFAULT_MAX_SIGNALS, 1), MAX_SIGNALS_CAP);
  const dryRun = body.dry_run === true;

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

  // Gate 2: data-driven routing kill-switch (also supplies the Slack channel).
  const { data: rt } = await supabase.from("activity_event_routing")
    .select("channel_id,enabled").eq("event_type", ROUTING_EVENT).maybeSingle();
  if (!rt || !rt.enabled || !rt.channel_id) { log("routing disabled — skipping"); return json({ ok: true, skipped: "routing_disabled" }); }
  const channel = rt.channel_id as string;

  // Target queue: the most-underserved OPEN demand signals (P5-5). Nothing to do if empty.
  const { data: signals, error: sigErr } = await supabase.from("directory_demand_signals")
    .select("id,term_slug,term_label,sample_sectors,sample_regions")
    .eq("signal_type", "service").eq("status", "new")
    .order("gap_score", { ascending: false }).limit(maxSignals);
  if (sigErr) { log("load demand signals failed", sigErr.message); return json({ error: "signals_unavailable" }, 500); }
  if (!signals || signals.length === 0) { log("no open demand signals — nothing to discover"); return json({ ok: true, targeted: 0, staged: 0 }); }

  const runId = crypto.randomUUID();
  const startedAt = new Date().toISOString();

  // Existing directory identity, loaded once for dedupe (id/name/website only).
  const { data: existing } = await supabase.from("service_providers").select("name,website").limit(5000);
  const existingDomains = new Set<string>();
  const existingNames = new Set<string>();
  for (const p of existing ?? []) {
    const d = normalizeDomain(p.website);
    if (d) existingDomains.add(d);
    const n = normalizeName(p.name);
    if (n) existingNames.add(n);
  }

  const perSignal: Array<{ term: string; searched: number; staged: number }> = [];
  const allStaged: Array<{ name: string; url: string; term: string; proposalId: string }> = [];

  for (const sig of signals) {
    const signalLike: DemandSignalLike = {
      term_slug: sig.term_slug, term_label: sig.term_label,
      sample_sectors: sig.sample_sectors, sample_regions: sig.sample_regions,
    };
    const queries = buildQueries(signalLike);
    const hits: RawHit[] = [];
    for (const q of queries) hits.push(...await firecrawlSearch(q));

    const candidates = dedupeAgainstExisting(extractCandidates(hits), existingDomains, existingNames);
    let staged = 0;
    for (const c of candidates) {
      // Reserve the domain across this run so two signals don't both stage it.
      if (existingDomains.has(c.domain)) continue;
      existingDomains.add(c.domain);
      if (dryRun) { staged += 1; continue; }
      const proposalId = crypto.randomUUID();
      const { error: insErr } = await supabase.from("directory_discovery_staging").insert({
        id: proposalId, run_id: runId, directory_table: "service_providers",
        candidate_name: c.name, candidate_url: c.url, candidate_domain: c.domain,
        description: c.description, term_slug: sig.term_slug, demand_signal_id: sig.id,
        source_query: queries[0] ?? null, status: "new",
        evidence: { source: "firecrawl_search", queries, snippet: c.description },
      });
      if (insErr) { log(`stage ${c.domain} skipped`, insErr.message); continue; } // unique open-per-domain = already queued
      staged += 1;
      allStaged.push({ name: c.name, url: c.url, term: sig.term_label, proposalId });
    }
    perSignal.push({ term: sig.term_slug, searched: candidates.length, staged });

    // Mark the signal acknowledged once discovery has staged at least one candidate for it,
    // so the next run doesn't re-spend search credits on the same gap. A gap that yielded
    // nothing stays 'new' for a retry.
    if (staged > 0 && !dryRun) {
      await supabase.from("directory_demand_signals")
        .update({ status: "ack", reviewed_at: new Date().toISOString() })
        .eq("id", sig.id).eq("status", "new");
    }
  }

  const totalStaged = perSignal.reduce((a, p) => a + p.staged, 0);

  // ── Slack digest (only when something was staged) ──────────────────────────────
  if (allStaged.length > 0) {
    // deno-lint-ignore no-explicit-any
    const blocks: any[] = [
      { type: "header", text: { type: "plain_text", text: "🛰️ Directory discovery — candidate providers" } },
      { type: "context", elements: [{ type: "mrkdwn", text: `${signals.length} gap(s) targeted · ${allStaged.length} new candidate(s) staged for review${dryRun ? " · _dry run_" : ""}` }] },
    ];
    for (const s of allStaged.slice(0, SLACK_TOP)) {
      blocks.push({
        type: "section",
        text: { type: "mrkdwn", text: `*${s.name}* — fills *${s.term}*\n<${s.url}|${s.url.slice(0, 80)}>` },
      });
      blocks.push({
        type: "actions",
        elements: [
          { type: "button", style: "primary", text: { type: "plain_text", text: "✅ Approve" }, action_id: `dd_approve_${s.proposalId}`, value: s.proposalId },
          { type: "button", text: { type: "plain_text", text: "❌ Dismiss" }, action_id: `dd_dismiss_${s.proposalId}`, value: s.proposalId },
        ],
      });
    }
    blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: "_Sourced from web search against unmet-demand signals. Approve queues a reviewed import — nothing is auto-added to the directory._" }] });
    await postToSlack(channel, "Directory discovery — candidate providers", blocks);
  }

  // Telemetry.
  if (!dryRun) {
    await supabase.from("automation_runs").insert({
      loop: LOOP_NAME, started_at: startedAt, finished_at: new Date().toISOString(), status: "success",
      reviewed: signals.length, proposed: totalStaged,
      metadata: { max_signals: maxSignals, per_signal: perSignal },
    });
  }

  log("run complete", { targeted: signals.length, staged: totalStaged, dryRun });
  return json({ ok: true, targeted: signals.length, staged: totalStaged, dry_run: dryRun, per_signal: perSignal });
});
