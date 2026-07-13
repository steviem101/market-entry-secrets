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
// SLACK_NOTIFY_WEBHOOK_SECRET (verify_jwt=false).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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
const INTAKE_CAP = 3000;      // most-recent forms to scan (Supabase default limit is 1000)
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

interface Signal {
  term_slug: string;
  term_label: string;
  demand_count: number;
  supply_count: number;
  gap_score: number;
  sample_regions: string[];
  sample_sectors: string[];
}

/** Upsert one open signal per term: refresh the existing open row's counts, else insert.
 *  The partial unique index (status in new/ack) guarantees at most one open row, so an
 *  insert race surfaces as a unique violation we swallow. */
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

  const runId = crypto.randomUUID();
  const startedAt = new Date().toISOString();
  const cutoff = new Date(Date.now() - windowDays * 86400000).toISOString();

  // 1) Canonical vocabulary (P5-1). No terms → nothing to mine.
  const { data: termRows, error: termErr } = await supabase.from("service_terms").select("slug,label,synonyms");
  if (termErr) { log("load service_terms failed", termErr.message); return json({ error: "service_terms_unavailable" }, 500); }
  const terms = (termRows ?? []) as ServiceTerm[];
  const index = buildTermIndex(terms);
  const synonymsBySlug = new Map<string, string[]>();
  for (const t of terms) {
    const syns = [...new Set([t.label, ...(Array.isArray(t.synonyms) ? t.synonyms : [])])].filter((x): x is string => typeof x === "string" && x.length > 0);
    synonymsBySlug.set(t.slug, syns);
  }

  // 2) Recent intake demand.
  const { data: forms, error: formErr } = await supabase.from("user_intake_forms")
    .select("services_needed,target_regions,industry_sector,created_at")
    .gte("created_at", cutoff).order("created_at", { ascending: false }).limit(INTAKE_CAP);
  if (formErr) { log("load intake failed", formErr.message); return json({ error: "intake_unavailable" }, 500); }
  const demand = tallyDemand((forms ?? []) as IntakeDemand[], index);

  // 3) For each sufficiently-demanded term, count supply + score the gap.
  const signals: Signal[] = [];
  for (const d of demand) {
    if (d.demand < MIN_DEMAND) continue;
    const syns = (synonymsBySlug.get(d.slug) ?? []).slice(0, MAX_SYNONYMS);
    let supply = 0;
    if (syns.length > 0) {
      const { count, error } = await supabase.from("service_providers")
        .select("id", { count: "exact", head: true }).overlaps("services", syns);
      if (error) { log(`supply count ${d.slug} failed`, error.message); continue; }
      supply = count ?? 0;
    }
    const gap = gapScore(d.demand, supply);
    if (gap <= 0) continue; // adequately served — not a gap
    signals.push({
      term_slug: d.slug, term_label: d.label, demand_count: d.demand,
      supply_count: supply, gap_score: gap, sample_regions: d.regions, sample_sectors: d.sectors,
    });
  }
  signals.sort((a, b) => (b.gap_score - a.gap_score) || (b.demand_count - a.demand_count) || a.term_slug.localeCompare(b.term_slug));

  // 4) Persist (unless dry-run).
  let upserted = 0;
  if (!dryRun) {
    for (const s of signals) {
      const r = await upsertSignal(supabase, s, windowDays, runId);
      if (r !== "skipped") upserted += 1;
    }
  }

  // 5) Slack digest (only when there are gaps).
  if (signals.length > 0) {
    // deno-lint-ignore no-explicit-any
    const blocks: any[] = [
      { type: "header", text: { type: "plain_text", text: "📈 Directory demand — underserved services" } },
      { type: "context", elements: [{ type: "mrkdwn", text: `${forms?.length ?? 0} intake forms (last ${windowDays}d) · ${signals.length} service gap(s)${dryRun ? " · _dry run_" : ""}` }] },
    ];
    for (const s of signals.slice(0, SLACK_TOP)) {
      const ctx = [
        s.sample_sectors.length ? `sectors: ${s.sample_sectors.join(", ")}` : "",
        s.sample_regions.length ? `regions: ${s.sample_regions.join(", ")}` : "",
      ].filter(Boolean).join(" · ");
      blocks.push({
        type: "section",
        text: { type: "mrkdwn", text: `*${s.term_label}* — demand *${s.demand_count}* vs supply *${s.supply_count}*  ·  gap \`${s.gap_score}\`${ctx ? `\n_${ctx}_` : ""}` },
      });
    }
    blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: "_Demand mined from report intake vs directory supply. The discovery agent targets these; nothing is auto-added._" }] });
    await postToSlack(channel, "Directory demand — underserved services", blocks);
  }

  // 6) Telemetry.
  if (!dryRun) {
    await supabase.from("automation_runs").insert({
      loop: LOOP_NAME, started_at: startedAt, finished_at: new Date().toISOString(), status: "success",
      reviewed: forms?.length ?? 0, proposed: signals.length, accepted: upserted,
      metadata: { window_days: windowDays, terms: terms.length, gaps: signals.map((s) => ({ term: s.term_slug, demand: s.demand_count, supply: s.supply_count, gap: s.gap_score })) },
    });
  }

  log("run complete", { scanned: forms?.length ?? 0, gaps: signals.length, upserted, dryRun });
  return json({ ok: true, scanned: forms?.length ?? 0, gaps: signals.length, upserted, dry_run: dryRun, signals });
});
