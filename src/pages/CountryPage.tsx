import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCountryPage } from "@/hooks/useCountryPage";
import { trackCountryEvent } from "@/lib/analytics/countryFunnel";
import { SEOHead } from "@/components/common/SEOHead";
import { EntityBreadcrumb } from "@/components/common/EntityBreadcrumb";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { CountryHero } from "@/components/countries/CountryHero";
import { CountryStickyBar } from "@/components/countries/CountryStickyBar";
import { CountryTradeSnapshot } from "@/components/countries/CountryTradeSnapshot";
import { CountryWhyItWorks } from "@/components/countries/CountryWhyItWorks";
import { CountryCaseStudies } from "@/components/countries/CountryCaseStudies";
import { CountryEcosystemTabs } from "@/components/countries/CountryEcosystemTabs";
import { CountryPlaybook } from "@/components/countries/CountryPlaybook";
import { CountryFundingPathways } from "@/components/countries/CountryFundingPathways";
import { CountryEvents } from "@/components/countries/CountryEvents";
import { CountryCities } from "@/components/countries/CountryCities";
import { CountryFAQ } from "@/components/countries/CountryFAQ";
import { CountryLeadCapture } from "@/components/countries/CountryLeadCapture";
import { buildCountryJsonLd } from "@/components/countries/CountryStructuredData";
import { publishedOrigin } from "@/lib/publishedOrigin";
import { getCountryCode } from "@/lib/countryCodes";
import { NoIndex } from "@/components/common/NoIndex";

// Per-slug SEO overrides - keep bespoke copy data-driven rather than branching in JSX.
const SEO_OVERRIDES: Record<string, { title: string; description: (c: { name: string; key_industries?: string[] }) => string }> = {
  ireland: {
    title: "Ireland to Australia Market Entry Playbook 2026",
    description: (c) =>
      `Ireland to Australia market entry. The founder's playbook covering grants, agencies, ${(c.key_industries || []).slice(0, 2).join(" and ")} partners, and case studies.`,
  },
};

// Country pages are the top-of-funnel SEO surface: they render ungated for
// anonymous visitors. Depth actions (mentor intros, lead lists, reports)
// keep their own gating.
const CountryPage = () => {
  const { countrySlug } = useParams<{ countrySlug: string }>();
  const slug = countrySlug || "";
  const { data: bundle, isLoading, error } = useCountryPage(slug);

  useEffect(() => {
    if (slug) trackCountryEvent(slug, "page_view");
  }, [slug]);

  if (isLoading) return <PageSkeleton />;

  // A transient RPC failure must NOT be treated as an unknown slug: emitting
  // NoIndex + a 404 for a live URL during a DB blip risks deindexation. Only a
  // successful RPC that returns no country is a genuine 404.
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="text-muted-foreground">
          We could not load this country page just now. Please try again shortly.
        </p>
      </div>
    );
  }

  if (!bundle?.country) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <NoIndex notFound />
        <h1 className="text-2xl font-bold mb-4">Country Not Found</h1>
        <p className="text-muted-foreground">
          The country you are looking for does not exist.
        </p>
      </div>
    );
  }

  const {
    country,
    page_content: pageContent,
    trade_metrics: tradeMetrics,
    case_studies: caseStudies,
    playbook,
    funding,
    faqs,
    mentors,
    agencies,
    service_providers: serviceProviders,
    investors,
    events,
    cities,
    link_totals: linkTotals,
  } = bundle;

  const fundingOrigin = funding.filter((f) => f.side === "origin");
  const fundingDestination = funding.filter((f) => f.side === "destination");

  const countryCode = getCountryCode(slug);
  const baseUrl = publishedOrigin();
  const canonicalPath = `/countries/${country.slug}`;
  const canonicalUrl = `${baseUrl}${canonicalPath}`;

  const seoOverride = SEO_OVERRIDES[slug];
  const topIndustries = (country.key_industries || []).slice(0, 2).join(" and ");
  const title =
    seoOverride?.title ??
    `${country.name} to Australia Market Entry${topIndustries ? `: ${topIndustries}` : ""} | Market Entry Secrets`;
  const description =
    seoOverride?.description(country) ??
    (pageContent?.hero_subhead ||
      `Market entry resources for ${country.name} companies expanding to Australia${
        topIndustries ? `: agencies, partners, and case studies across ${topIndustries}.` : "."
      }`);

  const jsonLd = buildCountryJsonLd({
    countryName: country.name,
    countrySlug: country.slug,
    countryDescription: country.description,
    canonicalUrl,
    baseUrl,
    faqs,
    playbook,
    events,
    cities,
  });

  return (
    <>
      <SEOHead
        title={title}
        description={description}
        canonicalPath={canonicalPath}
        jsonLd={jsonLd}
      />

      <CountryStickyBar
        countryName={country.name}
        countryCode={countryCode ?? ""}
        primaryCtaHref={`/report-creator?source=country-${country.slug}`}
        onPrimaryClick={() =>
          trackCountryEvent(country.slug, "report_creator_click", { section: "sticky_bar" })
        }
      />

      <main className="pt-4">
        <EntityBreadcrumb
          segments={[
            { label: "Countries", href: "/countries" },
            { label: country.name },
          ]}
        />

        <CountryHero
          countryName={country.name}
          countryCode={countryCode ?? ""}
          countrySlug={country.slug}
          content={pageContent}
          fallbackHeadline={country.hero_title}
          fallbackSubhead={country.hero_description}
        />

        <CountryTradeSnapshot metrics={tradeMetrics} countryName={country.name} />

        <CountryWhyItWorks
          countryName={country.name}
          bullets={pageContent?.narrative_bullets || []}
          differentiators={pageContent?.differentiators || []}
          pullQuote={pageContent?.pull_quote}
          pullQuoteAttr={pageContent?.pull_quote_attr}
        />

        <CountryCaseStudies countryName={country.name} caseStudies={caseStudies} />

        <CountryEcosystemTabs
          countryName={country.name}
          countrySlug={country.slug}
          agencies={agencies}
          mentors={mentors}
          services={serviceProviders}
          investors={investors}
          totals={linkTotals}
        />

        <CountryPlaybook
          countryName={country.name}
          countrySlug={country.slug}
          stages={playbook}
        />

        <CountryFundingPathways
          countryName={country.name}
          countrySlug={country.slug}
          countryCode={countryCode ?? ""}
          origin={fundingOrigin}
          destination={fundingDestination}
        />

        <CountryEvents countryName={country.name} events={events} />

        <CountryCities cities={cities} />

        <CountryFAQ
          countryName={country.name}
          countrySlug={country.slug}
          faqs={faqs}
        />

        <CountryLeadCapture
          countryName={country.name}
          countrySlug={country.slug}
          trustCompanies={pageContent?.hero_trust_companies}
        />
      </main>
    </>
  );
};

export default CountryPage;
