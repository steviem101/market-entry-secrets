// MES-160 — Notion "MES Events" → Supabase `events` importer: CLI runner.
//
// DRY RUN IS THE DEFAULT. Without --apply this command performs zero database
// writes: it validates + normalises the CSV, matches it against live rows and
// writes review artefacts (inserts / updates / ambiguous / invalid / taxonomy
// exceptions) to the out directory. Production writes require an explicit
// --apply AND existing dry-run artefacts for the exact same CSV content.
//
//   Dry run (default):
//     SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… \
//       node scripts/events-import/run.ts --csv input/mes-events-2026-07-14.csv
//
//   Offline dry run (no credentials — snapshot files instead of live reads):
//     node scripts/events-import/run.ts --csv … \
//       --events-snapshot input/events-snapshot.json \
//       --taxonomy-snapshot input/taxonomy-snapshot.json
//
//   Apply (after human review of the dry-run artefacts — see README.md):
//     … node scripts/events-import/run.ts --csv … --apply
//
//   Rollback a batch:
//     … node scripts/events-import/run.ts --rollback <batch-id>
//
// Credentials come from the environment only (server-side/local). The service
// role key must never reach the browser, git, or CI logs.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  parseCsv, toRecords, buildProposals, toCsv,
  type LiveEvent, type TaxonomyContext, type ProposalSet,
  type InsertProposal, type UpdateProposal,
} from "./importLib.ts";

const HERE = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

interface Args {
  csv?: string;
  batchId?: string;
  out?: string;
  eventsSnapshot?: string;
  taxonomySnapshot?: string;
  apply: boolean;
  rollback?: string;
  fallbackCategory?: string;
  insertStatus?: "approved" | "needs_review";
  limit?: number;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { apply: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) throw new Error(`Missing value for ${a}`);
      return v;
    };
    switch (a) {
      case "--csv": args.csv = next(); break;
      case "--batch-id": args.batchId = next(); break;
      case "--out": args.out = next(); break;
      case "--events-snapshot": args.eventsSnapshot = next(); break;
      case "--taxonomy-snapshot": args.taxonomySnapshot = next(); break;
      case "--apply": args.apply = true; break;
      case "--rollback": args.rollback = next(); break;
      case "--fallback-category": args.fallbackCategory = next(); break;
      case "--insert-status": {
        const v = next();
        if (v !== "approved" && v !== "needs_review") throw new Error(`--insert-status must be approved|needs_review, got "${v}"`);
        args.insertStatus = v; break;
      }
      case "--limit": args.limit = Number(next()); break;
      default: throw new Error(`Unknown argument: ${a}`);
    }
  }
  return args;
}

// ---------------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------------

const LIVE_EVENT_COLUMNS =
  "id,title,slug,status,source,source_url,description,date,event_date,date_precision," +
  "typical_month,venue,city,state_region,location,type,category,sector,sector_tags," +
  "organizer,organizer_website,website_url,registration_url,price,frequency," +
  "attendees,attendees_label,exhibitors,exhibitors_label,data_quality_flags";

function serviceClient(requireKey: boolean): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    if (requireKey) {
      throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for this operation (set them in the local environment; never commit them).");
    }
    return null;
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

async function loadLiveEvents(sb: SupabaseClient | null, snapshotPath?: string): Promise<LiveEvent[]> {
  if (snapshotPath) {
    return JSON.parse(readFileSync(snapshotPath, "utf-8")) as LiveEvent[];
  }
  if (!sb) throw new Error("No credentials and no --events-snapshot provided; cannot inventory live events for dedupe.");
  const all: LiveEvent[] = [];
  // Page past the PostgREST 1000-row default (CLAUDE.md gotcha #1).
  for (let fromIdx = 0; ; fromIdx += 1000) {
    const { data, error } = await sb.from("events").select(LIVE_EVENT_COLUMNS).range(fromIdx, fromIdx + 999);
    if (error) throw new Error(`Failed to read live events: ${error.message}`);
    all.push(...((data ?? []) as unknown as LiveEvent[]));
    if (!data || data.length < 1000) break;
  }
  return all;
}

interface TaxonomySnapshot {
  vocab: Array<{ raw_value: string; sector_slugs: string[] }>;
  valid_slugs: string[];
}

/** Repo-committed reviewer-curated additions: label → slugs + display category. */
function loadOverrides(): Array<{ label: string; slugs: string[]; category: string }> {
  const path = join(HERE, "sector-overrides.csv");
  if (!existsSync(path)) return [];
  const rows = parseCsv(readFileSync(path, "utf-8"));
  const [header, ...data] = rows;
  const idx = (name: string) => header.indexOf(name);
  if (idx("label") === -1 || idx("sector_slugs") === -1 || idx("category") === -1) {
    throw new Error("sector-overrides.csv must have columns: label,sector_slugs,category");
  }
  return data.map((r) => ({
    label: r[idx("label")].trim().toLowerCase(),
    slugs: r[idx("sector_slugs")].split(";").map((s) => s.trim()).filter(Boolean),
    category: r[idx("category")].trim(),
  }));
}

