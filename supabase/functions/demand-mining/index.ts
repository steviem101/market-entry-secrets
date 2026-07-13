// demand-mining — nightly unmet-demand pass (MES-148 Phase 5 P5-5).
//
// Reads recent report intake (user_intake_forms.services_needed) and maps each free-text
// service to a canonical term via service_terms (P5-1). For every term demanded at least
// MIN_DEMAND times in the window, it counts directory SUPPLY (service_providers whose
// services overlap the term's synonyms) and computes a demand-weighted gap. The ranked
// gaps land in directory_demand_signals (propose-only) and a Slack digest — the discovery
// agent (P5-4) targets them; a human triages via the admin-readable table.
//
// Read-only upstream: it only READS intake + supply and WRITES its own signal rows —
// never a directory row. Doubly disabled by default: requires DEMAND_MINING_ENABLED=on
// AND an enabled activity_event_routing 'directory.demand' row. Auth: x-webhook-secret ==
// SLACK_NOTIFY_WEBHOOK_SECRET (verify_jwt=false — see supabase/config.toml).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { escapeSlack } from "../_shared/slack.ts";
import {
  buildTermIndex,
  gapScore,
  MIN_DEMAND,
  tallyDemand,
  type IntakeDemand,
  type ServiceTerm,
} from "./demand.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN") ?? "";
const WEBHOOK_SECRET = Deno.env.get("SLACK_NOTIFY_WEBHOOK_SECRET") ?? "";
const ROUTING_EVENT = "directory.demand";
const LOOP_NAME = "demand-mining";
const DEFAULT_WINDOW_DAYS = 180;
const MAX_WINDOW_DAYS = 730;
// PostgREST caps a single response at ~1000 rows (CLAUDE.md gotcha #1), so a bare
// .limit(3000) would silently see only 1000 forms and undercount demand. Page through
// with .range() up to a hard ceiling instead.
const INTAKE_PAGE = 1000;
const INTAKE_MAX = 5000;      // forms scanned per run (5 pages) — bounds work + memory
const MAX_SYNONYMS = 60;      // cap the .overlaps() array per supply count
const SLACK_TOP = 15;         // gaps shown in the digest

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(b: unknown, s = 200): Response {
  return new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });
}
function log(msg: string, data?: unknown): void {
  console.log(`[${new Date().toISOString()}] [demand-mining] ${msg}`, data !== undefined ? JSON.stringify(data) : "");
}

// deno-lint-ignore no-explicit-any
async function postToSlack(channel: string, text: string, blocks: any[]): Promise<void> {
  if (!SLACK_BOT_TOKEN || !channel) return;
  try {
    const resp = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8", Authorization: `Bearer ${SLACK_BOT_TOKEN}` },
      body: JSON.stringify({ channel, text, attachments: [{ color: "#2f80ed", blocks }] }),
    });
    const d = await resp.json();
    if (!d.ok) log("slack post failed", d.error);
  } catch (e) { log("slack post threw", String(e)); }
}

/** Page through intake forms in the window via .range() (a single PostgREST response is
 *  capped at ~1000 rows), most-recent first, up to INTAKE_MAX. Throws on a read error so
 *  the caller records a failed run rather than silently mining partial data. */
// deno-lint-ignore no-explicit-any
async function fetchIntakeForms(supabase: any, cutoff: string): Promise<IntakeDemand[]> {
  const rows: IntakeDemand[] = [];
  for (let from = 0; from < INTAKE_MAX; from += INTAKE_PAGE) {
    const { data, error } = await supabase.from("user_intake_forms")
      .select("services_needed,target_regions,industry_sector,created_at")
      .gte("created_at", cutoff).order("created_at", { ascending: false })
      .range(from, from + INTAKE_PAGE - 1);
    if (error) throw new Error(`intake load failed: ${error.message}`);
    const page = (data ?? []) as IntakeDemand[];
    rows.push(...page);
    if (page.length < INTAKE_PAGE) break; // short page = last page
  }
  return rows;
}

interface Signal {
  term_slug: string;
  term_label: string;
  demand_count: number;
  supply_count: number;
  gap_score: number;
  sample_regions: string[];
  sample_sectors: string[];
}

