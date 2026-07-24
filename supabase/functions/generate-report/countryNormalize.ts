/**
 * Country normalisation for the corridor signal (Phase E).
 *
 * The intake form stores Title-Case country names ("United Kingdom",
 * "South Korea"); directory columns store lower/underscore tokens
 * (community_members.origin_country = "uk", "korea", "hong_kong"). To match an
 * Irish founder to an Irish-origin mentor we must fold both sides to one token.
 *
 * Pure module — no Deno globals — importable by the Deno function AND a Node test.
 */

// alias → canonical token (only where the two sides differ in spelling)
const ALIASES: Record<string, string> = {
  uk: "uk",
  "united kingdom": "uk",
  "great britain": "uk",
  britain: "uk",
  england: "uk",
  scotland: "uk",
  wales: "uk",
  usa: "usa",
  us: "usa",
  "u.s.": "usa",
  "u.s.a.": "usa",
  "united states": "usa",
  "united states of america": "usa",
  america: "usa",
  uae: "uae",
  "united arab emirates": "uae",
  // MES-233: verbose / native Irish origin ("Republic of Ireland", "Éire", "Eire")
  // disarmed the corridor by slugging to "republic-of-ireland"/"éire" instead of
  // matching "ireland". `normalizeCountry` lowercases but does NOT strip diacritics,
  // so the accented "éire" key is listed explicitly alongside the ASCII form.
  "republic of ireland": "ireland",
  eire: "ireland",
  "éire": "ireland",
  korea: "korea",
  "south korea": "korea",
  "republic of korea": "korea",
  "hong kong": "hong-kong",
  hongkong: "hong-kong",
  "new zealand": "new-zealand",
  "south africa": "south-africa",
};

/**
 * Fold a country name/token to a canonical comparison key.
 * Lower-cases, turns underscores into spaces, collapses whitespace, then maps
 * known aliases; unknown values become a hyphenated slug.
 */
export function normalizeCountry(raw?: string | null): string {
  const t = (raw ?? "").toLowerCase().trim().replace(/_+/g, " ").replace(/\s+/g, " ");
  if (!t) return "";
  return ALIASES[t] ?? t.replace(/\s+/g, "-");
}

/** True when the founder is entering Australia from abroad (drives the trade-direction persona). */
export function isInternationalOrigin(countryOfOrigin?: string | null): boolean {
  const c = normalizeCountry(countryOfOrigin);
  return c !== "" && c !== "australia";
}
