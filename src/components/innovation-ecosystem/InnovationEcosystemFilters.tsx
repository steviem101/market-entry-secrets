
import { useState } from "react";
import { StandardDirectoryFilters } from "@/components/common/StandardDirectoryFilters";

interface InnovationEcosystemFiltersProps {
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

const InnovationEcosystemFilters = ({
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
}: InnovationEcosystemFiltersProps) => {
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
      searchPlaceholder="Search organizations, services, or locations..."
    />
  );
};

export default InnovationEcosystemFilters;
