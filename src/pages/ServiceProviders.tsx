
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ServiceProvidersHero } from "@/components/service-providers/ServiceProvidersHero";
import { ServiceProvidersDataProvider } from "@/components/service-providers/ServiceProvidersDataProvider";
import { StandardDirectoryFilters } from "@/components/common/StandardDirectoryFilters";
import { ServiceProvidersAdvancedFilters } from "@/components/service-providers/ServiceProvidersAdvancedFilters";
import { ServiceProvidersList } from "@/components/service-providers/ServiceProvidersList";
import { ListPagination } from "@/components/common/ListPagination";
import { UsageBanner } from "@/components/UsageBanner";
import { mapServicesToSectors, getStandardTypes } from "@/utils/sectorMapping";
import { PersonaFilter, type PersonaFilterValue } from "@/components/PersonaFilter";
import { usePersona } from "@/contexts/PersonaContext";

const PAGE_SIZE = 12;

const ServiceProviders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { persona } = usePersona();
  const [personaFilterValue, setPersonaFilterValue] = useState<PersonaFilterValue>(
    (searchParams.get("persona") as PersonaFilterValue) ?? (persona as PersonaFilterValue) ?? 'all'
  );
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") ?? "");
  const [selectedLocation, setSelectedLocation] = useState<string>(searchParams.get("location") ?? "all");
  const [selectedType, setSelectedType] = useState<string>(searchParams.get("type") ?? "all");
  const [selectedSector, setSelectedSector] = useState<string>(searchParams.get("sector") ?? "all");
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") ?? "all");
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get("verified") === "true");
  const [sortBy, setSortBy] = useState<string>(searchParams.get("sort") ?? "featured");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);

  useEffect(() => {
    const p = new URLSearchParams();
    if (searchTerm) p.set("search", searchTerm);
    if (selectedLocation !== "all") p.set("location", selectedLocation);
    if (selectedType !== "all") p.set("type", selectedType);
    if (selectedSector !== "all") p.set("sector", selectedSector);
    if (selectedCategory !== "all") p.set("category", selectedCategory);
    if (verifiedOnly) p.set("verified", "true");
    if (sortBy !== "featured") p.set("sort", sortBy);
    if (personaFilterValue !== "all") p.set("persona", personaFilterValue);
    if (currentPage > 1) p.set("page", String(currentPage));
    setSearchParams(p, { replace: true });
  }, [searchTerm, selectedLocation, selectedType, selectedSector, selectedCategory, verifiedOnly, sortBy, personaFilterValue, currentPage, setSearchParams]);

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedLocation("all");
    setSelectedType("all");
    setSelectedSector("all");
    setSelectedCategory("all");
    setVerifiedOnly(false);
    setSortBy("featured");
    setCurrentPage(1);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
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
        <link rel="canonical" href={`${window.location.origin}/service-providers`} />
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
        {({ companies, loading, filteredCompanies, uniqueTypes, uniqueSectors, totalCompanies, uniqueLocations, uniqueLocationValues, totalServices }) => {
          const hasActiveFilters = selectedLocation !== "all" || selectedType !== "all" || selectedSector !== "all" || searchTerm !== "" || selectedCategory !== "all" || verifiedOnly;
          const types = getStandardTypes.serviceProviders;
          const sectors = Array.from(new Set(companies.flatMap(company => mapServicesToSectors(company.services || [])))).sort();
          const allServices = Array.from(new Set(companies.flatMap(company => company.services || []))).sort();

          const totalPages = Math.ceil(filteredCompanies.length / PAGE_SIZE);
          const clampedPage = Math.max(1, Math.min(currentPage, totalPages || 1));
          if (clampedPage !== currentPage) {
            setTimeout(() => setCurrentPage(clampedPage), 0);
          }
          const paginatedCompanies = filteredCompanies.slice(
            (clampedPage - 1) * PAGE_SIZE,
            clampedPage * PAGE_SIZE
          );

          return (
            <>
              <ServiceProvidersHero
                totalCompanies={totalCompanies}
                uniqueLocations={uniqueLocations}
                totalServices={totalServices}
              />

              <StandardDirectoryFilters
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                selectedLocation={selectedLocation}
                onLocationChange={handleLocationChange}
                selectedType={selectedType}
                onTypeChange={(t) => { setSelectedType(t); setCurrentPage(1); }}
                selectedSector={selectedSector}
                onSectorChange={(s) => { setSelectedSector(s); setCurrentPage(1); }}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                onClearFilters={handleClearFilters}
                hasActiveFilters={hasActiveFilters}
                locations={uniqueLocationValues}
                types={types}
                sectors={sectors}
                searchPlaceholder="Search service providers..."
              >
                <ServiceProvidersAdvancedFilters
                  selectedCategory={selectedCategory}
                  onCategoryChange={(c) => { setSelectedCategory(c); setCurrentPage(1); }}
                  verifiedOnly={verifiedOnly}
                  onVerifiedChange={(v) => { setVerifiedOnly(v); setCurrentPage(1); }}
                  sortBy={sortBy}
                  onSortChange={(s) => { setSortBy(s); setCurrentPage(1); }}
                  services={allServices}
                  onServiceClick={(s) => { setSearchTerm(s); setCurrentPage(1); }}
                />
              </StandardDirectoryFilters>

              <div className="container mx-auto px-4 py-8">
                <UsageBanner />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <PersonaFilter value={personaFilterValue} onChange={(v) => { setPersonaFilterValue(v); setCurrentPage(1); }} />
                  <p className="text-muted-foreground text-sm">
                    Showing {paginatedCompanies.length} of {filteredCompanies.length} service providers
                  </p>
                </div>

                <ServiceProvidersList
                  companies={paginatedCompanies}
                />

                <ListPagination
                  currentPage={clampedPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          );
        }}
      </ServiceProvidersDataProvider>

    </>
  );
};

export default ServiceProviders;