async function loadTaxonomy(sb: SupabaseClient | null, snapshotPath?: string): Promise<TaxonomyContext> {
  let snap: TaxonomySnapshot;
  if (snapshotPath) {
    snap = JSON.parse(readFileSync(snapshotPath, "utf-8")) as TaxonomySnapshot;
  } else {
    if (!sb) throw new Error("No credentials and no --taxonomy-snapshot provided; cannot resolve the live sector taxonomy.");
    const vocabRes = await sb.from("sector_vocabulary").select("raw_value,sector_slugs");
    if (vocabRes.error) throw new Error(`Failed to read sector_vocabulary: ${vocabRes.error.message}`);
    const slugRes = await sb.from("sector_group_crosswalk").select("v2_sector_slug");
    if (slugRes.error) throw new Error(`Failed to read sector_group_crosswalk: ${slugRes.error.message}`);
    snap = {
      vocab: (vocabRes.data ?? []) as TaxonomySnapshot["vocab"],
      valid_slugs: [...new Set(((slugRes.data ?? []) as Array<{ v2_sector_slug: string }>).map((r) => r.v2_sector_slug))],
    };
  }
  const sectorVocab = new Map<string, string[]>();
  for (const v of snap.vocab) sectorVocab.set(v.raw_value.trim().toLowerCase(), v.sector_slugs);
  const validSlugs = new Set(snap.valid_slugs);
  const categoryByLabel = new Map<string, string>();
  for (const o of loadOverrides()) {
    if (o.slugs.length > 0) sectorVocab.set(o.label, o.slugs);
    if (o.category) categoryByLabel.set(o.label, o.category);
  }
  return { sectorVocab, validSlugs, categoryByLabel };
}

// ---------------------------------------------------------------------------
// Artefacts
// ---------------------------------------------------------------------------

function writeArtefacts(outDir: string, batchId: string, csvSha: string, csvPath: string, proposals: ProposalSet): void {
  mkdirSync(outDir, { recursive: true });
  const w = (name: string, content: string) => writeFileSync(join(outDir, name), content);

  w("inserts.csv", toCsv(
    ["line", "title", "slug", "type", "category", "sector_tags", "date", "date_precision", "city", "state", "venue", "organiser", "website_url", "flags"],
    proposals.inserts.map((p) => [
      p.line, p.title, p.slug, String(p.payload.type), String(p.payload.category),
      (p.payload.sector_tags as string[]).join(";"), p.payload.date as string | null,
      p.payload.date_precision as string, p.payload.city as string | null,
      p.payload.state_region as string | null, p.payload.venue as string | null,
      p.payload.organizer as string | null, p.payload.website_url as string | null,
      p.flags.join(";"),
    ]),
  ));

  w("updates.csv", toCsv(
    ["line", "title", "target_id", "target_title", "target_source", "match_type", "field", "rule", "from", "to"],
    proposals.updates.flatMap((p) => p.ops.map((op) => [
      p.line, p.title, p.targetId, p.targetTitle, p.targetSource, p.matchType,
      op.field, op.rule, JSON.stringify(op.from), JSON.stringify(op.to),
    ])),
  ));

  w("ambiguous.csv", toCsv(
    ["line", "title", "reason", "candidate_id", "candidate_title", "candidate_city", "candidate_date", "candidate_source", "similarity"],
    proposals.ambiguous.flatMap((p) => p.candidates.map((c) => [
      p.line, p.title, p.reason, c.id, c.title, c.city, c.date, c.source, c.similarity,
    ])),
  ));

  w("invalid.csv", toCsv(
    ["line", "title", "errors"],
    proposals.invalid.map((p) => [p.line, p.title, p.errors.join(" | ")]),
  ));

  w("taxonomy-exceptions.csv", toCsv(
    ["line", "title", "issues"],
    proposals.taxonomyExceptions.map((p) => [p.line, p.title, p.issues.join(" | ")]),
  ));

  w("proposals.json", JSON.stringify(proposals, null, 2) + "\n");

  w("summary.json", JSON.stringify({
    batch_id: batchId,
    csv_file: basename(csvPath),
    csv_sha256: csvSha,
    generated_at: new Date().toISOString(),
    counts: {
      inserts: proposals.inserts.length,
      updates: proposals.updates.length,
      unchanged: proposals.unchanged.length,
      ambiguous: proposals.ambiguous.length,
      invalid: proposals.invalid.length,
      taxonomy_exceptions: proposals.taxonomyExceptions.length,
    },
    taxonomy_notes: proposals.taxonomyNotes,
  }, null, 2) + "\n");
}

