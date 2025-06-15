
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { BookmarksSection } from "@/components/BookmarksSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { ProvidersSection } from "@/components/sections/ProvidersSection";
import { CTASection } from "@/components/sections/CTASection";

const Index = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [searchMode, setSearchMode] = useState<'database' | 'ai'>('database');

  // Calculate total resources count
  const totalResources = 500 + 1200 + 50 + 200 + 25; // Service Providers + Success Stories + Events + Mentors + Innovation Hubs

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <HeroSection 
        totalResources={totalResources}
        searchMode={searchMode}
        onSearchModeChange={(value) => setSearchMode(value as 'database' | 'ai')}
      />

      {/* Stats Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/5 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <StatsSection />
          </div>
        </div>
      </section>

      {/* Bookmarks Section */}
      <BookmarksSection />

      {/* Featured Categories */}
      <CategoriesSection />

      {/* Service Providers Section */}
      <ProvidersSection 
        selectedCategories={selectedCategories}
        selectedLocations={selectedLocations}
        searchTerm={searchTerm}
        showFilters={showFilters}
        onCategoryChange={setSelectedCategories}
        onLocationChange={setSelectedLocations}
        onShowFiltersChange={setShowFilters}
      />

      {/* CTA Section */}
      <CTASection />
    </div>
  );
};

export default Index;
