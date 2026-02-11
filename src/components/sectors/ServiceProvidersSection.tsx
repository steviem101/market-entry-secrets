
import CompanyCard from "@/components/CompanyCard";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useAuth } from "@/hooks/useAuth";
import { PaywallModal } from "@/components/PaywallModal";
import SectorSection from "./SectorSection";
import { useSectorHandlers } from "@/hooks/useSectorHandlers";

interface ServiceProvidersSectionProps {
  serviceProviders: any[];
}

const ServiceProvidersSection = ({ serviceProviders }: ServiceProvidersSectionProps) => {
  const { handleViewProfile, handleContact } = useSectorHandlers();
  const { user, loading: authLoading } = useAuth();
  const { hasReachedLimit } = useUsageTracking();

  if (serviceProviders.length === 0) return null;

  if (!authLoading && hasReachedLimit && !user) {
    return <PaywallModal contentType="service_providers" />;
  }

  return (
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
      ))}
    </SectorSection>
  );
};

export default ServiceProvidersSection;
