/**
 * Geography / origin relevance gate for directory matches.
 *
 * Pure module — NO Deno globals, NO I/O — so it's importable by the Deno edge
 * function AND unit-tested under Node (`node --test`), like matchScoring.ts /
 * keyPageSelect.ts / competitorQueries.ts.
 *
 * Why it exists (Stage 7 bug review — Kota report, bugs B3 & B4):
 *   B3 — a New-York firm ("SIS International Research — New York City, NY, USA")
 *        was recommended under Service Providers on an *Australia* entry report.
 *   B4 — UK & Canadian trade agencies were shown as Trade & Government for an
 *        *Irish* company (neither the AU target market nor the Irish origin).
 * Root cause: the scorer is purely additive — a location hit is only worth `+1`,
 * it never EXCLUDES. So when the on-target pool is thin, a wrong-market row can
 * still win a slot as backfill.
 *
 * Two gates, because the two surfaces carry different signals:
 *   • Providers / innovation hubs — geography lives in a free-text `location`.
 *     `isGeoRelevant` drops a clearly-foreign location (word-boundary matched so
 *     "NT" can't match "inter**nt**ional", "WA" can't match "soft**wa**re").
 *   • Trade / government agencies — nearly every one is a foreign mission
 *     PHYSICALLY in Australia (so its text says "Australia"), so a text match is
 *     useless. `isAgencyInCorridor` uses the structured columns instead:
 *     `organisation_type` separates Australian bodies from foreign missions, and
 *     the represented country (jurisdiction / location_country / name) must be the
 *     founder's origin for a foreign mission to stay.
 */

// Australia + New Zealand (ANZ) region recogniser. Full names + safe
// abbreviations; the word-boundary regex below keeps the 2-3 letter ones honest.
const ANZ_TOKENS: string[] = [
  "australia", "australian", "aus", "au", "anz",
  "new south wales", "nsw", "victoria", "vic", "queensland", "qld",
  "western australia", "wa", "south australia", "sa", "tasmania", "tas",
  "australian capital territory", "act", "northern territory", "nt",
  "sydney", "melbourne", "brisbane", "perth", "adelaide", "canberra",
  "hobart", "darwin", "gold coast", "newcastle", "wollongong", "geelong", "cairns",
  "new zealand", "nz", "auckland", "wellington", "christchurch",
];

// A non-blank location that reads as location-agnostic rather than foreign —
// keep these on the provider surfaces (a "Global"/"Remote" provider is not a
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

/** The directory-row fields the gates read; everything is optional + unknown-typed
 *  so a raw Supabase row (or a decorated match card) satisfies it without casts. */
interface GeoRow {
  location?: unknown;
  name?: unknown;
  title?: unknown;
  company_name?: unknown;
  description?: unknown;
  country?: unknown;
  organisation_type?: unknown;
  location_country?: unknown;
  country_iso2?: unknown;
  jurisdiction?: unknown;
}
type Row = GeoRow | null | undefined;

export interface GeoScope {
  /** user's target regions, already split on "/" and sanitised (e.g. ["Australia"]) */
  targetRegions?: string[];
}

/**
 * Origin-country terms for the corridor check (agencies). An origin trade body
 * (Enterprise Ireland for an Irish founder) is genuinely useful, so it must stay
 * in scope. Returns [] for a blank/Australian origin (already the target market).
 * Length >= 4 avoids "us"/"uk"/"uae" codes false-matching common words.
 * Underscores/dashes are normalised to spaces to match stored values like
 * "united_kingdom".
 */
export function geoOriginTerms(countryOfOrigin?: string | null): string[] {
  const term = (countryOfOrigin || "").trim().toLowerCase().replace(/[_-]+/g, " ");
  if (term.length < 4) return [];
  if (term === "australia" || term === "australian") return [];
  return [term];
}

/** Build the ANZ + target-region matcher used for the provider/innovation surfaces. */
export function buildGeoMatcher(scope: GeoScope = {}): RegExp {
  const extra = (scope.targetRegions || [])
    .map((s) => (s || "").trim().toLowerCase())
    .filter((t) => t.length >= 2);
  return toWordBoundaryRegex([...ANZ_TOKENS, ...extra]);
}

/**
 * Is this provider/innovation row in the report's target geography?
 * Passes when the `location` is blank/ambiguous ("Global"/"Remote") OR names an
 * in-scope region; only a clearly-foreign location ("New York City, NY, USA") is
 * dropped. The blank escape matters — many genuine AU rows carry no location.
 */
export function isGeoRelevant(row: Row, matcher: RegExp): boolean {
  if (!row) return false;
  const loc = String(row.location ?? "").toLowerCase().trim();
  if (!loc) return true;                  // blank location: can't tell — keep
  if (ambiguousRe.test(loc)) return true; // "Global"/"Remote"/etc — keep
  return matcher.test(loc);
}

const norm = (s: unknown): string =>
  (s == null ? "" : String(s)).toLowerCase().replace(/[_-]+/g, " ");

/**
 * Is this trade/government agency in the report's corridor (AU target market OR
 * the founder's origin country)?
 *
 * `organisation_type` is the key signal: a non-`foreign_trade_agency` row located
 * in Australia (federal_agency / state_body / bilateral chamber — Austrade,
 * Investment NSW, the AU-UK Chamber) is an Australian body and always in scope. A
 * `foreign_trade_agency` is a foreign country's mission — nearly all are physically
 * in Australia, so their text says "Australia"; they stay ONLY when they represent
 * the founder's origin country (checked against name / jurisdiction / location_country
 * / description). So Enterprise Ireland stays for an Irish founder while the Canadian
 * / UK / Malaysian missions drop. `originTerms` = [] (domestic AU founder) drops every
 * foreign mission, which is correct.
 */
export function isAgencyInCorridor(row: Row, originTerms: string[]): boolean {
  if (!row) return false;
  const orgType = norm(row.organisation_type);
  const locCountry = norm(row.location_country);
  const isForeignMission = orgType === "foreign trade agency";

  // (A) Australian domestic body (not a foreign mission), or one with no recorded
  // country in an AU-centric directory → in scope.
  if (!isForeignMission && (locCountry === "australia" || locCountry === "")) return true;

  // (B) Represents the founder's origin corridor. Check the structured fields that
  // actually encode the represented country, normalised so "united_kingdom" matches.
  if (originTerms.length > 0) {
    const hay = norm([
      row.name, row.description, row.location, row.location_country, row.country_iso2,
      Array.isArray(row.jurisdiction) ? row.jurisdiction.join(" ") : row.jurisdiction,
    ].filter(Boolean).join(" "));
    if (originTerms.some((t) => t && hay.includes(t))) return true;
  }
  return false;
}
