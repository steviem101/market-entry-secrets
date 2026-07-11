/**
 * Pure filter predicate for the Investors directory — React-free so it can be
 * unit-tested with `node --test`. Mirrors the in-page logic that previously
 * lived in Investors.tsx, plus the new Location dimension.
 */
import type { FilterValues } from "@/lib/directoryFilters";

export interface InvestorLike {
  name?: string | null;
  description?: string | null;
  location?: string | null;
  investor_type?: string | null;
  stage_focus?: string[] | null;
  sector_focus?: string[] | null;
}

const includesCI = (haystack: string | null | undefined, needle: string) =>
  (haystack ?? "").toLowerCase().includes(needle);

/**
 * Filter values expected on `filters`:
 *   search, type, location, stage, sector  (each defaulting to "" / "all").
 */
export function filterInvestors<T extends InvestorLike>(
  investors: T[],
  filters: FilterValues,
): T[] {
  const search = (filters.search ?? "").toLowerCase().trim();
  const { type = "all", location = "all", stage = "all", sector = "all" } = filters;

  return investors.filter((inv) => {
    const matchesSearch =
      search === "" ||
      includesCI(inv.name, search) ||
      includesCI(inv.description, search) ||
      includesCI(inv.location, search) ||
      (inv.sector_focus ?? []).some((s) => s.toLowerCase().includes(search));

    const matchesType = type === "all" || inv.investor_type === type;
    const matchesLocation = location === "all" || inv.location === location;
    const matchesStage = stage === "all" || (inv.stage_focus ?? []).includes(stage);
    const matchesSector = sector === "all" || (inv.sector_focus ?? []).includes(sector);

    return matchesSearch && matchesType && matchesLocation && matchesStage && matchesSector;
  });
}
