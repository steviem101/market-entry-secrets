import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PricingSection } from '@/components/sections/PricingSection';
import { PaymentStatusModal } from '@/components/PaymentStatusModal';
import { PageTransition } from '@/components/PageTransition';

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
    }
  }, [searchParams]);

  const handleCloseModal = () => {
    setShowStatusModal(false);
    // Clean up URL parameters
    navigate('/pricing', { replace: true });
  };

  return (
    <PageTransition>
      <>
        <main>
          <PricingSection />
        </main>

        <PaymentStatusModal
          isOpen={showStatusModal}
          onClose={handleCloseModal}
          status={paymentStatus}
          sessionId={sessionId}
        />
      </>
    </PageTransition>
  );
};

export default Pricing;
