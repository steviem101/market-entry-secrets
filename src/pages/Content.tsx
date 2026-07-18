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
import { filterContent, CONTENT_LIBRARY_TYPES, type ContentItemLike } from "@/lib/contentFilters";
import { curateValues } from "@/lib/filterCuration";
import { sectorLabel } from "@/lib/sectorLabels";
import { guideTopicLabel } from "@/lib/guideTopics";

const CONTENT_TYPE_LABELS: Record<string, string> = {
  guide: "Guides",
  article: "Articles",
  success_story: "Success Stories",
  compliance: "Compliance",
  interview: "Interviews",
  best_practice: "Best Practices",
};

const CONTENT_TYPE_TABS: FilterOption[] = [
  { value: "all", label: "All Content" },
  ...Object.entries(CONTENT_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

// Valid content_type values; a stale/invalid ?type= is coerced to "all" by the
// filter hook so it can't match nothing and render an empty grid.
const CONTENT_TYPE_VALUES = Object.keys(CONTENT_TYPE_LABELS);

const CONTENT_FILTER_SPEC: FilterSpec = {
  search: { param: "search", default: "" },
  type: { param: "type", default: "all" },
  // Category carries the category slug (MES-100); legacy ?category=<uuid> links
  // are still resolved for back-compat.
  category: { param: "category", default: "all" },
  sector: { param: "sector", default: "all" },
  // Guide topic taxonomy (MES-182) — guides only; non-guides have no topic.
  topic: { param: "topic", default: "all" },
};

const Content = () => {
  const { data: contentItems = [], isLoading: itemsLoading, error: itemsError } = useContentItems({
    contentType: [...CONTENT_LIBRARY_TYPES]
  });
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useContentCategories();
  const contentItemIds = useMemo(() => contentItems.map(item => item.id), [contentItems]);
  const { data: attachmentCounts = {} } = useAttachmentCounts(contentItemIds);

  // Canonical sector_tags (MES-110) with the shared friendly labels. Zero-hidden
  // curation means untagged items don't produce options and stay under "All".
  const sectorOptions = useMemo(
    () => curateValues(contentItems.flatMap((item) => item.sector_tags || []), { labelFor: sectorLabel }),
    [contentItems]
  );
  // Guide topics (MES-182), count-ranked + zero-hidden like sectors. The cast
  // is the usual bridge until the generated Supabase types pick up the new
  // guide_topic column — the select('*') rows carry it at runtime.
  const topicOptions = useMemo(
    () => curateValues(
      contentItems.map((item) => (item as ContentItemLike).guide_topic),
      { labelFor: guideTopicLabel },
    ),
    [contentItems]
  );
  // The hook coerces a stale ?type= (retired content_type) and a stale/
  // case-variant ?sector=/?topic= to "all" so none renders a phantom tab or
  // empty grid. Category is slug/uuid-resolved in-page below, so it isn't
  // coerced here.
  const allowedValues = useMemo(
    () => ({
      type: CONTENT_TYPE_VALUES,
      sector: sectorOptions.map((o) => o.value),
      topic: topicOptions.map((o) => o.value),
    }),
    [sectorOptions, topicOptions],
  );
  const { filters, setFilter, clearAll, hasActiveFilters } =
    useDirectoryFilters(CONTENT_FILTER_SPEC, { allowedValues });

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
  // type/sector are already coerced by the hook; only category needs resolving.
  const displayFilters = useMemo(
    () => ({
      ...filters,
      category: selectedCat ? catSlug(selectedCat as any) : (filters.category === "all" ? "all" : filters.category),
    }),
    [filters, selectedCat]
  );

  // Filtering matches item.category_id, so pass the resolved id (not the slug).
  const filteredContent = useMemo(
    () => filterContent(contentItems, { ...filters, category: selectedCategoryId ?? "all" }),
    [contentItems, filters, selectedCategoryId]
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
    // Topic first — it's the guides' primary browse axis (MES-182).
    { key: "topic", allLabel: "All Topics", options: topicOptions },
    {
      key: "category",
      allLabel: "All Categories",
      options: categoriesWithContent.map((c) => ({ value: catSlug(c as any), label: c.name })),
    },
    { key: "sector", allLabel: "All Sectors", options: sectorOptions, searchable: true },
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
