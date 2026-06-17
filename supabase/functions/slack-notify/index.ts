// slack-notify — posts public.activity_events to Slack.
//
// Auth: header `x-webhook-secret` must equal env SLACK_NOTIFY_WEBHOOK_SECRET (verify_jwt=false).
// Modes:
//   { "event_id": "<uuid>" } -> claim-then-post one realtime event to its routed channel.
//   { "mode": "digest" }     -> roll up unsent info events; re-drive stuck realtime; sweep stale.
// Special event_type `report.quality` -> compute report build-health telemetry from report_json,
//   upsert public.report_quality (system of record), and post a "report card".
//
// Deterministic formatting only. No AI / token cost. Self-contained (no _shared imports).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN") ?? "";
const WEBHOOK_SECRET = Deno.env.get("SLACK_NOTIFY_WEBHOOK_SECRET") ?? "";
const REPORT_BASE_URL = "https://market-entry-secrets.lovable.app/report";

const DIGEST_LIMIT = 200;
const ID_CHUNK = 100;
const REDRIVE_AGE_MS = 10 * 60 * 1000;
const STALE_AGE_MS = 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const SEVERITY_COLOR: Record<string, string> = {
  revenue: "#2eb67d", action: "#36c5f0", error: "#e01e5a", info: "#9aa0a6",
};
const BAND = (s: number) => (s >= 80 ? { e: "🟢", c: "#2eb67d" } : s >= 60 ? { e: "🟡", c: "#ECB22E" } : { e: "🔴", c: "#e01e5a" });

// RAG source tables we expect a market-entry report to draw from (lemlist is internal, excluded).
const RAG_SOURCES = [
  "service_providers", "community_members", "events", "content_items",
  "leads", "innovation_ecosystem", "trade_investment_agencies", "investors",
];
const RAG_LABELS: Record<string, string> = {
  service_providers: "Providers", community_members: "Mentors", events: "Events", content_items: "Content",
  leads: "Leads", innovation_ecosystem: "Innovation", trade_investment_agencies: "Agencies", investors: "Investors",
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}
function logErr(where: string, detail: unknown): void { console.error(`[slack-notify] ${where}:`, detail); }
function clamp(n: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, n)); }
function wordCount(s: string): number { return s ? s.trim().split(/\s+/).filter(Boolean).length : 0; }

interface ActivityEvent {
  id: string; event_type: string; actor_user_id: string | null; actor_email: string | null;
  actor_name: string | null; object_type: string | null; object_id: string | null;
  metadata: Record<string, unknown> | null; severity: string;
  notified_at: string | null; dispatch_attempts: number | null; created_at: string;
}
interface Routing {
  event_type: string; channel_id: string; emoji: string; severity: string;
  realtime: boolean; mention: boolean; enabled: boolean;
}

function titleFor(eventType: string): string {
  return eventType.replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function actorLine(e: ActivityEvent): string | null {
  const who = e.actor_name || e.actor_email || (e.actor_user_id ? `user ${e.actor_user_id.slice(0, 8)}` : null);
  return who ? `*Who:* ${who}` : null;
}
function metaLines(e: ActivityEvent): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(e.metadata ?? {})) {
    if (v === null || v === undefined || v === "") continue;
    const val = Array.isArray(v) ? v.join(", ") : String(v);
    if (!val) continue;
    out.push(`*${titleFor(k)}:* ${val}`);
  }
  return out;
}
function summaryLine(e: ActivityEvent, r: Routing): string {
  const who = e.actor_name || e.actor_email || "";
  return `${r.emoji} *${titleFor(e.event_type)}*${who ? ` — ${who}` : ""}`;
}

async function postToSlack(
  channel: string, text: string, blocks: unknown[], color: string, mention: boolean,
): Promise<{ ok: boolean; ts?: string; error?: string }> {
  if (!SLACK_BOT_TOKEN) return { ok: false, error: "missing_bot_token" };
  const body = { channel, text: mention ? `<!here> ${text}` : text, attachments: [{ color, blocks }] };
  const resp = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8", Authorization: `Bearer ${SLACK_BOT_TOKEN}` },
    body: JSON.stringify(body),
  });
  const data = await resp.json();
  if (!data.ok) return { ok: false, error: data.error ?? "slack_error" };
  return { ok: true, ts: data.ts };
}

