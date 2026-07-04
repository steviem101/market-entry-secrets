/**
 * Geography / origin relevance gate for directory matches.
 *
 * Pure module — NO Deno globals, NO I/O — so it's importable by the Deno edge
 * function AND unit-tested under Node (`node --test`), like matchScoring.ts /
 * keyPageSelect.ts / competitorQueries.ts.
 *
 * Why it exists (Stage 7 bug review — Kota report, bugs B3 & B4):
 *   B3 — a New-York firm ("SIS International Research — New York City, USA") was
 *        recommended under Service Providers on an *Australia* entry report.
 *   B4 — UK & Canadian trade agencies were shown as Trade & Government for an
 *        *Irish* company (neither the AU target market nor the Irish origin).
 * Root cause: the scorer is purely additive — a location hit is only worth `+1`,
 * it never EXCLUDES. So when the on-target pool is thin, a wrong-market row can
 * still win a slot as backfill. This module adds an explicit geo predicate that
 * `preferRelevant()` uses to drop wrong-market rows while never emptying a
 * section (it backfills weak rows only when too few in-scope rows exist).
 *
 * Matching is word-boundary based so short abbreviations (NSW, WA, NZ, ACT)
 * can't substring-match inside unrelated words — e.g. "NT" must not match
 * "internatioNal Trade", "WA" must not match "softWAre".
 */

// Australia + New Zealand (ANZ) region recogniser. Full names + safe
// abbreviations; the word-boundary regex below keeps the 2-3 letter ones honest.
const ANZ_TOKENS: string[] = [
  "australia", "australian", "aus", "anz",
  "new south wales", "nsw", "victoria", "vic", "queensland", "qld",
  "western australia", "wa", "south australia", "sa", "tasmania", "tas",
  "australian capital territory", "act", "northern territory", "nt",
  "sydney", "melbourne", "brisbane", "perth", "adelaide", "canberra",
  "hobart", "darwin", "gold coast", "newcastle", "wollongong", "geelong", "cairns",
  "new zealand", "nz", "auckland", "wellington", "christchurch",
];

// A non-blank location that reads as location-agnostic rather than foreign —
// keep these on the non-strict surfaces (a "Global"/"Remote" provider is not a
// wrong-geography leak the way "New York City, USA" is).
const AMBIGUOUS_TOKENS: string[] = [
  "global", "international", "worldwide", "remote", "online", "anywhere",
  "various", "multiple", "hybrid",
];

function toWordBoundaryRegex(tokens: string[]): RegExp {
  const esc = tokens
    .filter((t) => t && t.trim().length >= 2)
    .map((t) => t.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  // Fallback that never matches, so an empty token list can't produce /\b()\b/.
  if (esc.length === 0) return /$a^/;
  return new RegExp(`\\b(${esc.join("|")})\\b`, "i");
}

const ambiguousRe = toWordBoundaryRegex(AMBIGUOUS_TOKENS);

// deno-lint-ignore no-explicit-any
type Row = any;

export interface GeoScope {
  /** user's target regions, already split on "/" and sanitised (e.g. ["Australia"]) */
  targetRegions?: string[];
  /** origin-country terms that should ALSO be in-scope (agencies only) */
  originTerms?: string[];
}

/**
 * Origin-country terms for the corridor surfaces (trade/government agencies).
 * An origin trade body (e.g. Enterprise Ireland for an Irish founder) is genuinely
 * useful, so it must stay in scope. Returns [] for a blank/Australian origin
 * (already covered by the ANZ tokens). Length >= 4 avoids "us"/"uk"/"uae" style
 * codes false-matching common words ("contact us").
 */
export function geoOriginTerms(countryOfOrigin?: string | null): string[] {
  const term = (countryOfOrigin || "").trim().toLowerCase();
  if (term.length < 4) return [];
  if (term === "australia" || term === "australian") return [];
  return [term];
}

/** Build the in-scope matcher: ANZ tokens + the user's target regions (+ origin terms). */
export function buildGeoMatcher(scope: GeoScope = {}): RegExp {
  const extra = [...(scope.targetRegions || []), ...(scope.originTerms || [])]
    .map((s) => (s || "").trim().toLowerCase())
    .filter((t) => t.length >= 2);
  return toWordBoundaryRegex([...ANZ_TOKENS, ...extra]);
}

/**
 * Is this directory row in the report's target geography?
 *
 * Non-strict (default — service providers, innovation hubs): a row passes when its
 * location is blank/ambiguous ("Global"/"Remote") OR its location names an in-scope
 * region. Only a clearly-foreign location ("New York City, USA") is dropped. The
 * blank escape matters because many genuine AU rows carry no location.
 *
 * Strict (trade/government agencies): NO blank escape — the row must POSITIVELY name
 * an in-scope region (AU/ANZ or the founder's origin country) somewhere in its name /
 * location / description. This is what drops a wrong-origin agency whose location is
 * "Unknown" but whose name gives it away ("UK Department for International Trade",
 * "Canadian Consulate").
 */
export function isGeoRelevant(
  row: Row,
  matcher: RegExp,
  opts: { strict?: boolean } = {},
): boolean {
  if (!row) return false;
  const loc = (row.location || row.country || "").toString().toLowerCase().trim();

  if (opts.strict) {
    const text = [row.name, row.title, row.company_name, row.location, row.country, row.description]
      .filter(Boolean).join(" ").toLowerCase();
    return matcher.test(text);
  }

  if (!loc) return true;                  // blank location: can't tell — keep
  if (ambiguousRe.test(loc)) return true; // "Global"/"Remote"/etc — keep
  return matcher.test(loc);
}
