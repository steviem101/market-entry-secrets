
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { LeadCard } from "@/components/LeadCard";
import { LeadsHero } from "@/components/leads/LeadsHero";
import { LeadsFilters } from "@/components/leads/LeadsFilters";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { FreemiumGate } from "@/components/FreemiumGate";
import { UsageBanner } from "@/components/UsageBanner";

export interface Lead {
  id: string;
  name: string;
  description: string;
  type: 'csv_list' | 'tam_map';
  category: string;
  industry: string;
  location: string;
  record_count?: number;
  file_url?: string;
  preview_url?: string;
  price?: number;
  currency?: string;
  data_quality_score?: number;
  last_updated?: string;
  contact_email?: string;
  provider_name?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

const Leads = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const {
    data: leads,
    isLoading,
    error
  } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      console.log('Fetching leads...');
      const {
        data,
        error
      } = await supabase.from('leads').select('*').order('created_at', {
        ascending: false
      });
      if (error) {
        console.error('Error fetching leads:', error);
        throw error;
      }
      console.log('Leads fetched:', data);
      return data as Lead[];
    }
  });

  const filteredLeads = leads?.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      lead.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      lead.industry.toLowerCase().includes(searchTerm.toLowerCase()) || 
      lead.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === "all" || lead.type === selectedType;
    const matchesCategory = selectedCategory === "all" || lead.category === selectedCategory;
    const matchesIndustry = selectedIndustry === "all" || lead.industry === selectedIndustry;
    const matchesLocation = selectedLocation === "all" || lead.location === selectedLocation;
    return matchesSearch && matchesType && matchesCategory && matchesIndustry && matchesLocation;
  });

  // Get unique values for filters
  const types = Array.from(new Set(leads?.map(lead => lead.type) || []));
  const categories = Array.from(new Set(leads?.map(lead => lead.category) || []));
  const industries = Array.from(new Set(leads?.map(lead => lead.industry) || []));
  const locations = Array.from(new Set(leads?.map(lead => lead.location) || []));

  const handleDownload = (lead: Lead) => {
    console.log('Download lead:', lead.name);
    if (lead.file_url) {
      window.open(lead.file_url, '_blank');
    } else if (lead.preview_url) {
      window.open(lead.preview_url, '_blank');
    }
  };

  const handlePreview = (lead: Lead) => {
    console.log('Preview lead:', lead.name);
    if (lead.preview_url) {
      window.open(lead.preview_url, '_blank');
    }
  };

  const handleClearFilters = () => {
    setSelectedType("all");
    setSelectedCategory("all");
    setSelectedIndustry("all");
    setSelectedLocation("all");
    setSearchTerm("");
  };

  const hasActiveFilters = selectedType !== "all" || selectedCategory !== "all" || 
    selectedIndustry !== "all" || selectedLocation !== "all" || searchTerm !== "";

  const csvListsCount = leads?.filter(lead => lead.type === 'csv_list').length || 0;
  const tamMapsCount = leads?.filter(lead => lead.type === 'tam_map').length || 0;

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">
            Error loading leads: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <LeadsHero 
        csvListsCount={csvListsCount}
        tamMapsCount={tamMapsCount}
      />

      <LeadsFilters 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedType={selectedType}
        selectedCategory={selectedCategory}
        selectedIndustry={selectedIndustry}
        selectedLocation={selectedLocation}
        onTypeChange={setSelectedType}
        onCategoryChange={setSelectedCategory}
        onIndustryChange={setSelectedIndustry}
        onLocationChange={setSelectedLocation}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        types={types}
        categories={categories}
        industries={industries}
        locations={locations}
      />

      <div className="container mx-auto px-4 py-8">
        <UsageBanner />

        {/* Results */}
        <section className="py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredLeads && filteredLeads.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-foreground">
                  {filteredLeads.length} Lead{filteredLeads.length !== 1 ? 's' : ''} Available
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLeads.map(lead => (
                  <FreemiumGate
                    key={lead.id}
                    contentType="leads"
                    itemId={lead.id}
                    contentTitle={lead.name}
                    contentDescription={lead.description}
                  >
                    <LeadCard lead={lead} onDownload={handleDownload} onPreview={handlePreview} />
                  </FreemiumGate>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">No leads found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or filters
              </p>
              <Button onClick={handleClearFilters} variant="outline">
                Clear all filters
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Leads;
