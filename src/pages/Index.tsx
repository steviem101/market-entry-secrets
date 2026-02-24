import { Helmet } from "react-helmet-async";
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
      <Helmet>
        <title>Market Entry Secrets | Enter the Australian Market with Confidence</title>
        <meta
          name="description"
          content="AI-powered market entry intelligence for international companies entering Australia. Connect with 500+ vetted service providers, mentors, and get a custom market entry report in minutes."
        />
        <meta property="og:title" content="Market Entry Secrets | Enter the Australian Market with Confidence" />
        <meta
          property="og:description"
          content="AI-powered market entry intelligence for international companies entering Australia. Connect with 500+ vetted service providers, mentors, and get a custom market entry report in minutes."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://market-entry-secrets.lovable.app/" />
      </Helmet>

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
