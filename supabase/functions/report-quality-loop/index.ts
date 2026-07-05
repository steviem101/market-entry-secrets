// report-quality-loop — scheduled, PROPOSE-ONLY report-quality review loop.
//
// Each run: pulls a capped batch of recent reports + their report_quality telemetry +
// intake inputs (read-only, service role), scores each on three axes against its tier
// (relevance / conciseness / input-actioning fidelity) via an Anthropic judge, writes
// ranked categorised proposals to report_quality_proposals, logs the run to
// automation_runs, and posts a digest to #report-quality.
//
// It NEVER edits prod prompts, matching logic, RLS, or directory data. Disabled by
// default: self-gates on the activity_event_routing 'report.quality.loop' enabled flag.
// Auth: x-webhook-secret == SLACK_NOTIFY_WEBHOOK_SECRET (verify_jwt=false), same as
// report-quality-rollup.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildCompactInput, buildScoringMessages, parseScoring, toProposalRows,
  rankAndCap, summariseThemes, RUBRIC_VERSION, type Category, type ProposalRow,
} from "./rubric.ts";
import { escapeSlack } from "../_shared/slack.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN") ?? "";
const WEBHOOK_SECRET = Deno.env.get("SLACK_NOTIFY_WEBHOOK_SECRET") ?? "";
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const ANTHROPIC_MODEL = Deno.env.get("RQ_LOOP_MODEL") ?? "claude-sonnet-4-6";
const REPORT_BASE_URL = "https://marketentrysecrets.com/report";
const NOTION_API_KEY = Deno.env.get("NOTION_API_KEY") ?? "";
// No hardcoded fallback: a non-prod deploy with a Notion key but no DB id must skip,
// not write test tickets into the production MES Tickets database.
const NOTION_TICKETS_DB_ID = Deno.env.get("NOTION_TICKETS_DB_ID") ?? "";
const NOTION_TIMEOUT_MS = 10000;
const LOOP_NAME = "report-quality-loop";
const ROUTING_EVENT = "report.quality.loop";
const DAY = 86400000;

// Hard caps (override via POST body). Keep cost bounded.
const DEFAULT_BATCH = 20;
const MAX_BATCH = 50;
const DEFAULT_TOKEN_BUDGET = 200000; // total Anthropic tokens (in+out) per run
const DEFAULT_LOOKBACK_DAYS = 14;
const PROPOSAL_CAP = 40; // max proposals written per run
// Wall-clock deadline: stop the batch early and still write/log/post what we have, so the
// edge function never blows the gateway timeout (which kills it before the batch insert).
// Leftover reports are picked up next run (proposed-on reports are skipped). Default 95s
// keeps worst-case (deadline + one in-flight judge call) under the ~150s edge limit.
const DEFAULT_MAX_RUN_MS = 95000;
const JUDGE_TIMEOUT_MS = 30000;
// Rough Anthropic USD pricing per 1M tokens (sonnet-class default; informational only).
const PRICE_IN = 3.0;
const PRICE_OUT = 15.0;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(b: unknown, s = 200): Response {
  return new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });
}
function band(s: number): string { return s >= 80 ? "🟢" : s >= 60 ? "🟡" : "🔴"; }
// Accept/Reject buttons for one proposal. Clicks hit the rq-slack-actions function
// (Slack-signature-verified), which flips the row's status — review only, never ships code.
function proposalActions(id: string): unknown {
  const ref = String(id).slice(0, 8);
  return { type: "actions", elements: [
    { type: "button", action_id: `rq_accept_${ref}`, style: "primary", text: { type: "plain_text", text: "✅ Accept" }, value: id },
    { type: "button", action_id: `rq_reject_${ref}`, style: "danger", text: { type: "plain_text", text: "❌ Reject" }, value: id },
  ] };
}
function avg(a: number[]): number { return a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0; }
function log(msg: string, data?: unknown): void {
  console.log(`[${new Date().toISOString()}] [${LOOP_NAME}] ${msg}`, data !== undefined ? JSON.stringify(data) : "");
}

