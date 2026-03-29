import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Search, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface InnovationEcosystemFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  selectedService: string;
  setSelectedService: (service: string) => void;
  uniqueLocations: string[];
  uniqueServices: string[];
}

const InnovationEcosystemFilters = ({
  searchTerm,
  setSearchTerm,
  selectedLocation,
  setSelectedLocation,
  selectedService,
  setSelectedService,
  uniqueLocations,
  uniqueServices
}: InnovationEcosystemFiltersProps) => {
  const [serviceOpen, setServiceOpen] = useState(false);

  const clearAllFilters = () => {
    setSelectedLocation("all");
    setSelectedService("all");
    setSearchTerm("");
  };

  const hasActiveFilters = selectedLocation !== "all" || selectedService !== "all" || searchTerm !== "";

  return (
    <section className="bg-background border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search organizations, services, or locations..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-44">
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-52">
            <Popover open={serviceOpen} onOpenChange={setServiceOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={serviceOpen}
                  className="w-full justify-between font-normal"
                >
                  <span className="truncate">
                    {selectedService === "all" ? "All Services" : selectedService}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search services..." />
                  <CommandList>
                    <CommandEmpty>No service found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="all"
                        onSelect={() => {
                          setSelectedService("all");
                          setServiceOpen(false);
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", selectedService === "all" ? "opacity-100" : "opacity-0")} />
                        All Services
                      </CommandItem>
                      {uniqueServices.map((service) => (
                        <CommandItem
                          key={service}
                          value={service}
                          onSelect={() => {
                            setSelectedService(service);
                            setServiceOpen(false);
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", selectedService === service ? "opacity-100" : "opacity-0")} />
                          {service}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4">
            <button
              onClick={clearAllFilters}
              className="text-sm text-primary hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default InnovationEcosystemFilters;
