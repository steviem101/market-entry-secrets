
import CompanyCard from "@/components/CompanyCard";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useAuth } from "@/hooks/useAuth";
import { PaywallModal } from "@/components/PaywallModal";
import SectorSection from "./SectorSection";
import { useSectorHandlers } from "@/hooks/useSectorHandlers";

interface TradeAgenciesSectionProps {
  tradeAgencies: any[];
}

const TradeAgenciesSection = ({ tradeAgencies }: TradeAgenciesSectionProps) => {
  const { handleViewProfile, handleContact } = useSectorHandlers();
  const { user, loading: authLoading } = useAuth();
  const { hasReachedLimit } = useUsageTracking();

  if (tradeAgencies.length === 0) return null;

  if (!authLoading && hasReachedLimit && !user) {
    return <PaywallModal contentType="trade_investment_agencies" />;
  }

  return (
    <SectorSection
      title="Government & Industry Support"
      viewAllLink="/government-support"
      viewAllText="View All Organisations"
      isEmpty={false}
    >
      {tradeAgencies.slice(0, 6).map((agency) => (
        <CompanyCard
          key={agency.id}
          company={{
            id: agency.id,
            name: agency.name,
            description: agency.description,
            location: agency.location,
            founded: agency.founded,
            employees: agency.employees,
            services: agency.services || [],
            website: agency.website_url || agency.website,
            contact: agency.email || agency.contact,
            logo: agency.logo,
            experienceTiles: [],
            contactPersons: agency.contact_persons ? (Array.isArray(agency.contact_persons) ? agency.contact_persons as any[] : []) : []
          }}
          detailUrl={`/government-support/${agency.slug || agency.id}`}
          onViewProfile={handleViewProfile}
          onContact={handleContact}
        />
      ))}
    </SectorSection>
  );
};

export default TradeAgenciesSection;
