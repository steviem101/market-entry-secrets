
import { LeadCard } from "@/components/LeadCard";
import { FreemiumGate } from "@/components/FreemiumGate";
import SectorSection from "./SectorSection";
import { useSectorHandlers } from "@/hooks/useSectorHandlers";

interface LeadsSectionProps {
  leads: any[];
}

const LeadsSection = ({ leads }: LeadsSectionProps) => {
  const { handleDownload, handlePreview } = useSectorHandlers();

  if (leads.length === 0) return null;

  return (
    <SectorSection
      title="Available Market Data"
      viewAllLink="/leads"
      viewAllText="View All Leads"
      isEmpty={false}
    >
      {leads.slice(0, 6).map((lead) => (
        <FreemiumGate
          key={lead.id}
          contentType="leads"
          itemId={lead.id}
        >
          <LeadCard 
            lead={{
              ...lead,
              type: lead.type as "csv_list" | "tam_map"
            }}
            onDownload={handleDownload}
            onPreview={handlePreview}
          />
        </FreemiumGate>
      ))}
    </SectorSection>
  );
};

export default LeadsSection;
