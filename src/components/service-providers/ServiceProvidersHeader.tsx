
import { ServiceProvidersHero } from "./ServiceProvidersHero";
import { ServiceProvidersSearchBar } from "./ServiceProvidersSearchBar";
import { ServiceProvidersFilters } from "./ServiceProvidersFilters";

interface ServiceProvidersHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  filteredCount: number;
  selectedLocations: string[];
  onLocationChange: (locations: string[]) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  uniqueTypes: string[];
  totalCompanies: number;
  uniqueLocations: number;
  totalServices: number;
}

export const ServiceProvidersHeader = ({
  searchTerm,
  onSearchChange,
  showFilters,
  onToggleFilters,
  filteredCount,
  selectedLocations,
  onLocationChange,
  selectedType,
  onTypeChange,
  uniqueTypes,
  totalCompanies,
  uniqueLocations,
  totalServices
}: ServiceProvidersHeaderProps) => {
  const hasActiveFilters = selectedLocations.length > 0 || selectedType !== "all";

  const clearAllFilters = () => {
    onLocationChange([]);
    onTypeChange("all");
  };

  return (
    <>
      {/* Hero Section */}
      <ServiceProvidersHero 
        totalCompanies={totalCompanies}
        uniqueLocations={uniqueLocations}
        totalServices={totalServices}
      />

      {/* Search and Filters Bar */}
      <section className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <ServiceProvidersSearchBar 
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            showFilters={showFilters}
            onToggleFilters={onToggleFilters}
            hasActiveFilters={hasActiveFilters}
            onClearAllFilters={clearAllFilters}
          />

          {/* Collapsible Filter Section */}
          {showFilters && (
            <ServiceProvidersFilters 
              selectedLocations={selectedLocations}
              onLocationChange={onLocationChange}
              selectedType={selectedType}
              onTypeChange={onTypeChange}
              uniqueTypes={uniqueTypes}
              hasActiveFilters={hasActiveFilters}
              onClearAllFilters={clearAllFilters}
            />
          )}
        </div>
      </section>
    </>
  );
};
