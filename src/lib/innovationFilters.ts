/**
 * Pure filter logic for the Innovation Ecosystem directory — React-free, tested.
 * Extracted during the MES-97 migration to the shared DirectoryFilterBar.
 *
 * NB: `innovation_ecosystem` has no type/category column, so there is no primary
 * tab axis here (flagged as a data gap in MES-100) — only search + location +
 * service.
 */
import type { FilterValues } from "@/lib/directoryFilters";

export interface OrganisationLike {
  name: string;
  description: string;
  location: string;
  services?: string[] | null;
}

/** Keys: search, location, service (each defaulting to "" / "all"). */
export function filterOrganisations<T extends OrganisationLike>(orgs: T[], filters: FilterValues): T[] {
  const search = (filters.search ?? "").toLowerCase().trim();
  const { location = "all", service = "all" } = filters;
  const serviceLc = service.toLowerCase();

  return orgs.filter((org) => {
    const matchesSearch =
      search === "" ||
      org.name.toLowerCase().includes(search) ||
      org.description.toLowerCase().includes(search) ||
      (org.services ?? []).some((s) => s.toLowerCase().includes(search));

    const matchesLocation = location === "all" || org.location === location;
    const matchesService = service === "all" || (org.services ?? []).some((s) => s.toLowerCase() === serviceLc);

    return matchesSearch && matchesLocation && matchesService;
  });
}
