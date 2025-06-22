import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Lightbulb, Users, MapPin, Globe, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CompanyCard from "@/components/CompanyCard";
import CompanyModal from "@/components/CompanyModal";

const InnovationEcosystem = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  const {
    data: organizations,
    isLoading,
    error
  } = useQuery({
    queryKey: ['innovation-ecosystem'],
    queryFn: async () => {
      console.log('Fetching innovation ecosystem organizations...');
      const { data, error } = await supabase
        .from('innovation_ecosystem')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching innovation ecosystem:', error);
        throw error;
      }

      console.log('Innovation ecosystem organizations fetched:', data);
      return data;
    }
  });

  const filteredOrganizations = organizations?.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.services?.some((service: string) => service.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation = selectedLocation === "all" || org.location.toLowerCase().includes(selectedLocation.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  const uniqueLocations = [...new Set(organizations?.map(org => org.location) || [])];

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">
            Error loading innovation ecosystem: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-orange-500/20 rounded-full">
                <Lightbulb className="w-12 h-12 text-orange-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Innovation Ecosystem
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connect with innovation hubs, accelerators, incubators, and research institutions that drive entrepreneurship and technological advancement
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge variant="secondary" className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                {organizations?.length || 0} Organizations
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
                placeholder="Search organizations, services, or locations..."
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
          ) : filteredOrganizations && filteredOrganizations.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-foreground">
                  {filteredOrganizations.length} Organization{filteredOrganizations.length !== 1 ? 's' : ''} Found
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrganizations.map((org) => (
                  <CompanyCard
                    key={org.id}
                    company={{
                      id: org.id,
                      name: org.name,
                      description: org.description,
                      location: org.location,
                      founded: org.founded,
                      employees: org.employees,
                      services: org.services,
                      website: org.website,
                      contact: org.contact,
                      logo: org.logo,
                      basic_info: org.basic_info,
                      why_work_with_us: org.why_work_with_us,
                      contact_persons: org.contact_persons,
                      experience_tiles: org.experience_tiles
                    }}
                    onViewProfile={() => setSelectedCompany(org)}
                    onContact={() => setSelectedCompany(org)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <Lightbulb className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">No organizations found</h3>
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

      {/* Company Modal */}
      {selectedCompany && (
        <CompanyModal
          company={{
            id: selectedCompany.id,
            name: selectedCompany.name,
            description: selectedCompany.description,
            location: selectedCompany.location,
            founded: selectedCompany.founded,
            employees: selectedCompany.employees,
            services: selectedCompany.services,
            website: selectedCompany.website,
            contact: selectedCompany.contact,
            logo: selectedCompany.logo,
            basic_info: selectedCompany.basic_info,
            why_work_with_us: selectedCompany.why_work_with_us,
            contact_persons: selectedCompany.contact_persons,
            experience_tiles: selectedCompany.experience_tiles
          }}
          isOpen={!!selectedCompany}
          onClose={() => setSelectedCompany(null)}
          onContact={() => setSelectedCompany(null)}
        />
      )}
    </div>
  );
};

export default InnovationEcosystem;
