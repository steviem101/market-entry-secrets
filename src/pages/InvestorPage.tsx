import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { FreemiumGate } from "@/components/FreemiumGate";
import { InvestorHero } from "@/components/investors/detail/InvestorHero";
import { InvestorContent } from "@/components/investors/detail/InvestorContent";
import { useInvestorById, useRelatedInvestors } from "@/hooks/useInvestors";

const InvestorPage = () => {
  const { investorId } = useParams<{ investorId: string }>();
  const { data: investor, isLoading, error } = useInvestorById(investorId || "");
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
      <Helmet>
        <title>{investor.name} | Australian Investors | Market Entry Secrets</title>
        <meta
          name="description"
          content={`${investor.name} - ${investor.description.slice(0, 150)}...`}
        />
        <meta property="og:title" content={`${investor.name} | Australian Investors`} />
        <meta
          property="og:description"
          content={`${investor.description.slice(0, 150)}`}
        />
        <link rel="canonical" href={`https://market-entry-secrets.lovable.app/investors/${investor.id}`} />
      </Helmet>

      <FreemiumGate
        contentType="investor"
        itemId={investor.id}
        contentTitle={investor.name}
        contentDescription={investor.description}
      >
        <main>
          <InvestorHero investor={investor} />
          <InvestorContent investor={investor} relatedInvestors={relatedInvestors} />
        </main>
      </FreemiumGate>
    </>
  );
};

export default InvestorPage;