// Never throws: a Slack outage after the run has been logged must not bubble into the
// outer catch and clobber a successful automation_runs row with an error/zeros.
// deno-lint-ignore no-explicit-any
async function postToSlack(channel: string, text: string, blocks: unknown[]): Promise<{ ok: boolean; error?: string }> {
  if (!SLACK_BOT_TOKEN) return { ok: false, error: "missing_bot_token" };
  try {
    const resp = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8", Authorization: `Bearer ${SLACK_BOT_TOKEN}` },
      body: JSON.stringify({ channel, text, attachments: [{ color: "#6b46c1", blocks }] }),
    });
    const d = await resp.json();
    return d.ok ? { ok: true } : { ok: false, error: d.error ?? "slack_error" };
  } catch (e) {
    log("slack post failed", String(e));
    return { ok: false, error: String(e) };
  }
}

interface JudgeResult { text: string; inTokens: number; outTokens: number }

async function judge(system: string, user: string): Promise<JudgeResult | null> {
  if (!ANTHROPIC_API_KEY) return null;
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), JUDGE_TIMEOUT_MS);
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1500,
        temperature: 0.2,
        system,
        messages: [{ role: "user", content: user }],
      }),
      signal: ctrl.signal,
    });
    clearTimeout(to);
    if (!resp.ok) { log("anthropic http error", resp.status); return null; }
    const data = await resp.json();
    // deno-lint-ignore no-explicit-any
    const text = (data?.content ?? []).filter((b: any) => b?.type === "text").map((b: any) => b.text).join("\n");
    return { text, inTokens: data?.usage?.input_tokens ?? 0, outTokens: data?.usage?.output_tokens ?? 0 };
  } catch (e) {
    log("anthropic exception", String(e));
    return null;
  }
}

// Post-only mode: push the current open review queue (status='new') to Slack via the
// loop's own bot. No scoring, no writes, no automation_runs row — just a digest the team
// can react to in-thread. Triggered by POST { "post_queue": true }.
// deno-lint-ignore no-explicit-any
async function postQueue(supabase: any, channel: string, limit: number): Promise<Response> {
  const { data: rows } = await supabase.from("report_quality_proposals")
    .select("id, report_id, category, title, recommended_change, impact_estimate, confidence, risk, evidence")
    .eq("status", "new").order("rank_score", { ascending: false }).limit(limit);
  // deno-lint-ignore no-explicit-any
  const props = (rows ?? []) as any[];
  if (!props.length) {
    await postToSlack(channel, "Report-quality queue — empty", [
      { type: "header", text: { type: "plain_text", text: "🔁 Report Quality — review queue" } },
      { type: "section", text: { type: "mrkdwn", text: "_No open proposals (status = new)._" } },
    ]);
    return json({ ok: true, posted: 0 });
  }
  // deno-lint-ignore no-explicit-any
  const line = (p: any, i: number) => {
    const ref = String(p.id).slice(0, 8);
    // company comes from the user's intake form and title/recommended_change from the AI
    // judge — all untrusted for Slack mrkdwn (a crafted value could ping <!channel> or
    // render masked links), so escape every interpolation.
    const company = escapeSlack(String(p.evidence?.company ?? "(unknown)"));
    return `${i + 1}. \`[${ref}]\` *${company}* · ${p.category} — ${escapeSlack(String(p.title ?? ""))} _(${p.impact_estimate}, conf ${p.confidence}, risk ${p.risk})_\n    ↳ ${escapeSlack(String(p.recommended_change ?? "").slice(0, 180))}  <${REPORT_BASE_URL}/${p.report_id}|report ↗>`;
  };
  const blocks: unknown[] = [
    { type: "header", text: { type: "plain_text", text: `🔁 Report Quality — ${props.length} proposals for review` } },
    { type: "section", text: { type: "mrkdwn", text: "*Click ✅ Accept / ❌ Reject* to action a proposal (updates `report_quality_proposals` directly). Propose-only: accepted proposals still ship via PRs." } },
    { type: "divider" },
  ];
  // Buttons for the top proposals (Slack caps a message at 50 blocks; 2 blocks each).
  const BUTTONED = 10;
  props.slice(0, BUTTONED).forEach((p, i) => {
    blocks.push({ type: "section", text: { type: "mrkdwn", text: line(p, i) } });
    blocks.push(proposalActions(p.id));
  });
  // The tail (if any) stays as compact text — action those by ref via Claude/admin.
  let buf = "";
  props.slice(BUTTONED).forEach((p, j) => {
    const ln = line(p, BUTTONED + j);
    if (buf && (buf + "\n" + ln).length > 2800) { blocks.push({ type: "section", text: { type: "mrkdwn", text: buf } }); buf = ln; }
    else buf = buf ? buf + "\n" + ln : ln;
  });
  if (buf) blocks.push({ type: "section", text: { type: "mrkdwn", text: buf } });
  blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: `review in report_quality_proposals · ${new Date().toUTCString()}` }] });
  // Slack caps a message at 50 blocks — truncate visibly rather than dropping the tail silently.
  const sendBlocks = blocks.length > 50
    ? [...blocks.slice(0, 49), { type: "context", elements: [{ type: "mrkdwn", text: `⚠️ truncated to Slack's 50-block cap — remaining proposals are in report_quality_proposals · ${new Date().toUTCString()}` }] }]
    : blocks;
  const res = await postToSlack(channel, `Report-quality review queue — ${props.length} proposals`, sendBlocks);
  return json({ ok: res.ok, posted: props.length, truncated: blocks.length > 50, error: res.error });
}