// ---------------------------------------------------------------------------
// Apply / rollback (the only write paths — both require the service key)
// ---------------------------------------------------------------------------

interface ApplyOutcome { line: number; title: string; action: string; event_id?: string; error?: string }

async function recordStaging(
  sb: SupabaseClient,
  batchId: string,
  notionUrl: string,
  raw: Record<string, unknown>,
  targetEventId: string | null,
): Promise<string | null> {
  const { error } = await sb.from("events_staging").upsert(
    {
      source_url: notionUrl,
      run_id: batchId,
      raw,
      processed: true,
      processed_at: new Date().toISOString(),
      target_event_id: targetEventId,
    },
    { onConflict: "source_url" },
  );
  return error ? error.message : null;
}

async function applyProposals(
  sb: SupabaseClient,
  batchId: string,
  proposals: ProposalSet,
  limit: number | undefined,
): Promise<ApplyOutcome[]> {
  const outcomes: ApplyOutcome[] = [];
  const nowIso = new Date().toISOString();
  let budget = limit ?? Infinity;

  for (const p of proposals.inserts as InsertProposal[]) {
    if (budget <= 0) { outcomes.push({ line: p.line, title: p.title, action: "skipped_limit" }); continue; }
    budget--;
    const { data, error } = await sb
      .from("events")
      .insert({ ...p.payload, ingested_at: nowIso })
      .select("id")
      .single();
    if (error || !data) {
      outcomes.push({ line: p.line, title: p.title, action: "insert_failed", error: error?.message ?? "no id returned" });
      continue;
    }
    const stagingErr = await recordStaging(sb, batchId, String(p.payload.source_url), p.stagingRaw, data.id);
    outcomes.push({ line: p.line, title: p.title, action: "inserted", event_id: data.id, ...(stagingErr ? { error: `staging: ${stagingErr}` } : {}) });
  }

  for (const p of proposals.updates as UpdateProposal[]) {
    if (budget <= 0) { outcomes.push({ line: p.line, title: p.title, action: "skipped_limit" }); continue; }
    budget--;
    const fields: Record<string, unknown> = {};
    for (const op of p.ops) fields[op.field] = op.to;
    const { error } = await sb.from("events").update(fields).eq("id", p.targetId);
    if (error) {
      outcomes.push({ line: p.line, title: p.title, action: "update_failed", error: error.message });
      continue;
    }
    const notionUrl = String((p.stagingRaw as { notion_page_url?: unknown }).notion_page_url ?? "");
    const stagingErr = notionUrl ? await recordStaging(sb, batchId, notionUrl, p.stagingRaw, p.targetId) : "missing notion_page_url";
    outcomes.push({ line: p.line, title: p.title, action: "updated", event_id: p.targetId, ...(stagingErr ? { error: `staging: ${stagingErr}` } : {}) });
  }

  return outcomes;
}