function buildEventBlocks(ev: ActivityEvent, routing: Routing): unknown[] {
  const blocks: unknown[] = [
    { type: "header", text: { type: "plain_text", text: `${routing.emoji} ${titleFor(ev.event_type)}`.slice(0, 150) } },
  ];
  const lines = [actorLine(ev), ...metaLines(ev)].filter(Boolean) as string[];
  if (lines.length) blocks.push({ type: "section", text: { type: "mrkdwn", text: lines.join("\n").slice(0, 2900) } });
  blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: `severity: ${ev.severity} · ${new Date(ev.created_at).toUTCString()}` }] });
  return blocks;
}

// ---------------- report.quality ----------------

// deno-lint-ignore no-explicit-any
function computeReportTelemetry(report: any, intake: any) {
  const rj = report.report_json ?? {};
  const meta = rj.metadata ?? {};
  const matchesObj = rj.matches ?? {};
  const sectionsObj = rj.sections ?? {};
  const status: string = report.status;

  const matchCounts: Record<string, number> = {};
  for (const [k, v] of Object.entries(matchesObj)) matchCounts[k] = Array.isArray(v) ? v.length : 0;
  const tablesHit = RAG_SOURCES.filter((t) => (matchCounts[t] ?? 0) > 0).length;
  const ragHitRate = tablesHit / RAG_SOURCES.length;
  const totalMatches = typeof meta.total_matches === "number"
    ? meta.total_matches : Object.values(matchCounts).reduce((a, b) => a + b, 0);

  const sectionEntries = Object.entries(sectionsObj) as [string, { visible?: boolean; content?: string }][];
  const sectionsVisible = sectionEntries.filter(([, v]) => v?.visible).length;
  const visibleWithContent = sectionEntries.filter(([, v]) => v?.visible && (v?.content || "").trim().length > 0).length;
  const failedSections = sectionEntries.filter(([, v]) => v?.visible && !((v?.content || "").trim().length > 0)).map(([k]) => k);
  const words = sectionEntries.reduce((a, [, v]) => a + wordCount(v?.content || ""), 0);

  const citations = Array.isArray(meta.perplexity_citations) ? meta.perplexity_citations.length : 0;
  const keyMetrics = Array.isArray(meta.key_metrics) ? meta.key_metrics.length : 0;
  const sources = {
    company_scrape: !!meta.firecrawl_deep_scrape,
    providers_enriched: meta.firecrawl_providers_enriched ?? 0,
    competitors_found: meta.firecrawl_competitors_found ?? 0,
    perplexity_used: !!meta.perplexity_used,
    citations, key_metrics: keyMetrics,
    discovered_events: meta.discovered_events_count ?? 0,
    polish_applied: !!meta.polish_applied,
    bilateral_trade: !!meta.bilateral_trade_available,
    cost_of_business: !!meta.cost_of_business_available,
    grants: !!meta.grants_available,
    end_buyer_research: !!meta.end_buyer_research_available,
  };

  const researchSignals = [
    citations > 0, keyMetrics > 0, sources.bilateral_trade, sources.cost_of_business,
    sources.grants, sources.end_buyer_research, sources.competitors_found > 0, sources.discovered_events > 0,
  ];
  const researchDepth = researchSignals.filter(Boolean).length / researchSignals.length;
  const groundedness = clamp(citations / Math.max(visibleWithContent, 1), 0, 1);

  let plumbing = 0, coverage = 0, completeness = 0;
  if (status !== "failed") {
    plumbing = Math.round(
      (sources.company_scrape ? 20 : 0) + (sources.perplexity_used ? 15 : 0) +
      (sectionsVisible ? (visibleWithContent / sectionsVisible) * 40 : 0) +
      (sources.polish_applied ? 10 : 0) + (failedSections.length === 0 ? 15 : 0),
    );
    coverage = Math.round(ragHitRate * 50 + researchDepth * 50);
    completeness = Math.round(
      (sectionsVisible ? (visibleWithContent / sectionsVisible) * 60 : 0) +
      clamp(words / 1500, 0, 1) * 20 + (citations > 0 ? 20 : 0),
    );
  }
  const buildHealth = Math.round(plumbing * 0.3 + coverage * 0.4 + completeness * 0.3);
  const degraded = status === "completed" && (
    !sources.company_scrape || tablesHit < 3 || failedSections.length > 0 || !sources.perplexity_used || researchDepth < 0.25
  );

  return {
    report_id: report.id, intake_form_id: report.intake_form_id ?? null, user_id: report.user_id ?? null,
    report_status: status, company: rj.company_name ?? intake?.company_name ?? null,
    build_health: buildHealth, score_plumbing: plumbing, score_coverage: coverage, score_completeness: completeness,
    degraded, rag_hit_rate: Number(ragHitRate.toFixed(2)), tables_hit: tablesHit, total_matches: totalMatches,
    match_counts: matchCounts, sources, generation_time_ms: meta.generation_time_ms ?? null,
    groundedness: Number(groundedness.toFixed(2)), words, sections_visible: sectionsVisible,
    visible_with_content: visibleWithContent, failed_sections: failedSections,
    user_feedback: report.feedback_score ?? null,
  };
}

