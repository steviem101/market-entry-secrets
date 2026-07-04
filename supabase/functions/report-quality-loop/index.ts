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

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN") ?? "";
const WEBHOOK_SECRET = Deno.env.get("SLACK_NOTIFY_WEBHOOK_SECRET") ?? "";
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const ANTHROPIC_MODEL = Deno.env.get("RQ_LOOP_MODEL") ?? "claude-sonnet-4-6";
const REPORT_BASE_URL = "https://market-entry-secrets.lovable.app/report";
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
    const company = p.evidence?.company ?? "(unknown)";
    return `${i + 1}. \`[${ref}]\` *${company}* · ${p.category} — ${p.title} _(${p.impact_estimate}, conf ${p.confidence}, risk ${p.risk})_\n    ↳ ${String(p.recommended_change ?? "").slice(0, 180)}  <${REPORT_BASE_URL}/${p.report_id}|report ↗>`;
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

interface NotionSweepResult { created: number; ticketed: number; skipped?: string; errors?: string[] }

// deno-lint-ignore no-explicit-any
async function syncAcceptedToNotion(supabase: any): Promise<NotionSweepResult> {
  if (!NOTION_API_KEY) return { created: 0, ticketed: 0, skipped: "missing_notion_key" };
  if (!NOTION_TICKETS_DB_ID) return { created: 0, ticketed: 0, skipped: "missing_notion_db_id" };
  const { data: rows, error } = await supabase.from("report_quality_proposals")
    .select("id, category, title, impact_estimate, confidence, risk, recommended_change, evidence, report_id")
    .eq("status", "accepted").is("fix_ref", null)
    .order("category", { ascending: true }).order("rank_score", { ascending: false }).limit(200);
  if (error) return { created: 0, ticketed: 0, errors: [error.message] };
  // deno-lint-ignore no-explicit-any
  const pending = (rows ?? []) as any[];
  if (!pending.length) return { created: 0, ticketed: 0 };

  // deno-lint-ignore no-explicit-any
  const groups = new Map<string, any[]>();
  for (const p of pending) {
    if (!groups.has(p.category)) groups.set(p.category, []);
    groups.get(p.category)!.push(p);
  }

  const result: NotionSweepResult = { created: 0, ticketed: 0, errors: [] };
  const today = new Date().toISOString().slice(0, 10);
  for (const [category, props] of groups) {
    const meta = CAT_META[category as Category] ?? { type: "Feature", priority: "P2", gate: "Plan", label: category };
    const refs = props.map((p) => String(p.id).slice(0, 8));
    const children: unknown[] = [
      { object: "block", type: "callout", callout: { icon: { type: "emoji", emoji: "🔁" }, rich_text: [{ type: "text", text: { content:
        `Accepted report-quality proposals, auto-swept from report_quality_proposals on ${today}. Rows carry fix_ref → this ticket; flip them to 'shipped' once implemented + merged.${meta.note ? " ⚠️ " + meta.note : ""}` } }] } },
      // one bullet per proposal, capped to stay under Notion's 100-blocks-per-request limit
      ...props.slice(0, 90).map((p) => ({ object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content:
        `[${String(p.id).slice(0, 8)}] ${p.evidence?.company ?? "(unknown)"} — ${p.title} (${p.impact_estimate}, conf ${p.confidence}, risk ${p.risk}) → ${String(p.recommended_change ?? "").slice(0, 400)}`.slice(0, 1900) } }] } })),
    ];
    // deno-lint-ignore no-explicit-any
    let page: any = null;
    try {
      // Bounded: the sweep may run after the scoring loop has spent its wall-clock
      // budget, so a hung Notion connection must not push the function into the
      // ~150s gateway kill (which would strand tickets without fix_ref).
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
            Name: { title: [{ text: { content: `RQ sweep: ${meta.label} — ${props.length} accepted proposal${props.length === 1 ? "" : "s"} (${today})` } }] },
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
        continue;
      }
      page = data;
    } catch (e) {
      result.errors!.push(`${category}: ${String(e)}`);
      log("notion sweep exception", { category, error: String(e) });
      continue;
    }
    // The ticket now exists in Notion; if fix_ref isn't written the next sweep would
    // re-select these rows and create a duplicate ticket. Retry once, and surface a
    // loud error (sweepAndNotify posts it to Slack) if it still fails.
    const pageUrl: string = page?.url ?? "";
    if (!pageUrl) {
      result.errors!.push(`${category}: notion response had no url — fix_ref not set, next sweep will re-ticket`);
    } else {
      let updErr = (await supabase.from("report_quality_proposals")
        .update({ fix_ref: pageUrl }).in("id", props.map((p) => p.id))).error;
      if (updErr) {
        updErr = (await supabase.from("report_quality_proposals")
          .update({ fix_ref: pageUrl }).in("id", props.map((p) => p.id))).error;
      }
      if (updErr) result.errors!.push(`${category} fix_ref failed twice (${updErr.message}) — next sweep will duplicate this ticket: ${pageUrl}`);
      else result.ticketed += props.length;
    }
    result.created += 1;
    log("notion ticket created", { category, proposals: props.length, url: pageUrl });
  }
  if (!result.errors!.length) delete result.errors;
  return result;
}

