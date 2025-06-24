
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { BookmarksSection } from "@/components/BookmarksSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { ProvidersSection } from "@/components/sections/ProvidersSection";
import { CTASection } from "@/components/sections/CTASection";
import { LeadGenPopup } from "@/components/LeadGenPopup";
import { useScrollTrigger } from "@/hooks/useScrollTrigger";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [searchMode, setSearchMode] = useState<'database' | 'ai'>('database');
  const [showLeadGenPopup, setShowLeadGenPopup] = useState(false);
  
  const { user } = useAuth();
  const { triggered } = useScrollTrigger({ 
    threshold: 50, 
    enabled: !user // Only enable for non-authenticated users
  });

  // Calculate total resources count based on actual database tables
  const totalResources = 500 + 25 + 100 + 1200 + 50 + 200; // Service Providers + Innovation Hubs + Lead Data + Success Stories + Events + Mentors

  useEffect(() => {
    // Show popup if scroll triggered and user is not signed in
    if (triggered && !user) {
      const hasSeenPopup = localStorage.getItem('leadGenPopupShown');
      if (!hasSeenPopup) {
        setShowLeadGenPopup(true);
      }
    }
  }, [triggered, user]);

  const handleCloseLeadGenPopup = () => {
    setShowLeadGenPopup(false);
    localStorage.setItem('leadGenPopupShown', 'true');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <HeroSection 
        totalResources={totalResources}
        searchMode={searchMode}
        onSearchModeChange={(value) => setSearchMode(value as 'database' | 'ai')}
      />

      {/* Client Testimonials Section - moved directly after hero */}
      <TestimonialsSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Bookmarks Section with soft integration */}
      <div className="relative">
        <div className="absolute inset-0 gradient-overlay" />
        <BookmarksSection />
      </div>

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

      {/* Lead Generation Popup */}
      <LeadGenPopup 
        isOpen={showLeadGenPopup}
        onClose={handleCloseLeadGenPopup}
      />
    </div>
  );
};

export default Index;
