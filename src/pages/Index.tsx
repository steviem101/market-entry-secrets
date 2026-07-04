import { Helmet } from "react-helmet-async";
import { HeroSection } from "@/components/sections/HeroSection";
import { BeforeAfterSection } from "@/components/sections/BeforeAfterSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { SearchSection } from "@/components/sections/SearchSection";
import { ValueSection } from "@/components/sections/ValueSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { CTASection } from "@/components/sections/CTASection";


const FALLBACK_URL = "https://market-entry-secrets.lovable.app";

const Index = () => {
  const siteUrl = typeof window !== "undefined" ? window.location.origin : FALLBACK_URL;

  const JSON_LD_ORGANIZATION = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Market Entry Secrets",
    url: siteUrl,
    description:
      "AI-powered intelligence and execution platform for the Australian and New Zealand market, serving international companies entering ANZ and local founders scaling within it.",
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
        <title>Market Entry Secrets | Intelligence for the ANZ Market</title>
        <meta
          name="description"
          content="AI-powered intelligence for the ANZ market. 500+ vetted providers, mentors, leads, and custom plans in minutes, whether you are entering Australia or scaling within it."
        />
        <meta property="og:title" content="Market Entry Secrets | Intelligence for the ANZ Market" />
        <meta
          property="og:description"
          content="AI-powered intelligence for the ANZ market. 500+ vetted providers, mentors, leads, and custom plans in minutes, whether you are entering Australia or scaling within it."
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

    </>
  );
};

export default Index;
