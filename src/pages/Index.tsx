import { HeroSection } from "@/components/sections/HeroSection";
import { PersonaPathways } from "@/components/sections/PersonaPathways";
import { StatsBar } from "@/components/sections/StatsBar";
import { BeforeAfterSection } from "@/components/sections/BeforeAfterSection";
import { SearchSection } from "@/components/sections/SearchSection";
import { ValueSection } from "@/components/sections/ValueSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { CTASection } from "@/components/sections/CTASection";
import { FloatingCTAButton } from "@/components/FloatingCTAButton";

const Index = () => {
  return (
    <>
      {/* Planner-First Hero Section */}
      <HeroSection />

      {/* Persona Pathway Cards */}
      <PersonaPathways />

      {/* Stats Bar */}
      <StatsBar />

      {/* Before vs. After Market Entry Section */}
      <BeforeAfterSection />

      {/* Search Section */}
      <SearchSection />

      {/* Combined Value Section */}
      <ValueSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* Final Conversion CTA Section */}
      <CTASection />

      {/* Floating CTA Button */}
      <FloatingCTAButton />
    </>
  );
};

export default Index;
