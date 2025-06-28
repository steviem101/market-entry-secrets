
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Users, X } from "lucide-react";

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
  uniqueTypes
}: ServiceProvidersHeaderProps) => {
  const handleLocationChange = (value: string) => {
    if (value === "all") {
      onLocationChange([]);
    } else {
      onLocationChange([value]);
    }
  };

  const selectedLocationValue = selectedLocations.length === 0 ? "all" : selectedLocations[0];

  const hasActiveFilters = selectedLocations.length > 0 || selectedType !== "all";

  const clearAllFilters = () => {
    onLocationChange([]);
    onTypeChange("all");
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-blue-500/20 rounded-full">
              <Users className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Service <span className="text-blue-600">Providers</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Connect with trusted service providers who specialize in helping businesses 
            successfully enter and expand in new markets.
          </p>
        </div>
      </section>

      {/* Search and Filters Bar */}
      <section className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-4 items-center">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search organizations, services, or locations..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            {/* Filters Toggle Button */}
            <Button
              variant="outline"
              onClick={onToggleFilters}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>

            {/* Clear Filters Button - Only show when filters are active */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearAllFilters}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
                Clear all
              </Button>
            )}
          </div>

          {/* Collapsible Filter Section */}
          {showFilters && (
            <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
              </div>

              {/* Clear All Button in Filter Section */}
              {hasActiveFilters && (
                <div className="flex justify-start">
                  <Button
                    variant="ghost"
                    onClick={clearAllFilters}
                    className="gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
};
