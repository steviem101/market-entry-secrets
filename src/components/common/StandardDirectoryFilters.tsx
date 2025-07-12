import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

export interface StandardDirectoryFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedSector: string;
  onSectorChange: (sector: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  
  // Data arrays
  locations: string[];
  types: string[];
  sectors: string[];
  
  // Customization
  searchPlaceholder?: string;
  children?: React.ReactNode; // For directory-specific advanced filters
}

export const StandardDirectoryFilters = ({
  searchTerm,
  onSearchChange,
  selectedLocation,
  onLocationChange,
  selectedType,
  onTypeChange,
  selectedSector,
  onSectorChange,
  showFilters,
  onToggleFilters,
  onClearFilters,
  hasActiveFilters,
  locations,
  types,
  sectors,
  searchPlaceholder = "Search...",
  children
}: StandardDirectoryFiltersProps) => {
  return (
    <>
      {/* Main Filter Bar */}
      <section className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={searchPlaceholder}
                className="pl-10"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            {/* Location Filter */}
            <div className="w-40">
              <Select value={selectedLocation} onValueChange={onLocationChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="w-36">
              <Select value={selectedType} onValueChange={onTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sector Filter */}
            <div className="w-40">
              <Select value={selectedSector} onValueChange={onSectorChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filters Button (only show if there are advanced filters) */}
            {children && (
              <Button
                variant="outline"
                onClick={onToggleFilters}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            )}
          </div>

          {/* Clear all filters link */}
          {hasActiveFilters && (
            <div className="mt-4">
              <button
                onClick={onClearFilters}
                className="text-sm text-primary hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Expandable Advanced Filters */}
      {children && showFilters && (
        <section className="bg-muted/50 border-b">
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </section>
      )}
    </>
  );
};