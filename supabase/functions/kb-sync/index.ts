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
// Pagination is KEYSET on (ts, id): source rows are bulk-inserted so many share one
// created_at (e.g. 589 chunks on a single timestamp); a plain .gt(ts) cursor would skip
// every tied row past a batch boundary. Watermark discipline: the persisted watermark
// advances ONLY over fully-successful batches and never moves backward, so a read /
// parent-fetch / upsert failure leaves the frontier intact and the NEXT run retries the
// unsynced rows. In-place source edits (a call consented after its chunks were created,
// re-extracted chunk_text) don't change created_at and so are NOT caught incrementally —
// the periodic full "reconcile" mode is their backstop (run it weekly).
//
// Embeddings are COPIED when the source row has one (embedded_hash = content_hash so
// embed-knowledge skips it); rows without an embedding sync with embedding=null and the
// embed-knowledge cron fills them.
//
// Auth: verify_jwt = false; guarded by x-internal-secret == KB_SYNC_SECRET.
// Body: { mode?: "incremental"|"backfill"|"reconcile", source?: "all"|"linkedin"|
//         "document_chunk"|"research_cache", batch_size?, max_batches? }.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildChunkRow, buildResearchRow, type ParentKind } from "./buildKbRows.ts";
import { normalizeTs, maxTs, keysetOr } from "./syncPaging.ts";

const MES_URL = Deno.env.get("SUPABASE_URL")!;
const MES_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CC_URL = Deno.env.get("CONTENT_CREATOR_URL") ?? "";
const CC_ANON_KEY = Deno.env.get("CONTENT_CREATOR_ANON_KEY") ?? "";
const KB_SYNC_SECRET = Deno.env.get("KB_SYNC_SECRET") ?? "";

const SRC_LINKEDIN = "content_creator_linkedin";
const SRC_CHUNK = "content_creator_document_chunk";
const SRC_RESEARCH = "content_creator_research_cache";
const EPOCH = "1970-01-01T00:00:00+00";
const DEFAULT_BATCH = 100;