async function rollbackBatch(sb: SupabaseClient, batchId: string): Promise<ApplyOutcome[]> {
  const { data, error } = await sb
    .from("events_staging")
    .select("id,source_url,raw,target_event_id")
    .eq("run_id", batchId);
  if (error) throw new Error(`Failed to read staging rows for batch ${batchId}: ${error.message}`);
  const rows = (data ?? []) as Array<{ id: string; source_url: string | null; raw: Record<string, unknown>; target_event_id: string | null }>;
  if (rows.length === 0) throw new Error(`No staging rows found for batch "${batchId}" — nothing to roll back.`);

  const outcomes: ApplyOutcome[] = [];
  for (const row of rows) {
    const action = String(row.raw?.action ?? "");
    const title = String(row.raw?.notion_page_url ?? row.source_url ?? row.id);
    if (row.raw?.rolled_back === true) { outcomes.push({ line: 0, title, action: "already_rolled_back" }); continue; }
    if (!row.target_event_id) { outcomes.push({ line: 0, title, action: "no_target_skipped" }); continue; }

    if (action === "insert") {
      // Deleting the events row cascades to its mes_knowledge_base entry via
      // the kb_sync_event trigger.
      const del = await sb.from("events").delete().eq("id", row.target_event_id);
      if (del.error) { outcomes.push({ line: 0, title, action: "delete_failed", error: del.error.message }); continue; }
      outcomes.push({ line: 0, title, action: "deleted", event_id: row.target_event_id });
    } else if (action === "update") {
      const preImage = (row.raw?.pre_image ?? {}) as Record<string, unknown>;
      if (Object.keys(preImage).length === 0) { outcomes.push({ line: 0, title, action: "no_preimage_skipped" }); continue; }
      const upd = await sb.from("events").update(preImage).eq("id", row.target_event_id);
      if (upd.error) { outcomes.push({ line: 0, title, action: "restore_failed", error: upd.error.message }); continue; }
      outcomes.push({ line: 0, title, action: "restored", event_id: row.target_event_id });
    } else {
      outcomes.push({ line: 0, title, action: `unknown_action_skipped:${action}` });
      continue;
    }
    await sb.from("events_staging").update({ raw: { ...row.raw, rolled_back: true } }).eq("id", row.id);
  }
  return outcomes;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.rollback) {
    const sb = serviceClient(true)!;
    const outcomes = await rollbackBatch(sb, args.rollback);
    const outDir = args.out ?? join(HERE, "out", args.rollback);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "rollback-report.json"), JSON.stringify({ batch_id: args.rollback, rolled_back_at: new Date().toISOString(), outcomes }, null, 2) + "\n");
    const counts = outcomes.reduce<Record<string, number>>((acc, o) => ({ ...acc, [o.action]: (acc[o.action] ?? 0) + 1 }), {});
    console.log(`Rollback of batch ${args.rollback}:`, counts);
    console.log(`Report: ${join(outDir, "rollback-report.json")}`);
    return;
  }

  if (!args.csv) throw new Error("--csv <path> is required (or --rollback <batch-id>).");
  const csvText = readFileSync(args.csv, "utf-8");
  const csvSha = createHash("sha256").update(csvText).digest("hex");
  const batchId = args.batchId ?? `mes-events-${csvSha.slice(0, 8)}`;
  const outDir = args.out ?? join(HERE, "out", batchId);

  if (args.apply && (args.eventsSnapshot || args.taxonomySnapshot)) {
    throw new Error("--apply must run against the live database, not snapshots.");
  }

  const sb = serviceClient(args.apply);
  const [liveEvents, taxonomy] = await Promise.all([
    loadLiveEvents(sb, args.eventsSnapshot),
    loadTaxonomy(sb, args.taxonomySnapshot),
  ]);

  const records = toRecords(parseCsv(csvText));
  const proposals = buildProposals(records, liveEvents, taxonomy, {
    batchId,
    todayIso: new Date().toISOString().slice(0, 10),
    fallbackCategory: args.fallbackCategory,
    insertStatus: args.insertStatus,
  });

  const counts = {
    rows: records.length,
    inserts: proposals.inserts.length,
    updates: proposals.updates.length,
    unchanged: proposals.unchanged.length,
    ambiguous: proposals.ambiguous.length,
    invalid: proposals.invalid.length,
    taxonomy_exceptions: proposals.taxonomyExceptions.length,
  };

  if (!args.apply) {
    writeArtefacts(outDir, batchId, csvSha, args.csv, proposals);
    console.log(`DRY RUN — no database writes performed.`);
    console.log(`Batch: ${batchId} (csv sha256 ${csvSha.slice(0, 12)}…)`);
    console.log(`Live events inventoried: ${liveEvents.length}`);
    console.table([counts]);
    console.log(`Review artefacts written to ${outDir}`);
    console.log(`Next step after review + explicit approval: re-run with --apply.`);
    return;
  }

  // --apply guard: a reviewed dry run for this exact CSV content must exist.
  const summaryPath = join(outDir, "summary.json");
  if (!existsSync(summaryPath)) {
    throw new Error(`--apply refused: no dry-run artefacts at ${summaryPath}. Run the dry run and review it first.`);
  }
  const prior = JSON.parse(readFileSync(summaryPath, "utf-8")) as { csv_sha256?: string; batch_id?: string };
  if (prior.csv_sha256 !== csvSha || prior.batch_id !== batchId) {
    throw new Error(`--apply refused: dry-run artefacts in ${outDir} were generated from different CSV content or batch id. Re-run the dry run.`);
  }

  console.log(`APPLY — batch ${batchId}: ${counts.inserts} inserts, ${counts.updates} updates (ambiguous/invalid/taxonomy exceptions are never applied).`);
  const outcomes = await applyProposals(sb!, batchId, proposals, args.limit);
  const byAction = outcomes.reduce<Record<string, number>>((acc, o) => ({ ...acc, [o.action]: (acc[o.action] ?? 0) + 1 }), {});
  writeFileSync(join(outDir, "apply-report.json"), JSON.stringify({ batch_id: batchId, csv_sha256: csvSha, applied_at: new Date().toISOString(), counts: byAction, outcomes }, null, 2) + "\n");
  console.table([byAction]);
  const failures = outcomes.filter((o) => o.error);
  if (failures.length > 0) {
    console.error(`${failures.length} row(s) reported errors — see apply-report.json.`);
    process.exitCode = 1;
  }
  console.log(`Apply report: ${join(outDir, "apply-report.json")}`);
  console.log(`Reconcile counts against the reviewed CSV, then verify KB embedding (README.md §Verify).`);
}

main().catch((err) => {
  console.error(String(err instanceof Error ? err.message : err));
  process.exit(1);
});
