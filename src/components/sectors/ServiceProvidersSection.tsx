
import CompanyCard from "@/components/CompanyCard";
import { ListingPageGate } from "@/components/ListingPageGate";
import SectorSection from "./SectorSection";
import { useSectorHandlers } from "@/hooks/useSectorHandlers";

interface SectorServiceProvider {
  id: string;
  name?: string;
  description?: string;
  location?: string;
  founded?: string;
  employees?: string;
  services?: string[];
  website?: string;
  contact?: string;
  logo?: string;
  slug?: string;
  experience_tiles?: unknown[];
  contact_persons?: unknown[];
}

interface ServiceProvidersSectionProps {
  serviceProviders: SectorServiceProvider[];
}

const ServiceProvidersSection = ({ serviceProviders }: ServiceProvidersSectionProps) => {
  const { handleViewProfile, handleContact } = useSectorHandlers();

  if (serviceProviders.length === 0) return null;

  return (
    <ListingPageGate contentType="service_providers">
      <SectorSection
      title="Specialized Service Providers"
      viewAllLink="/service-providers"
      viewAllText="View All Providers"
      isEmpty={false}
    >
      {serviceProviders.slice(0, 6).map((provider) => (
        <CompanyCard
          key={provider.id}
          company={{
            id: provider.id,
            name: provider.name || "",
            description: provider.description || "",
            location: provider.location || "",
            founded: provider.founded || "",
            employees: provider.employees || "",
            services: provider.services || [],
            website: provider.website || undefined,
            contact: provider.contact || undefined,
            logo: provider.logo || undefined,
            slug: provider.slug || undefined,
            experienceTiles: Array.isArray(provider.experience_tiles) ? provider.experience_tiles : [],
            contactPersons: Array.isArray(provider.contact_persons) ? provider.contact_persons : []
          }}
          onViewProfile={handleViewProfile}
          onContact={handleContact}
          detailUrl={`/service-providers/${provider.slug || provider.id}`}
        />
      ))}
      </SectorSection>
    </ListingPageGate>
  );
};

export default ServiceProvidersSection;
