
import { useState, useEffect } from "react";
import { LeadGenPopup } from "@/components/LeadGenPopup";
import { useTimerTrigger } from "@/hooks/useTimerTrigger";
import { useAuth } from "@/hooks/useAuth";

interface LeadGenPopupProviderProps {
  children: React.ReactNode;
}

// Check once at mount whether the user is returning from Stripe checkout.
// This provider sits outside BrowserRouter so we use window.location directly.
const isStripeReturn = () =>
  new URLSearchParams(window.location.search).has('stripe_status');

export const LeadGenPopupProvider = ({ children }: LeadGenPopupProviderProps) => {
  const [showLeadGenPopup, setShowLeadGenPopup] = useState(false);

  const { user, loading } = useAuth();

  // Don't start timer while auth is still loading (user appears null
  // during the async getSession() call) or when returning from Stripe.
  const { triggered } = useTimerTrigger({
    delay: 15000, // 15 seconds
    enabled: !user && !loading && !isStripeReturn()
  });

  useEffect(() => {
    // Show popup only after auth has settled and user is genuinely not signed in
    if (triggered && !user && !loading) {
      const hasSeenPopup = localStorage.getItem('leadGenPopupShown');
      if (!hasSeenPopup) {
        setShowLeadGenPopup(true);
      }
    }
  }, [triggered, user, loading]);

  const handleCloseLeadGenPopup = () => {
    setShowLeadGenPopup(false);
    localStorage.setItem('leadGenPopupShown', 'true');
  };

  return (
    <>
      {children}
      <LeadGenPopup 
        isOpen={showLeadGenPopup}
        onClose={handleCloseLeadGenPopup}
      />
    </>
  );
};
