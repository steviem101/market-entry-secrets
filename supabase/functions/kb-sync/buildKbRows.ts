// buildKbRows.ts — pure transforms from Content Studio source rows to the
// upsert_kb_knowledge_chunks payload shape. No I/O; unit-tested.
//
// Corridor/date/proprietary metadata comes from the seed ladder (corridorSeed.ts).
// The Haiku classification tier is deferred and gated (see classifyCorridor stub);
// today the ladder is: seed map -> unknown(null). Never guessed.

import { resolveFromSeed, unknownCorridor, type CorridorMeta } from "./corridorSeed.ts";

export type ParentKind = "document" | "youtube" | "reddit" | "podcast" | "call";

/** A document_chunks row already joined to its (single) parent. */
export interface RawChunk {
  id: string;                          // chunk uuid — the KB source_ref
  chunk_index: number | null;
  chunk_text: string | null;
  embedding: string | null;           // PostgREST vector string, or null
  parent_kind: ParentKind;
  parent_id: string;
  parent_title: string | null;        // file_name / video title / thread title
  parent_url: string | null;
  parent_content_types: string[] | null;
  consent_confirmed?: boolean;        // call_recordings only
}

/** A research_cache row (not chunked; whole research_text is one unit). */
export interface RawResearch {
  id: string;
  query: string | null;
  research_text: string | null;
  embedding: string | null;
  content_types: string[] | null;
}

export interface KbUpsertRow {
  source_ref: string;
  content: string;
  title: string | null;
  embedding: string | null;
  embedding_model: string;
  chunk_index: number;
  metadata: Record<string, unknown>;
}

const EMBED_MODEL = "text-embedding-3-small";

// Proprietary lanes: calls/podcasts/interviews are first-party (the moat). Third-party
// PDFs / LinkedIn / research are not. Documents inherit is_proprietary from the seed.
const PROPRIETARY_KINDS = new Set<ParentKind>(["podcast", "call"]);

function corridorFor(c: RawChunk): CorridorMeta {
  if (c.parent_kind === "document") return resolveFromSeed(c.parent_title) ?? unknownCorridor();
  return unknownCorridor(); // youtube/reddit/podcast/call: no seed today; Haiku tier deferred
}

/** Build one KB upsert row from a joined chunk. Returns null to SKIP:
 *  - empty content, or
 *  - a call recording lacking consent_confirmed (proprietary-consent gate). */
export function buildChunkRow(c: RawChunk): KbUpsertRow | null {
  if (!c.chunk_text || c.chunk_text.trim().length === 0) return null;
  if (c.parent_kind === "call" && c.consent_confirmed !== true) return null;

  const corridor = corridorFor(c);
  return {
    source_ref: c.id,
    content: c.chunk_text,
    title: c.parent_title,
    embedding: c.embedding ?? null,
    embedding_model: EMBED_MODEL,
    chunk_index: c.chunk_index ?? 0,
    metadata: {
      source_kind: c.parent_kind,
      parent_id: c.parent_id,
      title: c.parent_title,
      source_url: c.parent_url,
      content_types: c.parent_content_types ?? null,
      origin_country: corridor.origin_country,
      target_country: corridor.target_country,
      countries: corridor.countries,
      publication_date: corridor.publication_date,
      is_proprietary: corridor.is_proprietary || PROPRIETARY_KINDS.has(c.parent_kind),
      sectors: corridor.sectors,
    },
  };
}

/** Build one KB upsert row from a research_cache row. Returns null to skip empty text. */
export function buildResearchRow(r: RawResearch): KbUpsertRow | null {
  if (!r.research_text || r.research_text.trim().length === 0) return null;
  return {
    source_ref: r.id,
    content: r.research_text,
    title: r.query ?? null,
    embedding: r.embedding ?? null,
    embedding_model: EMBED_MODEL,
    chunk_index: 0,
    metadata: {
      source_kind: "research_cache",
      source_url: null,
      content_types: r.content_types ?? null,
      origin_country: null,
      target_country: null,
      countries: [],
      publication_date: null,
      is_proprietary: false,
      sectors: [],
    },
  };
}

/** Deferred, gated tier-3 of the metadata ladder. Not wired today: the seed map
 *  covers all 17 documents and the proprietary lanes are empty. When the library
 *  grows with untagged sources, implement a batched, cached, dry_run-able Haiku
 *  classifier here (ANTHROPIC_API_KEY) that runs ONLY for rows the seed misses, and
 *  returns null rather than guessing. Kept as an explicit seam so the ladder's shape
 *  is visible and the call site already routes through corridorFor(). */
export function classifyCorridorDeferred(_title: string | null): CorridorMeta | null {
  return null;
}
