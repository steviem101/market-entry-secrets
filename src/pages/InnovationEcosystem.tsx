import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { InnovationEcosystemHero } from "@/components/innovation-ecosystem/InnovationEcosystemHero";
import InnovationEcosystemFilters from "@/components/innovation-ecosystem/InnovationEcosystemFilters";
import InnovationEcosystemResults from "@/components/innovation-ecosystem/InnovationEcosystemResults";
import { ListPagination } from "@/components/common/ListPagination";
import { UsageBanner } from "@/components/UsageBanner";
import { EnrichEcosystemButton } from "@/components/innovation-ecosystem/EnrichEcosystemButton";
import { useInnovationEcosystem } from "@/hooks/useInnovationEcosystem";

const PAGE_SIZE = 12;

const InnovationEcosystem = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") ?? "");
  const [selectedLocation, setSelectedLocation] = useState<string>(searchParams.get("location") ?? "all");
  const [selectedService, setSelectedService] = useState<string>(searchParams.get("service") ?? "all");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const queryClient = useQueryClient();

  useEffect(() => {
    const p = new URLSearchParams();
    if (searchTerm) p.set("search", searchTerm);
    if (selectedLocation !== "all") p.set("location", selectedLocation);
    if (selectedService !== "all") p.set("service", selectedService);
    if (currentPage > 1) p.set("page", String(currentPage));
    setSearchParams(p, { replace: true });
  }, [searchTerm, selectedLocation, selectedService, currentPage, setSearchParams]);

  const { data: organizations, isLoading, error } = useInnovationEcosystem();

  const filteredOrganizations = organizations?.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.services?.some((service: string) => service.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation = selectedLocation === "all" || org.location.toLowerCase().includes(selectedLocation.toLowerCase());
    const matchesService = selectedService === "all" || org.services?.includes(selectedService);
    return matchesSearch && matchesLocation && matchesService;
  }) || [];

  const totalPages = Math.ceil(filteredOrganizations.length / PAGE_SIZE);
  const paginatedOrganizations = filteredOrganizations.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const uniqueLocations = [...new Set(organizations?.map(org => org.location) || [])].sort();
  const uniqueServices = [...new Set(organizations?.flatMap(org => org.services || []) || [])].sort();

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedLocation("all");
    setSelectedService("all");
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          Error loading innovation ecosystem: {error.message}
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Innovation Ecosystem | Market Entry Secrets</title>
        <meta
          name="description"
          content="Discover incubators, accelerators, innovation hubs, and startup ecosystems. Find partners to help scale your business and access the Australian market."
        />
        <meta property="og:title" content="Innovation Ecosystem | Market Entry Secrets" />
        <meta
          property="og:description"
          content="Discover incubators, accelerators, innovation hubs, and startup ecosystems worldwide."
        />
        <link rel="canonical" href="https://market-entry-secrets.lovable.app/innovation-ecosystem" />
      </Helmet>

      <InnovationEcosystemHero
        organizationCount={organizations?.length || 0}
        locationCount={uniqueLocations.length}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <UsageBanner />
          <EnrichEcosystemButton
            organizations={organizations || []}
            onEnrichmentComplete={() => queryClient.invalidateQueries({ queryKey: ['innovation-ecosystem'] })}
          />
        </div>

        <InnovationEcosystemFilters
          searchTerm={searchTerm}
          setSearchTerm={(v: string) => { setSearchTerm(v); setCurrentPage(1); }}
          selectedLocation={selectedLocation}
          setSelectedLocation={(v: string) => { setSelectedLocation(v); setCurrentPage(1); }}
          selectedService={selectedService}
          setSelectedService={(v: string) => { setSelectedService(v); setCurrentPage(1); }}
          uniqueLocations={uniqueLocations}
          uniqueServices={uniqueServices}
        />

        <p className="text-muted-foreground text-sm mb-4">
          Showing {paginatedOrganizations.length} of {filteredOrganizations.length} organisations
        </p>

        <InnovationEcosystemResults
          filteredOrganizations={paginatedOrganizations}
          isLoading={isLoading}
          onClearFilters={clearAllFilters}
        />

        <ListPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
};

export default InnovationEcosystem;
