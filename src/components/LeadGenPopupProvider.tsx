
import { useState, useEffect } from "react";
import { LeadGenPopup } from "@/components/LeadGenPopup";
import { useTimerTrigger } from "@/hooks/useTimerTrigger";
import { useAuth } from "@/hooks/useAuth";

interface LeadGenPopupProviderProps {
  children: React.ReactNode;
}

export const LeadGenPopupProvider = ({ children }: LeadGenPopupProviderProps) => {
  const [showLeadGenPopup, setShowLeadGenPopup] = useState(false);
  
  const { user } = useAuth();
  const { triggered } = useTimerTrigger({ 
    delay: 15000, // 15 seconds
    enabled: !user // Only enable for non-authenticated users
  });

  useEffect(() => {
    // Show popup if timer triggered and user is not signed in
    if (triggered && !user) {
      const hasSeenPopup = localStorage.getItem('leadGenPopupShown');
      if (!hasSeenPopup) {
        setShowLeadGenPopup(true);
      }
    }
  }, [triggered, user]);

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
