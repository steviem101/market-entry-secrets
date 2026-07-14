/**
 * Pure filter/sort logic for the Leads directory — React-free, unit-tested.
 * Extracted during the MES-97 migration to the shared DirectoryFilterBar.
 */
import type { FilterValues } from "@/lib/directoryFilters";

export interface LeadLike {
  title: string;
  description?: string | null;
  short_description?: string | null;
  tags?: string[] | null;
  list_type?: string | null;
  location?: string | null;
  sector?: string | null;
  /** Canonical MES-110 sector slugs (MES-177 C1). */
  sector_tags?: string[] | null;
  record_count?: number | null;
  created_at: string;
}

/**
 * Filter + sort lead databases from shared filter values. Keys:
 *   search, type (list_type), location, sector, sort (newest | most_records).
 * Returns a new array; input is not mutated.
 *
 * MES-177 C1: the sector facet is canonical `sector_tags` (not the free-text
 * `sector`, which stays searchable via `search`).
 */
export function filterAndSortLeads<T extends LeadLike>(leads: T[], filters: FilterValues): T[] {
  const search = (filters.search ?? "").toLowerCase().trim();
  const { type = "all", location = "all", sector = "all", sort = "newest" } = filters;

  const filtered = leads.filter((lead) => {
    const matchesSearch =
      search === "" ||
      lead.title.toLowerCase().includes(search) ||
      (lead.description ?? "").toLowerCase().includes(search) ||
      (lead.short_description ?? "").toLowerCase().includes(search) ||
      // Free-text sector stays searchable even though the facet is now sector_tags.
      (lead.sector ?? "").toLowerCase().includes(search) ||
      (lead.tags ?? []).some((t) => t.toLowerCase().includes(search));

    const matchesType = type === "all" || lead.list_type === type;
    const matchesLocation = location === "all" || lead.location === location;
    const matchesSector = sector === "all" || (lead.sector_tags ?? []).includes(sector);

    return matchesSearch && matchesType && matchesLocation && matchesSector;
  });

  const sorted = [...filtered];
  switch (sort) {
    case "most_records":
      sorted.sort((a, b) => (b.record_count || 0) - (a.record_count || 0));
      break;
    case "newest":
    default:
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
  }
  return sorted;
}
