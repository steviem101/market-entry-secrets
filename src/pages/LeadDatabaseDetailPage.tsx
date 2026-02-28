import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { FreemiumGate } from "@/components/FreemiumGate";
import { LeadDatabaseDetailHero } from "@/components/leads/detail/LeadDatabaseDetailHero";
import { LeadDatabaseDetailContent } from "@/components/leads/detail/LeadDatabaseDetailContent";
import { LeadPreviewModal } from "@/components/leads/LeadPreviewModal";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useLeadDatabaseBySlug, useRelatedLeadDatabases } from "@/hooks/useLeadDatabases";
import { useLeadCheckout } from "@/hooks/useLeadCheckout";

const LeadDatabaseDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: db, isLoading, error } = useLeadDatabaseBySlug(slug || "");
  const { data: relatedDatabases = [] } = useRelatedLeadDatabases(
    db?.id || "",
    db?.sector || null
  );
  const { startLeadCheckout, loading: checkoutLoading } = useLeadCheckout();
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Handle Stripe success redirect (exactly once)
  const stripeHandled = useRef(false);
  useEffect(() => {
    if (stripeHandled.current) return;
    const stripeStatus = searchParams.get('stripe_status');
    if (stripeStatus === 'success') {
      stripeHandled.current = true;
      toast.success(
        'Purchase confirmed! Your download details will be emailed within 24 hours.',
        { duration: 8000 }
      );
      navigate(`/leads/${slug}`, { replace: true });
    } else if (stripeStatus === 'cancel') {
      stripeHandled.current = true;
      navigate(`/leads/${slug}`, { replace: true });
    }
  }, [searchParams, navigate, slug]);

  const handleCheckout = async () => {
    if (!db) return;
    const result = await startLeadCheckout(db);
    if (result.needsAuth) {
      setShowAuthDialog(true);
    }
  };

  const handlePreview = () => {
    setShowPreviewModal(true);
  };

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
        <title>{db.title} | B2B Lead Database | Market Entry Secrets</title>
        <meta
          name="description"
          content={db.short_description || `${db.title} - ${db.record_count?.toLocaleString() || ''} verified records. ${db.description?.slice(0, 120) || ''}`}
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
          <LeadDatabaseDetailHero
            db={db}
            onCheckout={handleCheckout}
            onPreview={handlePreview}
            checkoutLoading={checkoutLoading}
          />
          <LeadDatabaseDetailContent
            db={db}
            relatedDatabases={relatedDatabases}
            onCheckout={handleCheckout}
            onPreview={handlePreview}
            checkoutLoading={checkoutLoading}
          />
        </main>
      </FreemiumGate>

      {/* Preview Modal */}
      <LeadPreviewModal
        open={showPreviewModal}
        onOpenChange={setShowPreviewModal}
        lead={db}
        onCheckout={() => {
          setShowPreviewModal(false);
          handleCheckout();
        }}
      />

      {/* Auth Dialog */}
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
      />
    </>
  );
};

export default LeadDatabaseDetailPage;