type Mode = "incremental" | "full";
interface SyncResult { source: string; pulled: number; upserted: number; failed: number; clean: boolean; watermark_before: string; watermark_after: string; }
interface SyncSpec {
  source: string; table: string; selectCols: string; tsCol: string; idCol: string;
  upsertRpc: string; buildPayload: (rows: any[], cc: any) => Promise<any[]>;
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

async function getWatermark(mes: any, source: string): Promise<string> {
  const { data } = await mes.from("kb_sync_state").select("last_synced_at").eq("source", source).maybeSingle();
  return (data?.last_synced_at as string) ?? EPOCH;
}
async function setWatermark(mes: any, source: string, maxSynced: string, rows: number): Promise<void> {
  await mes.from("kb_sync_state").upsert({
    source, last_synced_at: maxSynced, last_run_at: new Date().toISOString(), last_rows_synced: rows,
  }, { onConflict: "source" });
}

// ── Polymorphic chunk parents ────────────────────────────────────────────────
const PARENTS: Record<ParentKind, { fk: string; table: string; cols: string; title: string; url: string | null }> = {
  document: { fk: "document_id",       table: "source_documents", cols: "id, file_name, content_types",             title: "file_name", url: null },
  youtube:  { fk: "youtube_video_id",  table: "youtube_videos",   cols: "id, title, video_url, content_types",      title: "title",     url: "video_url" },
  reddit:   { fk: "reddit_thread_id",  table: "reddit_threads",   cols: "id, title, thread_url, content_types",     title: "title",     url: "thread_url" },
  podcast:  { fk: "podcast_episode_id",table: "podcast_episodes", cols: "id, title, content_types",                 title: "title",     url: null },
  call:     { fk: "call_recording_id", table: "call_recordings",  cols: "id, title, content_types, consent_confirmed", title: "title",  url: null },
};

function chunkParentKind(row: Record<string, unknown>): ParentKind | null {
  for (const kind of Object.keys(PARENTS) as ParentKind[]) if (row[PARENTS[kind].fk]) return kind;
  return null;
}

// Build the chunk upsert payload: fetch the parents referenced in this page (all kinds
// concurrently), join in memory, and map through the pure buildChunkRow. THROWS on a
// parent-fetch error so the caller marks the batch failed and retries it next run
// (rather than silently upserting chunks with null title/corridor).
async function buildChunkPayload(rows: any[], cc: any): Promise<any[]> {
  const idsByKind: Record<ParentKind, Set<string>> = { document: new Set(), youtube: new Set(), reddit: new Set(), podcast: new Set(), call: new Set() };
  for (const r of rows) { const k = chunkParentKind(r); if (k) idsByKind[k].add(r[PARENTS[k].fk]); }
  const kinds = (Object.keys(idsByKind) as ParentKind[]).filter((k) => idsByKind[k].size > 0);
  const parentById: Record<string, any> = {};
  await Promise.all(kinds.map(async (k) => {
    const { data, error } = await cc.from(PARENTS[k].table).select(PARENTS[k].cols).in("id", [...idsByKind[k]]);
    if (error) throw new Error(`parent fetch ${PARENTS[k].table}: ${error.message}`);
    for (const p of (data ?? [])) parentById[p.id] = p;
  }));

  const payload: any[] = [];
  for (const r of rows) {
    const kind = chunkParentKind(r);
    if (!kind) { console.warn(`kb-sync: chunk ${r.id} has no known parent FK; skipped`); continue; }
    const cfg = PARENTS[kind];
    const parent = parentById[r[cfg.fk]];
    const built = buildChunkRow({
      id: r.id, chunk_index: r.chunk_index ?? null, chunk_text: r.chunk_text ?? null, embedding: r.embedding ?? null,
      parent_kind: kind, parent_id: r[cfg.fk],
      parent_title: parent?.[cfg.title] ?? null,
      parent_url: cfg.url ? (parent?.[cfg.url] ?? null) : null,
      parent_content_types: parent?.content_types ?? null,
      consent_confirmed: kind === "call" ? parent?.consent_confirmed : undefined,
    });
    if (built) payload.push(built);
  }
  return payload;
}

function buildLinkedInPayload(rows: any[]): any[] {
  return rows.map((r) => ({
    source_ref: r.source_ref, content: r.content, title: r.title ?? null,
    embedding: r.embedding ?? null, embedding_model: "text-embedding-3-small",
    metadata: {
      engagement_score: r.engagement_score ?? null, quality_score: r.quality_score ?? null,
      content_types: r.content_types ?? null, post_url: r.post_url ?? null, post_date: r.post_date ?? null,
    },
  }));
}

function buildResearchPayload(rows: any[]): any[] {
  return rows
    .map((r) => buildResearchRow({ id: r.id, query: r.query ?? null, research_text: r.research_text ?? null, embedding: r.embedding ?? null, content_types: r.content_types ?? null }))
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

const SPECS: Record<string, SyncSpec> = {
  linkedin: {
    source: SRC_LINKEDIN, table: "kb_sync_source", tsCol: "synced_at", idCol: "source_ref",
    selectCols: "source_ref, content, title, embedding, post_url, post_date, engagement_score, quality_score, content_types, synced_at",
    upsertRpc: "upsert_kb_linkedin_posts", buildPayload: (rows) => Promise.resolve(buildLinkedInPayload(rows)),
  },
  document_chunk: {
    source: SRC_CHUNK, table: "document_chunks", tsCol: "created_at", idCol: "id",
    selectCols: "id, chunk_index, chunk_text, created_at, embedding, document_id, youtube_video_id, reddit_thread_id, podcast_episode_id, call_recording_id",
    upsertRpc: "upsert_kb_knowledge_chunks", buildPayload: buildChunkPayload,
  },
  research_cache: {
    source: SRC_RESEARCH, table: "research_cache", tsCol: "created_at", idCol: "id",
    selectCols: "id, query, research_text, embedding, content_types, created_at",
    upsertRpc: "upsert_kb_knowledge_chunks", buildPayload: (rows) => Promise.resolve(buildResearchPayload(rows)),
  },
};

// Generic keyset-paginated sync with watermark-commit discipline (see file header).
async function runKeysetSync(mes: any, cc: any, spec: SyncSpec, mode: Mode, batchSize: number, maxBatches: number): Promise<SyncResult> {
  const stored = normalizeTs(await getWatermark(mes, spec.source));
  const startTs = mode === "incremental" ? stored : EPOCH;
  let committedTs = stored;                       // never regress below the stored frontier
  let cursor: { ts: string; id: string } | null = null; // null => first page (.gte startTs)
  let pulled = 0, upserted = 0, failed = 0, clean = true;

  for (let b = 0; b < maxBatches; b++) {
    let q = cc.from(spec.table).select(spec.selectCols)
      .order(spec.tsCol, { ascending: true }).order(spec.idCol, { ascending: true }).limit(batchSize);
    // First page re-reads from startTs inclusive (.gte) so a boundary tie-group is never
    // skipped; the idempotent upsert makes the bounded re-read of that one group harmless.
    q = cursor === null ? q.gte(spec.tsCol, startTs) : q.or(keysetOr(spec.tsCol, spec.idCol, cursor.ts, cursor.id));

    const { data: rows, error } = await q;
    if (error) { clean = false; console.error(`kb-sync ${spec.source} read failed`, error.message); break; }
    if (!rows || rows.length === 0) break;
    pulled += rows.length;

    let payload: any[];
    try { payload = await spec.buildPayload(rows as any[], cc); }
    catch (e) { clean = false; failed += rows.length; console.error(`kb-sync ${spec.source} build failed`, e instanceof Error ? e.message : String(e)); break; }

    if (payload.length) {
      const { error: upErr } = await mes.rpc(spec.upsertRpc, { p_rows: payload });
      if (upErr) { clean = false; failed += payload.length; console.error(`kb-sync ${spec.source} upsert failed`, upErr.message); break; }
      upserted += payload.length;
    }

    // Batch fully successful → advance the committed frontier and the in-run cursor.
    const last = rows[rows.length - 1] as Record<string, unknown>;
    committedTs = maxTs(committedTs, last[spec.tsCol] as string);
    cursor = { ts: last[spec.tsCol] as string, id: String(last[spec.idCol]) };
    if (rows.length < batchSize) break;
  }

  await setWatermark(mes, spec.source, committedTs, upserted);
  return { source: spec.source, pulled, upserted, failed, clean, watermark_before: stored, watermark_after: committedTs };
}

const ORDER = ["linkedin", "document_chunk", "research_cache"];

Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { error: "method not allowed" });
  const provided = req.headers.get("x-internal-secret") ?? "";
  if (!KB_SYNC_SECRET || provided !== KB_SYNC_SECRET) return json(401, { error: "unauthorized" });
  if (!CC_URL || !CC_ANON_KEY) return json(500, { error: "CONTENT_CREATOR_URL / CONTENT_CREATOR_ANON_KEY not configured" });

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* defaults */ }
  const mode: Mode = (body.mode === "backfill" || body.mode === "reconcile") ? "full" : "incremental";
  const modeLabel = mode === "full" ? String(body.mode) : "incremental";
  const source = typeof body.source === "string" ? body.source : "all";
  const batchSize = Math.min(Math.max(Number(body.batch_size) || DEFAULT_BATCH, 1), 250);
  const maxBatches = Math.min(Math.max(Number(body.max_batches) || 100, 1), 1000);

  const selected = source === "all" ? ORDER : (SPECS[source] ? [source] : []);
  if (selected.length === 0) return json(400, { error: `unknown source '${source}'` });

  const mes = createClient(MES_URL, MES_SERVICE_KEY, { auth: { persistSession: false } });
  const cc = createClient(CC_URL, CC_ANON_KEY, { auth: { persistSession: false } });

  const run: SyncResult[] = [];
  for (const s of selected) run.push(await runKeysetSync(mes, cc, SPECS[s], mode, batchSize, maxBatches));

  const totals = run.reduce((a, r) => ({ pulled: a.pulled + r.pulled, upserted: a.upserted + r.upserted, failed: a.failed + r.failed }), { pulled: 0, upserted: 0, failed: 0 });
  const anyFailed = run.some((r) => !r.clean || r.failed > 0);
  console.log(`kb-sync mode=${modeLabel} source=${source}: pulled=${totals.pulled} upserted=${totals.upserted} failed=${totals.failed} clean=${!anyFailed}`);
  // Non-2xx on any failure so pg_cron/pg_net records it; the watermark was NOT advanced
  // past the failed rows, so the next run retries them regardless.
  return json(anyFailed ? 500 : 200, { ok: !anyFailed, mode: modeLabel, source, totals, sources: run });
});
