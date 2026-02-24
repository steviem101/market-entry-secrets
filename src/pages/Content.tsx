import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Search } from "lucide-react";
import { useContentItems, useContentCategories } from "@/hooks/useContent";
import { ContentHero } from "@/components/content/ContentHero";
import { FeaturedContent } from "@/components/content/FeaturedContent";
import { ContentGrid } from "@/components/content/ContentGrid";
import { UsageBanner } from "@/components/UsageBanner";

const CONTENT_TYPE_LABELS: Record<string, string> = {
  guide: "Guides",
  article: "Articles",
  success_story: "Success Stories",
};

const VALID_CONTENT_TYPES = new Set(Object.keys(CONTENT_TYPE_LABELS));

const Content = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("type") ?? "all";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState(
    VALID_CONTENT_TYPES.has(initialType) ? initialType : "all"
  );

  const { data: contentItems = [], isLoading: itemsLoading, error: itemsError } = useContentItems({
    contentType: ['guide', 'article', 'success_story']
  });
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useContentCategories();

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
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading content...</p>
        </div>
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
      <ContentHero
        totalContent={contentItems.length}
        totalCategories={categories.length}
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

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </Button>
            {categories.map((category) => (
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
        />

        <ContentGrid
          filteredContent={filteredContent}
          selectedCategory={selectedCategory}
          categories={categories}
          totalContent={contentItems.length}
          excludeFeatured={selectedCategory === null && featuredContent.length > 0}
        />
      </div>
    </>
  );
};

export default Content;
