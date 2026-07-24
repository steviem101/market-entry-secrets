/**
 * Events region hard-filter + title|date|venue dedupe.
 *
 * Pure module — NO Deno globals, NO I/O — so it's importable by the edge function
 * AND unit-tested under Node (`node --test`), exactly like targetRegion.ts /
 * matchScoring.ts. Extracted from index.ts (MES-232) so the events geo gate is
 * directly testable.
 *
 * `regionFilterAndDedupeEvents` keeps the report's events slate free of wrong-city
 * and near-duplicate rows: it hard-drops any event whose location matches none of
 * the supplied `locationPatterns`, then collapses rows sharing a normalised
 * title|date|venue key. Passing an EMPTY `locationPatterns` skips the city drop
 * while STILL deduping — this is how a "National" target is honoured (MES-186 B):
 * a national-tier interstate conference the entrant explicitly targets stays
 * eligible, and ranking (score + the target-city soft bonus) decides order.
 */

/** First 6 word-tokens, lowercased and punctuation-flattened — the fuzzy key half
 *  that collapses "Startups Demos & Networking Melbourne" duplicates for one night. */
export const normalizeEventKeyPart = (s: string): string =>
  (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).slice(0, 6).join(" ");

export function regionFilterAndDedupeEvents<T extends { title?: string; date?: string; location?: string }>(
  events: T[],
  locationPatterns: string[],
  cap: number,
): T[] {
  let filtered = events || [];
  if (locationPatterns.length > 0) {
    filtered = filtered.filter((row) => {
      const loc = (row.location || "").toLowerCase();
      return locationPatterns.some((l) => loc.includes(l.toLowerCase()));
    });
  }
  const seen = new Set<string>();
  const deduped: T[] = [];
  for (const e of filtered) {
    const key = `${normalizeEventKeyPart(e.title || "")}|${e.date || ""}|${normalizeEventKeyPart(e.location || "")}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(e);
    if (deduped.length >= cap) break;
  }
  return deduped;
}
