
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Users } from "lucide-react";

interface ServiceProvidersHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  filteredCount: number;
  selectedLocations: string[];
  onLocationChange: (locations: string[]) => void;
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
  onLocationChange
}: ServiceProvidersHeaderProps) => {
  const handleLocationChange = (value: string) => {
    if (value === "all") {
      onLocationChange([]);
    } else {
      onLocationChange([value]);
    }
  };

  const selectedLocationValue = selectedLocations.length === 0 ? "all" : selectedLocations[0];

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
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search organizations, services, or locations..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            {/* Location Filter */}
            <div className="w-48">
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
          {(selectedLocations.length > 0) && (
            <div className="mt-4">
              <button
                onClick={() => onLocationChange([])}
                className="text-sm text-primary hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};
