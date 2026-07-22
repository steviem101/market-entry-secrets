// supersede-insights — clusters near-duplicate knowledge_insight cards by embedding cosine
// similarity and marks ONE canonical card per cluster (metadata.cluster_id + is_canonical),
// so retrieval (Sub-ticket 3) returns one strong card instead of several stale vintage echoes.
//
// Structure mirrors distill-knowledge: Vault-backed x-internal-secret auth, gated OFF by default
// (runs only when SUPERSEDE_INSIGHTS_ENABLED is on, OR {"force":true}, OR {"dry_run":true}),
// automation_runs cost/telemetry. No LLM calls — pure vector maths in Postgres + union-find here.
// Write path is metadata-only (kb_apply_insight_clusters), so it never invalidates an embedding.
//
// Pilot: POST {"dry_run":true} -> returns cluster stats + sample, writes nothing.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { computeClusterDiff, summariseClusters, type CardField, type Edge } from "./cluster.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPERSEDE_ENABLED = ["on", "1", "true"].includes((Deno.env.get("SUPERSEDE_INSIGHTS_ENABLED") ?? "").toLowerCase());

// Default distiller version this pass clusters over. Kept as a local literal (not imported
// from the distiller) so the function is self-contained and deploys standalone; callers can
// override per request via body.distiller_version. Mirrors distill-knowledge's DISTILLER_VERSION.
const DEFAULT_DISTILLER_VERSION = "distill-v2";
const DEFAULT_THRESHOLD = 0.92;
const DEFAULT_K = 8;

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}
function jlog(level: string, msg: string, meta: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ fn: "supersede-insights", level, msg, ...meta }));
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { error: "method not allowed" });

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

  // Auth: Vault-backed internal secret (same as distill-knowledge / embed-knowledge).
  const presented = req.headers.get("x-internal-secret") ?? "";
  const { data: secretOk, error: secErr } = await supabase.rpc("kb_check_secret", { p_candidate: presented });
  if (secErr) { jlog("error", "secret check failed", { err: secErr.message }); return json(500, { error: "internal" }); }
  if (secretOk !== true) return json(401, { error: "unauthorized" });

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* defaults */ }
  const dryRun = body.dry_run === true;
  const force = body.force === true;
  const version = typeof body.distiller_version === "string" ? body.distiller_version : DEFAULT_DISTILLER_VERSION;
  const threshold = Math.min(Math.max(Number(body.threshold) || DEFAULT_THRESHOLD, 0.5), 1);
  const k = Math.min(Math.max(Math.trunc(Number(body.k) || DEFAULT_K), 1), 50);

  // Double gate: proceed only when enabled, or explicitly forced, or a dry-run preview.
  if (!SUPERSEDE_ENABLED && !force && !dryRun) {
    return json(200, { ok: true, disabled: true, message: "SUPERSEDE_INSIGHTS_ENABLED is off" });
  }

  const runStartedIso = new Date().toISOString();
  const runId = crypto.randomUUID();

  // 1. Candidate near-duplicate edges (server-side vector KNN, same topic_lane).
  const { data: edgeRows, error: edgeErr } = await supabase.rpc("kb_insight_neighbors", {
    p_distiller_version: version, p_threshold: threshold, p_k: k,
  });
  if (edgeErr) { jlog("error", "neighbors fetch failed", { err: edgeErr.message }); return json(500, { error: "neighbors failed" }); }
  const edges: Edge[] = (edgeRows ?? []).map((r: Record<string, unknown>) => ({
    id_a: String(r.id_a), id_b: String(r.id_b), sim: Number(r.sim),
  }));

  // 2. Per-card canonical-selection inputs + current cluster state.
  const { data: fieldRows, error: fieldErr } = await supabase.rpc("kb_insight_cluster_fields", { p_distiller_version: version });
  if (fieldErr) { jlog("error", "fields fetch failed", { err: fieldErr.message }); return json(500, { error: "fields failed" }); }
  const cards: CardField[] = (fieldRows ?? []).map((r: Record<string, unknown>) => ({
    id: String(r.id),
    publicationDate: (r.publication_date as string | null) ?? null,
    claimLen: Number(r.claim_len ?? 0),
    clusterId: (r.cluster_id as string | null) ?? null,
    isCanonical: r.is_canonical !== false,
  }));

  // 3. Cluster + diff (pure).
  const summary = summariseClusters(cards, edges);
  const diff = computeClusterDiff(cards, edges);

  // 4. Persist (skipped in dry-run so the pilot can preview without writing).
  let written = 0;
  if (!dryRun && diff.length) {
    const { data: n, error: wErr } = await supabase.rpc("kb_apply_insight_clusters", { p_rows: diff });
    if (wErr) { jlog("error", "cluster apply failed", { err: wErr.message }); return json(500, { error: "apply failed" }); }
    written = Number(n ?? 0);
  }

  // Telemetry (mirror distill-knowledge). No LLM tokens — clustering is free vector maths.
  await supabase.from("automation_runs").insert({
    loop: "supersede-insights", started_at: runStartedIso, finished_at: new Date().toISOString(),
    status: "success", reviewed: cards.length, proposed: diff.length, accepted: written,
    tokens_used: 0, cost: {},
    metadata: {
      run_id: runId, distiller_version: version, threshold, k, dry_run: dryRun,
      edges: edges.length, clusters: summary.clusters, cards_clustered: summary.cardsClustered,
    },
  });

  jlog("info", "run complete", { cards: cards.length, edges: edges.length, clusters: summary.clusters, diff: diff.length, written, dryRun });
  return json(200, {
    ok: true, dry_run: dryRun, distiller_version: version, threshold, k,
    ...summary, pending_writes: diff.length, written,
    // In a dry run, surface the largest clusters so the pass can be eyeballed before writing.
    sample: dryRun ? summary.largest : undefined,
  });
});
