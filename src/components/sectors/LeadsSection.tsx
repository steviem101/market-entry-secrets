
import { LeadCard } from "@/components/LeadCard";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useAuth } from "@/hooks/useAuth";
import { PaywallModal } from "@/components/PaywallModal";
import SectorSection from "./SectorSection";
import { useSectorHandlers } from "@/hooks/useSectorHandlers";

interface LeadsSectionProps {
  leads: any[];
}

const LeadsSection = ({ leads }: LeadsSectionProps) => {
  const { handleDownload, handlePreview } = useSectorHandlers();
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
          lead={{
            ...lead,
            type: lead.type as "csv_list" | "tam_map"
          }}
          onDownload={handleDownload}
          onPreview={handlePreview}
        />
      ))}
    </SectorSection>
  );
};

export default LeadsSection;
