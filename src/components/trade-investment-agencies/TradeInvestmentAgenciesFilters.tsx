
import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TradeInvestmentAgenciesFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  uniqueLocations: string[];
}

const TradeInvestmentAgenciesFilters = ({
  searchTerm,
  setSearchTerm,
  selectedLocation,
  setSelectedLocation,
  uniqueLocations
}: TradeInvestmentAgenciesFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const clearAllFilters = () => {
    setSelectedLocation("all");
    setSearchTerm("");
  };

  return (
    <section className="py-8 border-b border-border">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search agencies, services, or locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
      </div>
      
      {showFilters && (
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Locations</option>
                {uniqueLocations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
            >
              Clear all filters
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

export default TradeInvestmentAgenciesFilters;
