// slack-notify — posts public.activity_events to Slack.
//
// Auth: header `x-webhook-secret` must equal env SLACK_NOTIFY_WEBHOOK_SECRET (verify_jwt=false).
// Two modes:
//   { "event_id": "<uuid>" } -> post one realtime event to its routed channel (idempotent).
//   { "mode": "digest" }     -> roll up unsent info events into one message per channel,
//                               and re-drive stuck realtime events (silent-failure recovery).
//
// Deterministic formatting only. No AI / token cost. Self-contained (no _shared imports) so it
// deploys cleanly via the Supabase management API / CLI. Never deploy this via Lovable.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN") ?? "";
const WEBHOOK_SECRET = Deno.env.get("SLACK_NOTIFY_WEBHOOK_SECRET") ?? "";

const SEVERITY_COLOR: Record<string, string> = {
  revenue: "#2eb67d",
  action: "#36c5f0",
  error: "#e01e5a",
  info: "#9aa0a6",
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

interface ActivityEvent {
  id: string;
  event_type: string;
  actor_user_id: string | null;
  actor_email: string | null;
  actor_name: string | null;
  object_type: string | null;
  object_id: string | null;
  metadata: Record<string, unknown> | null;
  severity: string;
  notified_at: string | null;
  dispatch_attempts: number | null;
  created_at: string;
}

interface Routing {
  event_type: string;
  channel_id: string;
  emoji: string;
  severity: string;
  realtime: boolean;
  mention: boolean;
  enabled: boolean;
}

function titleFor(eventType: string): string {
  return eventType.replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function actorLine(e: ActivityEvent): string | null {
  const who = e.actor_name || e.actor_email ||
    (e.actor_user_id ? `user ${e.actor_user_id.slice(0, 8)}` : null);
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
  channel: string,
  text: string,
  blocks: unknown[],
  color: string,
  mention: boolean,
): Promise<{ ok: boolean; ts?: string; error?: string }> {
  if (!SLACK_BOT_TOKEN) return { ok: false, error: "missing_bot_token" };
  const body = {
    channel,
    text: mention ? `<!here> ${text}` : text,
    attachments: [{ color, blocks }],
  };
  const resp = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
    },
    body: JSON.stringify(body),
  });
  const data = await resp.json();
  if (!data.ok) return { ok: false, error: data.error ?? "slack_error" };
  return { ok: true, ts: data.ts };
}

function buildEventBlocks(ev: ActivityEvent, routing: Routing): unknown[] {
  const blocks: unknown[] = [
    {
      type: "header",
      text: { type: "plain_text", text: `${routing.emoji} ${titleFor(ev.event_type)}`.slice(0, 150) },
    },
  ];
  const lines = [actorLine(ev), ...metaLines(ev)].filter(Boolean) as string[];
  if (lines.length) {
    blocks.push({ type: "section", text: { type: "mrkdwn", text: lines.join("\n") } });
  }
  blocks.push({
    type: "context",
    elements: [{ type: "mrkdwn", text: `severity: ${ev.severity} · ${new Date(ev.created_at).toUTCString()}` }],
  });
  return blocks;
}

// deno-lint-ignore no-explicit-any
async function dispatchOne(supabase: any, eventId: string): Promise<Response> {
  const { data: e, error } = await supabase
    .from("activity_events").select("*").eq("id", eventId).maybeSingle();
  if (error) return json({ ok: false, error: error.message }, 500);
  if (!e) return json({ ok: false, error: "event_not_found" }, 404);
  const ev = e as ActivityEvent;
  if (ev.notified_at) return json({ ok: true, skipped: "already_notified" });

  const { data: r } = await supabase
    .from("activity_event_routing").select("*").eq("event_type", ev.event_type).maybeSingle();
  if (!r || !(r as Routing).enabled) return json({ ok: true, skipped: "no_enabled_routing" });
  const routing = r as Routing;

  const res = await postToSlack(
    routing.channel_id,
    titleFor(ev.event_type),
    buildEventBlocks(ev, routing),
    SEVERITY_COLOR[ev.severity] ?? SEVERITY_COLOR.info,
    routing.mention,
  );

  if (!res.ok) {
    await supabase.from("activity_events")
      .update({ dispatch_attempts: (ev.dispatch_attempts ?? 0) + 1 }).eq("id", ev.id);
    return json({ ok: false, error: res.error }, 200);
  }
  await supabase.from("activity_events")
    .update({ notified_at: new Date().toISOString(), slack_ts: res.ts }).eq("id", ev.id);
  return json({ ok: true, posted: true, ts: res.ts });
}

// deno-lint-ignore no-explicit-any
async function runDigest(supabase: any): Promise<Response> {
  const { data: routingRows } = await supabase.from("activity_event_routing").select("*");
  const routingMap = new Map<string, Routing>();
  for (const r of (routingRows ?? []) as Routing[]) routingMap.set(r.event_type, r);

  const { data: pending, error } = await supabase
    .from("activity_events").select("*").is("notified_at", null)
    .order("created_at", { ascending: true }).limit(500);
  if (error) return json({ ok: false, error: error.message }, 500);
  const events = (pending ?? []) as ActivityEvent[];

  const nowMs = Date.now();
  const digestByChannel = new Map<string, ActivityEvent[]>();
  const redrive: ActivityEvent[] = [];

  for (const ev of events) {
    const r = routingMap.get(ev.event_type);
    if (!r || !r.enabled) continue;
    if (r.realtime) {
      const ageMs = nowMs - new Date(ev.created_at).getTime();
      if (ageMs > 10 * 60 * 1000 && (ev.dispatch_attempts ?? 0) < 5) redrive.push(ev);
      continue;
    }
    const arr = digestByChannel.get(r.channel_id) ?? [];
    arr.push(ev);
    digestByChannel.set(r.channel_id, arr);
  }

  let digestChannels = 0, digestEvents = 0, redriven = 0;

  for (const [channel, evs] of digestByChannel) {
    const counts = new Map<string, number>();
    for (const ev of evs) counts.set(ev.event_type, (counts.get(ev.event_type) ?? 0) + 1);
    const countLines = [...counts.entries()].map(([t, n]) => {
      const r = routingMap.get(t)!;
      return `${r.emoji} *${titleFor(t)}* × ${n}`;
    }).join("\n");
    const itemLines = evs.slice(0, 20).map((ev) => `• ${summaryLine(ev, routingMap.get(ev.event_type)!)}`).join("\n");

    const blocks: unknown[] = [
      { type: "header", text: { type: "plain_text", text: `🔔 Activity digest — ${evs.length} new` } },
      { type: "section", text: { type: "mrkdwn", text: countLines || "—" } },
      { type: "divider" },
      { type: "section", text: { type: "mrkdwn", text: itemLines || "—" } },
      { type: "context", elements: [{ type: "mrkdwn", text: `as of ${new Date().toUTCString()}` }] },
    ];
    const res = await postToSlack(channel, `Activity digest — ${evs.length} new`, blocks, SEVERITY_COLOR.info, false);
    if (res.ok) {
      await supabase.from("activity_events")
        .update({ notified_at: new Date().toISOString(), slack_ts: res.ts })
        .in("id", evs.map((e) => e.id));
      digestChannels++; digestEvents += evs.length;
    } else {
      for (const ev of evs) {
        await supabase.from("activity_events")
          .update({ dispatch_attempts: (ev.dispatch_attempts ?? 0) + 1 }).eq("id", ev.id);
      }
    }
  }

  for (const ev of redrive) {
    await dispatchOne(supabase, ev.id);
    redriven++;
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
