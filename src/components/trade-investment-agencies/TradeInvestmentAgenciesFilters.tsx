
import { useState } from "react";
import { StandardDirectoryFilters } from "@/components/common/StandardDirectoryFilters";

interface TradeInvestmentAgenciesFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  selectedSector: string;
  setSelectedSector: (sector: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  uniqueLocations: string[];
  uniqueSectors: string[];
  uniqueTypes: string[];
}

const TradeInvestmentAgenciesFilters = ({
  searchTerm,
  setSearchTerm,
  selectedLocation,
  setSelectedLocation,
  selectedSector,
  setSelectedSector,
  selectedType,
  setSelectedType,
  uniqueLocations,
  uniqueSectors,
  uniqueTypes
}: TradeInvestmentAgenciesFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const clearAllFilters = () => {
    setSelectedLocation("all");
    setSelectedSector("all");
    setSelectedType("all");
    setSearchTerm("");
  };

  const hasActiveFilters = selectedLocation !== "all" || selectedSector !== "all" || selectedType !== "all" || searchTerm !== "";

  return (
    <StandardDirectoryFilters
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      selectedLocation={selectedLocation}
      onLocationChange={setSelectedLocation}
      selectedType={selectedType}
      onTypeChange={setSelectedType}
      selectedSector={selectedSector}
      onSectorChange={setSelectedSector}
      showFilters={showFilters}
      onToggleFilters={() => setShowFilters(!showFilters)}
      onClearFilters={clearAllFilters}
      hasActiveFilters={hasActiveFilters}
      locations={uniqueLocations}
      types={uniqueTypes}
      sectors={uniqueSectors}
      searchPlaceholder="Search agencies, services, or locations..."
    />
  );
};

export default TradeInvestmentAgenciesFilters;
