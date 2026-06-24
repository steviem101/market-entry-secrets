import { useParams } from "react-router-dom";
import { useCountryBySlug } from "@/hooks/useCountries";
import { useCountryPageContent } from "@/hooks/useCountryPageContent";
import { useCountryTradeMetrics } from "@/hooks/useCountryTradeMetrics";
import { useCountryCaseStudies } from "@/hooks/useCountryCaseStudies";
import { useCountryPlaybook } from "@/hooks/useCountryPlaybook";
import { useCountryFunding } from "@/hooks/useCountryFunding";
import { useCountryFAQs } from "@/hooks/useCountryFAQs";
import { useCountryAgencies } from "@/hooks/useCountryAgencies";
import { useCountryInvestors } from "@/hooks/useCountryInvestors";
import { useCountryCities } from "@/hooks/useCountryCities";
import { useCountryServiceProviders } from "@/hooks/useCountryServiceProviders";
import { useCountryEvents } from "@/hooks/useCountryEvents";
import { useCountryCommunityMembers } from "@/hooks/useCountryCommunityMembers";
import { SEOHead } from "@/components/common/SEOHead";
import { EntityBreadcrumb } from "@/components/common/EntityBreadcrumb";
import { FreemiumGate } from "@/components/FreemiumGate";
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

const COUNTRY_CODES: Record<string, string | null> = {
  ireland: "IE",
  uk: "GB",
  "united-kingdom": "GB",
  usa: "US",
  "united-states": "US",
  singapore: "SG",
};

// Per-slug SEO overrides — keep bespoke copy data-driven rather than branching in JSX.
const SEO_OVERRIDES: Record<string, { title: string; description: (c: { name: string; key_industries?: string[] }) => string }> = {
  ireland: {
    title: "Ireland to Australia Market Entry: The Founder's Playbook (2026) | Market Entry Secrets",
    description: (c) =>
      `Ireland to Australia market entry. The founder's playbook covering grants, agencies, ${(c.key_industries || []).slice(0, 2).join(" and ")} partners, and case studies.`,
  },
};

const CountryPage = () => {
  const { countrySlug } = useParams<{ countrySlug: string }>();
  const slug = countrySlug || "";
  const { data: country, isLoading, error } = useCountryBySlug(slug);

  const countryId = country?.id;
  const countryName = country?.name || "";

  const { data: pageContent } = useCountryPageContent(countryId);
  const { data: tradeMetrics = [] } = useCountryTradeMetrics(countryId);
  const { data: caseStudies = [] } = useCountryCaseStudies(countryId);
  const { data: playbook = [] } = useCountryPlaybook(countryId);
  const { data: funding = { origin: [], destination: [] } } = useCountryFunding(countryId);
  const { data: faqs = [] } = useCountryFAQs(countryId);

  const { data: agencies = [] } = useCountryAgencies(countryName, country?.keywords);
  const { data: investors = [] } = useCountryInvestors(countryName, country?.keywords);
  const { data: cities = [] } = useCountryCities(pageContent?.featured_city_slugs);
  const { data: serviceProviders = [] } = useCountryServiceProviders(slug, country?.service_keywords);
  const { data: events = [] } = useCountryEvents(slug, country?.event_keywords);
  const { data: mentors = [] } = useCountryCommunityMembers(slug, country?.name, country?.keywords);

  if (isLoading) return <PageSkeleton />;

  if (error || !country) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Country Not Found</h1>
        <p className="text-muted-foreground">
          The country you are looking for does not exist.
        </p>
      </div>
    );
  }

  const countryCode = COUNTRY_CODES[slug] ?? null;
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
        topIndustries ? ` — agencies, partners, and case studies across ${topIndustries}.` : "."
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

      <FreemiumGate
        contentType="countries"
        itemId={country.id}
        contentTitle={country.name}
        contentDescription={`Resources for ${country.name} companies entering the Australian market`}
      >
        <CountryStickyBar
          countryName={country.name}
          countryCode={countryCode ?? ""}
          primaryCtaHref={`/report-creator?source=country-${country.slug}`}
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
            agencies={agencies}
            mentors={mentors}
            services={serviceProviders}
            investors={investors}
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
            origin={funding.origin}
            destination={funding.destination}
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
      </FreemiumGate>
    </>
  );
};

export default CountryPage;
