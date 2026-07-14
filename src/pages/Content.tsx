import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { CardGridSkeleton } from "@/components/common/CardGridSkeleton";
import { useContentItems, useContentCategories } from "@/hooks/useContent";
import { useAttachmentCounts } from "@/hooks/useGuideAttachments";
import { ContentHero } from "@/components/content/ContentHero";
import { FeaturedContent } from "@/components/content/FeaturedContent";
import { ContentGrid } from "@/components/content/ContentGrid";
import { DirectoryFilterBar, type FilterOption, type SelectFilterConfig } from "@/components/common/DirectoryFilterBar";
import { UsageBanner } from "@/components/UsageBanner";
import { SEOHead } from "@/components/common/SEOHead";
import { useDirectoryFilters } from "@/hooks/useDirectoryFilters";
import type { FilterSpec } from "@/lib/directoryFilters";
import { filterContent } from "@/lib/contentFilters";

const CONTENT_TYPE_LABELS: Record<string, string> = {
  guide: "Guides",
  article: "Articles",
  success_story: "Success Stories",
};

const CONTENT_TYPE_TABS: FilterOption[] = [
  { value: "all", label: "All Content" },
  ...Object.entries(CONTENT_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

// Allowlist so a stale/invalid ?type= (e.g. a retired content_type) falls back
// to "All" instead of matching nothing and rendering an empty grid.
const VALID_CONTENT_TYPES = new Set(["all", ...Object.keys(CONTENT_TYPE_LABELS)]);

const CONTENT_FILTER_SPEC: FilterSpec = {
  search: { param: "search", default: "" },
  type: { param: "type", default: "all" },
  // Category carries the category slug (MES-100); legacy ?category=<uuid> links
  // are still resolved for back-compat.
  category: { param: "category", default: "all" },
};

const Content = () => {
  const { filters, setFilter, clearAll, hasActiveFilters } = useDirectoryFilters(CONTENT_FILTER_SPEC);

  const { data: contentItems = [], isLoading: itemsLoading, error: itemsError } = useContentItems({
    contentType: ['guide', 'article', 'success_story']
  });
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useContentCategories();
  const contentItemIds = useMemo(() => contentItems.map(item => item.id), [contentItems]);
  const { data: attachmentCounts = {} } = useAttachmentCounts(contentItemIds);

  // Coerce an invalid/stale ?type= to "all" so both filtering and the tab
  // highlight treat it as "All Content" (rather than a phantom active tab).
  const safeType = VALID_CONTENT_TYPES.has(filters.type) ? filters.type : "all";

  // Only show categories that have at least 1 piece of content.
  const categoriesWithContent = useMemo(
    () => categories.filter(category => contentItems.some(item => item.category_id === category.id)),
    [categories, contentItems]
  );

  // The category param carries a slug (MES-100), but old links used the UUID —
  // resolve either to the category row + its id.
  const catSlug = (c: { id: string; slug?: string | null }) => c.slug ?? c.id;
  const selectedCat = useMemo(
    () => categoriesWithContent.find(
      (c) => catSlug(c as any) === filters.category || c.id === filters.category
    ) ?? null,
    [categoriesWithContent, filters.category]
  );
  const selectedCategoryId = selectedCat?.id ?? null;

  // Bar shows the slug (normalised so old ?category=<uuid> links still highlight).
  const displayFilters = useMemo(
    () => ({
      ...filters,
      type: safeType,
      category: selectedCat ? catSlug(selectedCat as any) : (filters.category === "all" ? "all" : filters.category),
    }),
    [filters, safeType, selectedCat]
  );

  // Filtering matches item.category_id, so pass the resolved id (not the slug).
  const filteredContent = useMemo(
    () => filterContent(contentItems, { ...filters, type: safeType, category: selectedCategoryId ?? "all" }),
    [contentItems, filters, safeType, selectedCategoryId]
  );

  const featuredContent = useMemo(() => contentItems.filter(item => item.featured), [contentItems]);

  // Per-type counts for the tab suffixes. MES-130: hide zero-count type tabs
  // (e.g. Article / Success Story when no such content_type exists) so the row
  // shows only tabs that lead somewhere; "All" always stays.
  const typeTabs: FilterOption[] = useMemo(() => {
    const counts: Record<string, number> = {};
    contentItems.forEach((item) => {
      if (item.content_type) counts[item.content_type] = (counts[item.content_type] || 0) + 1;
    });
    return CONTENT_TYPE_TABS
      .map((t) => ({
        ...t,
        count: t.value === "all" ? contentItems.length : (counts[t.value] ?? 0),
      }))
      .filter((t) => t.value === "all" || (t.count ?? 0) > 0);
  }, [contentItems]);

  const selects: SelectFilterConfig[] = [
    {
      key: "category",
      allLabel: "All Categories",
      options: categoriesWithContent.map((c) => ({ value: catSlug(c as any), label: c.name })),
    },
  ];

  if (itemsLoading || categoriesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <CardGridSkeleton count={6} />
      </div>
    );
  }

  if (itemsError || categoriesError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Error Loading Content</h2>
          <p className="text-muted-foreground mb-6">
            {itemsError?.message || categoriesError?.message || 'Failed to load content'}
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Articles & Guides | Market Entry Secrets"
        description="Expert articles, guides, and insights for companies entering the Australian market."
        canonicalPath="/content"
        jsonLd={{
          type: "CollectionPage",
          data: {
            name: "Market Entry Articles & Guides",
            description:
              "Expert articles, guides, and insights for companies entering the Australian market.",
            hasPart: contentItems.slice(0, 25).map((item) => ({
              "@type": "Article",
              headline: item.title,
              url: `https://marketentrysecrets.com/content/${item.slug}`,
            })),
          },
        }}
      />
      <ContentHero
        totalContent={contentItems.length}
        totalCategories={categoriesWithContent.length}
      />

      <DirectoryFilterBar
        filters={displayFilters}
        onFilterChange={setFilter}
        onClearAll={clearAll}
        hasActiveFilters={hasActiveFilters}
        noun="results"
        shownCount={filteredContent.length}
        totalCount={contentItems.length}
        tabs={{ key: "type", options: typeTabs }}
        search={{ key: "search", placeholder: "Search market entry guides..." }}
        selects={selects}
      />

      <div className="container mx-auto px-4 py-8">
        <UsageBanner />

        <FeaturedContent
          featuredContent={featuredContent}
          selectedCategory={selectedCategoryId}
          attachmentCounts={attachmentCounts}
        />

        <ContentGrid
          filteredContent={filteredContent}
          selectedCategory={selectedCategoryId}
          categories={categoriesWithContent}
          totalContent={contentItems.length}
          excludeFeatured={selectedCategoryId === null && featuredContent.length > 0}
          attachmentCounts={attachmentCounts}
        />
      </div>
    </>
  );
};

export default Content;
