import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Search } from "lucide-react";
import { CardGridSkeleton } from "@/components/common/CardGridSkeleton";
import { useContentItems, useContentCategories } from "@/hooks/useContent";
import { useAttachmentCounts } from "@/hooks/useGuideAttachments";
import { ContentHero } from "@/components/content/ContentHero";
import { FeaturedContent } from "@/components/content/FeaturedContent";
import { ContentGrid } from "@/components/content/ContentGrid";
import { UsageBanner } from "@/components/UsageBanner";
import { SEOHead } from "@/components/common/SEOHead";

const CONTENT_TYPE_LABELS: Record<string, string> = {
  guide: "Guides",
  article: "Articles",
  success_story: "Success Stories",
};

const VALID_CONTENT_TYPES = new Set(Object.keys(CONTENT_TYPE_LABELS));

const Content = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") ?? "");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get("category") ?? null);
  const [selectedType, setSelectedType] = useState(() => {
    const t = searchParams.get("type") ?? "all";
    return VALID_CONTENT_TYPES.has(t) ? t : "all";
  });

  useEffect(() => {
    const p = new URLSearchParams();
    if (searchQuery) p.set("search", searchQuery);
    if (selectedCategory) p.set("category", selectedCategory);
    if (selectedType !== "all") p.set("type", selectedType);
    setSearchParams(p, { replace: true });
  }, [searchQuery, selectedCategory, selectedType, setSearchParams]);

  const { data: contentItems = [], isLoading: itemsLoading, error: itemsError } = useContentItems({
    contentType: ['guide', 'article', 'success_story']
  });
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useContentCategories();
  const contentItemIds = useMemo(() => contentItems.map(item => item.id), [contentItems]);
  const { data: attachmentCounts = {} } = useAttachmentCounts(contentItemIds);

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === null ||
      item.category_id === selectedCategory;

    const matchesType = selectedType === "all" ||
      item.content_type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  // Only show categories that have at least 1 piece of content
  const categoriesWithContent = categories.filter(category =>
    contentItems.some(item => item.category_id === category.id)
  );

  const featuredContent = contentItems.filter(item => item.featured);
  const hasActiveFilters = selectedCategory !== null || selectedType !== "all";

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSelectedType("all");
    setSearchQuery("");
  };

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
      />
      <ContentHero
        totalContent={contentItems.length}
        totalCategories={categoriesWithContent.length}
      />

      {/* Simplified Filter Bar: Search + Type Tabs + Category Pills */}
      <section className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          {/* Search */}
          <div className="relative max-w-md mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search market entry guides..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Type Tabs */}
          <div className="flex gap-4 text-sm mb-3">
            <button
              className={`pb-1 ${selectedType === "all" ? "text-foreground font-medium border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setSelectedType("all")}
            >
              All Content
            </button>
            {Object.entries(CONTENT_TYPE_LABELS).map(([value, label]) => (
              <button
                key={value}
                className={`pb-1 ${selectedType === value ? "text-foreground font-medium border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setSelectedType(value)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Category Pills — only show categories with content */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </Button>
            {categoriesWithContent.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Active filter summary */}
          {hasActiveFilters && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Showing {filteredContent.length} result{filteredContent.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={handleClearFilters}
                className="text-sm text-primary hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <UsageBanner />

        <FeaturedContent
          featuredContent={featuredContent}
          selectedCategory={selectedCategory}
          attachmentCounts={attachmentCounts}
        />

        <ContentGrid
          filteredContent={filteredContent}
          selectedCategory={selectedCategory}
          categories={categoriesWithContent}
          totalContent={contentItems.length}
          excludeFeatured={selectedCategory === null && featuredContent.length > 0}
          attachmentCounts={attachmentCounts}
        />
      </div>
    </>
  );
};

export default Content;
