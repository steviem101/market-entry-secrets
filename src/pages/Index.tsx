
import { HeroSection } from "@/components/sections/HeroSection";
import { BeforeAfterSection } from "@/components/sections/BeforeAfterSection";
import { SearchSection } from "@/components/sections/SearchSection";
import { ValueSection } from "@/components/sections/ValueSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { CTASection } from "@/components/sections/CTASection";
import { FloatingCTAButton } from "@/components/FloatingCTAButton";

const Index = () => {
  // Calculate total resources count based on actual database tables
  const totalResources = 500 + 25 + 100 + 1200 + 50 + 200; // Service Providers + Innovation Hubs + Lead Data + Success Stories + Events + Mentors

  return (
    <>

      {/* Streamlined Hero Section - Email Capture Focus */}
      <HeroSection totalResources={totalResources} />

      {/* Before vs. After Market Entry Section - Core value proposition */}
      <BeforeAfterSection />

      {/* Search Section - Moved from Hero */}
      <SearchSection />

      {/* Combined Value Section - What they get access to */}
      <ValueSection />

      {/* Testimonials Section - Social proof without heavy CTA */}
      <TestimonialsSection />

      {/* Pricing Section - Clear value and pricing tiers */}
      <PricingSection />

      {/* Final Conversion CTA Section */}
      <CTASection />

      {/* Footer */}

      {/* Floating CTA Button */}
      <FloatingCTAButton />
    </>
  );
};

export default Index;
