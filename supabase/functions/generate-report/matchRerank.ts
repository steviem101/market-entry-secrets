/**
 * LLM relevance curation ("re-rank") for directory matches.
 *
 * Pure module — NO Deno globals, NO I/O — importable by the edge function AND
 * unit-tested under Node (`node --test`), like matchScoring.ts / geoRelevance.ts.
 * The actual LLM call stays in index.ts (callAI); this owns prompt construction,
 * response parsing, and verdict application.
 *
 * Why it exists (matching audit, CreditLogic report 558bb8bd, 5 Jul 2026):
 * selection is embeddings-recall + a deterministic scorer — no model ever asks
 * "is this entity actually useful for THIS company?". The scorer's 20-sector
 * taxonomy is coarse, so plausible-but-wrong picks pass unchallenged (an
 * insurtech association and an Asia-gateway landing pad for an Irish credit-
 * decisioning fintech; a "Legal Technology Buyers" lead list). This pass hands
 * the FULL selected slate + the company profile to one cheap LLM call and drops
 * what a human analyst would cut.
 *
 * Safety properties (all enforced here, tested):
 *  - Floor-guarded: never drops a section below MIN_KEEP rows (original order
 *    backfills), so a thin directory still renders.
 *  - Drop-only: the LLM can only REMOVE from the slate — it cannot add, reorder
 *    above the scorer, or hallucinate entities into the report.
 *  - Fail-open: unparseable/empty/malformed responses yield zero drops.
 */

/** The match-card fields this module reads; rows carry many more that pass through
 *  untouched. Optional + unknown so any decorated match row satisfies it without casts. */
interface Row {
  name?: unknown;
  title?: unknown;
  subtitle?: unknown;
  location?: unknown;
  description?: unknown;
  meta_description?: unknown;
  short_description?: unknown;
  match_reasons?: unknown;
}

/** Surfaces submitted for curation — the card-rendering pools. lemlist_contacts is
 *  excluded (PII-obfuscated teasers, tiny) as are raw internal pools. */
export const RERANK_TABLES = [
  "service_providers",
  "trade_investment_agencies",
  "innovation_ecosystem",
  "community_members",
  "investors",
  "events",
  "content_items",
  "leads",
] as const;

export const RERANK_MIN_KEEP = 3;

export interface RerankItem {
  ref: number;      // stable index the LLM answers with
  tbl: string;      // source pool
  idx: number;      // position within the pool
  label: string;    // what the LLM sees
}

const clip = (s: unknown, n: number): string =>
  String(s ?? "").replace(/\s+/g, " ").trim().slice(0, n);

/** Flatten the matched slate into numbered items with a compact, informative label. */
export function buildRerankItems(matches: Record<string, Row[]>): RerankItem[] {
  const items: RerankItem[] = [];
  let ref = 1;
  for (const tbl of RERANK_TABLES) {
    (matches[tbl] || []).forEach((m, idx) => {
      const name = clip(m?.name || m?.title, 80);
      if (!name) return; // unlabellable row: never submitted, never dropped
      const bits = [
        clip(m?.subtitle || m?.location, 60),
        clip(m?.description || m?.meta_description || m?.short_description, 140),
        Array.isArray(m?.match_reasons) ? clip(m.match_reasons.join("; "), 90) : "",
      ].filter(Boolean);
      items.push({ ref: ref++, tbl, idx, label: `${name}${bits.length ? ` — ${bits.join(" | ")}` : ""}` });
    });
  }
  return items;
}

const TBL_HEADINGS: Record<string, string> = {
  service_providers: "Service providers (advisors for the company's OWN entry needs)",
  trade_investment_agencies: "Trade & government bodies",
  innovation_ecosystem: "Innovation hubs / accelerators / industry associations",
  community_members: "Mentors",
  investors: "Investors",
  events: "Industry events",
  content_items: "Guides & case studies",
  leads: "Purchasable lead databases (prospect lists matching the company's BUYERS)",
};

/** One prompt covering the whole slate. `companyContext` is the enriched profile
 *  summary + intake facts, assembled by the caller. */
