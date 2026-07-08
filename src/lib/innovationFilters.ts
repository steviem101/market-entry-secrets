/**
 * Pure filter logic for the Innovation Ecosystem directory — React-free, tested.
 * Extracted during the MES-97 migration to the shared DirectoryFilterBar.
 *
 * The `type` axis (MES-100 spin-off) is MULTI-VALUE: `type` is a text[] so an org
 * that is e.g. both an Accelerator and a Coworking Space surfaces under either tab
 * (array membership, not equality). Rows with no type stay under the "All" tab.
 */
import type { FilterValues } from "@/lib/directoryFilters";

export interface OrganisationLike {
  name: string;
  description: string;
  location: string;
  services?: string[] | null;
  type?: string[] | null;
}

/** Keys: search, location, service, type (each defaulting to "" / "all"). */
export function filterOrganisations<T extends OrganisationLike>(orgs: T[], filters: FilterValues): T[] {
  const search = (filters.search ?? "").toLowerCase().trim();
  const { location = "all", service = "all", type = "all" } = filters;
  const serviceLc = service.toLowerCase();

  return orgs.filter((org) => {
    const matchesSearch =
      search === "" ||
      org.name.toLowerCase().includes(search) ||
      org.description.toLowerCase().includes(search) ||
      (org.services ?? []).some((s) => s.toLowerCase().includes(search));

    const matchesLocation = location === "all" || org.location === location;
    const matchesService = service === "all" || (org.services ?? []).some((s) => s.toLowerCase() === serviceLc);
    // Multi-value type: the tab value must be one of the org's types.
    const matchesType = type === "all" || (org.type ?? []).includes(type);

    return matchesSearch && matchesLocation && matchesService && matchesType;
  });
}
