import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useContentItems, useContentCategories } from "@/hooks/useContent";
import { ContentHero } from "@/components/content/ContentHero";
import { StandardDirectoryFilters } from "@/components/common/StandardDirectoryFilters";
import { FeaturedContent } from "@/components/content/FeaturedContent";
import { ContentGrid } from "@/components/content/ContentGrid";
import { UsageBanner } from "@/components/UsageBanner";
import { getStandardTypes, STANDARD_SECTORS } from "@/utils/sectorMapping";

const Content = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSector, setSelectedSector] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const { data: contentItems = [], isLoading: itemsLoading, error: itemsError } = useContentItems();
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useContentCategories();

  // Mock locations for now - in a real app, this would come from content data
  const mockLocations = ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"];
  
  // Get types and sectors
  const allTypes = getStandardTypes.content;
  const allSectors = Array.from(
    new Set(contentItems.flatMap(item => item.sector_tags || []))
  ).sort();

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = searchQuery === "" || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || 
      item.category_id === selectedCategory;
    
    const matchesType = selectedType === "all" || 
      item.content_type === selectedType;
      
    const matchesSector = selectedSector === "all" || 
      (item.sector_tags && item.sector_tags.includes(selectedSector));
    
    // Location filtering would be implemented when location data is available
    // const matchesLocation = selectedLocation === "all" || item.location === selectedLocation;
    
    return matchesSearch && matchesCategory && matchesType && matchesSector;
  });

  const featuredContent = contentItems.filter(item => item.featured);
  const hasActiveFilters = selectedCategory !== null || selectedLocation !== "all" || 
    selectedType !== "all" || selectedSector !== "all";

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSelectedLocation("all");
    setSelectedType("all");
    setSelectedSector("all");
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

      <StandardDirectoryFilters
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedSector={selectedSector}
        onSectorChange={setSelectedSector}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        locations={mockLocations}
        types={allTypes}
        sectors={allSectors}
        searchPlaceholder="Search success stories..."
      >
        {/* Advanced Filters - Categories */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-muted-foreground">Category:</span>
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
              className="gap-2"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </StandardDirectoryFilters>

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
      
      <Footer />
    </div>
  );
};

export default Content;
