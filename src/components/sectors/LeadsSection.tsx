import { useState } from "react";
import { LeadCard } from "@/components/LeadCard";
import { LeadPreviewModal } from "@/components/leads/LeadPreviewModal";
import { useLeadCheckout } from "@/hooks/useLeadCheckout";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { ListingPageGate } from "@/components/ListingPageGate";
import SectorSection from "./SectorSection";
import type { LeadDatabase } from "@/types/leadDatabase";

interface LeadsSectionProps {
  leads: LeadDatabase[];
}

const LeadsSection = ({ leads }: LeadsSectionProps) => {
  const { startLeadCheckout } = useLeadCheckout();
  const [previewLead, setPreviewLead] = useState<LeadDatabase | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  if (leads.length === 0) return null;

  const handleCheckout = async (lead: LeadDatabase) => {
    const result = await startLeadCheckout(lead);
    if (result.needsAuth) {
      setShowAuthDialog(true);
    }
  };

  return (
    <ListingPageGate contentType="leads">
      <>
        <SectorSection
          title="Available Market Data"
          viewAllLink="/leads"
          viewAllText="View All Leads"
          isEmpty={false}
        >
          {leads.slice(0, 6).map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onPreview={(lead) => setPreviewLead(lead)}
              onCheckout={handleCheckout}
            />
          ))}
        </SectorSection>

        {previewLead && (
          <LeadPreviewModal
            open={!!previewLead}
            onOpenChange={(open) => { if (!open) setPreviewLead(null); }}
            lead={previewLead}
            onCheckout={() => {
              setPreviewLead(null);
              handleCheckout(previewLead);
            }}
          />
        )}

        <AuthDialog
          open={showAuthDialog}
          onOpenChange={setShowAuthDialog}
        />
      </>
    </ListingPageGate>
  );
};

export default LeadsSection;
