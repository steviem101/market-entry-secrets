import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp, Users, MapPin, Globe, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CompanyCard from "@/components/CompanyCard";
import CompanyModal from "@/components/CompanyModal";

const TradeInvestmentAgencies = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<any>(null);

  const {
    data: agencies,
    isLoading,
    error
  } = useQuery({
    queryKey: ['trade-investment-agencies'],
    queryFn: async () => {
      console.log('Fetching trade & investment agencies...');
      const { data, error } = await supabase
        .from('trade_investment_agencies')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching trade investment agencies:', error);
        throw error;
      }

      console.log('Trade investment agencies fetched:', data);
      return data;
    }
  });

  const filteredAgencies = agencies?.filter(agency => {
    const matchesSearch = agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agency.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agency.services?.some((service: string) => service.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation = selectedLocation === "all" || agency.location.toLowerCase().includes(selectedLocation.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  const uniqueLocations = [...new Set(agencies?.map(agency => agency.location) || [])];

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">
            Error loading trade & investment agencies: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-500/10 to-blue-500/10 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-green-500/20 rounded-full">
                <TrendingUp className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Trade & Investment Agencies
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connect with government trade offices, investment promotion agencies, and bilateral trade organizations that facilitate international business expansion
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge variant="secondary" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {agencies?.length || 0} Agencies
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {uniqueLocations.length} Locations
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
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
                  onClick={() => {
                    setSelectedLocation("all");
                    setSearchTerm("");
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Results */}
        <section className="py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredAgencies && filteredAgencies.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-foreground">
                  {filteredAgencies.length} Agenc{filteredAgencies.length !== 1 ? 'ies' : 'y'} Found
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAgencies.map((agency) => (
                  <CompanyCard
                    key={agency.id}
                    company={{
                      id: agency.id,
                      name: agency.name,
                      description: agency.description,
                      location: agency.location,
                      founded: agency.founded,
                      employees: agency.employees,
                      services: agency.services,
                      website: agency.website,
                      contact: agency.contact,
                      logo: agency.logo,
                      basic_info: agency.basic_info,
                      why_work_with_us: agency.why_work_with_us,
                      contact_persons: agency.contact_persons,
                      experience_tiles: agency.experience_tiles
                    }}
                    onViewProfile={() => setSelectedAgency(agency)}
                    onContact={() => setSelectedAgency(agency)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">No agencies found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or filters
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedLocation("all");
                }}
                variant="outline"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </section>
      </div>

      {/* Agency Modal */}
      {selectedAgency && (
        <CompanyModal
          company={{
            id: selectedAgency.id,
            name: selectedAgency.name,
            description: selectedAgency.description,
            location: selectedAgency.location,
            founded: selectedAgency.founded,
            employees: selectedAgency.employees,
            services: selectedAgency.services,
            website: selectedAgency.website,
            contact: selectedAgency.contact,
            logo: selectedAgency.logo,
            basic_info: selectedAgency.basic_info,
            why_work_with_us: selectedAgency.why_work_with_us,
            contact_persons: selectedAgency.contact_persons,
            experience_tiles: selectedAgency.experience_tiles
          }}
          isOpen={!!selectedAgency}
          onClose={() => setSelectedAgency(null)}
          onContact={() => setSelectedAgency(null)}
        />
      )}
    </div>
  );
};

export default TradeInvestmentAgencies;
