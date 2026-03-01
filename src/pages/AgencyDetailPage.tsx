import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { FreemiumGate } from "@/components/FreemiumGate";
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

  const metaDescription = agency.tagline || agency.description?.slice(0, 150);

  return (
    <>
      <Helmet>
        <title>{agency.meta_title || `${agency.name} | Government & Industry Support | Market Entry Secrets`}</title>
        <meta
          name="description"
          content={agency.meta_description || metaDescription}
        />
        <meta property="og:title" content={`${agency.name} | Government & Industry Support`} />
        <meta
          property="og:description"
          content={metaDescription}
        />
        <link rel="canonical" href={`https://market-entry-secrets.lovable.app/government-support/${slug}`} />
      </Helmet>

      <FreemiumGate
        contentType="trade_investment_agencies"
        itemId={agency.id}
        contentTitle={agency.name}
        contentDescription={agency.description}
      >
        <main>
          <AgencyHero agency={agency} categoryName={agency.category_name} />
          <AgencyContent agency={agency} relatedAgencies={relatedAgencies} categoryName={agency.category_name} />
        </main>
      </FreemiumGate>
    </>
  );
};

export default AgencyDetailPage;
