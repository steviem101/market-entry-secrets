
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ServiceProvidersHero } from "@/components/service-providers/ServiceProvidersHero";
import { ServiceProvidersDataProvider } from "@/components/service-providers/ServiceProvidersDataProvider";
import { StandardDirectoryFilters } from "@/components/common/StandardDirectoryFilters";
import { ServiceProvidersList } from "@/components/service-providers/ServiceProvidersList";
import CompanyModal from "@/components/CompanyModal";
import { Company } from "@/components/CompanyCard";
import { UsageBanner } from "@/components/UsageBanner";
import { mapServicesToSectors, getStandardTypes } from "@/utils/sectorMapping";

const ServiceProviders = () => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedLocation("all");
    setSelectedType("all");
    setSelectedSector("all");
  };

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
        selectedLocations={selectedLocation === "all" ? [] : [selectedLocation]}
        searchTerm={searchTerm}
        selectedType={selectedType}
        selectedSector={selectedSector}
      >
        {({ companies, loading, filteredCompanies, uniqueTypes, uniqueSectors, totalCompanies, uniqueLocations, totalServices }) => {
          const hasActiveFilters = selectedLocation !== "all" || selectedType !== "all" || selectedSector !== "all" || searchTerm !== "";
          const types = getStandardTypes.serviceProviders;
          const sectors = Array.from(new Set(companies.flatMap(company => mapServicesToSectors(company.services || [])))).sort();
          
          return (
            <>
              <ServiceProvidersHero 
                totalCompanies={totalCompanies}
                uniqueLocations={uniqueLocations}
                totalServices={totalServices}
              />
              
              <StandardDirectoryFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedLocation={selectedLocation}
                onLocationChange={handleLocationChange}
                selectedType={selectedType}
                onTypeChange={setSelectedType}
                selectedSector={selectedSector}
                onSectorChange={setSelectedSector}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                onClearFilters={handleClearFilters}
                hasActiveFilters={hasActiveFilters}
                locations={Array.isArray(uniqueLocations) ? uniqueLocations : []}
                types={types}
                sectors={sectors}
                searchPlaceholder="Search service providers..."
              >
                {/* Advanced Filters - Services */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Services:</span>
                  {Array.from(new Set(companies.flatMap(company => company.services || []))).sort().slice(0, 10).map((service) => (
                    <button
                      key={service}
                      className="px-3 py-1 text-sm bg-muted hover:bg-muted/80 rounded-full transition-colors"
                      onClick={() => setSearchTerm(service)}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              </StandardDirectoryFilters>
            
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
          );
        }}
      </ServiceProvidersDataProvider>

      {selectedCompany && (
        <CompanyModal
          company={selectedCompany}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onContact={handleContact}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default ServiceProviders;
