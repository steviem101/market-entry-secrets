/**
 * Server-side identity-leak lint for AI-generated anonymous mentor copy (MES-208).
 *
 * Pure module (no Deno APIs) so it runs under `npm test` alongside the other edge
 * function tests. Mirrors the token rules of the client-side advisory guard in
 * src/lib/mentorDisplay.ts (identityLeak) and extends them: leak terms are drawn
 * from the mentor's real name, real company, AND experience-tile company names —
 * the tile names were a known gap in the client-only guard.
 *
 * Country/place tokens are deliberately exempt: a mentor's origin is a welcomed,
 * non-identifying signal ("Singapore Trade & Government"), even when the country
 * word also appears in their employer's name ("Enterprise Singapore").
 */

export interface LeakFlag {
  field: string;
  term: string;
}

const STOPWORDS = new Set([
  "group", "global", "ventures", "capital", "partners", "advisory",
  "consulting", "services", "company", "limited", "pty", "the", "and",
]);

// Same vocabulary as COUNTRY_LABELS in src/lib/mentorDisplay.ts (keys + labels).
const COUNTRY_WORDS = new Set([
  "australia", "new", "zealand", "uk", "usa", "ireland", "singapore", "canada",
  "france", "germany", "china", "korea", "south", "japan", "india", "hong",
  "kong", "africa", "other", "asia", "eu", "europe",
]);

/**
 * Distinctive tokens that would re-identify the mentor: the full name/company
 * strings plus each significant word (surname, distinctive company word),
 * stopword- and country-filtered.
 */
export const leakTerms = (sources: (string | null | undefined)[]): string[] => {
  const terms = new Set<string>();
  for (const source of sources) {
    if (!source) continue;
    const full = source.trim().toLowerCase();
    if (full.length >= 3 && !COUNTRY_WORDS.has(full)) terms.add(full);
    for (const word of full.split(/\s+/)) {
      if (word.length >= 4 && !STOPWORDS.has(word) && !COUNTRY_WORDS.has(word)) {
        terms.add(word);
      }
    }
  }
  return Array.from(terms);
};

const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** First leaking term found in `text`, or null when clean. Token-aware. */
export const findLeak = (text: string, terms: string[]): string | null => {
  const haystack = ` ${text.toLowerCase()} `;
  for (const term of terms) {
    if (new RegExp(`(^|\\W)${escapeRegExp(term)}(\\W|$)`).test(haystack)) return term;
  }
  return null;
};

/**
 * Lint every draft field against the mentor's identifying terms.
 * Returns one flag per (field, term) hit.
 */
export const lintDraft = (
  fields: Record<string, string | null | undefined>,
  terms: string[],
): LeakFlag[] => {
  const flags: LeakFlag[] = [];
  for (const [field, value] of Object.entries(fields)) {
    if (!value) continue;
    const term = findLeak(value, terms);
    if (term) flags.push({ field, term });
  }
  return flags;
};

/** Company names out of the experience_tiles JSONB ([{ name, ... }]). */
export const tileCompanyNames = (tiles: unknown): string[] => {
  if (!Array.isArray(tiles)) return [];
  return tiles
    .map((t) => (t && typeof t === "object" && "name" in t ? String((t as { name: unknown }).name) : ""))
    .filter((n) => n.length > 0);
};
