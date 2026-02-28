import { useState } from "react";
import { TradeInvestmentAgenciesHero } from "@/components/trade-investment-agencies/TradeInvestmentAgenciesHero";
import TradeInvestmentAgenciesFilters from "@/components/trade-investment-agencies/TradeInvestmentAgenciesFilters";
import TradeInvestmentAgenciesResults from "@/components/trade-investment-agencies/TradeInvestmentAgenciesResults";
import { UsageBanner } from "@/components/UsageBanner";
import { useTradeAgencies, useOrganisationCategories } from "@/hooks/useTradeAgencies";

const TradeInvestmentAgencies = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: agencies, isLoading, error } = useTradeAgencies();
  const { data: categories = [] } = useOrganisationCategories();

  const filteredAgencies = agencies?.filter(agency => {
    const a = agency as any;
    const matchesSearch = searchTerm === "" ||
      agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.services?.some((service: string) => service.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.tagline && a.tagline.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation = selectedLocation === "all" || agency.location.toLowerCase().includes(selectedLocation.toLowerCase());
    const matchesSector = selectedSector === "all" ||
      (a.sectors_supported && a.sectors_supported.some((s: string) => s.toLowerCase().includes(selectedSector.toLowerCase())));
    const matchesType = selectedType === "all" ||
      (a.organisation_type && a.organisation_type.toLowerCase().includes(selectedType.toLowerCase()));
    const matchesCategory = selectedCategory === "all" ||
      (a.category_slug && a.category_slug === selectedCategory);
    return matchesSearch && matchesLocation && matchesSector && matchesType && matchesCategory;
  });

  const uniqueLocations = [...new Set(agencies?.map(agency => agency.location) || [])];
  const uniqueSectors = [...new Set(
    agencies?.flatMap(agency => (agency as any).sectors_supported || [])
      .filter((s: string) => s && s !== 'all') || []
  )];
  const uniqueTypes = [...new Set(
    agencies?.map(agency => (agency as any).organisation_type)
      .filter(Boolean) || []
  )];

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedLocation("all");
    setSelectedSector("all");
    setSelectedType("all");
    setSelectedCategory("all");
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          Error loading organisations: {error.message}
        </div>
      </div>
    );
  }

  return (
    <>
      <TradeInvestmentAgenciesHero
        agencyCount={agencies?.length || 0}
        locationCount={uniqueLocations.length}
        categories={categories}
        agencies={agencies || []}
      />

      <div className="container mx-auto px-4 py-8">
        <UsageBanner />

        <TradeInvestmentAgenciesFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          selectedSector={selectedSector}
          setSelectedSector={setSelectedSector}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          uniqueLocations={uniqueLocations}
          uniqueSectors={uniqueSectors}
          uniqueTypes={uniqueTypes}
          categories={categories}
        />

        <TradeInvestmentAgenciesResults
          filteredAgencies={filteredAgencies}
          isLoading={isLoading}
          onClearFilters={clearAllFilters}
        />
      </div>
    </>
  );
};

export default TradeInvestmentAgencies;
