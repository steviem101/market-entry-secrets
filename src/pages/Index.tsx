import { Helmet } from "react-helmet-async";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProofStrip } from "@/components/sections/ProofStrip";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { WhatsInYourReport } from "@/components/sections/WhatsInYourReport";
import { SearchSection } from "@/components/sections/SearchSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CTASection } from "@/components/sections/CTASection";


const FALLBACK_URL = "https://marketentrysecrets.com";

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
        <title>Market Entry Secrets | AI Market Entry Reports for ANZ</title>
        <meta
          name="description"
          content="Turn a 5-minute questionnaire into a full ANZ market entry report: live market intelligence, competitor landscape, vetted providers, mentors, and an action plan."
        />
        <meta property="og:title" content="Market Entry Secrets | AI Market Entry Reports for ANZ" />
        <meta
          property="og:description"
          content="Turn a 5-minute questionnaire into a full ANZ market entry report: live market intelligence, competitor landscape, vetted providers, mentors, and an action plan."
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

      {/* Hero — headline, platform definition, single CTA pair, report mockup */}
      <HeroSection />

      {/* Live directory counts — the one source of numbers on the page */}
      <ProofStrip />

      {/* How It Works — 3-step process, single CTA */}
      <HowItWorksSection />

      {/* What's in your report — mirrors real report sections + tier gating */}
      <WhatsInYourReport />

      {/* Directory / search teaser */}
      <SearchSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Final conversion CTA */}
      <CTASection />

    </>
  );
};

export default Index;
