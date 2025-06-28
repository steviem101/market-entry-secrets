
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

interface ServiceProvidersFiltersProps {
  selectedLocations: string[];
  onLocationChange: (locations: string[]) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedSector: string;
  onSectorChange: (sector: string) => void;
  uniqueTypes: string[];
  uniqueSectors: string[];
  hasActiveFilters: boolean;
  onClearAllFilters: () => void;
}

const australianCities = [
  "Sydney, NSW",
  "Melbourne, VIC", 
  "Brisbane, QLD",
  "Perth, WA",
  "Adelaide, SA",
  "Canberra, ACT",
  "Darwin, NT",
  "Hobart, TAS",
  "Gold Coast, QLD",
  "Newcastle, NSW"
];

export const ServiceProvidersFilters = ({
  selectedLocations,
  onLocationChange,
  selectedType,
  onTypeChange,
  selectedSector,
  onSectorChange,
  uniqueTypes,
  uniqueSectors,
  hasActiveFilters,
  onClearAllFilters
}: ServiceProvidersFiltersProps) => {
  const handleLocationChange = (value: string) => {
    if (value === "all") {
      onLocationChange([]);
    } else {
      onLocationChange([value]);
    }
  };

  const selectedLocationValue = selectedLocations.length === 0 ? "all" : selectedLocations[0];

  return (
    <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Location
          </label>
          <Select value={selectedLocationValue} onValueChange={handleLocationChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {australianCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Type
          </label>
          <Select value={selectedType} onValueChange={onTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sector Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Sector
          </label>
          <Select value={selectedSector} onValueChange={onSectorChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Sectors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              {uniqueSectors.map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clear All Button in Filter Section */}
      {hasActiveFilters && (
        <div className="flex justify-start">
          <Button
            variant="ghost"
            onClick={onClearAllFilters}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
};
