// slack-notify — posts public.activity_events to Slack.
//
// Auth: header `x-webhook-secret` must equal env SLACK_NOTIFY_WEBHOOK_SECRET (verify_jwt=false).
// Modes:
//   { "event_id": "<uuid>" } -> claim-then-post one realtime event to its routed channel.
//   { "mode": "digest" }     -> roll up unsent info events; re-drive stuck realtime; sweep stale.
// Special event_type `report.quality` -> handled by ./reportQuality.ts (telemetry + card).
//
// Deterministic formatting only. No AI / token cost. Self-contained (no _shared imports).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleReportQuality } from "./reportQuality.ts";
import { buildSubmissionEditorUrl, curateSubmissionFields, projectRefFromUrl } from "./submissionCard.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN") ?? "";
const WEBHOOK_SECRET = Deno.env.get("SLACK_NOTIFY_WEBHOOK_SECRET") ?? "";
// Numeric table id for public.directory_submissions in the Supabase table editor
// (env-overridable in case the id ever changes).
const SUBMISSIONS_TABLE_ID = Deno.env.get("SUBMISSIONS_TABLE_EDITOR_ID") ?? "20063";
const PROJECT_REF = projectRefFromUrl(SUPABASE_URL);

const DIGEST_LIMIT = 200;
const ID_CHUNK = 100;
const REDRIVE_AGE_MS = 10 * 60 * 1000;
const STALE_AGE_MS = 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const SEVERITY_COLOR: Record<string, string> = {
  revenue: "#2eb67d", action: "#36c5f0", error: "#e01e5a", info: "#9aa0a6",
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

// Richer card for directory_submissions events (submission.received /
// intro.requested): curated form_data fields + a deep link to the row in the
// Supabase table editor. Falls back to buildEventBlocks-style rendering when
// form_data is empty.
function buildSubmissionBlocks(
  ev: ActivityEvent, routing: Routing, formData: Record<string, unknown>,
): unknown[] {
  const submissionType = (ev.metadata?.submission_type as string) ?? (formData.content_type as string) ?? "";
  const blocks: unknown[] = [
    { type: "header", text: { type: "plain_text", text: `${routing.emoji} ${titleFor(ev.event_type)}`.slice(0, 150) } },
  ];
  const lines: string[] = [];
  const who = actorLine(ev);
  if (who) lines.push(who);
  if (submissionType) lines.push(`*Type:* ${titleFor(submissionType)}`);
  for (const f of curateSubmissionFields(formData)) lines.push(`*${f.label}:* ${f.value}`);
  if (lines.length) blocks.push({ type: "section", text: { type: "mrkdwn", text: lines.join("\n").slice(0, 2900) } });

  const editorUrl = buildSubmissionEditorUrl(PROJECT_REF, SUBMISSIONS_TABLE_ID, ev.object_id);
  if (editorUrl) blocks.push({ type: "section", text: { type: "mrkdwn", text: `<${editorUrl}|🔗 View submission in Supabase>` } });

  blocks.push({
    type: "context",
    elements: [{ type: "mrkdwn", text: `severity: ${ev.severity} · ${new Date(ev.created_at).toUTCString()} · id: ${ev.object_id ?? "—"}` }],
  });
  return blocks;
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

  let built = prebuilt;
  if (!built && ev.object_type === "directory_submissions" && ev.object_id) {
    const { data: sub, error: subErr } = await supabase
      .from("directory_submissions").select("form_data").eq("id", ev.object_id).maybeSingle();
    if (subErr) logErr("load submission", subErr.message);
    const formData = (sub?.form_data ?? {}) as Record<string, unknown>;
    built = {
      text: `${titleFor(ev.event_type)}${ev.metadata?.submission_type ? ` — ${ev.metadata.submission_type}` : ""}`,
      blocks: buildSubmissionBlocks(ev, routing, formData),
      color: SEVERITY_COLOR[ev.severity] ?? SEVERITY_COLOR.info,
    };
  }
  built ??= {
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
