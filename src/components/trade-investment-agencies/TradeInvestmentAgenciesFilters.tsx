import { useState } from "react";
import { StandardDirectoryFilters } from "@/components/common/StandardDirectoryFilters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TradeInvestmentAgenciesFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  selectedSector: string;
  setSelectedSector: (sector: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  uniqueLocations: string[];
  uniqueSectors: string[];
  uniqueTypes: string[];
  categories: any[];
}

const formatTypeLabel = (value: string) => {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const TradeInvestmentAgenciesFilters = ({
  searchTerm,
  setSearchTerm,
  selectedLocation,
  setSelectedLocation,
  selectedSector,
  setSelectedSector,
  selectedType,
  setSelectedType,
  selectedCategory,
  setSelectedCategory,
  uniqueLocations,
  uniqueSectors,
  uniqueTypes,
  categories
}: TradeInvestmentAgenciesFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const clearAllFilters = () => {
    setSelectedLocation("all");
    setSelectedSector("all");
    setSelectedType("all");
    setSelectedCategory("all");
    setSearchTerm("");
  };

  const hasActiveFilters = selectedLocation !== "all" || selectedSector !== "all" || selectedType !== "all" || selectedCategory !== "all" || searchTerm !== "";

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
      types={uniqueTypes.map(t => formatTypeLabel(t))}
      sectors={uniqueSectors.map(s => formatTypeLabel(s))}
      searchPlaceholder="Search agencies, associations, or services..."
    >
      <div className="flex flex-wrap gap-4">
        <div className="w-48">
          <label className="text-sm font-medium text-muted-foreground mb-1 block">Category</label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat: any) => (
                <SelectItem key={cat.slug} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </StandardDirectoryFilters>
  );
};

export default TradeInvestmentAgenciesFilters;
