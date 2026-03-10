import { useParams } from "react-router-dom";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { FreemiumGate } from "@/components/FreemiumGate";
import { SEOHead } from "@/components/common/SEOHead";
import { EntityBreadcrumb } from "@/components/common/EntityBreadcrumb";
import { InnovationOrgHero } from "@/components/innovation-ecosystem/detail/InnovationOrgHero";
import { InnovationOrgContent } from "@/components/innovation-ecosystem/detail/InnovationOrgContent";
import { useInnovationOrgBySlug, useRelatedInnovationOrgs } from "@/hooks/useInnovationEcosystem";

const InnovationOrgPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: org, isLoading, error } = useInnovationOrgBySlug(slug || "");
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
      <SEOHead
        title={`${org.name} | Innovation Ecosystem | Market Entry Secrets`}
        description={(org.description || "").slice(0, 160)}
        canonicalPath={`/innovation-ecosystem/${org.slug}`}
        ogImage={org.logo}
        jsonLd={{
          type: "Organization",
          data: {
            name: org.name,
            description: org.description,
            ...(org.website ? { url: org.website } : {}),
            ...(org.logo ? { logo: org.logo } : {}),
            ...(org.location ? { address: { "@type": "PostalAddress", addressLocality: org.location } } : {}),
            ...(org.founded ? { foundingDate: String(org.founded) } : {}),
          },
        }}
      />

      <FreemiumGate
        contentType="innovation_ecosystem"
        itemId={org.id}
        contentTitle={org.name}
        contentDescription={org.description}
      >
        <main>
          <EntityBreadcrumb
            segments={[
              { label: "Innovation Ecosystem", href: "/innovation-ecosystem" },
              { label: org.name },
            ]}
          />
          <InnovationOrgHero org={org} />
          <InnovationOrgContent org={org} relatedOrgs={relatedOrgs} />
        </main>
      </FreemiumGate>
    </>
  );
};

export default InnovationOrgPage;