// Run the Notion sweep and tell the channel what happened — a success note when tickets
// were created, a loud warning when anything failed (a silent sweep failure means
// accepted proposals pile up unticketed with no signal anywhere).
// deno-lint-ignore no-explicit-any
async function sweepAndNotify(supabase: any, channel: string): Promise<NotionSweepResult> {
  const sweep = await syncAcceptedToNotion(supabase);
  if (sweep.created > 0) {
    await postToSlack(channel, `Report-quality — ${sweep.ticketed} accepted proposals ticketed into Notion`, [
      { type: "section", text: { type: "mrkdwn", text: `🗂 *Notion sweep* — ${sweep.ticketed} accepted proposal(s) grouped into ${sweep.created} MES ticket(s). Each proposal's \`fix_ref\` now links to its ticket.` } },
    ]);
  }
  if (sweep.errors?.length) {
    await postToSlack(channel, "Report-quality — Notion sweep errors", [
      { type: "section", text: { type: "mrkdwn", text: `⚠️ *Notion sweep errors* — accepted proposals may not be ticketed:\n${sweep.errors.map((e) => `• ${e}`).join("\n")}`.slice(0, 2900) } },
    ]);
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
    const sweep = await sweepAndNotify(supabase, channel);
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

  const finish = async (status: string, fields: Record<string, unknown>, error?: string) => {
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

    const ranked = rankAndCap(allRows, PROPOSAL_CAP);
    const tokensUsed = inTok + outTok;
    const cost = { input_tokens: inTok, output_tokens: outTok, usd: Number(((inTok * PRICE_IN + outTok * PRICE_OUT) / 1_000_000).toFixed(4)) };

    // Persist proposals. A failed insert must NOT be reported as a successful run —
    // otherwise automation_runs shows success/proposed=N and Slack announces N proposals
    // while the queue stays empty (silent data loss). Capture the error and reflect the
    // count actually written.
    let insertError: string | null = null;
    let proposalsWritten = 0;
    // Generate ids client-side so the digest's Accept/Reject buttons are keyed to the
    // exact row, with no reliance on INSERT..RETURNING row order (not a PG contract).
    let insertedIds: string[] = [];
    if (!dryRun && runId && ranked.length) {
      const insertRows = ranked.map((r) => ({ ...r, id: crypto.randomUUID(), run_id: runId, status: "new" }));
      const { error: insErr } = await supabase.from("report_quality_proposals").insert(insertRows);
      if (insErr) { insertError = insErr.message; log("proposal insert error", insErr.message); }
      else { proposalsWritten = ranked.length; insertedIds = insertRows.map((r) => r.id); }
    } else if (dryRun) {
      proposalsWritten = ranked.length; // not persisted, but report what would be written
    }

    await finish(insertError ? "error" : "success", {
      reviewed, proposed: proposalsWritten, tokens_used: tokensUsed, cost,
      metadata: {
        batch_size: batchSize, token_budget: tokenBudget, lookback_days: lookbackDays,
        max_run_ms: maxRunMs, deadline_hit: deadlineHit, eligible: batch.length,
        model: ANTHROPIC_MODEL, rubric_version: RUBRIC_VERSION,
        avg_axes: { relevance: avg(axisRel), conciseness: avg(axisCon), fidelity: avg(axisFid) },
      },
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
        { type: "section", text: { type: "mrkdwn", text: `*Top recurring themes*\n${themes.length ? themes.map((t) => `${t.category} ×${t.count} — _${t.example}_`).join("\n") : "_none_"}` } },
        { type: "divider" },
      ];
      const top = ranked.slice(0, 5);
      if (!top.length) {
        blocks.push({ type: "section", text: { type: "mrkdwn", text: "*Top proposals*\n_none_" } });
      } else {
        blocks.push({ type: "section", text: { type: "mrkdwn", text: "*Top proposals* — ✅/❌ actions the proposal directly; the full queue is in `report_quality_proposals`:" } });
        top.forEach((r, i) => {
          blocks.push({ type: "section", text: { type: "mrkdwn", text:
            `• ${band(Math.round(r.confidence * 100))} *${r.category}* — ${r.title}  _(impact ${r.impact_estimate}, conf ${r.confidence}, risk ${r.risk})_ <${REPORT_BASE_URL}/${r.report_id}|↗>` } });
          if (insertedIds[i]) blocks.push(proposalActions(insertedIds[i]));
        });
      }
      blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: `propose-only · review in report_quality_proposals · rubric ${RUBRIC_VERSION}${deadlineHit ? ` · partial run (${reviewed}/${batch.length}; rest next run)` : ""} · ${new Date().toUTCString()}` }] });
    }
    if (!dryRun) await postToSlack(channel, insertError ? `Report-quality loop — write FAILED (${ranked.length} scored, 0 written)` : `Report-quality loop — ${proposalsWritten} proposals from ${reviewed} reports`, blocks);

    // --- Notion sweep: ticket anything accepted since the last run ----------------------
    // Runs after the digest so a sweep failure can never block scoring/logging/posting.
    // Skipped on deadline-hit runs: the wall-clock budget is already spent and even a
    // bounded sweep risks the ~150s gateway kill mid-write — it runs next cycle instead.
    let notionSweep: NotionSweepResult | undefined;
    if (!dryRun && !deadlineHit) notionSweep = await sweepAndNotify(supabase, channel);
    else if (deadlineHit) log("skipping notion sweep (deadline hit) — will run next cycle");

    return json({ ok: !insertError, error: insertError ?? undefined, reviewed, proposed: proposalsWritten, eligible: batch.length, deadline_hit: deadlineHit, tokens_used: tokensUsed, cost, notion: notionSweep, dry_run: dryRun, proposals: dryRun ? ranked : undefined });
  } catch (e) {
    log("run failed", String(e));
    await finish("error", { reviewed: 0, proposed: 0 }, String(e));
    return json({ ok: false, error: String(e) }, 500);
  }
});
