// directory-discovery — demand-driven directory growth agent (MES-148 Phase 5 P5-4).
//
// Reads the top open unmet-demand signals (directory_demand_signals, P5-5), web-searches
// (Firecrawl) for organisations that could fill each gap, dedupes candidates against the
// live directory + already-staged rows, and lands each as a propose-only candidate
// (directory_discovery_staging) + an informational Slack digest. NOTHING is auto-inserted
// into a directory — a human triages the staging queue and the import ships as a separate
// reviewed action.
//
// Doubly disabled by default: requires DIRECTORY_DISCOVERY_ENABLED=on AND an enabled
// activity_event_routing 'directory.discovery' row. Cost-bounded: at most MAX_SIGNALS
// gaps per run, each with a capped search, and a gap is acknowledged after one attempt so
// it isn't re-searched every run. Auth: x-webhook-secret == SLACK_NOTIFY_WEBHOOK_SECRET
// (verify_jwt=false — see supabase/config.toml).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { escapeSlack } from "../_shared/slack.ts";
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
// PostgREST caps a single response at ~1000 rows (CLAUDE.md gotcha #1); page the dedup
// snapshot with .range() so providers past the first page aren't silently missed.
const PROVIDERS_PAGE = 1000;
const PROVIDERS_MAX = 10000;
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

/** One Firecrawl /v1/search call. `ok` distinguishes a genuine empty result (ok:true)
 *  from a transient failure (ok:false) so the caller can retry a failed gap next run
 *  instead of acknowledging it. */
async function firecrawlSearch(query: string): Promise<{ ok: boolean; hits: RawHit[] }> {
  if (!FIRECRAWL_API_KEY) { log("FIRECRAWL_API_KEY missing — skipping search"); return { ok: false, hits: [] }; }
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), FIRECRAWL_TIMEOUT_MS);
  try {
    const res = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, limit: SEARCH_LIMIT, lang: "en", country: "au" }),
      signal: ctrl.signal,
    });
    if (!res.ok) { log("firecrawl search non-2xx", res.status); return { ok: false, hits: [] }; }
    const body = await res.json();
    const rows = Array.isArray(body?.data) ? body.data : [];
    // deno-lint-ignore no-explicit-any
    const hits = rows.map((r: any) => ({ title: r?.title ?? r?.metadata?.title ?? null, url: r?.url ?? null, description: r?.description ?? r?.metadata?.description ?? null }));
    return { ok: true, hits };
  } catch (e) {
    log("firecrawl search threw", String(e));
    return { ok: false, hits: [] };
  } finally {
    clearTimeout(to);
  }
}

/** Paginated dedup snapshot: every live provider's normalised domain + name, plus the
 *  domains of open (new/approved) staging candidates, so we don't re-surface something
 *  already listed or already queued. Throws on a live-provider read error so the caller
 *  records a failed run rather than staging against an empty (falsely-clean) set. */
