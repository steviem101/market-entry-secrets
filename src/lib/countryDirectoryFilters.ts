// Pure filter/sort logic for the /countries listing, kept out of the
// component per house convention (colocated tests in
// countryDirectoryFilters.test.ts).

export interface CountryDirectoryLike {
  name: string;
  description: string;
  featured: boolean;
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
    if (sort === "density")
      return countryDensity(b) - countryDensity(a) || a.name.localeCompare(b.name);
    // "featured": featured first, then data density, then name
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return countryDensity(b) - countryDensity(a) || a.name.localeCompare(b.name);
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
