/**
 * Maps a country page slug to its ISO 3166-1 alpha-2 code, used to pick the
 * right flag in <CountryFlag>. Returns null for any slug we don't have an
 * explicit, verified mapping for — callers must treat "no code" as "no flag"
 * rather than rendering a wrong (previously: always Irish) flag.
 *
 * Shared by CountryPage (detail) and CountryCard (listing) so both agree.
 */
const SLUG_TO_CODE: Record<string, string> = {
  ireland: "IE",
  uk: "GB",
  "united-kingdom": "GB",
  "great-britain": "GB",
  usa: "US",
  "united-states": "US",
  "united-states-of-america": "US",
  singapore: "SG",
};

export const getCountryCode = (slug: string | null | undefined): string | null => {
  if (!slug) return null;
  return SLUG_TO_CODE[slug.toLowerCase()] ?? null;
};
