// kb-sync — pulls qualifying content from MES Content Creator
// (rcgaviwbsudouvfwzydq) into MES Platform's mes_knowledge_base.
//
// MES owns what enters its product layer, so this function lives on MES and
// READS Content Creator via its anon key (never writes to it). Sources:
//   * content_creator_linkedin        — kb_sync_source view (quality_score >= 70)
//   * content_creator_document_chunk  — document_chunks JOIN parents
//                                        (source_documents / youtube_videos /
//                                         reddit_threads / podcast_episodes /
//                                         call_recordings) — Sub-ticket 1B
//   * content_creator_research_cache   — research_cache — Sub-ticket 1B
//
// Embeddings are COPIED when the source row has one (embedded_hash = content_hash so
// embed-knowledge skips it — zero cost); rows without an embedding sync with
// embedding=null and the embed-knowledge cron fills them.
//
// Auth: verify_jwt = false; guarded by x-internal-secret == KB_SYNC_SECRET.
// Modes: "incremental" (watermark per source), "backfill"/"reconcile" (full paged
// re-upsert — the backstop for in-place source edits that the created_at/synced_at
// watermark cannot see). `source` selects one lane or "all" (default). All upserts are
// SET-BASED (one RPC per batch) to stay under the compute limit.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildChunkRow, buildResearchRow, type ParentKind, type RawChunk } from "./buildKbRows.ts";

const MES_URL = Deno.env.get("SUPABASE_URL")!;
const MES_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CC_URL = Deno.env.get("CONTENT_CREATOR_URL") ?? "";
const CC_ANON_KEY = Deno.env.get("CONTENT_CREATOR_ANON_KEY") ?? "";
const KB_SYNC_SECRET = Deno.env.get("KB_SYNC_SECRET") ?? "";

const SRC_LINKEDIN = "content_creator_linkedin";
const SRC_CHUNK = "content_creator_document_chunk";
const SRC_RESEARCH = "content_creator_research_cache";
const DEFAULT_BATCH = 100;

type Mode = "incremental" | "full";
interface SyncResult { source: string; pulled: number; upserted: number; failed: number; watermark_before: string; watermark_after: string; }

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

async function getWatermark(mes: any, source: string): Promise<string> {
  const { data } = await mes.from("kb_sync_state").select("last_synced_at").eq("source", source).maybeSingle();
  return (data?.last_synced_at as string) ?? "1970-01-01T00:00:00Z";
}

async function setWatermark(mes: any, source: string, maxSynced: string, rows: number): Promise<void> {
  await mes.from("kb_sync_state").upsert({
    source, last_synced_at: maxSynced, last_run_at: new Date().toISOString(), last_rows_synced: rows,
  }, { onConflict: "source" });
}

// ── LinkedIn (unchanged behaviour, via the kb_sync_source view) ──────────────
async function syncLinkedIn(mes: any, cc: any, mode: Mode, batchSize: number, maxBatches: number): Promise<SyncResult> {
  let watermark = mode === "incremental" ? await getWatermark(mes, SRC_LINKEDIN) : "1970-01-01T00:00:00Z";
  const watermarkBefore = watermark;
  let pulled = 0, upserted = 0, failed = 0, offset = 0, maxSynced = watermark;
  const cols = "source_ref, content, title, embedding, post_url, post_date, engagement_score, quality_score, content_types, synced_at";

  for (let b = 0; b < maxBatches; b++) {
    let q = cc.from("kb_sync_source").select(cols)
      .order("synced_at", { ascending: true }).order("source_ref", { ascending: true });
    q = mode === "incremental" ? q.gt("synced_at", watermark).limit(batchSize) : q.range(offset, offset + batchSize - 1);
    const { data: rows, error } = await q;
    if (error) return { source: SRC_LINKEDIN, pulled, upserted, failed, watermark_before: watermarkBefore, watermark_after: maxSynced };
    if (!rows || rows.length === 0) break;
    pulled += rows.length;

    const payload = (rows as Array<Record<string, unknown>>).map((r) => ({
      source_ref: r.source_ref, content: r.content, title: r.title ?? null,
      embedding: r.embedding ?? null, embedding_model: "text-embedding-3-small",
      metadata: {
        engagement_score: r.engagement_score ?? null, quality_score: r.quality_score ?? null,
        content_types: r.content_types ?? null, post_url: r.post_url ?? null, post_date: r.post_date ?? null,
      },
    }));
    const { error: upErr } = await mes.rpc("upsert_kb_linkedin_posts", { p_rows: payload });
    if (upErr) { failed += rows.length; console.error("linkedin upsert failed", upErr.message); } else { upserted += rows.length; }

    for (const r of rows as Array<Record<string, unknown>>) {
      const s = r.synced_at as string | null;
      if (s && s > maxSynced) maxSynced = s;
    }
    offset += rows.length;
    if (mode === "incremental" && rows.length) watermark = (rows[rows.length - 1] as any).synced_at as string;
    if (rows.length < batchSize) break;
  }
  await setWatermark(mes, SRC_LINKEDIN, maxSynced, upserted);
  return { source: SRC_LINKEDIN, pulled, upserted, failed, watermark_before: watermarkBefore, watermark_after: maxSynced };
}

