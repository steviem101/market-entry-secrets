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
const anzRe = toWordBoundaryRegex(ANZ_TOKENS);

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
  (s == null ? "" : String(s)).toLowerCase().replace(/[_-]+/g, " ").trim();

// In-market `location_country` values (normalised). The platform targets the
// Australian/ANZ market, so a domestic ANZ body counts regardless of the exact
// spelling used — real data carries "australia", "new_zealand" AND the bare code
// "au". Kept in sync with the ANZ tokens used for the provider surfaces.
const ANZ_MARKET_COUNTRIES = new Set<string>([
  "australia", "au", "aus", "anz", "new zealand", "nz",
]);

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
/** Does this agency operate in the ANZ market — by recorded country (or blank, in an
 *  AU-centric directory) or by a `jurisdiction` entry that names an ANZ region? */
function operatesInANZ(row: NonNullable<Row>): boolean {
  const locCountry = norm(row.location_country);
  if (locCountry === "" || ANZ_MARKET_COUNTRIES.has(locCountry)) return true;
  const j = row.jurisdiction;
  const arr = Array.isArray(j) ? j : j == null ? [] : [j];
  return arr.some((x) => anzRe.test(norm(x)));
}

/**
 * A bilateral chamber's `jurisdiction` pairs an ANZ member with its partner country
 * (or countries) — AmCham Australia → ["Australia","United States"]; the Italian
 * Chamber of Commerce in NZ → ["Italy","New Zealand"]. Strip the ANZ entries; what
 * remains is the foreign partner. Such a chamber is only relevant to a founder FROM
 * that partner country, so it's in corridor when a partner matches the origin — or
 * when no specific foreign partner is named (a generic ANZ chamber, kept for all).
 * Missing jurisdiction is treated as generic (kept) rather than guessed.
 */
function bilateralPartnerInCorridor(row: NonNullable<Row>, originTerms: string[]): boolean {
  const j = row.jurisdiction;
  const arr = Array.isArray(j) ? j : j == null ? [] : [j];
  const partners = arr.map((x) => norm(x)).filter((x) => x && !anzRe.test(x));
  if (partners.length === 0) return true; // generic ANZ chamber — no specific foreign partner
  return partners.some((p) => originTerms.some((t) => t && p.includes(t)));
}

export function isAgencyInCorridor(row: Row, originTerms: string[]): boolean {
  if (!row) return false;
  const orgType = norm(row.organisation_type);
  const isForeignMission = orgType === "foreign trade agency";

  // (A) Domestic ANZ body (not a foreign mission) — an Australian/NZ government,
  // state, bilateral chamber, industry body, or a private trade consultancy that
  // OPERATES in the ANZ market — is always in scope. "Operates in ANZ" means either
  // its recorded country is ANZ (or blank, in an AU-centric directory) OR its
  // `jurisdiction` covers ANZ. The jurisdiction escape is what keeps a consultancy
  // HQ'd abroad but serving Australia (ALTIOS/Expandys — jurisdiction ["Australia",…])
  // and rescues rows with a mis-set location_country (e.g. an AU chamber tagged
  // location_country=canada whose jurisdiction still names Australia). It does NOT
  // re-admit foreign government missions — those are `foreign_trade_agency` and never
  // take this branch, so a Canadian consulate (jurisdiction ["Canada","Australia"])
  // still falls to the origin check below. A genuinely-foreign inward-investment
  // agency (Invest Northern Ireland — jurisdiction ["Northern Ireland","United
  // Kingdom"], no ANZ) also falls through, appearing only for a founder from there.
  if (!isForeignMission && operatesInANZ(row)) {
    // A bilateral chamber (ANZ ↔ one partner country) is relevant only to founders from
    // that partner country — AmCham Australia (partner US) is noise for a Singaporean;
    // an Italy–NZ chamber is noise for anyone but an Italian founder. Gate it by partner;
    // every other ANZ body (federal/state govt, industry association, trade consultancy)
    // stays for everyone.
    return orgType === "bilateral" ? bilateralPartnerInCorridor(row, originTerms) : true;
  }

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
