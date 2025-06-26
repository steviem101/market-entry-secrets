
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface CommunityFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedLocation: string;
  selectedSpecialty: string | null;
  onLocationChange: (location: string) => void;
  onSpecialtyChange: (specialty: string | null) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  locations: string[];
  specialties: string[];
}

export const CommunityFilters = ({
  searchTerm,
  onSearchChange,
  selectedLocation,
  selectedSpecialty,
  onLocationChange,
  onSpecialtyChange,
  showFilters,
  onToggleFilters,
  onClearFilters,
  hasActiveFilters,
  locations,
  specialties
}: CommunityFiltersProps) => {
  return (
    <>
      {/* Search and Filters Bar */}
      <section className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-4 items-center">
            {/* Search Bar */}
            <div className="w-80 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search experts, specialties, or locations..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            {/* Location Filter */}
            <div className="w-48">
              <Select value={selectedLocation} onValueChange={onLocationChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
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

            {/* Filters Button */}
            <Button
              variant="outline"
              onClick={onToggleFilters}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
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

      {/* Expandable Filters */}
      {showFilters && (
        <section className="bg-muted/50 border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground">Specialty:</span>
              <Button
                variant={selectedSpecialty === null ? "default" : "outline"}
                size="sm"
                onClick={() => onSpecialtyChange(null)}
              >
                All Specialties
              </Button>
              {specialties.map((specialty) => (
                <Button
                  key={specialty}
                  variant={selectedSpecialty === specialty ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSpecialtyChange(specialty)}
                >
                  {specialty}
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};
