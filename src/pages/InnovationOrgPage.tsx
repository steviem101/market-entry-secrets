import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { FreemiumGate } from "@/components/FreemiumGate";
import { InnovationOrgHero } from "@/components/innovation-ecosystem/detail/InnovationOrgHero";
import { InnovationOrgContent } from "@/components/innovation-ecosystem/detail/InnovationOrgContent";
import { useInnovationOrgById, useRelatedInnovationOrgs } from "@/hooks/useInnovationEcosystem";

const InnovationOrgPage = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const { data: org, isLoading, error } = useInnovationOrgById(orgId || "");
  const { data: relatedOrgs = [] } = useRelatedInnovationOrgs(
    org?.id || "",
    org?.location || ""
  );

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error || !org) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Organization Not Found</h1>
        <p className="text-muted-foreground">
          The organization you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{org.name} | Innovation Ecosystem | Market Entry Secrets</title>
        <meta
          name="description"
          content={`${org.name} - ${org.description.slice(0, 150)}...`}
        />
        <meta property="og:title" content={`${org.name} | Innovation Ecosystem`} />
        <meta
          property="og:description"
          content={`${org.description.slice(0, 150)}`}
        />
        <link rel="canonical" href={`https://market-entry-secrets.lovable.app/innovation-ecosystem/${org.id}`} />
      </Helmet>

      <FreemiumGate
        contentType="innovation_ecosystem"
        itemId={org.id}
        contentTitle={org.name}
        contentDescription={org.description}
      >
        <main>
          <InnovationOrgHero org={org} />
          <InnovationOrgContent org={org} relatedOrgs={relatedOrgs} />
        </main>
      </FreemiumGate>
    </>
  );
};

export default InnovationOrgPage;
