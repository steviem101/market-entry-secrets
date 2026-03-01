import { Helmet } from "react-helmet-async";
import { HeroSection } from "@/components/sections/HeroSection";
import { TrustLogosSection } from "@/components/sections/TrustLogosSection";
import { BeforeAfterSection } from "@/components/sections/BeforeAfterSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { SearchSection } from "@/components/sections/SearchSection";
import { ValueSection } from "@/components/sections/ValueSection";
import { ComparisonSection } from "@/components/sections/ComparisonSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { CTASection } from "@/components/sections/CTASection";
import { FloatingCTAButton } from "@/components/FloatingCTAButton";

const JSON_LD_ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Market Entry Secrets",
  url: "https://market-entry-secrets.lovable.app",
  description:
    "AI-powered market entry intelligence platform helping international companies enter the Australian and New Zealand markets.",
  areaServed: ["Australia", "New Zealand"],
  serviceType: "Market Entry Intelligence",
};

const JSON_LD_WEBSITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Market Entry Secrets",
  url: "https://market-entry-secrets.lovable.app",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate:
        "https://market-entry-secrets.lovable.app/service-providers?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

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
        <script type="application/ld+json">
          {JSON.stringify(JSON_LD_ORGANIZATION)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(JSON_LD_WEBSITE)}
        </script>
      </Helmet>

      {/* Interactive Hero Section */}
      <HeroSection />

      {/* Data Source Trust Logos */}
      <TrustLogosSection />

      {/* Before vs. After Market Entry Section */}
      <BeforeAfterSection />

      {/* How It Works — 3-Step Process */}
      <HowItWorksSection />

      {/* Search Section */}
      <SearchSection />

      {/* Combined Value Section */}
      <ValueSection />

      {/* MES vs Alternatives Comparison */}
      <ComparisonSection />

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
