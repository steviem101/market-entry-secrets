
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Search } from "lucide-react";

interface EventsFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: string[];
  locations: string[];
  selectedCategory: string;
  selectedLocation: string;
  onCategoryChange: (category: string) => void;
  onLocationChange: (location: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const EventsFilters = ({
  searchQuery,
  onSearchChange,
  categories,
  locations,
  selectedCategory,
  selectedLocation,
  onCategoryChange,
  onLocationChange,
  showFilters,
  onToggleFilters,
  onClearFilters,
  hasActiveFilters
}: EventsFiltersProps) => {
  return (
    <>
      {/* Search and Filters Bar */}
      <section className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search events, locations, or organizers..."
                className="pl-10"
                value={searchQuery}
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
            <div className="flex flex-wrap gap-4">
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-muted-foreground">Category:</span>
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onCategoryChange("all")}
                >
                  All Categories
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => onCategoryChange(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};
