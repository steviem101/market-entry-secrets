import CompanyCard from "@/components/CompanyCard";
import { useAuth } from "@/hooks/useAuth";
import SectorSection from "./SectorSection";
import { parseJsonArray } from "@/components/company-card/CompanyCardHelpers";

interface InnovationEcosystemSectionProps {
  innovationEcosystem: any[];
}

const InnovationEcosystemSection = ({ innovationEcosystem }: InnovationEcosystemSectionProps) => {
  const { user } = useAuth();

  if (innovationEcosystem.length === 0) return null;

  const displayedEntities = user ? innovationEcosystem.slice(0, 6) : innovationEcosystem.slice(0, 3);

  return (
    <SectorSection
      title="Innovation Ecosystem Partners"
      viewAllLink="/innovation-ecosystem"
      viewAllText="View All Partners"
      isEmpty={false}
    >
      {displayedEntities.map((entity) => (
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
          detailUrl={`/innovation-ecosystem/${entity.id}`}
        />
      ))}
    </SectorSection>
  );
};

export default InnovationEcosystemSection;
