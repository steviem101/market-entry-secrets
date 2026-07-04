// report-quality-rollup — weekly cross-report summary to #report-quality.
// Reads public.report_quality (last 14d), aggregates this-week vs last-week, posts one card.
// Auth: x-webhook-secret == SLACK_NOTIFY_WEBHOOK_SECRET (verify_jwt=false). Deterministic; no AI.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN") ?? "";
const WEBHOOK_SECRET = Deno.env.get("SLACK_NOTIFY_WEBHOOK_SECRET") ?? "";
const REPORT_BASE_URL = "https://marketentrysecrets.com/report";
const DAY = 86400000;

const RAG_LABELS: Record<string, string> = {
  service_providers: "Providers", community_members: "Mentors", events: "Events", content_items: "Content",
  leads: "Leads", innovation_ecosystem: "Innovation", trade_investment_agencies: "Agencies", investors: "Investors",
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(b: unknown, s = 200): Response {
  return new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });
}
function avg(a: number[]): number { return a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0; }
function band(s: number): string { return s >= 80 ? "🟢" : s >= 60 ? "🟡" : "🔴"; }
function arrow(d: number | null): string { return d == null ? "" : d > 0 ? ` ▲${d}` : d < 0 ? ` ▼${Math.abs(d)}` : " ▬"; }

// deno-lint-ignore no-explicit-any
async function postToSlack(channel: string, text: string, blocks: unknown[]): Promise<{ ok: boolean; error?: string }> {
  if (!SLACK_BOT_TOKEN) return { ok: false, error: "missing_bot_token" };
  const resp = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8", Authorization: `Bearer ${SLACK_BOT_TOKEN}` },
    body: JSON.stringify({ channel, text, attachments: [{ color: "#6b46c1", blocks }] }),
  });
  const d = await resp.json();
  return d.ok ? { ok: true } : { ok: false, error: d.error ?? "slack_error" };
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!WEBHOOK_SECRET || (req.headers.get("x-webhook-secret") ?? "") !== WEBHOOK_SECRET) return json({ error: "unauthorized" }, 401);

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
  const since = new Date(Date.now() - 14 * DAY).toISOString();
  // deno-lint-ignore no-explicit-any
  const { data: rows, error } = await supabase.from("report_quality").select("*").gte("created_at", since);
  if (error) return json({ ok: false, error: error.message }, 500);

  const { data: rt } = await supabase.from("activity_event_routing").select("channel_id,enabled").eq("event_type", "report.quality").maybeSingle();
  if (!rt || !rt.enabled || !rt.channel_id) return json({ ok: true, skipped: "no_enabled_routing" });
  const channel = rt.channel_id as string;

  const now = Date.now();
  // deno-lint-ignore no-explicit-any
  const all = (rows ?? []) as any[];
  const wk = all.filter((r) => now - new Date(r.created_at).getTime() <= 7 * DAY);
  const prev = all.filter((r) => { const a = now - new Date(r.created_at).getTime(); return a > 7 * DAY && a <= 14 * DAY; });

  if (wk.length === 0) {
    await postToSlack(channel, "Weekly report-quality rollup", [
      { type: "header", text: { type: "plain_text", text: "📊 Report Quality — weekly rollup" } },
      { type: "section", text: { type: "mrkdwn", text: "_No reports generated in the last 7 days._" } },
    ]);
    return json({ ok: true, reports: 0 });
  }

  const completed = wk.filter((r) => r.report_status === "completed");
  const failed = wk.filter((r) => r.report_status === "failed").length;
  const avgBuild = avg(wk.map((r) => r.build_health ?? 0));
  const avgReport = avg(completed.map((r) => r.report_score ?? 0));
  const avgPres = avg(completed.map((r) => r.score_presentation ?? 0));
  const avgSub = avg(completed.filter((r) => r.score_substance != null).map((r) => r.score_substance));
  const avgUtil = avg(completed.filter((r) => r.utilization_rate != null).map((r) => Math.round(r.utilization_rate * 100)));
  const avgGen = (() => { const g = completed.filter((r) => r.generation_time_ms).map((r) => r.generation_time_ms); return g.length ? Math.round(avg(g) / 1000) : 0; })();
  const trend = prev.length ? avgBuild - avg(prev.map((r) => r.build_health ?? 0)) : null;
  const degraded = wk.filter((r) => r.degraded).length;
  const greens = completed.filter((r) => (r.report_score ?? 0) >= 80).length;
  const yellows = completed.filter((r) => { const s = r.report_score ?? 0; return s >= 60 && s < 80; }).length;
  const reds = completed.filter((r) => (r.report_score ?? 0) < 60).length;

  const dropTally: Record<string, number> = {};
  for (const r of completed) for (const c of (r.utilization?.dropped ?? [])) dropTally[c] = (dropTally[c] ?? 0) + 1;
  const topDropped = Object.entries(dropTally).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([c, n]) => `${RAG_LABELS[c] ?? c} ×${n}`);

  const flagTally: Record<string, number> = {};
  for (const r of completed) for (const f of (r.presentation?.flags ?? [])) {
    const key = String(f).split(":")[0].split(" in ")[0].split(" (")[0].trim();
    flagTally[key] = (flagTally[key] ?? 0) + 1;
  }
  const topFlags = Object.entries(flagTally).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([f, n]) => `${f} ×${n}`);

  const worst = [...completed].sort((a, b) => (a.report_score ?? 0) - (b.report_score ?? 0)).slice(0, 3)
    .map((r) => `• ${band(r.report_score ?? 0)} ${r.report_score ?? 0} — ${r.metadata?.company ?? "(unknown)"} <${REPORT_BASE_URL}/${r.report_id}|↗>`);

  const fb = wk.filter((r) => r.user_feedback != null).map((r) => r.user_feedback);

  const blocks: unknown[] = [
    { type: "header", text: { type: "plain_text", text: "📊 Report Quality — weekly rollup" } },
    { type: "section", text: { type: "mrkdwn", text:
      `*${wk.length} reports* (last 7d)${failed ? ` · ${failed} failed` : ""}${degraded ? ` · ${degraded} degraded` : ""}\n` +
      `*Build ${avgBuild}${arrow(trend)}* · Report ${avgReport} · Presentation ${avgPres} · Substance ${avgSub} · Utilization ${avgUtil}% · avg ${avgGen}s` } },
    { type: "section", text: { type: "mrkdwn", text: `*Report score mix:*  🟢 ${greens}  ·  🟡 ${yellows}  ·  🔴 ${reds}${fb.length ? `\n*User ratings:* avg ${avg(fb)} (n=${fb.length})` : ""}` } },
    { type: "divider" },
    { type: "section", text: { type: "mrkdwn", text: `*Most-dropped retrieval (surfaced, never used)*\n${topDropped.length ? topDropped.join("  ·  ") : "_none_"}` } },
    { type: "section", text: { type: "mrkdwn", text: `*Most-common writing issues*\n${topFlags.length ? topFlags.join("  ·  ") : "_none_"}` } },
    { type: "section", text: { type: "mrkdwn", text: `*Lowest-scoring reports*\n${worst.join("\n") || "_none_"}` } },
    { type: "context", elements: [{ type: "mrkdwn", text: `as of ${new Date().toUTCString()} · use these patterns to prioritise prompt/taxonomy fixes` }] },
  ];

  const res = await postToSlack(channel, `Report Quality weekly rollup — ${wk.length} reports`, blocks);
  return json({ ok: res.ok, error: res.error, reports: wk.length });
});
