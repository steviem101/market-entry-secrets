import { HeroSection } from "@/components/sections/HeroSection";
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
      {/* Interactive Hero Section */}
      <HeroSection />

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
