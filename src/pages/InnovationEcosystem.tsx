import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { InnovationEcosystemHero } from "@/components/innovation-ecosystem/InnovationEcosystemHero";
import InnovationEcosystemFilters from "@/components/innovation-ecosystem/InnovationEcosystemFilters";
import InnovationEcosystemResults from "@/components/innovation-ecosystem/InnovationEcosystemResults";
import { UsageBanner } from "@/components/UsageBanner";
import { EnrichEcosystemButton } from "@/components/innovation-ecosystem/EnrichEcosystemButton";
import { useInnovationEcosystem } from "@/hooks/useInnovationEcosystem";

const InnovationEcosystem = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: organizations, isLoading, error } = useInnovationEcosystem();

  const filteredOrganizations = organizations?.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.services?.some((service: string) => service.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation = selectedLocation === "all" || org.location.toLowerCase().includes(selectedLocation.toLowerCase());
    const matchesService = selectedService === "all" || org.services?.includes(selectedService);
    return matchesSearch && matchesLocation && matchesService;
  });

  const uniqueLocations = [...new Set(organizations?.map(org => org.location) || [])].sort();
  const uniqueServices = [...new Set(organizations?.flatMap(org => org.services || []) || [])].sort();

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedLocation("all");
    setSelectedService("all");
  };

  if (error) {
    return (
      <>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">
            Error loading innovation ecosystem: {error.message}
          </div>
        </div>
      </>
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
          setSearchTerm={setSearchTerm}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          selectedService={selectedService}
          setSelectedService={setSelectedService}
          uniqueLocations={uniqueLocations}
          uniqueServices={uniqueServices}
        />

        <InnovationEcosystemResults
          filteredOrganizations={filteredOrganizations}
          isLoading={isLoading}
          onClearFilters={clearAllFilters}
        />
      </div>
    </>
  );
};

export default InnovationEcosystem;
