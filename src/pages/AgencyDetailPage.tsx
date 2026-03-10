import { useParams } from "react-router-dom";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { FreemiumGate } from "@/components/FreemiumGate";
import { SEOHead } from "@/components/common/SEOHead";
import { EntityBreadcrumb } from "@/components/common/EntityBreadcrumb";
import { AgencyHero } from "@/components/trade-investment-agencies/detail/AgencyHero";
import { AgencyContent } from "@/components/trade-investment-agencies/detail/AgencyContent";
import { useTradeAgencyBySlug, useRelatedTradeAgencies } from "@/hooks/useTradeAgencies";

const AgencyDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: agency, isLoading, error } = useTradeAgencyBySlug(slug || "");
  const { data: relatedAgencies = [] } = useRelatedTradeAgencies(
    agency?.id || "",
    agency?.category_slug || "",
    agency?.location || ""
  );

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error || !agency) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Organisation Not Found</h1>
        <p className="text-muted-foreground">
          The organisation you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  const metaDescription = agency.meta_description || agency.tagline || agency.description?.slice(0, 150) || "";

  return (
    <>
      <SEOHead
        title={agency.meta_title || `${agency.name} | Government & Industry Support | Market Entry Secrets`}
        description={metaDescription}
        canonicalPath={`/government-support/${slug}`}
        ogImage={agency.logo_url || agency.logo}
        jsonLd={{
          type: "Organization",
          data: {
            name: agency.name,
            description: agency.description,
            ...(agency.website_url || agency.website ? { url: agency.website_url || agency.website } : {}),
            ...(agency.logo_url || agency.logo ? { logo: agency.logo_url || agency.logo } : {}),
            ...(agency.location ? { address: { "@type": "PostalAddress", addressLocality: agency.location } } : {}),
            ...(agency.founded ? { foundingDate: String(agency.founded) } : {}),
          },
        }}
      />

      <FreemiumGate
        contentType="trade_investment_agencies"
        itemId={agency.id}
        contentTitle={agency.name}
        contentDescription={agency.description}
      >
        <main>
          <EntityBreadcrumb
            segments={[
              { label: "Government & Industry Support", href: "/trade-investment-agencies" },
              ...(agency.category_name ? [{ label: agency.category_name }] : []),
              { label: agency.name },
            ]}
          />
          <AgencyHero agency={agency} categoryName={agency.category_name} />
          <AgencyContent agency={agency} relatedAgencies={relatedAgencies} categoryName={agency.category_name} />
        </main>
      </FreemiumGate>
    </>
  );
};

export default AgencyDetailPage;
