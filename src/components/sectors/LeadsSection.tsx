import { LeadCard } from "@/components/LeadCard";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useAuth } from "@/hooks/useAuth";
import { PaywallModal } from "@/components/PaywallModal";
import SectorSection from "./SectorSection";
import type { LeadDatabase } from "@/types/leadDatabase";

interface LeadsSectionProps {
  leads: LeadDatabase[];
}

const LeadsSection = ({ leads }: LeadsSectionProps) => {
  const { user, loading: authLoading } = useAuth();
  const { hasReachedLimit } = useUsageTracking();

  if (leads.length === 0) return null;

  if (!authLoading && hasReachedLimit && !user) {
    return <PaywallModal contentType="leads" />;
  }

  return (
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
        />
      ))}
    </SectorSection>
  );
};

export default LeadsSection;