/** Upsert one open signal per term. Refresh the existing open (new/ack) row's counts;
 *  else, if a TERMINAL row (dismissed/actioned) already exists for the term, respect it
 *  and do NOT recreate it as 'new' (a nightly re-run must not undo a human dismissal);
 *  else insert a fresh 'new' row. The partial unique index (status in new/ack) makes an
 *  insert race surface as a unique violation we swallow. */
// deno-lint-ignore no-explicit-any
async function upsertSignal(supabase: any, s: Signal, windowDays: number, runId: string): Promise<"updated" | "inserted" | "skipped"> {
  const patch = {
    term_label: s.term_label,
    demand_count: s.demand_count,
    supply_count: s.supply_count,
    gap_score: s.gap_score,
    window_days: windowDays,
    sample_regions: s.sample_regions,
    sample_sectors: s.sample_sectors,
    run_id: runId,
    updated_at: new Date().toISOString(),
  };
  const { data: updated, error: upErr } = await supabase.from("directory_demand_signals")
    .update(patch)
    .eq("signal_type", "service").eq("term_slug", s.term_slug).in("status", ["new", "ack"])
    .select("id");
  if (upErr) { log(`update signal ${s.term_slug} failed`, upErr.message); return "skipped"; }
  if (updated && updated.length > 0) return "updated";

  // No open row. If a resolved (dismissed/actioned) row exists, honour it — don't
  // resurrect a gap a human already closed. Only a genuinely never-seen term inserts.
  const { data: terminal } = await supabase.from("directory_demand_signals")
    .select("id,status").eq("signal_type", "service").eq("term_slug", s.term_slug).limit(1);
  if (terminal && terminal.length > 0) {
    log(`signal ${s.term_slug} already resolved (${terminal[0].status}) — not resurrecting`);
    return "skipped";
  }

  const { error: insErr } = await supabase.from("directory_demand_signals").insert({
    signal_type: "service", term_slug: s.term_slug, status: "new",
    evidence: { source: "user_intake_forms.services_needed", window_days: windowDays },
    ...patch,
  });
  if (insErr) { log(`insert signal ${s.term_slug} skipped`, insErr.message); return "skipped"; } // unique violation = raced
  return "inserted";
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!WEBHOOK_SECRET || (req.headers.get("x-webhook-secret") ?? "") !== WEBHOOK_SECRET) return json({ error: "unauthorized" }, 401);

  // Gate 1: explicit env kill-switch.
  if (!["on", "1", "true"].includes((Deno.env.get("DEMAND_MINING_ENABLED") || "").trim().toLowerCase())) {
    log("disabled (DEMAND_MINING_ENABLED off) — skipping");
    return json({ ok: true, skipped: "demand_mining_disabled" });
  }

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* defaults */ }
  const windowDays = Math.min(Math.max(Number(body.window_days) || DEFAULT_WINDOW_DAYS, 7), MAX_WINDOW_DAYS);
  const dryRun = body.dry_run === true;

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

  // Gate 2: data-driven routing kill-switch (also supplies the Slack channel).
  const { data: rt } = await supabase.from("activity_event_routing")
    .select("channel_id,enabled").eq("event_type", ROUTING_EVENT).maybeSingle();
  if (!rt || !rt.enabled || !rt.channel_id) { log("routing disabled — skipping"); return json({ ok: true, skipped: "routing_disabled" }); }
  const channel = rt.channel_id as string;

  const startedAt = new Date().toISOString();
  const runId = crypto.randomUUID();
  const cutoff = new Date(Date.now() - windowDays * 86400000).toISOString();

  // Start-of-run telemetry: a 'running' row up front so a crash/failure mid-run is
  // visible to the ops loop (not just successful runs).
  let runRowId: string | null = null;
  if (!dryRun) {
    const { data: run } = await supabase.from("automation_runs")
      .insert({ loop: LOOP_NAME, started_at: startedAt, status: "running", metadata: { window_days: windowDays } })
      .select("id").maybeSingle();
    runRowId = run?.id ?? null;
  }

  try {
    // 1) Canonical vocabulary (P5-1). No terms → nothing to mine.
    const { data: termRows, error: termErr } = await supabase.from("service_terms").select("slug,label,synonyms");
    if (termErr) throw new Error(`service_terms load failed: ${termErr.message}`);
    const terms = (termRows ?? []) as ServiceTerm[];
    const index = buildTermIndex(terms);
    const synonymsBySlug = new Map<string, string[]>();
    for (const t of terms) {
      const syns = [...new Set([t.label, ...(Array.isArray(t.synonyms) ? t.synonyms : [])])].filter((x): x is string => typeof x === "string" && x.length > 0);
      synonymsBySlug.set(t.slug, syns);
    }

    // 2) Recent intake demand (paginated — see fetchIntakeForms).
    const forms = await fetchIntakeForms(supabase, cutoff);
    const demand = tallyDemand(forms, index);

    // 3) For each sufficiently-demanded term, count supply (accurate count:exact — not
    //    subject to the row cap) + score the gap. Counts run concurrently.
    const demanded = demand.filter((d) => d.demand >= MIN_DEMAND);
    const scored = await Promise.all(demanded.map(async (d): Promise<Signal | null> => {
      const syns = (synonymsBySlug.get(d.slug) ?? []).slice(0, MAX_SYNONYMS);
      let supply = 0;
      if (syns.length > 0) {
        const { count, error } = await supabase.from("service_providers")
          .select("id", { count: "exact", head: true }).overlaps("services", syns);
        if (error) { log(`supply count ${d.slug} failed`, error.message); return null; }
        supply = count ?? 0;
      }
      const gap = gapScore(d.demand, supply);
      if (gap <= 0) return null; // adequately served — not a gap
      return {
        term_slug: d.slug, term_label: d.label, demand_count: d.demand,
        supply_count: supply, gap_score: gap, sample_regions: d.regions, sample_sectors: d.sectors,
      };
    }));
    const signals = scored.filter((x): x is Signal => x !== null)
      .sort((a, b) => (b.gap_score - a.gap_score) || (b.demand_count - a.demand_count) || a.term_slug.localeCompare(b.term_slug));

    // 4) Persist (unless dry-run).
    let upserted = 0;
    if (!dryRun) {
      for (const s of signals) {
        const r = await upsertSignal(supabase, s, windowDays, runId);
        if (r !== "skipped") upserted += 1;
      }
    }

    // 5) Slack digest — real runs only (a dry-run must not spam the channel). Untrusted
    //    intake-derived text (term label, sectors, regions) is escaped for mrkdwn.
    if (!dryRun && signals.length > 0) {
      // deno-lint-ignore no-explicit-any
      const blocks: any[] = [
        { type: "header", text: { type: "plain_text", text: "📈 Directory demand — underserved services" } },
        { type: "context", elements: [{ type: "mrkdwn", text: `${forms.length} intake forms (last ${windowDays}d) · ${signals.length} service gap(s)` }] },
      ];
      for (const s of signals.slice(0, SLACK_TOP)) {
        const ctx = [
          s.sample_sectors.length ? `sectors: ${s.sample_sectors.map(escapeSlack).join(", ")}` : "",
          s.sample_regions.length ? `regions: ${s.sample_regions.map(escapeSlack).join(", ")}` : "",
        ].filter(Boolean).join(" · ");
        blocks.push({
          type: "section",
          text: { type: "mrkdwn", text: `*${escapeSlack(s.term_label)}* — demand *${s.demand_count}* vs supply *${s.supply_count}*  ·  gap \`${s.gap_score}\`${ctx ? `\n_${ctx}_` : ""}` },
        });
      }
      blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: "_Demand mined from report intake vs directory supply. The discovery agent targets these; nothing is auto-added._" }] });
      await postToSlack(channel, "Directory demand — underserved services", blocks);
    }

    // 6) Success telemetry.
    if (!dryRun && runRowId) {
      await supabase.from("automation_runs").update({
        finished_at: new Date().toISOString(), status: "success",
        reviewed: forms.length, proposed: signals.length, accepted: upserted,
        metadata: { window_days: windowDays, terms: terms.length, gaps: signals.map((s) => ({ term: s.term_slug, demand: s.demand_count, supply: s.supply_count, gap: s.gap_score })) },
      }).eq("id", runRowId);
    }

    log("run complete", { scanned: forms.length, gaps: signals.length, upserted, dryRun });
    return json({ ok: true, scanned: forms.length, gaps: signals.length, upserted, dry_run: dryRun, signals });
  } catch (e) {
    log("run failed", String(e));
    if (!dryRun && runRowId) {
      await supabase.from("automation_runs").update({ finished_at: new Date().toISOString(), status: "error", error: String(e) }).eq("id", runRowId);
    }
    return json({ error: "run_failed", detail: String(e) }, 500);
  }
});
