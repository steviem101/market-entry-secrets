/**
 * Pure filter/sort logic for the Mentors directory — React-free, tested.
 * Ported from the old useFilteredMentors during the MES-99 migration to the
 * shared DirectoryFilterBar.
 */
import type { FilterValues } from "@/lib/directoryFilters";

export interface MentorLike {
  name: string;
  title: string;
  description: string;
  tagline?: string | null;
  location: string;
  location_city?: string | null;
  category_slug?: string | null;
  archetype?: string | null;
  persona_fit?: string[] | null;
  market_corridors?: string[] | null;
  sector_tags?: string[] | null;
  is_featured?: boolean;
  view_count?: number;
  years_experience?: number | null;
}

/**
 * The Mentors primary tab dimension is `archetype` (MES-130): the
 * `mentor_categories` table the old tabs read never existed, and
 * `category_slug` is null on every row. Slugify the archetype so it can drive
 * both the tab value and the /mentors/:categorySlug route param.
 * e.g. "International Founder" → "international-founder", "Trade & Government" → "trade-government".
 */
export function archetypeToSlug(archetype: string | null | undefined): string | null {
  if (!archetype) return null;
  const slug = archetype
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || null;
}

/**
 * Keys: search, persona, category, sector, corridor, location, sort
 * (sort ∈ featured | views | experience | az). Returns a new array.
 */
export function filterMentors<T extends MentorLike>(mentors: T[], filters: FilterValues): T[] {
  const search = (filters.search ?? "").toLowerCase();
  const { persona = "all", category = "all", sector = "all", corridor = "all", location = "all", sort = "featured" } = filters;

  const result = mentors.filter((m) => {
    if (search) {
      const matchesSearch =
        m.name.toLowerCase().includes(search) ||
        m.title.toLowerCase().includes(search) ||
        m.description.toLowerCase().includes(search) ||
        (m.tagline || "").toLowerCase().includes(search) ||
        m.location.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }

    // Persona: a "both" mentor serves international entrants AND local startups.
    if (persona !== "all") {
      const fits = m.persona_fit || [];
      if (fits.length > 0) {
        const wanted =
          persona === "international_entrant"
            ? ["international_entrant", "both"]
            : persona === "local_startup"
            ? ["local_startup", "both"]
            : [persona];
        if (!wanted.some((w) => fits.includes(w))) return false;
      }
    }

    // Category is the mentor archetype (slugified). category_slug is retained as
    // a fallback for any legacy row that ever gets one populated.
    if (category !== "all" && archetypeToSlug(m.archetype) !== category && m.category_slug !== category) return false;

    if (sector !== "all") {
      const tags = m.sector_tags || [];
      if (!tags.some((s) => s.toLowerCase() === sector.toLowerCase())) return false;
    }

    // Corridor: "Experience entering from {origin}" — match any corridor with this origin.
    if (corridor !== "all") {
      const corridors = m.market_corridors || [];
      if (!corridors.some((c) => c.startsWith(`${corridor}-to-`))) return false;
    }

    if (location !== "all" && m.location !== location && m.location_city !== location) return false;

    return true;
  });

  switch (sort) {
    case "featured":
      result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
      break;
    case "views":
      result.sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0));
      break;
    case "experience":
      result.sort((a, b) => (b.years_experience || 0) - (a.years_experience || 0));
      break;
    case "az":
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  return result;
}
