
import CompanyCard from "@/components/CompanyCard";
import { FreemiumGate } from "@/components/FreemiumGate";
import SectorSection from "./SectorSection";
import { useSectorHandlers } from "@/hooks/useSectorHandlers";

interface InnovationEcosystemSectionProps {
  innovationEcosystem: any[];
}

const InnovationEcosystemSection = ({ innovationEcosystem }: InnovationEcosystemSectionProps) => {
  const { handleViewProfile, handleContact } = useSectorHandlers();

  if (innovationEcosystem.length === 0) return null;

  return (
    <SectorSection
      title="Innovation Ecosystem Partners"
      viewAllLink="/innovation-ecosystem"
      viewAllText="View All Partners"
      isEmpty={false}
    >
      {innovationEcosystem.slice(0, 6).map((entity) => (
        <FreemiumGate
          key={entity.id}
          contentType="innovation_ecosystem"
          itemId={entity.id}
        >
          <CompanyCard
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
              experienceTiles: entity.experience_tiles ? (Array.isArray(entity.experience_tiles) ? entity.experience_tiles as any[] : []) : [],
              contactPersons: entity.contact_persons ? (Array.isArray(entity.contact_persons) ? entity.contact_persons as any[] : []) : []
            }}
            onViewProfile={handleViewProfile}
            onContact={handleContact}
          />
        </FreemiumGate>
      ))}
    </SectorSection>
  );
};

export default InnovationEcosystemSection;