// --- Notion ticket sweep -------------------------------------------------------------
// Batches accepted-but-unticketed proposals (status='accepted', fix_ref is null) into
// grouped tickets in the Notion "MES Tickets" database, one ticket per category, then
// writes the ticket URL back to each proposal's fix_ref. Runs at the end of every
// scheduled run and on demand via POST {"sync_notion": true}. Skips quietly when
// NOTION_API_KEY isn't configured.
// Typed against the rubric's Category union so a category rename/addition in rubric.ts
// is a compile error here instead of silently falling back to generic ticket metadata
// (which would drop e.g. the data-coverage-gap "do NOT invent records" safety note).
const CAT_META: Record<Category, { type: string; priority: string; gate: string; label: string; note?: string }> = {
  "matching/relevance": { type: "Bug", priority: "P1", gate: "Plan", label: "Matching relevance" },
  "content/prompt-bulk": { type: "Refactor", priority: "P2", gate: "Plan", label: "Content bulk / prompt tightening" },
  "input-not-actioned": { type: "Feature", priority: "P1", gate: "Plan", label: "Input-actioning fidelity" },
  "accuracy/hallucination": { type: "Bug", priority: "P1", gate: "Plan", label: "Accuracy / hallucination guards" },
  "data-coverage-gap": { type: "Data", priority: "P2", gate: "Audit", label: "Directory data seeding", note: "Needs human data sourcing — do NOT auto-implement or invent records." },
};

interface NotionSweepResult { created: number; ticketed: number; deferred?: number; skipped?: string; errors?: string[] }

// Claim protocol: rows are atomically claimed (fix_ref = "claim:<iso>:<rand>") before any
// ticket is created, so two overlapping sweeps (manual sync_notion + the scheduled run)
// can never double-ticket the same proposals — the CAS makes exactly one winner per row.
// Claims from a sweep that died mid-flight are recovered after CLAIM_STALE_MS.
const CLAIM_PREFIX = "claim:";
const CLAIM_STALE_MS = 15 * 60 * 1000;
const TICKET_LIST_CAP = 90; // Notion caps page creates at 100 children blocks

