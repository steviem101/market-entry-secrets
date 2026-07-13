// MES-148 Phase 5 (P5-1) — service-term synonym expansion (pure logic, node --test).
//
// Directory service tags are fragmented free text ("Legal Services", "Tax & Legal",
// "HR / Talent"), so an intake goal's exact tag ("Legal", "HR") misses the rows that
// use a variant. `service_terms` maps each canonical term to its real directory-cased
// synonyms; this module expands a set of goal tags into that superset before matching.
//
// ADDITIVE ONLY: the original tags are always retained, and unknown tags pass through
// untouched — so expansion can only ADD matching variants to the `.cs.{}` arms, never
// remove one. Behind the SERVICE_TERMS_ENABLED flag in generate-report.

export interface ServiceTermRow {
  slug: string;
  label: string;
  synonyms: string[];
}

export interface ServiceTermIndex {
  /** lowercased variant → the full set of real-cased synonyms for that term. */
  bySynonym: Map<string, string[]>;
}

/** Build a case-insensitive lookup from every known variant (slug, label, each
 *  synonym) to that term's full real-cased synonym+label set. */
export function buildServiceTermIndex(rows: ServiceTermRow[]): ServiceTermIndex {
  const bySynonym = new Map<string, string[]>();
  for (const row of rows || []) {
    if (!row?.slug) continue;
    // The term's expansion set: the label + every synonym, de-duplicated, real-cased.
    const expansion = [...new Set([row.label, ...(row.synonyms || [])].filter((s) => typeof s === "string" && s.trim()))];
    // Index the term under every case-folded key that should resolve to it.
    const keys = new Set<string>([row.slug, row.label, ...(row.synonyms || [])]
      .filter((s) => typeof s === "string" && s.trim())
      .map((s) => s.trim().toLowerCase()));
    for (const k of keys) {
      // First term to claim a key wins (deterministic); curated synonyms shouldn't
      // collide across terms, but if they do we don't silently merge two expansions.
      if (!bySynonym.has(k)) bySynonym.set(k, expansion);
    }
  }
  return { bySynonym };
}

/** Expand a list of tags into the union of themselves + their term synonyms.
 *  Order-stable (originals first, then newly-added synonyms), de-duplicated. */
export function expandServiceTags(tags: string[], index: ServiceTermIndex): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (t: string) => {
    if (typeof t !== "string") return;
    const trimmed = t.trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(trimmed);
  };
  // Originals first so their casing/order is preserved for the matcher.
  for (const t of tags || []) push(t);
  for (const t of tags || []) {
    const expansion = index.bySynonym.get((t ?? "").trim().toLowerCase());
    if (expansion) for (const syn of expansion) push(syn);
  }
  return out;
}
