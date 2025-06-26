import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useContentItems, useContentCategories } from "@/hooks/useContent";
import { ContentHero } from "@/components/content/ContentHero";
import { ContentFilters } from "@/components/content/ContentFilters";
import { FeaturedContent } from "@/components/content/FeaturedContent";
import { ContentGrid } from "@/components/content/ContentGrid";
import { UsageBanner } from "@/components/UsageBanner";

const Content = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const { data: contentItems = [], isLoading: itemsLoading, error: itemsError } = useContentItems();
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useContentCategories();

  // Mock locations for now - in a real app, this would come from content data
  const mockLocations = ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"];

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = searchQuery === "" || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || 
      item.category_id === selectedCategory;
    
    // Location filtering would be implemented when location data is available
    // const matchesLocation = selectedLocation === "all" || item.location === selectedLocation;
    
    return matchesSearch && matchesCategory;
  });

  const featuredContent = contentItems.filter(item => item.featured);
  const hasActiveFilters = selectedCategory !== null || selectedLocation !== "all";

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSelectedLocation("all");
  };

  if (itemsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (itemsError || categoriesError) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <ContentHero 
        totalContent={contentItems.length}
        totalCategories={categories.length}
      />

      <ContentFilters
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        selectedLocation={selectedLocation}
        selectedCategory={selectedCategory}
        onLocationChange={setSelectedLocation}
        onCategoryChange={setSelectedCategory}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        categories={categories}
        locations={mockLocations}
      />

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
        />
      </div>
    </div>
  );
};

export default Content;
