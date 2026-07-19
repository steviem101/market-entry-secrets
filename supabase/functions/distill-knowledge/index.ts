// distill-knowledge — turns embedded knowledge_chunk rows into atomic insight cards
// (entity_type='knowledge_insight') via Claude Haiku. Sub-ticket 2B.
//
// Structure mirrors embed-knowledge (Vault-backed x-internal-secret auth, batch cap,
// resumable queue) + report-quality-loop (Anthropic call + automation_runs cost log).
//
// GATED OFF by default: runs only when DISTILL_KNOWLEDGE_ENABLED is on, OR the caller
// passes {"force":true} (post-pilot fan-out) or {"dry_run":true} (pilot preview — returns
// cards without writing). Pilot: POST {"dry_run":true,"parent_ids":["<docA>","<docB>"]}.
//
// Persistence is set-based: upsert_kb_knowledge_insights + log_knowledge_distill (one row
// per chunk, kept or skipped-with-reason). Every processed chunk is logged — nothing is
// silently dropped. Insight embeddings are left null for the embed-knowledge cron.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildDistillPrompt, parseDistillResponse, DISTILLER_VERSION, isTooThin, type ChunkInput, type InsightCard, type SkipReason } from "./distillCard.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const DISTILL_ENABLED = ["on", "1", "true"].includes((Deno.env.get("DISTILL_KNOWLEDGE_ENABLED") ?? "").toLowerCase());

const HAIKU_MODEL = "claude-haiku-4-5-20251001";
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const MAX_RUN_MS = 95_000;         // stay under the function compute limit
const MAX_TOKENS = 1024;           // per-chunk output cap
const ANTHROPIC_TIMEOUT_MS = 30_000;

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}
function jlog(level: string, msg: string, meta: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ fn: "distill-knowledge", level, msg, ...meta }));
}

interface HaikuResult { text: string; input_tokens: number; output_tokens: number; }

