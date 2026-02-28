import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { FreemiumGate } from "@/components/FreemiumGate";
import { LeadDatabaseDetailHero } from "@/components/leads/detail/LeadDatabaseDetailHero";
import { LeadDatabaseDetailContent } from "@/components/leads/detail/LeadDatabaseDetailContent";
import { useLeadDatabaseBySlug, useRelatedLeadDatabases, useLeadDatabaseRecords } from "@/hooks/useLeadDatabases";

const LeadDatabaseDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: db, isLoading, error } = useLeadDatabaseBySlug(slug || "");
  const { data: relatedDatabases = [] } = useRelatedLeadDatabases(
    db?.id || "",
    db?.sector || null
  );
  const { data: previewRecords = [] } = useLeadDatabaseRecords(db?.id || "");

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error || !db) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Database Not Found</h1>
        <p className="text-muted-foreground">
          The lead database you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{db.title} | Sales Leads | Market Entry Secrets</title>
        <meta
          name="description"
          content={db.short_description || `${db.title} - ${db.record_count?.toLocaleString() || ''} records. ${db.description?.slice(0, 120) || ''}`}
        />
        <meta property="og:title" content={`${db.title} | Market Entry Secrets`} />
        <meta
          property="og:description"
          content={db.short_description || db.description?.slice(0, 150) || ''}
        />
        <link rel="canonical" href={`https://market-entry-secrets.lovable.app/leads/${db.slug}`} />
      </Helmet>

      <FreemiumGate
        contentType="leads"
        itemId={db.id}
        contentTitle={db.title}
        contentDescription={db.description || ''}
      >
        <main>
          <LeadDatabaseDetailHero db={db} />
          <LeadDatabaseDetailContent
            db={db}
            relatedDatabases={relatedDatabases}
            previewRecords={previewRecords}
          />
        </main>
      </FreemiumGate>
    </>
  );
};

export default LeadDatabaseDetailPage;
