// Pure filter/sort logic for the /countries listing, kept out of the
// component per house convention (colocated tests in
// countryDirectoryFilters.test.ts).

export interface CountryDirectoryLike {
  name: string;
  description: string;
  featured: boolean;
  sort_order: number | null;
  key_industries: string[];
  trade_relationship_strength: string | null;
  case_study_count: number;
  mentor_count: number;
  agency_count: number;
  investor_count: number;
  provider_count: number;
}

export type CountrySortMode = "featured" | "density" | "alphabetical";

export interface CountryDirectoryFilters {
  search: string;
  strength: string | null;
  sector: string | null;
  sort: CountrySortMode;
}

export const countryDensity = (c: CountryDirectoryLike): number =>
  c.case_study_count + c.mentor_count + c.agency_count + c.investor_count + c.provider_count;

const byDensityThenName = (a: CountryDirectoryLike, b: CountryDirectoryLike): number =>
  countryDensity(b) - countryDensity(a) || a.name.localeCompare(b.name);

// Admin-curated order wins in featured mode; NULL sort_order sinks to the
// bottom so unset countries fall through to the density/name tiebreak.
const bySortOrder = (a: CountryDirectoryLike, b: CountryDirectoryLike): number => {
  const av = a.sort_order ?? Number.POSITIVE_INFINITY;
  const bv = b.sort_order ?? Number.POSITIVE_INFINITY;
  if (av === bv) return 0; // both unset (or equal) -> avoid Infinity - Infinity = NaN
  return av - bv;
};

export function filterAndSortCountries<T extends CountryDirectoryLike>(
  countries: T[],
  { search, strength, sector, sort }: CountryDirectoryFilters,
): T[] {
  const q = search.trim().toLowerCase();

  const filtered = countries.filter((c) => {
    if (strength && c.trade_relationship_strength !== strength) return false;
    if (sector && !c.key_industries.includes(sector)) return false;
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.key_industries.some((k) => k.toLowerCase().includes(q))
    );
  });

  return [...filtered].sort((a, b) => {
    if (sort === "alphabetical") return a.name.localeCompare(b.name);
    if (sort === "density") return byDensityThenName(a, b);
    // "featured": featured first, then the admin-curated sort_order, then
    // data density, then name.
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return bySortOrder(a, b) || byDensityThenName(a, b);
  });
}

/** Distinct strength values present in the data, insertion-ordered. */
export const distinctStrengths = (countries: CountryDirectoryLike[]): string[] =>
  Array.from(
    new Set(countries.map((c) => c.trade_relationship_strength).filter(Boolean)),
  ) as string[];

/** Top N key industries by how many countries carry them. */
export const topSectors = (countries: CountryDirectoryLike[], limit = 8): string[] => {
  const counts = new Map<string, number>();
  countries.forEach((c) =>
    c.key_industries.forEach((k) => counts.set(k, (counts.get(k) ?? 0) + 1)),
  );
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k]) => k);
};