async function callHaiku(system: string, user: string): Promise<HaikuResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ANTHROPIC_TIMEOUT_MS);
  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: HAIKU_MODEL, max_tokens: MAX_TOKENS, temperature: 0, system,
        messages: [{ role: "user", content: user }],
      }),
      signal: controller.signal,
    });
    if (!resp.ok) throw new Error(`anthropic ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
    const j = await resp.json();
    const text = (j.content ?? []).filter((b: any) => b.type === "text").map((b: any) => b.text).join("");
    return { text, input_tokens: j.usage?.input_tokens ?? 0, output_tokens: j.usage?.output_tokens ?? 0 };
  } finally { clearTimeout(timer); }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { error: "method not allowed" });

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

  // Auth: Vault-backed internal secret (same as embed-knowledge).
  const presented = req.headers.get("x-internal-secret") ?? "";
  const { data: secretOk, error: secErr } = await supabase.rpc("kb_check_secret", { p_candidate: presented });
  if (secErr) { jlog("error", "secret check failed", { err: secErr.message }); return json(500, { error: "internal" }); }
  if (secretOk !== true) return json(401, { error: "unauthorized" });

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* defaults */ }
  const dryRun = body.dry_run === true;
  const force = body.force === true;
  const limit = Math.min(Math.max(Number(body.limit) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const parentIds = Array.isArray(body.parent_ids) ? (body.parent_ids as string[]).filter((s) => typeof s === "string") : null;

  // Double gate: proceed only when enabled, or explicitly forced, or a dry-run preview.
  if (!DISTILL_ENABLED && !force && !dryRun) return json(200, { ok: true, disabled: true, message: "DISTILL_KNOWLEDGE_ENABLED is off" });
  if (!ANTHROPIC_API_KEY) return json(503, { error: "ANTHROPIC_API_KEY not configured" });

  // Fetch the work set: targeted parents (pilot) or the undistilled queue.
  let chunks: ChunkInput[] = [];
  if (parentIds && parentIds.length) {
    const { data, error } = await supabase.from("mes_knowledge_base")
      .select("id, content, metadata")
      .eq("entity_type", "knowledge_chunk")
      .in("metadata->>parent_id", parentIds)
      .limit(limit);
    if (error) { jlog("error", "parent fetch failed", { err: error.message }); return json(500, { error: "queue fetch failed" }); }
    chunks = (data ?? []) as ChunkInput[];
  } else {
    const { data, error } = await supabase.rpc("kb_undistilled_chunks", { p_distiller_version: DISTILLER_VERSION, p_limit: limit });
    if (error) { jlog("error", "queue fetch failed", { err: error.message }); return json(500, { error: "queue fetch failed" }); }
    chunks = (data ?? []) as ChunkInput[];
  }

  const started = Date.now();
  const runStartedIso = new Date().toISOString();
  const runId = crypto.randomUUID();
  const allCards: InsightCard[] = [];
  const logRows: Array<Record<string, unknown>> = [];
  // One prune row per chunk that was actually distilled (skip errored chunks so their prior
  // insights survive a retry). keep_refs = the refs this run produced; the RPC deletes the
  // chunk's other knowledge_insight rows so re-distills don't orphan stale/reordered cards.
  const pruneRows: Array<{ chunk_kb_id: string; keep_refs: string[] }> = [];
  let processed = 0, inTok = 0, outTok = 0, errors = 0;
  const skipTally: Record<string, number> = {};

  for (const chunk of chunks) {
    if (Date.now() - started > MAX_RUN_MS) { jlog("info", "run budget reached", { processed }); break; }

    // Cheap pre-filter: skip too-thin chunks before paying for a Haiku call.
    if (isTooThin(chunk.content)) {
      processed++;
      skipTally["too_thin"] = (skipTally["too_thin"] ?? 0) + 1;
      logRows.push({
        chunk_kb_id: chunk.id, distiller_version: DISTILLER_VERSION,
        distilled: false, skip_reason: "too_thin", insight_count: 0, insight_refs: [],
        run_id: runId, metadata: {},
      });
      pruneRows.push({ chunk_kb_id: chunk.id, keep_refs: [] });
      continue;
    }

    const { system, user } = buildDistillPrompt(chunk);
    let cards: InsightCard[] = [], skip: SkipReason | null = null;
    try {
      const r = await callHaiku(system, user);
      inTok += r.input_tokens; outTok += r.output_tokens;
      ({ cards, skip } = parseDistillResponse(r.text, chunk));
    } catch (e) {
      errors++; skip = "error";
      jlog("error", "haiku call failed", { chunk: chunk.id, err: e instanceof Error ? e.message : String(e) });
    }
    processed++;
    if (cards.length) allCards.push(...cards);
    else if (skip) skipTally[skip] = (skipTally[skip] ?? 0) + 1;
    logRows.push({
      chunk_kb_id: chunk.id, distiller_version: DISTILLER_VERSION,
      distilled: cards.length > 0, skip_reason: cards.length ? null : skip,
      insight_count: cards.length, insight_refs: cards.map((c) => c.insight_ref),
      run_id: runId, metadata: {},
    });
    // Prune this chunk's superseded insights — but NOT when the call errored, so a transient
    // failure doesn't wipe insights that a later retry will regenerate.
    if (skip !== "error") pruneRows.push({ chunk_kb_id: chunk.id, keep_refs: cards.map((c) => c.insight_ref) });
  }

  // Persist (skipped in dry-run so the pilot can preview without writing).
  let inserted = 0;
  if (!dryRun) {
    if (allCards.length) {
      const { error: upErr } = await supabase.rpc("upsert_kb_knowledge_insights", { p_rows: allCards });
      if (upErr) { jlog("error", "insight upsert failed", { err: upErr.message }); }
      else inserted = allCards.length;
    }
    // Prune superseded cards AFTER upsert so this run's refs are already present.
    if (pruneRows.length) {
      const { error: prErr } = await supabase.rpc("prune_chunk_insights", { p_rows: pruneRows });
      if (prErr) jlog("error", "insight prune failed", { err: prErr.message });
    }
    if (logRows.length) {
      const { error: logErr } = await supabase.rpc("log_knowledge_distill", { p_rows: logRows });
      if (logErr) jlog("error", "distill log failed", { err: logErr.message });
    }
  }

  // Cost/telemetry (mirror report-quality-loop). Logged ALWAYS — a dry run still spends Haiku
  // tokens, so the cost must be attributed; metadata.dry_run distinguishes preview from write.
  await supabase.from("automation_runs").insert({
    loop: "distill-knowledge", started_at: runStartedIso, finished_at: new Date().toISOString(),
    status: errors && !inserted ? "error" : "success", reviewed: processed, proposed: allCards.length, accepted: inserted,
    tokens_used: inTok + outTok, cost: { input_tokens: inTok, output_tokens: outTok, model: HAIKU_MODEL },
    error: errors ? `${errors} chunk error(s)` : null,
    metadata: { distiller_version: DISTILLER_VERSION, run_id: runId, skips: skipTally, targeted: !!parentIds, dry_run: dryRun },
  });

  jlog("info", "run complete", { processed, cards: allCards.length, inserted, dryRun, skips: skipTally });
  return json(200, {
    ok: true, dry_run: dryRun, distiller_version: DISTILLER_VERSION,
    processed, cards: allCards.length, inserted, skips: skipTally,
    tokens: { input: inTok, output: outTok },
    // In a dry run, return the cards so the pilot can eyeball quality.
    sample: dryRun ? allCards.slice(0, 20) : undefined,
  });
});
