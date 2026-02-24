
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeadCard } from "@/components/LeadCard";
import { LeadsHero } from "@/components/leads/LeadsHero";
import { StandardDirectoryFilters } from "@/components/common/StandardDirectoryFilters";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useAuth } from "@/hooks/useAuth";
import { PaywallModal } from "@/components/PaywallModal";
import { UsageBanner } from "@/components/UsageBanner";
import { mapIndustryToSector, getStandardTypes } from "@/utils/sectorMapping";

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
  const { user, loading: authLoading } = useAuth();
  const { hasReachedLimit } = useUsageTracking();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const {
    data: leads,
    isLoading,
    error
  } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('leads').select('*').order('created_at', {
        ascending: false
      });
      if (error) {
        throw error;
      }
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
    const matchesSector = selectedSector === "all" || mapIndustryToSector(lead.industry) === selectedSector;
    return matchesSearch && matchesType && matchesCategory && matchesIndustry && matchesLocation && matchesSector;
  });

  // Get unique values for filters
  const types = getStandardTypes.leads;
  const categories = Array.from(new Set(leads?.map(lead => lead.category) || []));
  const industries = Array.from(new Set(leads?.map(lead => lead.industry) || []));
  const locations = Array.from(new Set(leads?.map(lead => lead.location) || []));
  const sectors = Array.from(new Set(leads?.map(lead => mapIndustryToSector(lead.industry)) || [])).sort();

  const handleDownload = (lead: Lead) => {
    if (lead.file_url) {
      window.open(lead.file_url, '_blank');
    } else if (lead.preview_url) {
      window.open(lead.preview_url, '_blank');
    }
  };

  const handlePreview = (lead: Lead) => {
    if (lead.preview_url) {
      window.open(lead.preview_url, '_blank');
    }
  };

  const handleClearFilters = () => {
    setSelectedType("all");
    setSelectedCategory("all");
    setSelectedIndustry("all");
    setSelectedLocation("all");
    setSelectedSector("all");
    setSearchTerm("");
  };

  const hasActiveFilters = selectedType !== "all" || selectedCategory !== "all" || 
    selectedIndustry !== "all" || selectedLocation !== "all" || selectedSector !== "all" || searchTerm !== "";

  const csvListsCount = leads?.filter(lead => lead.type === 'csv_list').length || 0;
  const tamMapsCount = leads?.filter(lead => lead.type === 'tam_map').length || 0;

  if (error) {
    return (
      <>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">
            Error loading leads: {error.message}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      
      <LeadsHero 
        csvListsCount={csvListsCount}
        tamMapsCount={tamMapsCount}
      />

      <StandardDirectoryFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedSector={selectedSector}
        onSectorChange={setSelectedSector}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        locations={locations}
        types={types}
        sectors={sectors}
        searchPlaceholder="Search leads, industries, or tags..."
      >
        {/* Advanced Filters */}
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-muted-foreground">Category:</span>
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
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
              onClick={() => setSelectedIndustry("all")}
            >
              All Industries
            </Button>
            {industries.map((industry) => (
              <Button
                key={industry}
                variant={selectedIndustry === industry ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedIndustry(industry)}
              >
                {industry}
              </Button>
            ))}
          </div>
        </div>
      </StandardDirectoryFilters>

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
          ) : !authLoading && hasReachedLimit && !user ? (
            <PaywallModal contentType="leads" />
          ) : filteredLeads && filteredLeads.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-foreground">
                  {filteredLeads.length} Lead{filteredLeads.length !== 1 ? 's' : ''} Available
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLeads.map(lead => (
                  <LeadCard key={lead.id} lead={lead} onDownload={handleDownload} onPreview={handlePreview} />
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
      
    </>
  );
};

export default Leads;
