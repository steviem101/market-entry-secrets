
import { useParams } from "react-router-dom";
import { useCountryBySlug } from "@/hooks/useCountries";
import { CountryHero } from "@/components/countries/CountryHero";
import { CountryContent } from "@/components/countries/CountryContent";
import { SEOHead } from "@/components/common/SEOHead";
import { EntityBreadcrumb } from "@/components/common/EntityBreadcrumb";
import { FreemiumGate } from "@/components/FreemiumGate";
import { PageSkeleton } from "@/components/ui/page-skeleton";

const CountryPage = () => {
  const { countrySlug } = useParams<{ countrySlug: string }>();
  const { data: country, isLoading, error } = useCountryBySlug(countrySlug || "");

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error || !country) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Country Not Found</h1>
        <p className="text-muted-foreground">The country you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${country.name} → Australia Market Entry | Market Entry Secrets`}
        description={`Resources for ${country.name} companies entering the Australian market. Key industries: ${(country.key_industries || []).slice(0, 3).join(", ")}.`}
        canonicalPath={`/countries/${country.slug}`}
        jsonLd={{
          type: "Place",
          data: {
            name: country.name,
            description: `Market entry origin: ${country.name}`,
          },
        }}
      />

      <FreemiumGate
        contentType="countries"
        itemId={country.id}
        contentTitle={country.name}
        contentDescription={`Resources for ${country.name} companies entering the Australian market`}
      >
        <main className="pt-4">
          <EntityBreadcrumb
            segments={[
              { label: "Countries", href: "/countries" },
              { label: country.name },
            ]}
          />
          <CountryHero country={country} />
          <CountryContent country={country} />
        </main>
      </FreemiumGate>
    </>
  );
};

export default CountryPage;
