
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { LeadCard } from "@/components/LeadCard";
import { LeadFilters } from "@/components/LeadFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, Database, Map, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || lead.description.toLowerCase().includes(searchTerm.toLowerCase()) || lead.industry.toLowerCase().includes(searchTerm.toLowerCase()) || lead.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === "all" || lead.type === selectedType;
    const matchesCategory = selectedCategory === "all" || lead.category === selectedCategory;
    const matchesIndustry = selectedIndustry === "all" || lead.industry === selectedIndustry;
    const matchesLocation = selectedLocation === "all" || lead.location === selectedLocation;
    return matchesSearch && matchesType && matchesCategory && matchesIndustry && matchesLocation;
  });

  const handleDownload = (lead: Lead) => {
    console.log('Download lead:', lead.name);
    // In a real implementation, this would handle the download/purchase process
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'csv_list':
        return <Database className="w-4 h-4" />;
      case 'tam_map':
        return <Map className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const csvListsCount = leads?.filter(lead => lead.type === 'csv_list').length || 0;
  const tamMapsCount = leads?.filter(lead => lead.type === 'tam_map').length || 0;

  if (error) {
    return <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">
            Error loading leads: {error.message}
          </div>
        </div>
      </div>;
  }

  return <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Sales Leads & Market Intelligence
            </h1>
            <p className="text-xl text-muted-foreground mb-8">Access premium databases and Total Addressable Market (TAM) maps to accelerate your market entry and sales strategy</p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge variant="secondary" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                {csvListsCount} Lead Databases
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2">
                <Map className="w-4 h-4" />
                {tamMapsCount} TAM Maps
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <UsageBanner />

        {/* Search and Filters */}
        <section className="py-8 border-b border-border">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search leads, industries, or tags..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>
          </div>
          
          {showFilters && <div className="mt-4">
              <LeadFilters leads={leads || []} selectedType={selectedType} selectedCategory={selectedCategory} selectedIndustry={selectedIndustry} selectedLocation={selectedLocation} onTypeChange={setSelectedType} onCategoryChange={setSelectedCategory} onIndustryChange={setSelectedIndustry} onLocationChange={setSelectedLocation} onReset={() => {
            setSelectedType("all");
            setSelectedCategory("all");
            setSelectedIndustry("all");
            setSelectedLocation("all");
            setSearchTerm("");
          }} />
            </div>}
        </section>

        {/* Results */}
        <section className="py-8">
          {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />)}
            </div> : filteredLeads && filteredLeads.length > 0 ? <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-foreground">
                  {filteredLeads.length} Lead{filteredLeads.length !== 1 ? 's' : ''} Available
                </h2>
                <div className="flex gap-2">
                  {selectedType !== "all" && <Badge variant="outline" className="flex items-center gap-1">
                      {getTypeIcon(selectedType)}
                      {selectedType === 'csv_list' ? 'CSV Lists' : 'TAM Maps'}
                    </Badge>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLeads.map(lead => 
                  <FreemiumGate
                    key={lead.id}
                    contentType="leads"
                    itemId={lead.id}
                    contentTitle={lead.name}
                    contentDescription={lead.description}
                  >
                    <LeadCard lead={lead} onDownload={handleDownload} onPreview={handlePreview} />
                  </FreemiumGate>
                )}
              </div>
            </> : <div className="text-center py-16">
              <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">No leads found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or filters
              </p>
              <Button onClick={() => {
            setSearchTerm("");
            setSelectedType("all");
            setSelectedCategory("all");
            setSelectedIndustry("all");
            setSelectedLocation("all");
          }} variant="outline">
                Clear all filters
              </Button>
            </div>}
        </section>
      </div>
    </div>;
};

export default Leads;
