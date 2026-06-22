// kb-sync — pulls qualifying LinkedIn posts from MES Content Creator
// (rcgaviwbsudouvfwzydq) into MES Platform's mes_knowledge_base.
//
// MES owns what enters its product layer, so this function lives on MES and
// READS Content Creator via its anon key + the restricted `kb_sync_source`
// view (quality_score >= 70). Embeddings are COPIED (not regenerated):
// upsert_kb_linkedin_post sets embedded_hash = content_hash so the
// embed-knowledge cron never re-embeds these rows (zero embedding cost).
//
// Auth: verify_jwt = false; guarded by the x-internal-secret header
// (== KB_SYNC_SECRET), same pattern as process-email-queue. Invoked by
// pg_cron via pg_net for the incremental sync, or once with {"mode":"backfill"}.
//
// Body: { mode?: "backfill" | "incremental", batch_size?: number, max_batches?: number }
//   - backfill   : offset-paginates the whole view (robust to clustered synced_at)
//   - incremental: pulls rows with synced_at > stored watermark

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MES_URL = Deno.env.get("SUPABASE_URL")!;
const MES_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CC_URL = Deno.env.get("CONTENT_CREATOR_URL") ?? "";
const CC_ANON_KEY = Deno.env.get("CONTENT_CREATOR_ANON_KEY") ?? "";
const KB_SYNC_SECRET = Deno.env.get("KB_SYNC_SECRET") ?? "";

const SOURCE = "content_creator_linkedin";
const DEFAULT_BATCH = 200;

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { error: "method not allowed" });

  // Constant-ish guard. verify_jwt=false, so this header is the only gate.
  const provided = req.headers.get("x-internal-secret") ?? "";
  if (!KB_SYNC_SECRET || provided !== KB_SYNC_SECRET) {
    return json(401, { error: "unauthorized" });
  }
  if (!CC_URL || !CC_ANON_KEY) {
    return json(500, { error: "CONTENT_CREATOR_URL / CONTENT_CREATOR_ANON_KEY not configured" });
  }

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* defaults */ }
  const mode = body.mode === "backfill" ? "backfill" : "incremental";
  const batchSize = Math.min(Math.max(Number(body.batch_size) || DEFAULT_BATCH, 1), 500);
  const maxBatches = Math.min(Math.max(Number(body.max_batches) || 100, 1), 1000);

  const mes = createClient(MES_URL, MES_SERVICE_KEY, { auth: { persistSession: false } });
  const cc = createClient(CC_URL, CC_ANON_KEY, { auth: { persistSession: false } });

  // Resolve the incremental watermark.
  let watermark = "1970-01-01T00:00:00Z";
  if (mode === "incremental") {
    const { data: state } = await mes
      .from("kb_sync_state").select("last_synced_at").eq("source", SOURCE).maybeSingle();
    if (state?.last_synced_at) watermark = state.last_synced_at as string;
  }
  const watermarkBefore = watermark;

  let pulled = 0, upserted = 0, failed = 0, offset = 0;
  let maxSynced = watermark;
  const cols = "source_ref, content, title, embedding, post_url, post_date, engagement_score, quality_score, content_types, synced_at";

  for (let b = 0; b < maxBatches; b++) {
    let q = cc.from("kb_sync_source").select(cols)
      .order("synced_at", { ascending: true })
      .order("source_ref", { ascending: true }); // stable tiebreaker

    if (mode === "backfill") {
      q = q.range(offset, offset + batchSize - 1);
    } else {
      q = q.gt("synced_at", watermark).limit(batchSize);
    }

    const { data: rows, error } = await q;
    if (error) {
      return json(502, { error: `content creator read failed: ${error.message}`, pulled, upserted, failed });
    }
    if (!rows || rows.length === 0) break;
    pulled += rows.length;

    for (const r of rows as Array<Record<string, unknown>>) {
      const meta = {
        engagement_score: r.engagement_score ?? null,
        quality_score: r.quality_score ?? null,
        content_types: r.content_types ?? null,
        post_url: r.post_url ?? null,
        post_date: r.post_date ?? null,
      };
      const { error: upErr } = await mes.rpc("upsert_kb_linkedin_post", {
        p_source_ref: r.source_ref,
        p_content: r.content,
        p_embedding: r.embedding, // PostgREST returns vector as "[...]"; cast to vector server-side
        p_title: r.title ?? null,
        p_metadata: meta,
        p_embedding_model: "text-embedding-3-small",
      });
      if (upErr) { failed++; console.error("upsert failed", r.source_ref, upErr.message); }
      else { upserted++; }
      const s = r.synced_at as string | null;
      if (s && s > maxSynced) maxSynced = s;
    }

    offset += rows.length;
    if (mode === "incremental") {
      const last = rows[rows.length - 1] as Record<string, unknown>;
      if (last.synced_at) watermark = last.synced_at as string;
    }
    if (rows.length < batchSize) break;
  }

  await mes.from("kb_sync_state").upsert({
    source: SOURCE,
    last_synced_at: maxSynced,
    last_run_at: new Date().toISOString(),
    last_rows_synced: upserted,
  }, { onConflict: "source" });

  console.log(`kb-sync ${mode}: pulled=${pulled} upserted=${upserted} failed=${failed}`);
  return json(200, { ok: true, mode, pulled, upserted, failed, watermark_before: watermarkBefore, watermark_after: maxSynced });
});
