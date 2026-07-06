/**
 * Pure filter logic for the Government Support (trade/investment agencies)
 * directory — React-free, tested. Extracted during the MES-98 migration.
 *
 * Type/sector values are raw slugs; a normalised-comparison fallback keeps
 * pre-MES-94 bookmarks that carried the prettified label still matching.
 */
import type { FilterValues } from "@/lib/directoryFilters";

export interface AgencyLike {
  name?: string | null;
  description?: string | null;
  tagline?: string | null;
  services?: string[] | null;
  location?: string | null;
  organisation_type?: string | null;
  sectors_supported?: string[] | null;
  category_slug?: string | null;
}

const normalise = (v: string) => v.replace(/_/g, " ").toLowerCase();

/** Keys: search, location, type, sector, category (each defaulting to "" / "all"). */
export function filterAgencies<T extends AgencyLike>(agencies: T[], filters: FilterValues): T[] {
  const search = (filters.search ?? "").toLowerCase().trim();
  const { location = "all", type = "all", sector = "all", category = "all" } = filters;

  return agencies.filter((a) => {
    const matchesSearch =
      search === "" ||
      (a.name ?? "").toLowerCase().includes(search) ||
      (a.description ?? "").toLowerCase().includes(search) ||
      (a.services ?? []).some((s) => s.toLowerCase().includes(search)) ||
      (a.tagline ?? "").toLowerCase().includes(search);

    const matchesLocation =
      location === "all" || (a.location ?? "").toLowerCase().includes(location.toLowerCase());

    const matchesSector =
      sector === "all" ||
      (!!a.sectors_supported &&
        (a.sectors_supported.includes("all") ||
          a.sectors_supported.includes(sector) ||
          a.sectors_supported.some((s) => normalise(s) === normalise(sector))));

    const matchesType =
      type === "all" ||
      a.organisation_type === type ||
      (!!a.organisation_type && normalise(a.organisation_type) === normalise(type));

    const matchesCategory = category === "all" || a.category_slug === category;

    return matchesSearch && matchesLocation && matchesSector && matchesType && matchesCategory;
  });
}