// deno-lint-ignore no-explicit-any
function buildReportQualityCard(t: any, intake: any): { text: string; blocks: unknown[]; color: string } {
  const band = BAND(t.build_health);
  const company = t.company || "(unknown company)";
  const secs = Math.round((t.generation_time_ms ?? 0) / 1000);

  const inputLine = intake
    ? [
        intake.country_of_origin ? `from ${intake.country_of_origin}` : null,
        Array.isArray(intake.industry_sector) && intake.industry_sector.length ? `industry: ${intake.industry_sector.join(", ")}` : null,
        Array.isArray(intake.target_regions) && intake.target_regions.length ? `regions: ${intake.target_regions.join(", ")}` : null,
        Array.isArray(intake.services_needed) && intake.services_needed.length ? `services: ${intake.services_needed.join(", ")}` : null,
      ].filter(Boolean).join(" · ")
    : "";

  const s = t.sources;
  const plumbingLines = [
    `${s.company_scrape ? "✅" : "❌"} Firecrawl — company scrape ${s.company_scrape ? "ok" : "FAILED"} · ${s.providers_enriched} providers enriched · ${s.competitors_found} competitors`,
    `${s.perplexity_used ? "✅" : "❌"} Perplexity — ${s.perplexity_used ? "ran" : "not used"} · ${s.citations} citations · ${s.key_metrics} key metrics`,
    `${t.failed_sections.length === 0 ? "✅" : "⚠️"} Gemini — ${t.visible_with_content}/${t.sections_visible} sections${t.failed_sections.length ? ` (failed: ${t.failed_sections.join(", ")})` : ""} · polish ${s.polish_applied ? "applied" : "skipped"}`,
  ].join("\n");

  const cov = RAG_SOURCES.map((tbl) => {
    const n = t.match_counts[tbl] ?? 0;
    return `${n > 0 ? "✅" : "⬜"} ${RAG_LABELS[tbl]} ${n}`;
  });
  const covGrid = [cov.slice(0, 4).join("   "), cov.slice(4).join("   ")].join("\n");
  const zeroTables = RAG_SOURCES.filter((tbl) => (t.match_counts[tbl] ?? 0) === 0).map((tbl) => RAG_LABELS[tbl]);

  const researchWarn = (t.sources.citations === 0 && t.sources.key_metrics === 0)
    ? "\n⚠️ Perplexity returned 0 citations & 0 key metrics — research enrichment underperforming."
    : "";
  const coverageWarn = zeroTables.length
    ? `\n⚠️ 0 matches for: ${zeroTables.join(", ")}${inputLine ? " — possible taxonomy/matching gap for these inputs." : "."}`
    : "";

  const blocks: unknown[] = [
    { type: "header", text: { type: "plain_text", text: `🔬 Report Quality — ${company}`.slice(0, 150) } },
    { type: "section", text: { type: "mrkdwn", text:
      `*${t.build_health}/100 ${band.e}*  ·  Plumbing ${t.score_plumbing} · Coverage ${t.score_coverage} · Completeness ${t.score_completeness}` +
      `  ·  ${t.report_status}${secs ? ` · built in ${secs}s` : ""}${t.degraded ? "  ·  ⚠️ *DEGRADED*" : ""}` },
    },
  ];
  if (inputLine) blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: `*Inputs:* ${inputLine}` }] });
  blocks.push({ type: "section", text: { type: "mrkdwn", text: `*Plumbing (how it was built)*\n${plumbingLines}` } });
  blocks.push({ type: "section", text: { type: "mrkdwn", text:
    `*RAG coverage (what the inputs surfaced)*\n${covGrid}\n→ *${t.tables_hit}/${RAG_SOURCES.length}* data types hit · ${t.total_matches} matches${coverageWarn}${researchWarn}` } });
  blocks.push({ type: "section", text: { type: "mrkdwn", text:
    `*Surfaced in report*\n${t.visible_with_content} sections · ~${t.words.toLocaleString()} words · ${t.sources.citations} citations · ${t.sources.key_metrics} key metrics` +
    `${t.user_feedback != null ? `\n*User rating:* ${t.user_feedback}` : ""}` } });
  blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: `<${REPORT_BASE_URL}/${t.report_id}|View report ↗>  ·  report ${String(t.report_id).slice(0, 8)}…` }] });

  return { text: `Report Quality — ${company} — ${t.build_health}/100`, blocks, color: band.c };
}

