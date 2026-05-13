import { Helmet } from "react-helmet-async";
import { HeroSection } from "@/components/sections/HeroSection";
import { BeforeAfterSection } from "@/components/sections/BeforeAfterSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { SearchSection } from "@/components/sections/SearchSection";
import { ValueSection } from "@/components/sections/ValueSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { CTASection } from "@/components/sections/CTASection";
import { FloatingCTAButton } from "@/components/FloatingCTAButton";

const FALLBACK_URL = "https://market-entry-secrets.lovable.app";

const Index = () => {
  const siteUrl = typeof window !== "undefined" ? window.location.origin : FALLBACK_URL;

  const JSON_LD_ORGANIZATION = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Market Entry Secrets",
    url: siteUrl,
    description:
      "AI-powered market entry intelligence platform helping international companies enter the Australian and New Zealand markets.",
    areaServed: ["Australia", "New Zealand"],
    serviceType: "Market Entry Intelligence",
  };

  const JSON_LD_WEBSITE = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Market Entry Secrets",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          `${siteUrl}/service-providers?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
  return (
    <>
      <Helmet>
        <title>Market Entry Secrets | Australian Market Entry Intelligence</title>
        <meta
          name="description"
          content="AI market entry intelligence for companies entering Australia. 500+ vetted providers, mentors, and custom reports in minutes."
        />
        <meta property="og:title" content="Market Entry Secrets | Australian Market Entry Intelligence" />
        <meta
          property="og:description"
          content="AI market entry intelligence for companies entering Australia. 500+ vetted providers, mentors, and custom reports in minutes."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/`} />
        <link rel="canonical" href={`${siteUrl}/`} />
        <script type="application/ld+json">
          {JSON.stringify(JSON_LD_ORGANIZATION)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(JSON_LD_WEBSITE)}
        </script>
      </Helmet>

      {/* Interactive Hero Section */}
      <HeroSection />

      {/* Before vs. After Market Entry Section */}
      <BeforeAfterSection />

      {/* How It Works — 3-Step Process */}
      <HowItWorksSection />

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