// deno-lint-ignore no-explicit-any
async function loadExistingIdentity(supabase: any): Promise<{ domains: Set<string>; names: Set<string> }> {
  const domains = new Set<string>();
  const names = new Set<string>();
  for (let from = 0; from < PROVIDERS_MAX; from += PROVIDERS_PAGE) {
    const { data, error } = await supabase.from("service_providers")
      .select("name,website").order("id", { ascending: true }).range(from, from + PROVIDERS_PAGE - 1);
    if (error) throw new Error(`providers load failed: ${error.message}`);
    const page = data ?? [];
    for (const p of page) {
      const d = normalizeDomain(p.website); if (d) domains.add(d);
      const n = normalizeName(p.name); if (n) names.add(n);
    }
    if (page.length < PROVIDERS_PAGE) break;
  }
  // Open staging candidates (best-effort — the DB unique index is the hard guard).
  const { data: openStaged, error: stErr } = await supabase.from("directory_discovery_staging")
    .select("candidate_domain").in("status", ["new", "approved"]);
  if (stErr) { log("open-staging dedup load failed (non-fatal)", stErr.message); }
  else { for (const r of openStaged ?? []) if (r.candidate_domain) domains.add(r.candidate_domain); }
  return { domains, names };
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

  const startedAt = new Date().toISOString();
  const runId = crypto.randomUUID();

  // Start-of-run telemetry: a 'running' row up front so a crash/failure mid-run (after
  // Firecrawl credits were spent) is visible to the ops loop.
  let runRowId: string | null = null;
  if (!dryRun) {
    const { data: run } = await supabase.from("automation_runs")
      .insert({ loop: LOOP_NAME, started_at: startedAt, status: "running", metadata: { max_signals: maxSignals } })
      .select("id").maybeSingle();
    runRowId = run?.id ?? null;
  }

  try {
    const { domains: existingDomains, names: existingNames } = await loadExistingIdentity(supabase);

    const perSignal: Array<{ term: string; searched: number; staged: number; search_ok: boolean }> = [];
    const allStaged: Array<{ name: string; url: string; term: string }> = [];

    for (const sig of signals) {
      const signalLike: DemandSignalLike = {
        term_slug: sig.term_slug, term_label: sig.term_label,
        sample_sectors: sig.sample_sectors, sample_regions: sig.sample_regions,
      };
      // Independent queries run concurrently. searchOk is false if ANY query failed
      // transiently (empty queries → every() true → attempted-but-nothing).
      const queries = buildQueries(signalLike);
      const results = await Promise.all(queries.map(firecrawlSearch));
      const searchOk = results.every((r) => r.ok);
      const hits = results.flatMap((r) => r.hits);

      const candidates = dedupeAgainstExisting(extractCandidates(hits), existingDomains, existingNames);
      let staged = 0;
      for (const c of candidates) {
        // Reserve BOTH domain and name across the run so a later signal doesn't re-stage
        // the same org under a different domain.
        existingDomains.add(c.domain);
        existingNames.add(normalizeName(c.name));
        if (!dryRun) {
          const { error: insErr } = await supabase.from("directory_discovery_staging").insert({
            id: crypto.randomUUID(), run_id: runId, directory_table: "service_providers",
            candidate_name: c.name, candidate_url: c.url, candidate_domain: c.domain,
            description: c.description, term_slug: sig.term_slug, demand_signal_id: sig.id,
            source_query: queries[0] ?? null, status: "new",
            evidence: { source: "firecrawl_search", queries, snippet: c.description },
          });
          if (insErr) { log(`stage ${c.domain} skipped`, insErr.message); continue; } // unique open-per-domain = already queued
        }
        staged += 1;
        allStaged.push({ name: c.name, url: c.url, term: sig.term_label });
      }
      perSignal.push({ term: sig.term_slug, searched: candidates.length, staged, search_ok: searchOk });

      // Acknowledge the gap once we've actually attempted it (candidates or not), so it's
      // not re-searched every run — the recurring-cost guard. A transient search FAILURE
      // leaves it 'new' for a genuine retry next run.
      if (searchOk && !dryRun) {
        await supabase.from("directory_demand_signals")
          .update({ status: "ack", reviewed_at: new Date().toISOString() })
          .eq("id", sig.id).eq("status", "new");
      }
    }

    const totalStaged = perSignal.reduce((a, p) => a + p.staged, 0);

    // ── Informational Slack digest (real runs only; a dry-run must not spam the channel).
    //    No action buttons — triage happens in the admin staging queue. Untrusted
    //    web-search text (candidate name/url) is escaped for mrkdwn.
    if (!dryRun && allStaged.length > 0) {
      // deno-lint-ignore no-explicit-any
      const blocks: any[] = [
        { type: "header", text: { type: "plain_text", text: "🛰️ Directory discovery — candidate providers" } },
        { type: "context", elements: [{ type: "mrkdwn", text: `${signals.length} gap(s) targeted · ${allStaged.length} new candidate(s) staged for review` }] },
      ];
      for (const s of allStaged.slice(0, SLACK_TOP)) {
        blocks.push({
          type: "section",
          text: { type: "mrkdwn", text: `*${escapeSlack(s.name)}* — fills *${escapeSlack(s.term)}*\n${escapeSlack(s.url)}` },
        });
      }
      blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: "_Sourced from web search against unmet-demand signals. Triage in the admin review queue — nothing is auto-added to the directory._" }] });
      await postToSlack(channel, "Directory discovery — candidate providers", blocks);
    }

    // Success telemetry.
    if (!dryRun && runRowId) {
      await supabase.from("automation_runs").update({
        finished_at: new Date().toISOString(), status: "success",
        reviewed: signals.length, proposed: totalStaged,
        metadata: { max_signals: maxSignals, per_signal: perSignal },
      }).eq("id", runRowId);
    }

    log("run complete", { targeted: signals.length, staged: totalStaged, dryRun });
    return json({ ok: true, targeted: signals.length, staged: totalStaged, dry_run: dryRun, per_signal: perSignal, candidates: dryRun ? allStaged : undefined });
  } catch (e) {
    log("run failed", String(e));
    if (!dryRun && runRowId) {
      await supabase.from("automation_runs").update({ finished_at: new Date().toISOString(), status: "error", error: String(e) }).eq("id", runRowId);
    }
    return json({ error: "run_failed", detail: String(e) }, 500);
  }
});