// ── Knowledge chunks (document / youtube / reddit / podcast / call) ──────────
// document_chunks is polymorphic — each row points at exactly one parent. We read a
// page of chunks (watermark on created_at), bulk-fetch the parents referenced in that
// page, join in memory, and set-upsert. Parent lookups are done per kind, not per row.
const PARENTS: Record<ParentKind, { fk: string; table: string; cols: string; title: string; url: string | null }> = {
  document: { fk: "document_id",       table: "source_documents", cols: "id, file_name, content_types",        title: "file_name", url: null },
  youtube:  { fk: "youtube_video_id",  table: "youtube_videos",   cols: "id, title, video_url, content_types", title: "title",     url: "video_url" },
  reddit:   { fk: "reddit_thread_id",  table: "reddit_threads",   cols: "id, title, thread_url, content_types",title: "title",     url: "thread_url" },
  podcast:  { fk: "podcast_episode_id",table: "podcast_episodes", cols: "id, title, content_types",            title: "title",     url: null },
  call:     { fk: "call_recording_id", table: "call_recordings",  cols: "id, title, content_types, consent_confirmed", title: "title", url: null },
};

function chunkParentKind(row: Record<string, unknown>): ParentKind | null {
  for (const kind of Object.keys(PARENTS) as ParentKind[]) if (row[PARENTS[kind].fk]) return kind;
  return null;
}

async function syncKnowledgeChunks(mes: any, cc: any, mode: Mode, batchSize: number, maxBatches: number): Promise<SyncResult> {
  let watermark = mode === "incremental" ? await getWatermark(mes, SRC_CHUNK) : "1970-01-01T00:00:00Z";
  const watermarkBefore = watermark;
  let pulled = 0, upserted = 0, failed = 0, offset = 0, maxSynced = watermark;
  const cols = "id, chunk_index, chunk_text, created_at, embedding, document_id, youtube_video_id, reddit_thread_id, podcast_episode_id, call_recording_id";

  for (let b = 0; b < maxBatches; b++) {
    let q = cc.from("document_chunks").select(cols)
      .order("created_at", { ascending: true }).order("id", { ascending: true });
    q = mode === "incremental" ? q.gt("created_at", watermark).limit(batchSize) : q.range(offset, offset + batchSize - 1);
    const { data: rows, error } = await q;
    if (error) { console.error("chunk read failed", error.message); break; }
    if (!rows || rows.length === 0) break;
    pulled += rows.length;

    // Bulk-fetch parents referenced in this page, keyed by kind.
    const idsByKind: Record<ParentKind, Set<string>> = { document: new Set(), youtube: new Set(), reddit: new Set(), podcast: new Set(), call: new Set() };
    for (const r of rows as Array<Record<string, unknown>>) {
      const kind = chunkParentKind(r);
      if (kind) idsByKind[kind].add(r[PARENTS[kind].fk] as string);
    }
    const parentById: Record<string, Record<string, unknown>> = {};
    for (const kind of Object.keys(idsByKind) as ParentKind[]) {
      const ids = [...idsByKind[kind]];
      if (ids.length === 0) continue;
      const { data: parents } = await cc.from(PARENTS[kind].table).select(PARENTS[kind].cols).in("id", ids);
      for (const p of (parents ?? []) as Array<Record<string, unknown>>) parentById[p.id as string] = p;
    }

    const payload = [];
    for (const r of rows as Array<Record<string, unknown>>) {
      const kind = chunkParentKind(r);
      if (!kind) continue; // orphan chunk — skip
      const pid = r[PARENTS[kind].fk] as string;
      const parent = parentById[pid];
      const cfg = PARENTS[kind];
      const raw: RawChunk = {
        id: r.id as string, chunk_index: (r.chunk_index as number) ?? null, chunk_text: (r.chunk_text as string) ?? null,
        embedding: (r.embedding as string) ?? null, parent_kind: kind, parent_id: pid,
        parent_title: (parent?.[cfg.title] as string) ?? null,
        parent_url: cfg.url ? ((parent?.[cfg.url] as string) ?? null) : null,
        parent_content_types: (parent?.content_types as string[]) ?? null,
        consent_confirmed: kind === "call" ? (parent?.consent_confirmed as boolean) : undefined,
      };
      const built = buildChunkRow(raw);
      if (built) payload.push(built);
    }

    if (payload.length) {
      const { error: upErr } = await mes.rpc("upsert_kb_knowledge_chunks", { p_rows: payload });
      if (upErr) { failed += payload.length; console.error("chunk upsert failed", upErr.message); } else { upserted += payload.length; }
    }
    for (const r of rows as Array<Record<string, unknown>>) {
      const s = r.created_at as string | null;
      if (s && s > maxSynced) maxSynced = s;
    }
    offset += rows.length;
    if (mode === "incremental" && rows.length) watermark = (rows[rows.length - 1] as any).created_at as string;
    if (rows.length < batchSize) break;
  }
  await setWatermark(mes, SRC_CHUNK, maxSynced, upserted);
  return { source: SRC_CHUNK, pulled, upserted, failed, watermark_before: watermarkBefore, watermark_after: maxSynced };
}

