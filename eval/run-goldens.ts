// MES-148 Phase 1c — golden-set eval runner (Deno).
//
// Replays every frozen intake in eval/goldens/ against a target Supabase
// environment, waits for generate-report to complete, judge-scores each
// section against the fixed rubric (judge.ts), persists a row per golden to
// eval_runs, and fails (exit 1) when any section's mean score drops >= 1.0
// versus the committed eval/baselines.json.
//
// Usage:
//   deno run --allow-net --allow-env --allow-read --allow-write eval/run-goldens.ts [--update-baseline] [--goldens id1,id2]
//
// The runner SELF-CLEANS: each golden's intake (and, by FK cascade, its report)
// is deleted after judging, so a run leaves zero residue in the target env. That
// makes pointing at prod acceptable — it's the only env with real directory data
// to match against — with one caveat: EVAL_SERVICE_ROLE_KEY would then be the prod
// service-role key living in CI (see eval/README.md). Set EVAL_KEEP_ROWS=1 to keep
// rows when debugging.
//
// Required env (see eval/README.md):
//   EVAL_SUPABASE_URL        target project URL (prod is fine — the runner cleans up after itself)
//   EVAL_SUPABASE_ANON_KEY   anon key of the target env
//   EVAL_SERVICE_ROLE_KEY    service-role key of the target env (report_json read + eval_runs write)
//   EVAL_USER_EMAIL/PASSWORD dedicated eval user in the target env (owns the intakes)
//   ANTHROPIC_API_KEY        judge model access
// Optional:
//   RUN_LABEL                label stored on eval_runs rows (default: local-<iso date>)
//   EVAL_JUDGE_MODEL         judge override (default claude-sonnet-4-6 — keep pinned; judge drift = rubric drift)
//
// NOTE: generate-report is rate-limited to 5 reports/60min/user, so a full run
// of >5 goldens against one eval user will 429 — keep the set <=5 per hour or
// shard eval users.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildJudgePrompt,
  parseJudgeResponse,
  compareToBaseline,
  summarizeScores,
  RUBRIC_VERSION,
  type BaselineFile,
  type Regression,
  type SectionScores,
} from "./judge.ts";

const GOLDENS_DIR = new URL("./goldens/", import.meta.url);
const BASELINES_PATH = new URL("./baselines.json", import.meta.url);
const POLL_INTERVAL_MS = 10_000;
const POLL_TIMEOUT_MS = 12 * 60_000;
const JUDGE_TIMEOUT_MS = 120_000;
const JUDGE_MODEL = Deno.env.get("EVAL_JUDGE_MODEL") || "claude-sonnet-4-6";

function requiredEnv(name: string): string | null {
  // Trim: GitHub Actions secrets frequently keep a trailing newline from a
  // copy-paste, and a stray "\n"/space on the URL or a key breaks the request
  // path ("Invalid path specified in request URL" on sign-in) or the apikey.
  const v = Deno.env.get(name)?.trim();
  return v ? v : null;
}

const env = {
  // Also strip a trailing slash so a URL saved as ".../supabase.co/" doesn't
  // produce a double-slash auth path that Supabase rejects.
  url: requiredEnv("EVAL_SUPABASE_URL")?.replace(/\/+$/, "") ?? null,
  anonKey: requiredEnv("EVAL_SUPABASE_ANON_KEY"),
  serviceKey: requiredEnv("EVAL_SERVICE_ROLE_KEY"),
  email: requiredEnv("EVAL_USER_EMAIL"),
  password: requiredEnv("EVAL_USER_PASSWORD"),
  anthropicKey: requiredEnv("ANTHROPIC_API_KEY"),
};

// Missing configuration is a SKIP, not a failure — the workflow stays green on
// forks / repos without eval secrets, and the README documents setup.
const ENV_NAMES: Record<string, string> = {
  url: "EVAL_SUPABASE_URL",
  anonKey: "EVAL_SUPABASE_ANON_KEY",
  serviceKey: "EVAL_SERVICE_ROLE_KEY",
  email: "EVAL_USER_EMAIL",
  password: "EVAL_USER_PASSWORD",
  anthropicKey: "ANTHROPIC_API_KEY",
};
const missing = Object.entries(env).filter(([, v]) => !v).map(([k]) => ENV_NAMES[k] ?? k);
if (missing.length > 0) {
  console.log(`SKIPPED: eval environment not configured (missing: ${missing.join(", ")}). See eval/README.md.`);
  Deno.exit(0);
}

const updateBaseline = Deno.args.includes("--update-baseline");
// Accept both `--goldens a,b` and `--goldens=a,b`. The equals-form value is
// read from the flag token itself; the space-form value is the NEXT token only
// when it isn't itself a flag (so `--goldens=x --update-baseline` doesn't grab
// `--update-baseline` as the filter).
function parseGoldenFilter(): string[] | null {
  const eq = Deno.args.find((a) => a.startsWith("--goldens="));
  if (eq) return eq.slice("--goldens=".length).split(",").filter(Boolean);
  const i = Deno.args.indexOf("--goldens");
  if (i === -1) return null;
  const next = Deno.args[i + 1];
  return (next && !next.startsWith("--") ? next : "").split(",").filter(Boolean);
}
const goldenFilter = parseGoldenFilter();
const runLabel = Deno.env.get("RUN_LABEL") || `local-${new Date().toISOString().slice(0, 16)}`;

