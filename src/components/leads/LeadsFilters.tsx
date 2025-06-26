
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface LeadsFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedType: string;
  selectedCategory: string;
  selectedIndustry: string;
  selectedLocation: string;
  onTypeChange: (type: string) => void;
  onCategoryChange: (category: string) => void;
  onIndustryChange: (industry: string) => void;
  onLocationChange: (location: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  types: string[];
  categories: string[];
  industries: string[];
  locations: string[];
}

export const LeadsFilters = ({
  searchTerm,
  onSearchChange,
  selectedType,
  selectedCategory,
  selectedIndustry,
  selectedLocation,
  onTypeChange,
  onCategoryChange,
  onIndustryChange,
  onLocationChange,
  showFilters,
  onToggleFilters,
  onClearFilters,
  hasActiveFilters,
  types,
  categories,
  industries,
  locations
}: LeadsFiltersProps) => {
  return (
    <>
      {/* Search and Filters Bar */}
      <section className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-4 items-center">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search leads, industries, or tags..."
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
            <div className="space-y-4">
              {/* Type Filter */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-muted-foreground">Type:</span>
                <Button
                  variant={selectedType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onTypeChange("all")}
                >
                  All Types
                </Button>
                {types.map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => onTypeChange(type)}
                  >
                    {type === 'csv_list' ? 'CSV Lists' : 'TAM Maps'}
                  </Button>
                ))}
              </div>

              {/* Category Filter */}
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

              {/* Industry Filter */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-muted-foreground">Industry:</span>
                <Button
                  variant={selectedIndustry === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onIndustryChange("all")}
                >
                  All Industries
                </Button>
                {industries.map((industry) => (
                  <Button
                    key={industry}
                    variant={selectedIndustry === industry ? "default" : "outline"}
                    size="sm"
                    onClick={() => onIndustryChange(industry)}
                  >
                    {industry}
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
