
import Navigation from "@/components/Navigation";
import { HeroSection } from "@/components/sections/HeroSection";
import { BeforeMESSection } from "@/components/sections/BeforeMESSection";
import { SearchSection } from "@/components/sections/SearchSection";
import { ValueSection } from "@/components/sections/ValueSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/Footer";

const Index = () => {
  // Calculate total resources count based on actual database tables
  const totalResources = 500 + 25 + 100 + 1200 + 50 + 200; // Service Providers + Innovation Hubs + Lead Data + Success Stories + Events + Mentors

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Streamlined Hero Section - Email Capture Focus */}
      <HeroSection totalResources={totalResources} />

      {/* Before MES Section - Core value proposition */}
      <BeforeMESSection />

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
      <Footer />
    </div>
  );
};

export default Index;
