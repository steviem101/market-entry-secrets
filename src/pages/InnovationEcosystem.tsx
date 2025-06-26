
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import CompanyModal from "@/components/CompanyModal";
import InnovationEcosystemHero from "@/components/innovation-ecosystem/InnovationEcosystemHero";
import InnovationEcosystemFilters from "@/components/innovation-ecosystem/InnovationEcosystemFilters";
import InnovationEcosystemResults from "@/components/innovation-ecosystem/InnovationEcosystemResults";

const InnovationEcosystem = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
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
    const matchesSector = selectedSector === "all" || org.sector?.toLowerCase().includes(selectedSector.toLowerCase());
    const matchesType = selectedType === "all" || org.type?.toLowerCase().includes(selectedType.toLowerCase());
    return matchesSearch && matchesLocation && matchesSector && matchesType;
  });

  const uniqueLocations = [...new Set(organizations?.map(org => org.location) || [])];
  const uniqueSectors = [...new Set(organizations?.map(org => org.sector).filter(Boolean) || [])];
  const uniqueTypes = [...new Set(organizations?.map(org => org.type).filter(Boolean) || [])];

  // Helper function to safely parse JSONB arrays
  const parseJsonArray = (jsonData: any): any[] => {
    if (!jsonData) return [];
    if (Array.isArray(jsonData)) return jsonData;
    if (typeof jsonData === 'string') {
      try {
        const parsed = JSON.parse(jsonData);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedLocation("all");
    setSelectedSector("all");
    setSelectedType("all");
  };

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
      
      <InnovationEcosystemHero 
        organizationCount={organizations?.length || 0}
        locationCount={uniqueLocations.length}
      />

      <div className="container mx-auto px-4 py-8">
        <InnovationEcosystemFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          selectedSector={selectedSector}
          setSelectedSector={setSelectedSector}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          uniqueLocations={uniqueLocations}
          uniqueSectors={uniqueSectors}
          uniqueTypes={uniqueTypes}
        />

        <InnovationEcosystemResults
          filteredOrganizations={filteredOrganizations}
          isLoading={isLoading}
          onViewProfile={setSelectedCompany}
          onContact={setSelectedCompany}
          onClearFilters={clearAllFilters}
          parseJsonArray={parseJsonArray}
        />
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
            contact_persons: parseJsonArray(selectedCompany.contact_persons),
            experience_tiles: parseJsonArray(selectedCompany.experience_tiles)
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
