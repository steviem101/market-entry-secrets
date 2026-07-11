import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PricingSection } from '@/components/sections/PricingSection';
import { PaymentStatusModal } from '@/components/PaymentStatusModal';
import { PageTransition } from '@/components/PageTransition';
import { SEOHead } from "@/components/common/SEOHead";

const Pricing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'cancel'>('success');
  const [sessionId, setSessionId] = useState<string | undefined>();

  useEffect(() => {
    const status = searchParams.get('stripe_status');
    const checkoutSessionId = searchParams.get('session_id');

    if (status === 'success' || status === 'cancel') {
      setPaymentStatus(status);
      setSessionId(checkoutSessionId || undefined);
      setShowStatusModal(true);
      // Strip the Stripe params right away so refresh/back doesn't replay the modal
      navigate('/pricing', { replace: true });
    }
  }, [searchParams, navigate]);

  const handleCloseModal = () => {
    setShowStatusModal(false);
    if (paymentStatus === 'success') {
      // Don't strand the buyer on the pricing page — take them to their reports
      navigate('/my-reports');
    }
  };

  return (
    <PageTransition>
      <>
        <SEOHead
          title="Pricing | Market Entry Secrets"
          description="Choose the right plan for your ANZ journey, whether you are entering the market or scaling within it."
          canonicalPath="/pricing"
        />
        <main>
          <PricingSection />
        </main>

        <PaymentStatusModal
          isOpen={showStatusModal}
          onClose={handleCloseModal}
          status={paymentStatus}
          sessionId={sessionId}
          successActionLabel="Go to My Reports"
        />
      </>
    </PageTransition>
  );
};

export default Pricing;
