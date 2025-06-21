
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { ServiceProvidersLayout } from "@/components/service-providers/ServiceProvidersLayout";
import { ServiceProvidersDataProvider } from "@/components/service-providers/ServiceProvidersDataProvider";
import { ServiceProvidersHeader } from "@/components/service-providers/ServiceProvidersHeader";
import { ServiceProvidersFilters } from "@/components/service-providers/ServiceProvidersFilters";
import { ServiceProvidersList } from "@/components/service-providers/ServiceProvidersList";
import { CompanyModal } from "@/components/CompanyModal";
import { Company } from "@/components/CompanyCard";
import { UsageBanner } from "@/components/UsageBanner";

const ServiceProviders = () => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewProfile = (company: Company) => {
    setSelectedCompany(company);
    setShowModal(true);
  };

  const handleContact = (company: Company) => {
    console.log('Contact company:', company.name);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <ServiceProvidersDataProvider>
        {({ companies, loading, error, searchQuery, onSearchChange, filters, onFiltersChange }) => (
          <>
            <ServiceProvidersHeader 
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
            />
            
            <div className="container mx-auto px-4 py-8">
              <UsageBanner />
            </div>

            <ServiceProvidersLayout
              filters={
                <ServiceProvidersFilters 
                  filters={filters}
                  onFiltersChange={onFiltersChange}
                />
              }
              content={
                <ServiceProvidersList
                  companies={companies}
                  onViewProfile={handleViewProfile}
                  onContact={handleContact}
                />
              }
            />
          </>
        )}
      </ServiceProvidersDataProvider>

      {selectedCompany && (
        <CompanyModal
          company={selectedCompany}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default ServiceProviders;
