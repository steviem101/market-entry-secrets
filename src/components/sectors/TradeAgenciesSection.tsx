
import CompanyCard from "@/components/CompanyCard";
import { ListingPageGate } from "@/components/ListingPageGate";
import SectorSection from "./SectorSection";
import { useSectorHandlers } from "@/hooks/useSectorHandlers";

interface TradeAgenciesSectionProps {
  tradeAgencies: any[];
}

const TradeAgenciesSection = ({ tradeAgencies }: TradeAgenciesSectionProps) => {
  const { handleViewProfile, handleContact } = useSectorHandlers();

  if (tradeAgencies.length === 0) return null;

  return (
    <ListingPageGate contentType="trade_investment_agencies">
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
              contactPersons: Array.isArray(agency.contact_persons) ? agency.contact_persons : []
            }}
            detailUrl={`/government-support/${agency.slug || agency.id}`}
            onViewProfile={handleViewProfile}
            onContact={handleContact}
          />
        ))}
      </SectorSection>
    </ListingPageGate>
  );
};

export default TradeAgenciesSection;