// Fetches the report (+intake), computes telemetry, upserts report_quality, returns the card.
// deno-lint-ignore no-explicit-any
async function handleReportQuality(supabase: any, ev: ActivityEvent): Promise<{ text: string; blocks: unknown[]; color: string } | null> {
  const reportId = ev.object_id;
  if (!reportId) return null;
  const { data: report, error } = await supabase
    .from("user_reports").select("id,user_id,intake_form_id,status,report_json,feedback_score").eq("id", reportId).maybeSingle();
  if (error) { logErr("report.quality load report", error.message); return null; }
  if (!report) { logErr("report.quality", "report not found"); return null; }

  let intake = null;
  if (report.intake_form_id) {
    const { data: i } = await supabase.from("user_intake_forms")
      .select("company_name,country_of_origin,industry_sector,target_regions,services_needed,customer_type")
      .eq("id", report.intake_form_id).maybeSingle();
    intake = i;
  }

  const t = computeReportTelemetry(report, intake);
  const { error: upErr } = await supabase.from("report_quality").upsert({
    report_id: t.report_id, intake_form_id: t.intake_form_id, user_id: t.user_id, report_status: t.report_status,
    build_health: t.build_health, score_plumbing: t.score_plumbing, score_coverage: t.score_coverage,
    score_completeness: t.score_completeness, degraded: t.degraded, rag_hit_rate: t.rag_hit_rate,
    tables_hit: t.tables_hit, total_matches: t.total_matches, match_counts: t.match_counts, sources: t.sources,
    generation_time_ms: t.generation_time_ms, groundedness: t.groundedness, user_feedback: t.user_feedback,
    metadata: { company: t.company, words: t.words, sections_visible: t.sections_visible, visible_with_content: t.visible_with_content, failed_sections: t.failed_sections },
  }, { onConflict: "report_id" });
  if (upErr) logErr("report.quality upsert", upErr.message);

  return buildReportQualityCard(t, intake);
}

