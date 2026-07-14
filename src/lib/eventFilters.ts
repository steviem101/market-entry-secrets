/**
 * Pure filter logic for the Events directory — React-free, tested.
 * Extracted during the MES-98 migration to the shared DirectoryFilterBar.
 *
 * Time (upcoming/past) partitions the base set and is handled by the caller;
 * this module covers the client-side filter dimensions (type/city/sector).
 *
 * Retired dimensions (2026-07-14 filter bar consistency sweep):
 *   - category: 49 free-text values duplicating the sector vocabulary
 *   - topic: no usage evidence (dimension-budget cut)
 *   - persona: the audience pill was dropped platform-wide
 *   - source: Curated/Community lists merged — community rows are badged on
 *     the card instead; the `source` column stays in data for admin/ops
 * Stale URL params for any of these are ignored (not in the page's FilterSpec).
 */
import type { FilterValues } from "@/lib/directoryFilters";
// Relative (not "@/") because this module is unit-tested with node --test, whose
// resolver doesn't understand the Vite alias for runtime (value) imports.
import { resolveEventBucket } from "./eventTypeBuckets.ts";

/** Rows ingested by the community scrape (badged on the card, not partitioned). */
export const COMMUNITY_SOURCE = "apify_events_finder";

export interface EventLike {
  type?: string | null;
  type_canonical?: string | null;
  city?: string | null;
  sector?: string | null;
}

/**
 * Apply the client-side filter dimensions to an already time-partitioned list.
 * Keys: type (canonical bucket), city, sector (each "all" = off).
 */
export function filterEvents<T extends EventLike>(events: T[], filters: FilterValues): T[] {
  const { type = "all", city = "all", sector = "all" } = filters;

  return events.filter((event) => {
    // `type` is a canonical bucket (MES-130): prefer the DB type_canonical
    // column, fall back to computing from the raw events.type value.
    const matchesType = type === "all" || resolveEventBucket(event) === type;
    const matchesCity = city === "all" || event.city === city;
    const matchesSector = sector === "all" || event.sector === sector;
    return matchesType && matchesCity && matchesSector;
  });
}
