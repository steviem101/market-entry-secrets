
import CompanyCard from "@/components/CompanyCard";
import { FreemiumGate } from "@/components/FreemiumGate";
import SectorSection from "./SectorSection";
import { useSectorHandlers } from "@/hooks/useSectorHandlers";

interface TradeAgenciesSectionProps {
  tradeAgencies: any[];
}

const TradeAgenciesSection = ({ tradeAgencies }: TradeAgenciesSectionProps) => {
  const { handleViewProfile, handleContact } = useSectorHandlers();

  if (tradeAgencies.length === 0) return null;

  return (
    <SectorSection
      title="Trade & Investment Agencies"
      viewAllLink="/trade-investment-agencies"
      viewAllText="View All Agencies"
      isEmpty={false}
    >
      {tradeAgencies.slice(0, 6).map((agency) => (
        <FreemiumGate
          key={agency.id}
          contentType="trade_investment_agencies"
          itemId={agency.id}
        >
          <CompanyCard
            company={{
              id: agency.id,
              name: agency.name,
              description: agency.description,
              location: agency.location,
              founded: agency.founded,
              employees: agency.employees,
              services: agency.services || [],
              website: agency.website,
              contact: agency.contact,
              logo: agency.logo,
              experienceTiles: agency.experience_tiles ? (Array.isArray(agency.experience_tiles) ? agency.experience_tiles as any[] : []) : [],
              contactPersons: agency.contact_persons ? (Array.isArray(agency.contact_persons) ? agency.contact_persons as any[] : []) : []
            }}
            onViewProfile={handleViewProfile}
            onContact={handleContact}
          />
        </FreemiumGate>
      ))}
    </SectorSection>
  );
};

export default TradeAgenciesSection;