// ── research_cache (not chunked; whole research_text is one unit) ────────────
async function syncResearchCache(mes: any, cc: any, mode: Mode, batchSize: number, maxBatches: number): Promise<SyncResult> {
  let watermark = mode === "incremental" ? await getWatermark(mes, SRC_RESEARCH) : "1970-01-01T00:00:00Z";
  const watermarkBefore = watermark;
  let pulled = 0, upserted = 0, failed = 0, offset = 0, maxSynced = watermark;
  const cols = "id, query, research_text, embedding, content_types, created_at";

  for (let b = 0; b < maxBatches; b++) {
    let q = cc.from("research_cache").select(cols)
      .order("created_at", { ascending: true }).order("id", { ascending: true });
    q = mode === "incremental" ? q.gt("created_at", watermark).limit(batchSize) : q.range(offset, offset + batchSize - 1);
    const { data: rows, error } = await q;
    if (error) { console.error("research read failed", error.message); break; }
    if (!rows || rows.length === 0) break;
    pulled += rows.length;

    const payload = (rows as Array<Record<string, unknown>>).map((r) => buildResearchRow({
      id: r.id as string, query: (r.query as string) ?? null, research_text: (r.research_text as string) ?? null,
      embedding: (r.embedding as string) ?? null, content_types: (r.content_types as string[]) ?? null,
    })).filter((x): x is NonNullable<typeof x> => x !== null);

    if (payload.length) {
      const { error: upErr } = await mes.rpc("upsert_kb_knowledge_chunks", { p_rows: payload });
      if (upErr) { failed += payload.length; console.error("research upsert failed", upErr.message); } else { upserted += payload.length; }
    }
    for (const r of rows as Array<Record<string, unknown>>) {
      const s = r.created_at as string | null;
      if (s && s > maxSynced) maxSynced = s;
    }
    offset += rows.length;
    if (mode === "incremental" && rows.length) watermark = (rows[rows.length - 1] as any).created_at as string;
    if (rows.length < batchSize) break;
  }
  await setWatermark(mes, SRC_RESEARCH, maxSynced, upserted);
  return { source: SRC_RESEARCH, pulled, upserted, failed, watermark_before: watermarkBefore, watermark_after: maxSynced };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { error: "method not allowed" });
  const provided = req.headers.get("x-internal-secret") ?? "";
  if (!KB_SYNC_SECRET || provided !== KB_SYNC_SECRET) return json(401, { error: "unauthorized" });
  if (!CC_URL || !CC_ANON_KEY) return json(500, { error: "CONTENT_CREATOR_URL / CONTENT_CREATOR_ANON_KEY not configured" });

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* defaults */ }
  // "backfill" and "reconcile" both mean a full paged re-upsert.
  const mode: Mode = (body.mode === "backfill" || body.mode === "reconcile") ? "full" : "incremental";
  const source = typeof body.source === "string" ? body.source : "all";
  const batchSize = Math.min(Math.max(Number(body.batch_size) || DEFAULT_BATCH, 1), 250);
  const maxBatches = Math.min(Math.max(Number(body.max_batches) || 100, 1), 1000);

  const mes = createClient(MES_URL, MES_SERVICE_KEY, { auth: { persistSession: false } });
  const cc = createClient(CC_URL, CC_ANON_KEY, { auth: { persistSession: false } });

  const run: SyncResult[] = [];
  if (source === "all" || source === "linkedin")        run.push(await syncLinkedIn(mes, cc, mode, batchSize, maxBatches));
  if (source === "all" || source === "document_chunk")  run.push(await syncKnowledgeChunks(mes, cc, mode, batchSize, maxBatches));
  if (source === "all" || source === "research_cache")  run.push(await syncResearchCache(mes, cc, mode, batchSize, maxBatches));
  if (run.length === 0) return json(400, { error: `unknown source '${source}'` });

  const totals = run.reduce((a, r) => ({ pulled: a.pulled + r.pulled, upserted: a.upserted + r.upserted, failed: a.failed + r.failed }), { pulled: 0, upserted: 0, failed: 0 });
  console.log(`kb-sync mode=${mode === "full" ? (body.mode as string) : "incremental"} source=${source}: pulled=${totals.pulled} upserted=${totals.upserted} failed=${totals.failed}`);
  return json(200, { ok: true, mode: mode === "full" ? (body.mode as string) : "incremental", source, totals, sources: run });
});
