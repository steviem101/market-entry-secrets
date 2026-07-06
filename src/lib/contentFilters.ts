/**
 * Pure filter logic for the Content (Market Entry Guides) directory — React-free,
 * tested. Extracted during the MES-97 migration to the shared DirectoryFilterBar.
 *
 * NB: `content_categories` has no slug column, so the category dimension carries
 * the category id (flagged as a data gap in MES-100).
 */
import type { FilterValues } from "@/lib/directoryFilters";

export interface ContentItemLike {
  title: string;
  subtitle?: string | null;
  content_type?: string | null;
  category_id?: string | null;
}

/** Keys: search, type (content_type), category (category id | "all"). */
export function filterContent<T extends ContentItemLike>(items: T[], filters: FilterValues): T[] {
  const search = (filters.search ?? "").toLowerCase().trim();
  const { type = "all", category = "all" } = filters;

  return items.filter((item) => {
    const matchesSearch =
      search === "" ||
      item.title.toLowerCase().includes(search) ||
      (item.subtitle ?? "").toLowerCase().includes(search);

    const matchesType = type === "all" || item.content_type === type;
    const matchesCategory = category === "all" || item.category_id === category;

    return matchesSearch && matchesType && matchesCategory;
  });
}