export function buildRerankPrompt(companyContext: string, items: RerankItem[]): string {
  const grouped: string[] = [];
  for (const tbl of RERANK_TABLES) {
    const rows = items.filter((i) => i.tbl === tbl);
    if (rows.length === 0) continue;
    grouped.push(`### ${TBL_HEADINGS[tbl] || tbl}\n${rows.map((i) => `${i.ref}. ${i.label}`).join("\n")}`);
  }
  return `You are a market-entry analyst reviewing the candidate resources selected for a client's Australian market-entry report. The client:

${companyContext}

Below are the selected candidates, numbered. Most are good — your job is ONLY to flag the clearly WEAK ones a senior analyst would cut: wrong industry for this client, a body serving a different country corridor than the client's, a generic item with no plausible use to them, or an obvious duplicate of another numbered item. When unsure, KEEP — do not flag borderline-but-plausible items. Judge mentors/providers/hubs by fit with the client's OWN industry and origin; judge events/leads/content by fit with the client's market and buyers.

${grouped.join("\n\n")}

Respond with ONLY a JSON object, no markdown fences:
{"drop": [{"ref": <number>, "why": "<10 words max>"}]}
If nothing should be dropped: {"drop": []}`;
}

export interface RerankVerdicts {
  dropRefs: Map<number, string>; // ref -> reason
  parsed: boolean;               // false => fail-open (no drops applied)
}

/** Tolerant parse of the LLM reply. Unknown refs are ignored; any failure → parsed:false. */
export function parseRerankVerdicts(aiText: string, maxRef: number): RerankVerdicts {
  const dropRefs = new Map<number, string>();
  try {
    const cleaned = (aiText || "").replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start < 0 || end <= start) return { dropRefs, parsed: false };
    const obj = JSON.parse(cleaned.slice(start, end + 1));
    if (!Array.isArray(obj?.drop)) return { dropRefs, parsed: false };
    for (const d of obj.drop) {
      const ref = Number(d?.ref);
      if (Number.isInteger(ref) && ref >= 1 && ref <= maxRef) {
        dropRefs.set(ref, clip(d?.why, 80) || "flagged irrelevant");
      }
    }
    return { dropRefs, parsed: true };
  } catch {
    return { dropRefs: new Map(), parsed: false };
  }
}

export interface RerankResult {
  matches: Record<string, Row[]>;
  droppedByTable: Record<string, number>;
  droppedNames: string[]; // for telemetry/logging — names only, no PII fields
}

/**
 * Apply drop verdicts, floor-guarded per table: if drops would leave fewer than
 * `minKeep` rows, the highest-ranked dropped rows are restored (original order)
 * until the floor is met. Tables outside RERANK_TABLES pass through untouched.
 * Returns new arrays — input is not mutated.
 */
export function applyRerankVerdicts(
  matches: Record<string, Row[]>,
  items: RerankItem[],
  verdicts: RerankVerdicts,
  minKeep = RERANK_MIN_KEEP,
): RerankResult {
  const out: Record<string, Row[]> = { ...matches };
  const droppedByTable: Record<string, number> = {};
  const droppedNames: string[] = [];
  if (!verdicts.parsed || verdicts.dropRefs.size === 0) {
    return { matches: out, droppedByTable, droppedNames };
  }
  const byTable = new Map<string, Set<number>>(); // tbl -> pool idx flagged
  for (const it of items) {
    if (verdicts.dropRefs.has(it.ref)) {
      (byTable.get(it.tbl) ?? byTable.set(it.tbl, new Set()).get(it.tbl)!).add(it.idx);
    }
  }
  for (const [tbl, dropIdx] of byTable) {
    const pool = matches[tbl] || [];
    // Floor: a section that started with >= minKeep rows must retain minKeep; a
    // smaller section must just never be emptied (retain 1). So a thin pool can
    // still shed a clearly-wrong pick, but a healthy one can't be gutted.
    const floor = pool.length >= minKeep ? minKeep : 1;
    const keepable = pool.length - dropIdx.size;
    if (keepable < floor && pool.length > 0) {
      // Restore best-ranked flagged rows (ascending pool order = scorer order)
      // until the floor is met.
      const restore = floor - keepable;
      let restored = 0;
      for (const i of [...dropIdx].sort((a, b) => a - b)) {
        if (restored >= restore) break;
        dropIdx.delete(i);
        restored++;
      }
    }
    if (dropIdx.size === 0) continue;
    out[tbl] = pool.filter((_, i) => !dropIdx.has(i));
    droppedByTable[tbl] = dropIdx.size;
    for (const i of dropIdx) droppedNames.push(clip(pool[i]?.name || pool[i]?.title, 60));
  }
  return { matches: out, droppedByTable, droppedNames };
}
