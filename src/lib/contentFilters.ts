/**
 * Pure filter logic for the Content (Market Entry Guides) directory — React-free,
 * tested. Extracted during the MES-97 migration to the shared DirectoryFilterBar.
 *
 * NB: the URL carries the category *slug* (`content_categories.slug`, added
 * post-MES-100), but this predicate matches on `category_id` — the page resolves
 * slug → id before calling `filterContent`.
 */
import type { FilterValues } from "@/lib/directoryFilters";

/**
 * The content_type values the content library (/content) fetches and tabs over.
 * Matches the live vocabulary (verified against prod, MES-182 audit §3) plus the
 * `article`/`success_story` values MES-108 may re-introduce — zero-count tabs are
 * hidden, so carrying them is free. `case_study` is deliberately absent: case
 * studies live on /case-studies.
 */
export const CONTENT_LIBRARY_TYPES: readonly string[] = [
  "guide",
  "article",
  "success_story",
  "compliance",
  "interview",
  "best_practice",
];

export interface ContentItemLike {
  title: string;
  subtitle?: string | null;
  content_type?: string | null;
  category_id?: string | null;
  sector_tags?: string[] | null;
  guide_topic?: string | null;
}

/** Keys: search, type (content_type), category (category id | "all"), sector
 *  (canonical sector_tags slug | "all"), topic (guide_topic slug | "all" —
 *  MES-182; guides only). Items without the filtered value (untagged sectors,
 *  NULL topics, non-guides) stay reachable via that dimension's "all". */
export function filterContent<T extends ContentItemLike>(items: T[], filters: FilterValues): T[] {
  const search = (filters.search ?? "").toLowerCase().trim();
  const { type = "all", category = "all", sector = "all", topic = "all" } = filters;

  return items.filter((item) => {
    const matchesSearch =
      search === "" ||
      item.title.toLowerCase().includes(search) ||
      (item.subtitle ?? "").toLowerCase().includes(search);

    const matchesType = type === "all" || item.content_type === type;
    const matchesCategory = category === "all" || item.category_id === category;
    const matchesSector = sector === "all" || (item.sector_tags ?? []).includes(sector);
    const matchesTopic = topic === "all" || item.guide_topic === topic;

    return matchesSearch && matchesType && matchesCategory && matchesSector && matchesTopic;
  });
}