// deno-lint-ignore no-explicit-any
async function claimIds(supabase: any, ids: string[]): Promise<string[]> {
  const claimed: string[] = [];
  const stamp = new Date().toISOString();
  for (let i = 0; i < ids.length; i += ID_CHUNK) {
    const chunk = ids.slice(i, i + ID_CHUNK);
    const { data, error } = await supabase.from("activity_events").update({ notified_at: stamp })
      .in("id", chunk).is("notified_at", null).select("id");
    if (error) { logErr("claim chunk", error.message); continue; }
    for (const row of (data ?? [])) claimed.push(row.id as string);
  }
  return claimed;
}
// deno-lint-ignore no-explicit-any
async function updateChunked(supabase: any, ids: string[], patch: Record<string, unknown>): Promise<void> {
  for (let i = 0; i < ids.length; i += ID_CHUNK) {
    const { error } = await supabase.from("activity_events").update(patch).in("id", ids.slice(i, i + ID_CHUNK));
    if (error) logErr("update chunk", error.message);
  }
}
function buildDigestBlocks(evs: ActivityEvent[], routingMap: Map<string, Routing>): unknown[] {
  const counts = new Map<string, number>();
  for (const ev of evs) counts.set(ev.event_type, (counts.get(ev.event_type) ?? 0) + 1);
  const countLines = [...counts.entries()].map(([t, n]) => {
    const r = routingMap.get(t);
    return `${r?.emoji ?? ":bell:"} *${titleFor(t)}* × ${n}`;
  }).join("\n").slice(0, 2900);
  const itemLines = evs.slice(0, 20).map((ev) => `• ${summaryLine(ev, routingMap.get(ev.event_type)!)}`).join("\n").slice(0, 2900);
  return [
    { type: "header", text: { type: "plain_text", text: `🔔 Activity digest — ${evs.length} new`.slice(0, 150) } },
    { type: "section", text: { type: "mrkdwn", text: countLines || "—" } },
    { type: "divider" },
    { type: "section", text: { type: "mrkdwn", text: itemLines || "—" } },
    { type: "context", elements: [{ type: "mrkdwn", text: `as of ${new Date().toUTCString()}` }] },
  ];
}

// deno-lint-ignore no-explicit-any
async function dispatchOne(supabase: any, eventId: string): Promise<Response> {
  const { data: e, error } = await supabase.from("activity_events").select("*").eq("id", eventId).maybeSingle();
  if (error) { logErr("load event", error.message); return json({ ok: false, error: error.message }, 500); }
  if (!e) return json({ ok: false, error: "event_not_found" }, 404);
  const ev = e as ActivityEvent;
  if (ev.notified_at) return json({ ok: true, skipped: "already_notified" });

  const { data: r, error: rErr } = await supabase
    .from("activity_event_routing").select("*").eq("event_type", ev.event_type).maybeSingle();
  if (rErr) { logErr("load routing", rErr.message); return json({ ok: false, error: rErr.message }, 500); }

  // report.quality always computes + persists telemetry (system of record), even if posting is disabled.
  let prebuilt: { text: string; blocks: unknown[]; color: string } | null = null;
  if (ev.event_type === "report.quality") prebuilt = await handleReportQuality(supabase, ev);

  if (!r || !(r as Routing).enabled) return json({ ok: true, skipped: "no_enabled_routing" });
  const routing = r as Routing;

  const { data: claimed, error: claimErr } = await supabase.from("activity_events")
    .update({ notified_at: new Date().toISOString() }).eq("id", ev.id).is("notified_at", null).select("id");
  if (claimErr) { logErr("claim", claimErr.message); return json({ ok: false, error: claimErr.message }, 500); }
  if (!claimed || claimed.length === 0) return json({ ok: true, skipped: "already_claimed" });

  const built = prebuilt ?? {
    text: titleFor(ev.event_type), blocks: buildEventBlocks(ev, routing),
    color: SEVERITY_COLOR[ev.severity] ?? SEVERITY_COLOR.info,
  };
  const res = await postToSlack(routing.channel_id, built.text, built.blocks, built.color, routing.mention);

  if (!res.ok) {
    await supabase.from("activity_events").update({ notified_at: null, dispatch_attempts: (ev.dispatch_attempts ?? 0) + 1 }).eq("id", ev.id);
    logErr("post failed", { event_type: ev.event_type, error: res.error });
    return json({ ok: false, error: res.error }, 200);
  }
  const { error: tsErr } = await supabase.from("activity_events").update({ slack_ts: res.ts }).eq("id", ev.id);
  if (tsErr) logErr("slack_ts update", tsErr.message);
  return json({ ok: true, posted: true, ts: res.ts });
}

