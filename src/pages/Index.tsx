
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { BookmarksSection } from "@/components/BookmarksSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { SocialProofBanner } from "@/components/sections/SocialProofBanner";
import { BeforeAfterSection } from "@/components/sections/BeforeAfterSection";
import { FeaturedSolutionsSection } from "@/components/sections/FeaturedSolutionsSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { ProvidersSection } from "@/components/sections/ProvidersSection";
import { CTASection } from "@/components/sections/CTASection";

const Index = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [searchMode, setSearchMode] = useState<'database' | 'ai'>('database');

  // Calculate total resources count based on actual database tables
  const totalResources = 500 + 25 + 100 + 1200 + 50 + 200; // Service Providers + Innovation Hubs + Lead Data + Success Stories + Events + Mentors

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section with Enhanced Search */}
      <HeroSection 
        totalResources={totalResources}
        searchMode={searchMode}
        onSearchModeChange={(value) => setSearchMode(value as 'database' | 'ai')}
      />

      {/* Enhanced Client Testimonials Section - Now second section */}
      <TestimonialsSection />

      {/* Immediate Social Proof Banner */}
      <SocialProofBanner />

      {/* Before vs. After Market Entry Section */}
      <BeforeAfterSection />

      {/* Featured Solutions Overview */}
      <FeaturedSolutionsSection />

      {/* Bookmarks Section with soft integration */}
      <div className="relative">
        <div className="absolute inset-0 gradient-overlay" />
        <BookmarksSection />
      </div>

      {/* Service Providers Section - More focused */}
      <ProvidersSection 
        selectedCategories={selectedCategories}
        selectedLocations={selectedLocations}
        searchTerm={searchTerm}
        showFilters={showFilters}
        onCategoryChange={setSelectedCategories}
        onLocationChange={setSelectedLocations}
        onShowFiltersChange={setShowFilters}
      />

      {/* Final CTA Section */}
      <CTASection />
    </div>
  );
};

export default Index;
