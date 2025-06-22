
import CompanyCard from "@/components/CompanyCard";
import { FreemiumGate } from "@/components/FreemiumGate";
import SectorSection from "./SectorSection";
import { useSectorHandlers } from "@/hooks/useSectorHandlers";

interface ServiceProvidersSectionProps {
  serviceProviders: any[];
}

const ServiceProvidersSection = ({ serviceProviders }: ServiceProvidersSectionProps) => {
  const { handleViewProfile, handleContact } = useSectorHandlers();

  if (serviceProviders.length === 0) return null;

  return (
    <SectorSection
      title="Specialized Service Providers"
      viewAllLink="/service-providers"
      viewAllText="View All Providers"
      isEmpty={false}
    >
      {serviceProviders.slice(0, 6).map((provider) => (
        <FreemiumGate
          key={provider.id}
          contentType="service_providers"
          itemId={provider.id}
        >
          <CompanyCard
            company={{
              id: provider.id,
              name: provider.name,
              description: provider.description,
              location: provider.location,
              founded: provider.founded,
              employees: provider.employees,
              services: provider.services || [],
              website: provider.website,
              contact: provider.contact,
              logo: provider.logo,
              experienceTiles: provider.experience_tiles ? (Array.isArray(provider.experience_tiles) ? provider.experience_tiles as any[] : []) : [],
              contactPersons: provider.contact_persons ? (Array.isArray(provider.contact_persons) ? provider.contact_persons as any[] : []) : []
            }}
            onViewProfile={handleViewProfile}
            onContact={handleContact}
          />
        </FreemiumGate>
      ))}
    </SectorSection>
  );
};

export default ServiceProvidersSection;