interface Golden {
  golden_id: string;
  description: string;
  intake: Record<string, unknown>;
}

async function loadGoldens(): Promise<Golden[]> {
  const goldens: Golden[] = [];
  for await (const entry of Deno.readDir(GOLDENS_DIR)) {
    if (!entry.isFile || !entry.name.endsWith(".json")) continue;
    const g = JSON.parse(await Deno.readTextFile(new URL(entry.name, GOLDENS_DIR))) as Golden;
    if (goldenFilter && !goldenFilter.includes(g.golden_id)) continue;
    goldens.push(g);
  }
  return goldens.sort((a, b) => a.golden_id.localeCompare(b.golden_id));
}

async function callJudge(prompt: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), JUDGE_TIMEOUT_MS);
  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.anthropicKey!,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: JUDGE_MODEL,
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: controller.signal,
    });
    if (!resp.ok) {
      console.error(`  judge call failed: status ${resp.status}`);
      return null;
    }
    const data = await resp.json();
    // Text blocks only — a non-text block would otherwise contribute "".
    return (data.content || [])
      .filter((b: { type?: string }) => b?.type === "text")
      .map((b: { text?: string }) => b?.text || "")
      .join("") || null;
  } catch (e) {
    console.error("  judge call threw:", e instanceof Error ? e.message : e);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const goldens = await loadGoldens();
  if (goldens.length === 0) {
    console.error("No goldens found (filter too narrow?)");
    Deno.exit(1);
  }
  console.log(`Golden eval: ${goldens.length} golden(s), run_label=${runLabel}, judge=${JUDGE_MODEL}`);

  let baseline: BaselineFile | null = null;
  try {
    baseline = JSON.parse(await Deno.readTextFile(BASELINES_PATH)) as BaselineFile;
  } catch {
    console.log("No readable eval/baselines.json — regression gate inactive this run.");
  }
  // A baseline is only comparable when it was produced by the SAME rubric AND
  // judge model — otherwise a diff measures the judge change, not the pipeline.
  // On mismatch, deactivate the gate (loud warning) rather than compare across
  // incompatible judges. --update-baseline re-stamps and adopts the current set.
  if (baseline && !updateBaseline) {
    const rubricOk = !baseline.rubric_version || baseline.rubric_version === RUBRIC_VERSION;
    const judgeOk = !baseline.judge_model || baseline.judge_model === JUDGE_MODEL;
    if (!rubricOk || !judgeOk) {
      console.warn(
        `⚠︎ baseline incompatible (baseline rubric=${baseline.rubric_version}/judge=${baseline.judge_model} ` +
        `vs current rubric=${RUBRIC_VERSION}/judge=${JUDGE_MODEL}) — regression gate DISABLED this run. Re-baseline with --update-baseline.`,
      );
      baseline = null;
    }
  }

  const userClient = createClient(env.url!, env.anonKey!);
  const { data: auth, error: authErr } = await userClient.auth.signInWithPassword({
    email: env.email!,
    password: env.password!,
  });
  if (authErr || !auth.session) {
    console.error("Eval user sign-in failed:", authErr?.message);
    Deno.exit(1);
  }
  const service = createClient(env.url!, env.serviceKey!);

  const allRegressions: Regression[] = [];
  const newBaseline: BaselineFile = { rubric_version: RUBRIC_VERSION, judge_model: JUDGE_MODEL, goldens: { ...(baseline?.goldens ?? {}) } };
  let judgeFailures = 0;
  // Rate-limited goldens are a SKIP, not a failure: generate-report caps a user at
  // 5 reports/60min, so a burst (or a run before EVAL_BYPASS_USER_ID is live in the
  // target env) must not red-fail the gate — it just means reduced coverage this run.
  let rateLimited = 0;

  for (const golden of goldens) {
    console.log(`\n── ${golden.golden_id} ──`);

    // 1. Insert the frozen intake for the eval user.
    const { data: intakeRow, error: intakeErr } = await userClient
      .from("user_intake_forms")
      .insert({ ...golden.intake, user_id: auth.session.user.id, status: "pending" })
      .select("id")
      .single();
    if (intakeErr || !intakeRow) {
      console.error("  intake insert failed:", intakeErr?.message);
      judgeFailures++;
      continue;
    }

    // Everything after the intake exists runs inside try/finally so the cleanup
    // ALWAYS fires (success, early-continue, or throw) — the eval leaves ZERO
    // residue in the target env, which is what makes pointing EVAL_* at prod safe:
    // no junk intake/report rows polluting counts or admin views. Deleting the
    // intake CASCADEs to its user_reports row (FK ON DELETE CASCADE); the eval_runs
    // telemetry row survives because its report_id FK is ON DELETE SET NULL. Set
    // EVAL_KEEP_ROWS=1 to retain rows when debugging a specific run.
    try {
      // 2. Kick off generation.
      const genResp = await fetch(`${env.url}/functions/v1/generate-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.session.access_token}`,
        },
        body: JSON.stringify({ intake_form_id: intakeRow.id }),
      });
      const genJson = await genResp.json().catch(() => ({}));
      if (genResp.status === 429) {
        // Rate limited — skip, don't fail. (The finally still cleans up the intake.)
        console.warn(`  SKIP: rate-limited (429) — ${JSON.stringify(genJson)}`);
        rateLimited++;
        continue;
      }
      if (!genResp.ok || !genJson.report_id) {
        console.error(`  generate-report failed: ${genResp.status} ${JSON.stringify(genJson)}`);
        judgeFailures++;
        continue;
      }
      const reportId = genJson.report_id as string;
      console.log(`  report ${reportId} processing…`);

      // 3. Poll to completion.
      const deadline = Date.now() + POLL_TIMEOUT_MS;
      let status = "processing";
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        const { data } = await service.from("user_reports").select("status").eq("id", reportId).single();
        status = data?.status ?? status;
        if (status === "completed" || status === "failed") break;
      }
      if (status !== "completed") {
        console.error(`  report did not complete (status=${status})`);
        judgeFailures++;
        continue;
      }

      // 4. Read the full report (service role — evaluates ALL sections regardless of tier).
      const { data: reportRow } = await service
        .from("user_reports")
        .select("report_json")
        .eq("id", reportId)
        .single();
      const reportJson = reportRow?.report_json as Record<string, any> | undefined;
      const sectionsObj = (reportJson?.sections ?? {}) as Record<string, { content?: string }>;
      const sectionList = Object.entries(sectionsObj)
        .filter(([, v]) => (v?.content || "").trim())
        .map(([name, v]) => ({ name, content: String(v.content) }));
      if (sectionList.length === 0) {
        console.error("  completed report has no section content");
        judgeFailures++;
        continue;
      }
      const verification = reportJson?.metadata?.verification ?? null;
      if (verification) {
        console.log(`  verifier: ${JSON.stringify(verification.totals ?? {})}`);
      }

      // 5. Judge (one retry on parse failure).
      let scores: Record<string, SectionScores> | null = null;
      for (let attempt = 1; attempt <= 2 && !scores; attempt++) {
        const raw = await callJudge(buildJudgePrompt(golden, sectionList));
        scores = raw ? parseJudgeResponse(raw, sectionList.map((s) => s.name)) : null;
        if (!scores) console.warn(`  judge attempt ${attempt} failed validation`);
      }
      if (!scores) {
        judgeFailures++;
        continue;
      }

      const summary = summarizeScores(scores);
      console.log(`  overall ${summary.overall} — ${JSON.stringify(summary.per_section)}`);

      // 6. Persist telemetry (best-effort). report_id is retained here but the
      // report row itself is deleted in the finally — the FK nulls it, the scores
      // and verification totals live on in eval_runs.
      const { error: evalErr } = await service.from("eval_runs").insert({
        run_label: runLabel,
        golden_id: golden.golden_id,
        report_id: reportId,
        judge_model: JUDGE_MODEL,
        rubric_version: RUBRIC_VERSION,
        sections: scores,
        overall: summary.overall,
        verification,
        baseline: updateBaseline,
      });
      if (evalErr) console.error("  eval_runs insert failed (continuing):", evalErr.message);

      // 7. Gate vs baseline / collect new baseline.
      allRegressions.push(...compareToBaseline(golden.golden_id, scores, baseline));
      newBaseline.goldens[golden.golden_id] = scores;
    } finally {
      // Self-cleanup: remove the intake (and, by cascade, its report) so the eval
      // leaves nothing behind in the target env. Best-effort — a failed delete is
      // logged, never fatal, and never masks the run result.
      if (Deno.env.get("EVAL_KEEP_ROWS") !== "1") {
        const { error: delErr } = await service.from("user_intake_forms").delete().eq("id", intakeRow.id);
        if (delErr) console.error(`  cleanup: intake delete failed (leaves residue): ${delErr.message}`);
        else console.log("  cleaned up eval intake + report");
      }
    }
  }

  if (updateBaseline) {
    await Deno.writeTextFile(BASELINES_PATH, JSON.stringify(newBaseline, null, 2) + "\n");
    console.log("\nBaselines updated — commit eval/baselines.json to adopt them.");
  }

  console.log("\n── Result ──");
  if (rateLimited > 0) {
    console.warn(`${rateLimited} golden(s) skipped (rate-limited) — not counted as failures.`);
  }
  if (judgeFailures > 0) {
    console.error(`${judgeFailures} golden(s) failed to generate or judge.`);
  }
  if (allRegressions.length > 0) {
    console.error("REGRESSIONS (section mean dropped >= 1.0 vs baseline):");
    for (const r of allRegressions) {
      console.error(`  ${r.golden_id} / ${r.section}: ${r.baseline_mean} → ${r.current_mean} (${r.delta})`);
    }
  }
  if (allRegressions.length > 0 || judgeFailures > 0) Deno.exit(1);
  console.log("Golden eval passed.");
}

await main();