// deno-lint-ignore no-explicit-any
async function runDigest(supabase: any): Promise<Response> {
  const { error: staleErr } = await supabase.from("activity_events")
    .update({ notified_at: new Date().toISOString() }).is("notified_at", null)
    .lt("created_at", new Date(Date.now() - STALE_AGE_MS).toISOString());
  if (staleErr) logErr("stale sweep", staleErr.message);

  const { data: routingRows, error: rErr } = await supabase.from("activity_event_routing").select("*");
  if (rErr) { logErr("load routing", rErr.message); return json({ ok: false, error: rErr.message }, 500); }
  const routingMap = new Map<string, Routing>();
  const digestTypes: string[] = [];
  const realtimeTypes: string[] = [];
  for (const r of (routingRows ?? []) as Routing[]) {
    routingMap.set(r.event_type, r);
    if (!r.enabled) continue;
    (r.realtime ? realtimeTypes : digestTypes).push(r.event_type);
  }

  let digestChannels = 0, digestEvents = 0, redriven = 0;
  if (digestTypes.length) {
    const { data: pending, error } = await supabase.from("activity_events").select("*")
      .is("notified_at", null).in("event_type", digestTypes).lt("dispatch_attempts", MAX_ATTEMPTS)
      .order("created_at", { ascending: true }).limit(DIGEST_LIMIT);
    if (error) logErr("digest query", error.message);
    const byChannel = new Map<string, ActivityEvent[]>();
    for (const ev of (pending ?? []) as ActivityEvent[]) {
      const r = routingMap.get(ev.event_type)!;
      const arr = byChannel.get(r.channel_id) ?? []; arr.push(ev); byChannel.set(r.channel_id, arr);
    }
    for (const [channel, evs] of byChannel) {
      const claimedIds = await claimIds(supabase, evs.map((e) => e.id));
      if (claimedIds.length === 0) continue;
      const claimedSet = new Set(claimedIds);
      const claimedEvs = evs.filter((e) => claimedSet.has(e.id));
      const res = await postToSlack(channel, `Activity digest — ${claimedEvs.length} new`, buildDigestBlocks(claimedEvs, routingMap), SEVERITY_COLOR.info, false);
      if (res.ok) {
        await updateChunked(supabase, claimedIds, { slack_ts: res.ts });
        digestChannels++; digestEvents += claimedEvs.length;
      } else {
        await updateChunked(supabase, claimedIds, { notified_at: null });
        for (const ev of claimedEvs) {
          await supabase.from("activity_events").update({ dispatch_attempts: (ev.dispatch_attempts ?? 0) + 1 }).eq("id", ev.id);
        }
        logErr("digest post failed", { channel, error: res.error });
      }
    }
  }

  if (realtimeTypes.length) {
    const cutoff = new Date(Date.now() - REDRIVE_AGE_MS).toISOString();
    const { data: stuck, error } = await supabase.from("activity_events").select("id")
      .is("notified_at", null).in("event_type", realtimeTypes).lt("dispatch_attempts", MAX_ATTEMPTS)
      .lt("created_at", cutoff).limit(100);
    if (error) logErr("redrive query", error.message);
    for (const ev of (stuck ?? [])) { await dispatchOne(supabase, ev.id as string); redriven++; }
  }
  return json({ ok: true, digest_channels: digestChannels, digest_events: digestEvents, redriven });
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const provided = req.headers.get("x-webhook-secret") ?? "";
  if (!WEBHOOK_SECRET || provided !== WEBHOOK_SECRET) return json({ error: "unauthorized" }, 401);

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
  let payload: { event_id?: string; mode?: string } = {};
  try { payload = await req.json(); } catch { /* tolerate empty body */ }

  if (payload.mode === "digest") return await runDigest(supabase);
  if (payload.event_id) return await dispatchOne(supabase, payload.event_id);
  return json({ error: "bad_request", detail: "provide event_id or mode:digest" }, 400);
});
