
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { ServiceProvidersHero } from "@/components/service-providers/ServiceProvidersHero";
import { ServiceProvidersDataProvider } from "@/components/service-providers/ServiceProvidersDataProvider";
import { StandardDirectoryFilters } from "@/components/common/StandardDirectoryFilters";
import { ServiceProvidersAdvancedFilters } from "@/components/service-providers/ServiceProvidersAdvancedFilters";
import { ServiceProvidersList } from "@/components/service-providers/ServiceProvidersList";
import CompanyModal from "@/components/CompanyModal";
import { Company } from "@/components/CompanyCard";
import { UsageBanner } from "@/components/UsageBanner";
import { mapServicesToSectors, getStandardTypes } from "@/utils/sectorMapping";
import { PersonaFilter, type PersonaFilterValue } from "@/components/PersonaFilter";
import { usePersona } from "@/contexts/PersonaContext";

const ServiceProviders = () => {
  const { persona } = usePersona();
  const [personaFilterValue, setPersonaFilterValue] = useState<PersonaFilterValue>(
    (persona as PersonaFilterValue) ?? 'all'
  );
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [showFilters, setShowFilters] = useState(false);

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedLocation("all");
    setSelectedType("all");
    setSelectedSector("all");
    setSelectedCategory("all");
    setVerifiedOnly(false);
    setSortBy("featured");
  };

  const handleViewProfile = (company: Company) => {
    setSelectedCompany(company);
    setShowModal(true);
  };

  const handleContact = (_company: Company) => {
    // Contact functionality placeholder
  };

  return (
    <>
      <Helmet>
        <title>Service Providers | Market Entry Secrets</title>
        <meta
          name="description"
          content="Find expert service providers who specialize in international market entry to Australia and New Zealand. Legal, accounting, recruitment, strategy, and more."
        />
        <meta property="og:title" content="Service Providers | Market Entry Secrets" />
        <meta
          property="og:description"
          content="Connect with verified service providers for your market entry into Australia and New Zealand."
        />
        <link rel="canonical" href="https://market-entry-secrets.lovable.app/service-providers" />
      </Helmet>

      <ServiceProvidersDataProvider
        selectedLocations={selectedLocation === "all" ? [] : [selectedLocation]}
        searchTerm={searchTerm}
        selectedType={selectedType}
        selectedSector={selectedSector}
        selectedCategory={selectedCategory}
        verifiedOnly={verifiedOnly}
        sortBy={sortBy}
        personaFilter={personaFilterValue}
      >
        {({ companies, loading, filteredCompanies, uniqueTypes, uniqueSectors, totalCompanies, uniqueLocations, totalServices }) => {
          const hasActiveFilters = selectedLocation !== "all" || selectedType !== "all" || selectedSector !== "all" || searchTerm !== "" || selectedCategory !== "all" || verifiedOnly;
          const types = getStandardTypes.serviceProviders;
          const sectors = Array.from(new Set(companies.flatMap(company => mapServicesToSectors(company.services || [])))).sort();
          const allServices = Array.from(new Set(companies.flatMap(company => company.services || []))).sort();

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
                <ServiceProvidersAdvancedFilters
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  verifiedOnly={verifiedOnly}
                  onVerifiedChange={setVerifiedOnly}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  services={allServices}
                  onServiceClick={setSearchTerm}
                />
              </StandardDirectoryFilters>

              <div className="container mx-auto px-4 py-8">
                <UsageBanner />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <PersonaFilter value={personaFilterValue} onChange={setPersonaFilterValue} />
                  <p className="text-muted-foreground text-sm">
                    {filteredCompanies.length} service providers found
                  </p>
                </div>

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
    </>
  );
};

export default ServiceProviders;
