/**
 * Pure filter/partition logic for the Events directory — React-free, tested.
 * Extracted during the MES-98 migration to the shared DirectoryFilterBar.
 *
 * Source (curated/community) and time (upcoming/past) partition the base set
 * and are handled by the caller; this module covers the client-side filter
 * dimensions (category/type/city/sector/topic/persona) plus the source helper.
 */
import type { FilterValues } from "@/lib/directoryFilters";
// Relative (not "@/") because this module is unit-tested with node --test, whose
// resolver doesn't understand the Vite alias for runtime (value) imports.
import { resolveEventBucket } from "./eventTypeBuckets.ts";

export const COMMUNITY_SOURCE = "apify_events_finder";

// The event-function axis (Appendix D categories), carried in `tags`. Fixed
// allowlist so the Topic filter shows clean function chips, not noisy
// location/keyword tags some curated rows also carry.
export const TOPIC_TAGS = [
  "AI/ML", "Founders/Startup", "Investing", "Networking",
  "Growth/Marketing", "Product", "Design", "Dev/Engineering", "Web3/Crypto",
];

export interface EventLike {
  category?: string | null;
  type?: string | null;
  type_canonical?: string | null;
  city?: string | null;
  sector?: string | null;
  tags?: string[] | null;
  source?: string | null;
  persona?: string | null;
  target_personas?: string[] | null;
}

/** True if an event belongs to the selected source partition. */
export function matchesSource(event: EventLike, source: string): boolean {
  if (source === "all") return true;
  if (source === "community") return event.source === COMMUNITY_SOURCE;
  // "curated" (default) — anything not from the community scrape.
  return event.source !== COMMUNITY_SOURCE;
}

/** Persona (audience) matching — mirrors the original in-page logic. */
export function matchesPersona(event: EventLike, persona: string): boolean {
  if (persona === "all") return true;
  const hasTarget = !!event.target_personas?.length;
  const hasPersona = !!event.persona;
  // Don't hide events we can't classify on either signal.
  if (!hasTarget && !hasPersona) return true;
  const targetMatch = hasTarget && event.target_personas!.includes(persona);
  const personaMatch =
    hasPersona &&
    (event.persona === "both" ||
      (persona === "international_entrant" && event.persona === "international_entrant") ||
      (persona === "local_startup" && event.persona === "local_founder"));
  return targetMatch || personaMatch;
}

/**
 * Apply the client-side filter dimensions to an already source/time-partitioned
 * list. Keys: category, type, city, sector, topic, persona (each "all" = off).
 */
export function filterEvents<T extends EventLike>(events: T[], filters: FilterValues): T[] {
  const { category = "all", type = "all", city = "all", sector = "all", topic = "all", persona = "all" } = filters;

  return events.filter((event) => {
    const matchesCategory = category === "all" || event.category === category;
    // `type` is a canonical bucket (MES-130): prefer the DB type_canonical
    // column, fall back to computing from the raw events.type value.
    const matchesType = type === "all" || resolveEventBucket(event) === type;
    const matchesCity = city === "all" || event.city === city;
    const matchesSector = sector === "all" || event.sector === sector;
    const matchesTopic = topic === "all" || (event.tags ?? []).includes(topic);
    return matchesCategory && matchesType && matchesCity && matchesSector && matchesTopic && matchesPersona(event, persona);
  });
}
