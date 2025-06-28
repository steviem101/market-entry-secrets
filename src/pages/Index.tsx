import { useState } from "react";
import Navigation from "@/components/Navigation";
import { HeroSection } from "@/components/sections/HeroSection";
import { SocialProofBanner } from "@/components/sections/SocialProofBanner";
import { BeforeAfterSection } from "@/components/sections/BeforeAfterSection";
import { FeaturedSolutionsSection } from "@/components/sections/FeaturedSolutionsSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { FeaturedItemsSection } from "@/components/sections/FeaturedItemsSection";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/Footer";
import { PricingSection } from "@/components/sections/PricingSection";

const Index = () => {
  const [searchMode, setSearchMode] = useState<'database' | 'ai'>('database');

  // Calculate total resources count based on actual database tables
  const totalResources = 500 + 25 + 100 + 1200 + 50 + 200; // Service Providers + Innovation Hubs + Lead Data + Success Stories + Events + Mentors

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Streamlined Hero Section */}
      <HeroSection 
        totalResources={totalResources}
        searchMode={searchMode}
        onSearchModeChange={(value) => setSearchMode(value as 'database' | 'ai')}
      />

      {/* Immediate Social Proof Banner */}
      <SocialProofBanner />

      {/* Before vs. After Market Entry Section - Core value proposition */}
      <BeforeAfterSection />

      {/* Featured Solutions Overview - What they get access to */}
      <FeaturedSolutionsSection />

      {/* Condensed Testimonials Section - Social proof without heavy CTA */}
      <TestimonialsSection />

      {/* Pricing Section - Clear value and pricing tiers */}
      <PricingSection />

      {/* Featured Items Section - Rotating cards from multiple directories */}
      <FeaturedItemsSection />

      {/* Final Conversion CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
