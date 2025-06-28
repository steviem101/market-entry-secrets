
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { ServiceProvidersDataProvider } from "@/components/service-providers/ServiceProvidersDataProvider";
import { ServiceProvidersHeader } from "@/components/service-providers/ServiceProvidersHeader";
import { ServiceProvidersList } from "@/components/service-providers/ServiceProvidersList";
import CompanyModal from "@/components/CompanyModal";
import { Company } from "@/components/CompanyCard";
import { UsageBanner } from "@/components/UsageBanner";

const ServiceProviders = () => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

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
      
      <ServiceProvidersDataProvider
        selectedLocations={selectedLocations}
        searchTerm={searchTerm}
        selectedType={selectedType}
      >
        {({ companies, loading, filteredCompanies, uniqueTypes, totalCompanies, uniqueLocations }) => (
          <>
            <ServiceProvidersHeader 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
              filteredCount={filteredCompanies.length}
              selectedLocations={selectedLocations}
              onLocationChange={setSelectedLocations}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              uniqueTypes={uniqueTypes}
              totalCompanies={totalCompanies}
              uniqueLocations={uniqueLocations}
            />
            
            <div className="container mx-auto px-4 py-8">
              <UsageBanner />
              
              {/* Results count */}
              <div className="mb-6">
                <p className="text-muted-foreground">
                  {filteredCompanies.length} service providers found
                </p>
              </div>

              {/* Service Providers List - No sidebar, full width */}
              <ServiceProvidersList
                companies={filteredCompanies}
                onViewProfile={handleViewProfile}
                onContact={handleContact}
              />
            </div>
          </>
        )}
      </ServiceProvidersDataProvider>

      {selectedCompany && (
        <CompanyModal
          company={selectedCompany}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onContact={handleContact}
        />
      )}
    </div>
  );
};

export default ServiceProviders;
