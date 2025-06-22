
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import CompanyModal from "@/components/CompanyModal";
import TradeInvestmentAgenciesHero from "@/components/trade-investment-agencies/TradeInvestmentAgenciesHero";
import TradeInvestmentAgenciesFilters from "@/components/trade-investment-agencies/TradeInvestmentAgenciesFilters";
import TradeInvestmentAgenciesResults from "@/components/trade-investment-agencies/TradeInvestmentAgenciesResults";

const TradeInvestmentAgencies = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
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
  };

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
      
      <TradeInvestmentAgenciesHero 
        agencyCount={agencies?.length || 0}
        locationCount={uniqueLocations.length}
      />

      <div className="container mx-auto px-4 py-8">
        <TradeInvestmentAgenciesFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          uniqueLocations={uniqueLocations}
        />

        <TradeInvestmentAgenciesResults
          filteredAgencies={filteredAgencies}
          isLoading={isLoading}
          onViewProfile={setSelectedAgency}
          onContact={setSelectedAgency}
          onClearFilters={clearAllFilters}
          parseJsonArray={parseJsonArray}
        />
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
            contact_persons: parseJsonArray(selectedAgency.contact_persons),
            experience_tiles: parseJsonArray(selectedAgency.experience_tiles)
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
