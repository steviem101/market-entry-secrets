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
// Required env (see eval/README.md):
//   EVAL_SUPABASE_URL        target project URL (use a PREVIEW/staging env, never prod)
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
  const v = Deno.env.get(name);
  return v && v.trim() ? v : null;
}

const env = {
  url: requiredEnv("EVAL_SUPABASE_URL"),
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
const goldenFilterArg = Deno.args.find((a) => a.startsWith("--goldens"));
const goldenFilter = goldenFilterArg
  ? (Deno.args[Deno.args.indexOf(goldenFilterArg) + 1] || goldenFilterArg.split("=")[1] || "").split(",").filter(Boolean)
  : null;
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
    return (data.content || []).map((b: { text?: string }) => b?.text || "").join("") || null;
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
  const newBaseline: BaselineFile = { rubric_version: RUBRIC_VERSION, goldens: { ...(baseline?.goldens ?? {}) } };
  let judgeFailures = 0;

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

    // 6. Persist telemetry (best-effort).
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
  }

  if (updateBaseline) {
    await Deno.writeTextFile(BASELINES_PATH, JSON.stringify(newBaseline, null, 2) + "\n");
    console.log("\nBaselines updated — commit eval/baselines.json to adopt them.");
  }

  console.log("\n── Result ──");
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