// deno-lint-ignore no-explicit-any
async function syncAcceptedToNotion(supabase: any, deadlineAt: number): Promise<NotionSweepResult> {
  if (!NOTION_API_KEY) return { created: 0, ticketed: 0, skipped: "missing_notion_key" };
  if (!NOTION_TICKETS_DB_ID) return { created: 0, ticketed: 0, skipped: "missing_notion_db_id" };
  if (Date.now() >= deadlineAt) return { created: 0, ticketed: 0, skipped: "deadline" };

  const claim = `${CLAIM_PREFIX}${new Date().toISOString()}:${crypto.randomUUID().slice(0, 8)}`;
  const PROPOSAL_COLS = "id, category, title, impact_estimate, confidence, risk, recommended_change, evidence, report_id";
  const { data: claimedRows, error: claimErr } = await supabase.from("report_quality_proposals")
    .update({ fix_ref: claim })
    .eq("status", "accepted").is("fix_ref", null)
    .select(PROPOSAL_COLS);
  if (claimErr) return { created: 0, ticketed: 0, errors: [claimErr.message] };
  // deno-lint-ignore no-explicit-any
  const pending = (claimedRows ?? []) as any[];

  // Recover rows stranded by a sweep that died between claiming and stamping.
  const { data: staleRows } = await supabase.from("report_quality_proposals")
    .select(`${PROPOSAL_COLS}, fix_ref`)
    .eq("status", "accepted").like("fix_ref", `${CLAIM_PREFIX}%`).neq("fix_ref", claim).limit(200);
  for (const s of (staleRows ?? []) as { fix_ref: string; id: string }[]) {
    const body = String(s.fix_ref).slice(CLAIM_PREFIX.length);
    const ts = Date.parse(body.slice(0, body.lastIndexOf(":")));
    if (!Number.isFinite(ts) || Date.now() - ts < CLAIM_STALE_MS) continue; // in-flight elsewhere
    const { data: stolen } = await supabase.from("report_quality_proposals")
      .update({ fix_ref: claim }).eq("id", s.id).eq("fix_ref", s.fix_ref).select("id");
    if (stolen?.length) pending.push(s);
  }
  if (!pending.length) return { created: 0, ticketed: 0 };

  // Rows we claimed but didn't ticket go back to null so the next sweep picks them up.
  const release = async (ids: string[]): Promise<void> => {
    if (!ids.length) return;
    const { error: relErr } = await supabase.from("report_quality_proposals")
      .update({ fix_ref: null }).in("id", ids).eq("fix_ref", claim);
    if (relErr) log("claim release failed (stale-claim recovery will handle)", relErr.message);
  };

  // deno-lint-ignore no-explicit-any
  const groups = new Map<string, any[]>();
  for (const p of pending) {
    if (!groups.has(p.category)) groups.set(p.category, []);
    groups.get(p.category)!.push(p);
  }

  const result: NotionSweepResult = { created: 0, ticketed: 0, errors: [] };
  const today = new Date().toISOString().slice(0, 10);
  const entries = [...groups.entries()];
  for (let g = 0; g < entries.length; g++) {
    const [category, props] = entries[g];
    if (Date.now() >= deadlineAt) {
      const remaining = entries.slice(g).flatMap(([, ps]) => ps.map((p) => p.id));
      await release(remaining);
      result.deferred = (result.deferred ?? 0) + remaining.length;
      log("sweep deadline — deferring remaining groups to next run", { deferred: remaining.length });
      break;
    }
    const listed = props.slice(0, TICKET_LIST_CAP);
    const overflow = props.slice(TICKET_LIST_CAP);
    if (overflow.length) { // ticketed on the next sweep rather than silently dropped
      await release(overflow.map((p) => p.id));
      result.deferred = (result.deferred ?? 0) + overflow.length;
    }
    const meta = CAT_META[category as Category] ?? { type: "Feature", priority: "P2", gate: "Plan", label: category };
    const refs = listed.map((p) => String(p.id).slice(0, 8));
    const children: unknown[] = [
      { object: "block", type: "callout", callout: { icon: { type: "emoji", emoji: "🔁" }, rich_text: [{ type: "text", text: { content:
        `Accepted report-quality proposals, auto-swept from report_quality_proposals on ${today}. Rows carry fix_ref → this ticket; flip them to 'shipped' once implemented + merged.${meta.note ? " ⚠️ " + meta.note : ""}` } }] } },
      ...listed.map((p) => ({ object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content:
        `[${String(p.id).slice(0, 8)}] ${p.evidence?.company ?? "(unknown)"} — ${p.title} (${p.impact_estimate}, conf ${p.confidence}, risk ${p.risk}) → ${String(p.recommended_change ?? "").slice(0, 400)}`.slice(0, 1900) } }] } })),
    ];
    let pageUrl = "";
    try {
      // Bounded: a hung Notion connection must not push the function into the ~150s
      // gateway kill (which would strand claims until stale recovery).
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), NOTION_TIMEOUT_MS);
      const resp = await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        signal: ctrl.signal,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${NOTION_API_KEY}`, "Notion-Version": "2022-06-28" },
        body: JSON.stringify({
          parent: { database_id: NOTION_TICKETS_DB_ID },
          icon: { type: "emoji", emoji: "🔁" },
          properties: {
            Name: { title: [{ text: { content: `RQ sweep: ${meta.label} — ${listed.length} accepted proposal${listed.length === 1 ? "" : "s"} (${today})` } }] },
            Status: { select: { name: "Scoped" } },
            "Gate stage": { select: { name: meta.gate } },
            Priority: { select: { name: meta.priority } },
            Project: { select: { name: "MES Platform" } },
            Workstream: { select: { name: "Reports" } },
            Type: { select: { name: meta.type } },
            "Supabase ref": { select: { name: "xhziwveaiuhzdoutpgrh" } },
            Notes: { rich_text: [{ text: { content: `Auto-created by report-quality-loop Notion sweep. Proposal refs: ${refs.join(", ")}`.slice(0, 1900) } }] },
          },
          children,
        }),
      });
      clearTimeout(to);
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        result.errors!.push(`${category}: ${data?.message ?? `http_${resp.status}`}`);
        log("notion sweep create failed", { category, status: resp.status, error: data?.message });
        await release(listed.map((p) => p.id));
        continue;
      }
      pageUrl = String(data?.url ?? "");
    } catch (e) {
      result.errors!.push(`${category}: ${String(e)}`);
      log("notion sweep exception", { category, error: String(e) });
      await release(listed.map((p) => p.id));
      continue;
    }
    if (!pageUrl) {
      result.errors!.push(`${category}: notion response had no url — rows released; next sweep may duplicate this ticket`);
      await release(listed.map((p) => p.id));
      continue;
    }
    // Stamp the listed rows with the real URL (retry once; still-claimed rows fall to
    // stale-claim recovery rather than duplicating the ticket immediately).
    let updErr;
    for (let attempt = 0; attempt < 2 && (attempt === 0 || updErr); attempt++) {
      updErr = (await supabase.from("report_quality_proposals")
        .update({ fix_ref: pageUrl }).in("id", listed.map((p) => p.id)).eq("fix_ref", claim)).error;
    }
    if (updErr) result.errors!.push(`${category} fix_ref failed twice (${updErr.message}) — rows stay claimed; stale-claim recovery re-tickets in ~15min: ${pageUrl}`);
    else result.ticketed += listed.length;
    result.created += 1;
    log("notion ticket created", { category, proposals: listed.length, url: pageUrl });
  }
  if (!result.errors!.length) delete result.errors;
  return result;
}

// Run the Notion sweep and tell the channel what happened — a success note when tickets
// were created, a loud warning when anything failed (a silent sweep failure means
// accepted proposals pile up unticketed with no signal anywhere). Slack-post failures
// are logged; the sweep result also lands in automation_runs metadata on scheduled runs
// so the outcome stays queryable even if Slack is down.
// deno-lint-ignore no-explicit-any
async function sweepAndNotify(supabase: any, channel: string, deadlineAt: number): Promise<NotionSweepResult> {
  const sweep = await syncAcceptedToNotion(supabase, deadlineAt);
  if (sweep.created > 0) {
    const res = await postToSlack(channel, `Report-quality — ${sweep.ticketed} accepted proposals ticketed into Notion`, [
      { type: "section", text: { type: "mrkdwn", text: `🗂 *Notion sweep* — ${sweep.ticketed} accepted proposal(s) grouped into ${sweep.created} MES ticket(s). Each proposal's \`fix_ref\` now links to its ticket.${sweep.deferred ? ` ${sweep.deferred} deferred to the next sweep.` : ""}` } },
    ]);
    if (!res.ok) log("sweep note post failed", res.error);
  }
  if (sweep.errors?.length) {
    const res = await postToSlack(channel, "Report-quality — Notion sweep errors", [
      { type: "section", text: { type: "mrkdwn", text: `⚠️ *Notion sweep errors* — accepted proposals may not be ticketed:\n${sweep.errors.map((e) => `• ${escapeSlack(e)}`).join("\n")}`.slice(0, 2900) } },
    ]);
    if (!res.ok) log("sweep error-warning post failed", res.error);
  }
  return sweep;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!WEBHOOK_SECRET || (req.headers.get("x-webhook-secret") ?? "") !== WEBHOOK_SECRET) {
    return json({ error: "unauthorized" }, 401);
  }

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* defaults */ }
  const batchSize = Math.min(Math.max(Number(body.batch_size) || DEFAULT_BATCH, 1), MAX_BATCH);
  const tokenBudget = Math.max(Number(body.token_budget) || DEFAULT_TOKEN_BUDGET, 10000);
  const lookbackDays = Math.max(Number(body.lookback_days) || DEFAULT_LOOKBACK_DAYS, 1);
  const maxRunMs = Math.max(Number(body.max_run_ms) || DEFAULT_MAX_RUN_MS, 10000);
  const dryRun = body.dry_run === true;

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

  // --- feature flag ---------------------------------------------------------------------
  const { data: rt } = await supabase.from("activity_event_routing")
    .select("channel_id,enabled").eq("event_type", ROUTING_EVENT).maybeSingle();
  const channel = (rt?.channel_id ?? "") as string;

  // --- sweep-only mode: ticket accepted proposals into Notion (no scoring) ------------
  // Deliberately NOT gated on routing.enabled: ticketing already-accepted proposals
  // doesn't require the (Anthropic-spending) scoring loop to be switched on.
  if (body.sync_notion === true) {
    if (!channel) return json({ ok: false, error: "no_channel_configured" }, 500);
    const sweep = await sweepAndNotify(supabase, channel, Date.now() + 60000);
    return json({ ok: !sweep.errors, notion: sweep });
  }

  // Everything below (scoring runs + queue posts) is gated on the routing flag.
  if (!rt || !rt.enabled || !channel) {
    log("loop disabled (routing flag off) — skipping");
    return json({ ok: true, skipped: "loop_disabled" });
  }

  // --- post-only mode: push the open review queue to Slack (no scoring) ---------------
  if (body.post_queue === true) return await postQueue(supabase, channel, Math.min(Math.max(Number(body.limit) || 40, 1), 100));

  // --- open an automation_runs row ---------------------------------------------------
  const startedAt = new Date().toISOString();
  let runId: string | null = null;
  if (!dryRun) {
    const { data: run, error: runErr } = await supabase.from("automation_runs")
      .insert({ loop: LOOP_NAME, started_at: startedAt, status: "running",
        metadata: { batch_size: batchSize, token_budget: tokenBudget, lookback_days: lookbackDays, model: ANTHROPIC_MODEL, rubric_version: RUBRIC_VERSION } })
      .select("id").single();
    if (runErr) { log("failed to open run", runErr.message); return json({ ok: false, error: runErr.message }, 500); }
    runId = run.id;
  }

  // Closes the run row exactly once: a late failure (e.g. a Slack outage after a
  // successful finish) must not clobber the recorded stats with error/zeros.
  let runClosed = false;
  const finish = async (status: string, fields: Record<string, unknown>, error?: string) => {
    if (runClosed) { log("finish skipped — run already closed", { status, error }); return; }
    runClosed = true;
    if (runId) {
      await supabase.from("automation_runs").update({
        finished_at: new Date().toISOString(), status, error: error ?? null, ...fields,
      }).eq("id", runId);
    }
  };

  try {
    if (!ANTHROPIC_API_KEY) { await finish("error", { reviewed: 0, proposed: 0 }, "missing_anthropic_key"); return json({ ok: false, error: "missing_anthropic_key" }, 500); }

    // --- pull a batch: recent quality rows, lowest-scoring first, not yet proposed-on -
    const since = new Date(Date.now() - lookbackDays * DAY).toISOString();
    // deno-lint-ignore no-explicit-any
    const { data: qrows, error: qErr } = await supabase.from("report_quality")
      .select("*").eq("report_status", "completed").gte("created_at", since)
      .order("report_score", { ascending: true, nullsFirst: true }).limit(batchSize * 3);
    if (qErr) { await finish("error", { reviewed: 0, proposed: 0 }, qErr.message); return json({ ok: false, error: qErr.message }, 500); }

    // skip reports that already have proposals (avoid re-proposing every run)
    const ids = (qrows ?? []).map((r) => r.report_id);
    const seen = new Set<string>();
    if (ids.length) {
      const { data: existing } = await supabase.from("report_quality_proposals")
        .select("report_id").in("report_id", ids);
      for (const e of existing ?? []) seen.add(e.report_id);
    }
    const batch = (qrows ?? []).filter((r) => !seen.has(r.report_id)).slice(0, batchSize);

    if (batch.length === 0) {
      await finish("success", { reviewed: 0, proposed: 0, tokens_used: 0, cost: { input_tokens: 0, output_tokens: 0, usd: 0 } });
      await postToSlack(channel, "Report-quality loop — nothing to review", [
        { type: "header", text: { type: "plain_text", text: "🔁 Report Quality loop" } },
        { type: "section", text: { type: "mrkdwn", text: `_No new completed reports to review in the last ${lookbackDays}d._` } },
      ]);
      return json({ ok: true, reviewed: 0, proposed: 0 });
    }

    let reviewed = 0, inTok = 0, outTok = 0;
    let deadlineHit = false;
    const runStart = Date.now();
    const allRows: ProposalRow[] = [];
    const axisRel: number[] = [], axisCon: number[] = [], axisFid: number[] = [];

    for (const rq of batch) {
      if (inTok + outTok >= tokenBudget) { log("token budget reached — stopping batch", { reviewed }); break; }
      if (Date.now() - runStart >= maxRunMs) { deadlineHit = true; log("wall-clock deadline reached — stopping batch", { reviewed }); break; }

      const { data: report } = await supabase.from("user_reports")
        .select("id, report_json, tier_at_generation, intake_form_id").eq("id", rq.report_id).maybeSingle();
      if (!report) continue;
      const { data: intake } = report.intake_form_id
        ? await supabase.from("user_intake_forms").select("*").eq("id", report.intake_form_id).maybeSingle()
        : { data: null };

      const compact = buildCompactInput(rq, report, intake);
      const { system, user } = buildScoringMessages(compact);
      const res = await judge(system, user);
      reviewed += 1;
      if (!res) continue;
      inTok += res.inTokens; outTok += res.outTokens;

      const parsed = parseScoring(res.text);
      axisRel.push(parsed.axes.relevance); axisCon.push(parsed.axes.conciseness); axisFid.push(parsed.axes.fidelity);
      allRows.push(...toProposalRows(compact, parsed));
    }

    // Ids are generated client-side and attached to the ranked rows themselves, so the
    // digest's Accept/Reject buttons are keyed to the exact row — no parallel array, no
    // reliance on INSERT..RETURNING row order (not a PG contract).
    const ranked = rankAndCap(allRows, PROPOSAL_CAP).map((r) => ({ ...r, id: crypto.randomUUID() }));
    const tokensUsed = inTok + outTok;
    const cost = { input_tokens: inTok, output_tokens: outTok, usd: Number(((inTok * PRICE_IN + outTok * PRICE_OUT) / 1_000_000).toFixed(4)) };

    // Persist proposals. A failed insert must NOT be reported as a successful run —
    // otherwise automation_runs shows success/proposed=N and Slack announces N proposals
    // while the queue stays empty (silent data loss). Capture the error and reflect the
    // count actually written.
    let insertError: string | null = null;
    let proposalsWritten = 0;
    if (!dryRun && runId && ranked.length) {
      const insertRows = ranked.map((r) => ({ ...r, run_id: runId, status: "new" }));
      const { error: insErr } = await supabase.from("report_quality_proposals").insert(insertRows);
      if (insErr) { insertError = insErr.message; log("proposal insert error", insErr.message); }
      else proposalsWritten = ranked.length;
    } else if (dryRun) {
      proposalsWritten = ranked.length; // not persisted, but report what would be written
    }

    const runMeta = {
      batch_size: batchSize, token_budget: tokenBudget, lookback_days: lookbackDays,
      max_run_ms: maxRunMs, deadline_hit: deadlineHit, eligible: batch.length,
      model: ANTHROPIC_MODEL, rubric_version: RUBRIC_VERSION,
      avg_axes: { relevance: avg(axisRel), conciseness: avg(axisCon), fidelity: avg(axisFid) },
    };
    await finish(insertError ? "error" : "success", {
      reviewed, proposed: proposalsWritten, tokens_used: tokensUsed, cost, metadata: runMeta,
    }, insertError ?? undefined);

    // --- Slack digest ------------------------------------------------------------------
    let blocks: unknown[];
    if (insertError) {
      // Be loud about a write failure rather than claiming proposals that never landed.
      blocks = [
        { type: "header", text: { type: "plain_text", text: "🔁 Report Quality loop — ⚠️ write failed" } },
        { type: "section", text: { type: "mrkdwn", text:
          `*${reviewed} reviewed* · scored *${ranked.length}* proposals but the insert into report_quality_proposals FAILED — *0 written*.\n\`${insertError}\`` } },
        { type: "context", elements: [{ type: "mrkdwn", text: `run logged as error · rubric ${RUBRIC_VERSION} · ${new Date().toUTCString()}` }] },
      ];
    } else {
      const themes = summariseThemes(ranked);
      blocks = [
        { type: "header", text: { type: "plain_text", text: "🔁 Report Quality loop — proposals" } },
        { type: "section", text: { type: "mrkdwn", text:
          `*${reviewed} reviewed* · *${proposalsWritten} proposals* · ${tokensUsed.toLocaleString()} tokens ($${cost.usd})\n` +
          `Avg axes — Relevance ${avg(axisRel)} · Conciseness ${avg(axisCon)} · Fidelity ${avg(axisFid)}` } },
        { type: "section", text: { type: "mrkdwn", text: `*Top recurring themes*\n${themes.length ? themes.map((t) => `${t.category} ×${t.count} — _${escapeSlack(t.example)}_`).join("\n") : "_none_"}` } },
        { type: "divider" },
      ];
      const top = ranked.slice(0, 5);
      if (!top.length) {
        blocks.push({ type: "section", text: { type: "mrkdwn", text: "*Top proposals*\n_none_" } });
      } else {
        blocks.push({ type: "section", text: { type: "mrkdwn", text: "*Top proposals* — ✅/❌ actions the proposal directly; the full queue is in `report_quality_proposals`:" } });
        for (const r of top) {
          blocks.push({ type: "section", text: { type: "mrkdwn", text:
            `• ${band(Math.round(r.confidence * 100))} *${r.category}* — ${escapeSlack(r.title)}  _(impact ${r.impact_estimate}, conf ${r.confidence}, risk ${r.risk})_ <${REPORT_BASE_URL}/${r.report_id}|↗>` } });
          blocks.push(proposalActions(r.id));
        }
      }
      blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: `propose-only · review in report_quality_proposals · rubric ${RUBRIC_VERSION}${deadlineHit ? ` · partial run (${reviewed}/${batch.length}; rest next run)` : ""} · ${new Date().toUTCString()}` }] });
    }
    if (!dryRun) await postToSlack(channel, insertError ? `Report-quality loop — write FAILED (${ranked.length} scored, 0 written)` : `Report-quality loop — ${proposalsWritten} proposals from ${reviewed} reports`, blocks);

    // --- Notion sweep: ticket anything accepted since the last run ----------------------
    // Runs after the digest so a sweep failure can never block scoring/logging/posting.
    // Skipped on deadline-hit runs, and otherwise bounded by the run's own wall-clock
    // budget (covers token-budget exits that already spent most of it): the sweep defers
    // remaining groups rather than risking the ~150s gateway kill mid-write.
    let notionSweep: NotionSweepResult | undefined;
    if (!dryRun && !deadlineHit) {
      notionSweep = await sweepAndNotify(supabase, channel, runStart + maxRunMs + 20000);
      // Keep the sweep outcome queryable in the system of record, not just in Slack —
      // an expired Notion token must show up in automation_runs, not only in a channel.
      if (runId && (notionSweep.created || notionSweep.errors || notionSweep.deferred)) {
        await supabase.from("automation_runs").update({
          metadata: { ...runMeta, notion_sweep: notionSweep },
        }).eq("id", runId);
      }
    } else if (deadlineHit) log("skipping notion sweep (deadline hit) — will run next cycle");

    return json({ ok: !insertError, error: insertError ?? undefined, reviewed, proposed: proposalsWritten, eligible: batch.length, deadline_hit: deadlineHit, tokens_used: tokensUsed, cost, notion: notionSweep, dry_run: dryRun, proposals: dryRun ? ranked : undefined });
  } catch (e) {
    log("run failed", String(e));
    await finish("error", { reviewed: 0, proposed: 0 }, String(e));
    return json({ ok: false, error: String(e) }, 500);
  }
});
