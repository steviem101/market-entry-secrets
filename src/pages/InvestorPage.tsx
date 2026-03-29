import { useParams } from "react-router-dom";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { FreemiumGate } from "@/components/FreemiumGate";
import { SEOHead } from "@/components/common/SEOHead";
import { EntityBreadcrumb } from "@/components/common/EntityBreadcrumb";
import { InvestorHero } from "@/components/investors/detail/InvestorHero";
import { InvestorContent } from "@/components/investors/detail/InvestorContent";
import { useInvestorBySlug, useRelatedInvestors } from "@/hooks/useInvestors";

const InvestorPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: investor, isLoading, error } = useInvestorBySlug(slug || "");
  const { data: relatedInvestors = [] } = useRelatedInvestors(
    investor?.id || "",
    investor?.investor_type || "",
    investor?.location || ""
  );

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error || !investor) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Investor Not Found</h1>
        <p className="text-muted-foreground">
          The investor you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${investor.name} | Australian Investors | Market Entry Secrets`}
        description={(investor.description || "").slice(0, 160)}
        canonicalPath={`/investors/${investor.slug || slug}`}
        ogImage={investor.logo}
        jsonLd={{
          type: "Organization",
          data: {
            name: investor.name,
            description: investor.description,
            ...(investor.website ? { url: investor.website } : {}),
            ...(investor.logo ? { logo: investor.logo } : {}),
            ...(investor.location ? { address: { "@type": "PostalAddress", addressLocality: investor.location } } : {}),
          },
        }}
      />

      <FreemiumGate
        contentType="investor"
        itemId={investor.id}
        contentTitle={investor.name}
        contentDescription={investor.description}
      >
        <main>
          <EntityBreadcrumb
            segments={[
              { label: "Investors", href: "/investors" },
              { label: investor.name },
            ]}
          />
          <InvestorHero investor={investor} />
          <InvestorContent investor={investor} relatedInvestors={relatedInvestors} />
        </main>
      </FreemiumGate>
    </>
  );
};

export default InvestorPage;
