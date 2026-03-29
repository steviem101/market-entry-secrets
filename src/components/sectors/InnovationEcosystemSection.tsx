import CompanyCard from "@/components/CompanyCard";
import { ListingPageGate } from "@/components/ListingPageGate";
import SectorSection from "./SectorSection";
import { parseJsonArray } from "@/components/company-card/CompanyCardHelpers";

interface InnovationEcosystemSectionProps {
  innovationEcosystem: any[];
}

const InnovationEcosystemSection = ({ innovationEcosystem }: InnovationEcosystemSectionProps) => {
  if (innovationEcosystem.length === 0) return null;

  return (
    <ListingPageGate contentType="innovation_ecosystem">
      <SectorSection
        title="Innovation Ecosystem Partners"
        viewAllLink="/innovation-ecosystem"
        viewAllText="View All Partners"
        isEmpty={false}
      >
        {innovationEcosystem.slice(0, 6).map((entity) => (
          <CompanyCard
            key={entity.id}
            company={{
              id: entity.id,
              name: entity.name,
              description: entity.description,
              location: entity.location,
              founded: entity.founded,
              employees: entity.employees,
              services: entity.services || [],
              website: entity.website,
              contact: entity.contact,
              logo: entity.logo,
              experience_tiles: parseJsonArray(entity.experience_tiles),
              contact_persons: parseJsonArray(entity.contact_persons)
            }}
            detailUrl={`/innovation-ecosystem/${entity.slug}`}
          />
        ))}
      </SectorSection>
    </ListingPageGate>
  );
};

export default InnovationEcosystemSection;
