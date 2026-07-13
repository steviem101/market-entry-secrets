// prompt-ab-rollup — nightly candidate-vs-active summary for the prompt A/B flywheel.
//
// Deterministic (no AI): compares each live CANDIDATE prompt (prompt_versions,
// status='candidate') against the ACTIVE prompt using report-level
// report_quality.report_score, attributing each recent report to its arm via
// report_json.metadata.prompt_ab (written by generate-report, Phase 4 PR-A). When
// a candidate clears the lift + min-sample bar it writes a propose-only
// promote/retire recommendation to prompt_ab_proposals and posts a Slack card with
// Accept/Dismiss buttons (handled by rq-slack-actions). Accepting flips status
// only — the actual prompt promotion still ships as a human migration/PR.
//
// Auth: x-webhook-secret == SLACK_NOTIFY_WEBHOOK_SECRET (verify_jwt=false).
// Gated on activity_event_routing event_type='prompt.ab.rollup' (channel + enabled).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { aggregateAb, type AbReportSample, type CandidateSpec, type AbSectionResult } from "./aggregate.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN") ?? "";
const WEBHOOK_SECRET = Deno.env.get("SLACK_NOTIFY_WEBHOOK_SECRET") ?? "";
const ROUTING_EVENT = "prompt.ab.rollup";
const DAY = 86400000;
const DEFAULT_LOOKBACK_DAYS = 30;
const MIN_N = Math.max(Number(Deno.env.get("PROMPT_AB_MIN_N")) || 20, 2);
const LIFT_THRESHOLD = Math.max(Number(Deno.env.get("PROMPT_AB_LIFT")) || 3, 0.1);
const SAMPLE_CAP = 5000; // hard bound on reports pulled per run

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(b: unknown, s = 200): Response {
  return new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });
}
function log(msg: string, data?: unknown): void {
  console.log(`[${new Date().toISOString()}] [prompt-ab-rollup] ${msg}`, data !== undefined ? JSON.stringify(data) : "");
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

/** Per-section grounding proxy (0–1) from the verifier telemetry. A section not
 *  listed in verification.sections had no unverified items → 1.0; if verification
 *  is absent we have no grounding sample for that report (returns null). */
// deno-lint-ignore no-explicit-any
function groundingForSection(verification: any, section: string): number | null {
  if (!verification || typeof verification !== "object") return null;
  const secs = Array.isArray(verification.sections) ? verification.sections : [];
  const row = secs.find((s: any) => s?.section === section);
  if (!row) return 1; // clean (not flagged) — verification ran, section had no unverified items
  const checked = (Number(row.numerals_checked) || 0) + (Number(row.entities_checked) || 0);
  if (checked <= 0) return 1;
  const unverified = (Number(row.unverified_numerals_count) || 0) + (Number(row.unverified_entities_count) || 0);
  return Math.max(0, 1 - unverified / checked);
}

function verdictEmoji(v: AbSectionResult["verdict"]): string {
  return v === "promote" ? "🚀" : v === "retire" ? "🗑️" : v === "inconclusive" ? "🤔" : "⏳";
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!WEBHOOK_SECRET || (req.headers.get("x-webhook-secret") ?? "") !== WEBHOOK_SECRET) return json({ error: "unauthorized" }, 401);

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* defaults */ }
  const lookbackDays = Math.max(Number(body.lookback_days) || DEFAULT_LOOKBACK_DAYS, 1);
  const dryRun = body.dry_run === true;

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

  const { data: rt } = await supabase.from("activity_event_routing")
    .select("channel_id,enabled").eq("event_type", ROUTING_EVENT).maybeSingle();
  if (!rt || !rt.enabled || !rt.channel_id) { log("loop disabled (routing flag off) — skipping"); return json({ ok: true, skipped: "loop_disabled" }); }
  const channel = rt.channel_id as string;

  // --- current candidate prompts --------------------------------------------------------
  const { data: candRows, error: candErr } = await supabase.from("prompt_versions")
    .select("section_name, version").eq("status", "candidate");
  if (candErr) return json({ ok: false, error: candErr.message }, 500);
  const candidates: CandidateSpec[] = (candRows ?? []).map((c) => ({ section: c.section_name, version: c.version ?? 1 }));
  if (candidates.length === 0) {
    log("no candidate prompts — nothing to compare");
    return json({ ok: true, candidates: 0, skipped: "no_candidates" });
  }

  // --- recent scored reports + their A/B arm --------------------------------------------
  const since = new Date(Date.now() - lookbackDays * DAY).toISOString();
  const { data: qrows, error: qErr } = await supabase.from("report_quality")
    .select("report_id, report_score").eq("report_status", "completed").gte("created_at", since).limit(SAMPLE_CAP);
  if (qErr) return json({ ok: false, error: qErr.message }, 500);
  const scoreById = new Map<string, number | null>();
  for (const r of qrows ?? []) scoreById.set(r.report_id, typeof r.report_score === "number" ? r.report_score : null);

  const ids = [...scoreById.keys()];
  const samples: AbReportSample[] = [];
  // Pull the A/B arm + verifier telemetry via JSON sub-paths (avoids fetching the
  // full report_json). Chunk the id list so the .in() filter stays bounded.
  for (let i = 0; i < ids.length; i += 500) {
    const chunk = ids.slice(i, i + 500);
    const { data: metaRows, error: mErr } = await supabase.from("user_reports")
      .select("id, prompt_ab:report_json->metadata->prompt_ab, verification:report_json->metadata->verification")
      .in("id", chunk);
    if (mErr) return json({ ok: false, error: mErr.message }, 500);
    for (const m of metaRows ?? []) {
      // deno-lint-ignore no-explicit-any
      const ab = (m as any).prompt_ab as { bucket?: boolean; variants?: Record<string, number> } | null;
      if (!ab) continue; // report predates Phase 4 telemetry — not part of any A/B
      const variants = ab.variants ?? {};
      const grounding: Record<string, number> = {};
      for (const { section } of candidates) {
        // deno-lint-ignore no-explicit-any
        const g = groundingForSection((m as any).verification, section);
        if (g !== null) grounding[section] = g;
      }
      samples.push({ bucket: ab.bucket === true, variants, score: scoreById.get((m as any).id) ?? null, grounding });
    }
  }

  const results = aggregateAb(samples, candidates, { minN: MIN_N, liftThreshold: LIFT_THRESHOLD });
  const actionable = results.filter((r) => r.verdict === "promote" || r.verdict === "retire");

  // --- persist propose-only rows for actionable verdicts (dedupe on open row) -----------
  const runId = crypto.randomUUID();
  const proposalIdByKey = new Map<string, string>();
  let proposalsWritten = 0;
  if (!dryRun && actionable.length) {
    // Skip candidates that already have an open ('new') proposal.
    const { data: openRows } = await supabase.from("prompt_ab_proposals")
      .select("section_name, candidate_version").eq("status", "new");
    const openKeys = new Set((openRows ?? []).map((o) => `${o.section_name}::${o.candidate_version}`));
    const toInsert = actionable.filter((r) => !openKeys.has(`${r.section}::${r.version}`));
    for (const r of toInsert) {
      const id = crypto.randomUUID();
      proposalIdByKey.set(`${r.section}::${r.version}`, id);
      const { error: insErr } = await supabase.from("prompt_ab_proposals").insert({
        id, run_id: runId, section_name: r.section, candidate_version: r.version, verdict: r.verdict,
        candidate_n: r.candidate.n, control_n: r.control.n,
        candidate_mean: r.candidate.meanScore, control_mean: r.control.meanScore,
        lift: r.lift, grounding_lift: r.groundingLift, status: "new",
        evidence: { candidate: r.candidate, control: r.control, min_n: MIN_N, lift_threshold: LIFT_THRESHOLD, lookback_days: lookbackDays },
      });
      if (insErr) { log("proposal insert error (continuing)", insErr.message); continue; }
      proposalsWritten += 1;
    }
  }

  // --- Slack digest ---------------------------------------------------------------------
  // deno-lint-ignore no-explicit-any
  const blocks: any[] = [
    { type: "header", text: { type: "plain_text", text: "🧪 Prompt A/B — nightly rollup" } },
    { type: "context", elements: [{ type: "mrkdwn", text: `min n *${MIN_N}*/arm · lift bar *${LIFT_THRESHOLD}* pts · lookback *${lookbackDays}d* · ${samples.length} reports` }] },
  ];
  for (const r of results) {
    const liftTxt = r.lift === null ? "—" : `${r.lift > 0 ? "+" : ""}${r.lift}`;
    const grTxt = r.groundingLift === null ? "" : ` · grounding ${r.groundingLift > 0 ? "+" : ""}${r.groundingLift}`;
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: `${verdictEmoji(r.verdict)} *${r.section}* v${r.version} — *${r.verdict}*\n` +
        `cand ${r.candidate.meanScore ?? "—"} (n=${r.candidate.n}) vs active ${r.control.meanScore ?? "—"} (n=${r.control.n}) · lift *${liftTxt}*${grTxt}` },
    });
    const pid = proposalIdByKey.get(`${r.section}::${r.version}`);
    if (pid) {
      blocks.push({
        type: "actions",
        elements: [
          { type: "button", style: "primary", text: { type: "plain_text", text: r.verdict === "promote" ? "✅ Accept (promote)" : "✅ Accept (retire)" }, action_id: `ab_accept_${pid}`, value: pid },
          { type: "button", text: { type: "plain_text", text: "❌ Dismiss" }, action_id: `ab_dismiss_${pid}`, value: pid },
        ],
      });
    }
  }
  blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: "_Accepting flips the proposal only — promotion ships as a migration/PR (copy the candidate body into report_templates, retire the version)._" }] });

  const slack = await postToSlack(channel, "Prompt A/B — nightly rollup", blocks);
  if (!slack.ok) log("slack post failed", slack.error);

  return json({ ok: true, candidates: candidates.length, samples: samples.length, results, proposals_written: proposalsWritten, dry_run: dryRun });
});
