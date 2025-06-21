
import { useState, useEffect } from "react";
import { Filter, Grid3X3 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import CompanyCard, { Company, ExperienceTile, ContactPerson } from "@/components/CompanyCard";
import SearchFilters from "@/components/SearchFilters";
import CompanyModal from "@/components/CompanyModal";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useEnterpriseIrelandLogo } from "@/hooks/useEnterpriseIrelandLogo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FreemiumGate } from "@/components/FreemiumGate";
import { UsageBanner } from "@/components/UsageBanner";

// Use the Supabase-generated type directly
import { Tables } from "@/integrations/supabase/types";

type TradeAgency = Tables<'trade_investment_agencies'>;

const serviceCategories = [
  { id: "export", name: "Export Promotion", count: 4 },
  { id: "investment", name: "Investment Attraction", count: 6 },
  { id: "trade", name: "Trade Facilitation", count: 5 },
  { id: "networking", name: "Business Networking", count: 3 },
  { id: "advisory", name: "Advisory Services", count: 7 },
  { id: "market", name: "Market Intelligence", count: 4 }
];

const categoryGroups = [
  {
    id: "government",
    name: "Government Agencies",
    totalCount: 15,
    categories: [
      { id: "export-promotion", name: "Export Promotion", count: 4 },
      { id: "investment-promotion", name: "Investment Promotion", count: 6 },
      { id: "trade-development", name: "Trade Development", count: 5 }
    ]
  },
  {
    id: "chambers",
    name: "Chambers of Commerce",
    totalCount: 8,
    categories: [
      { id: "bilateral", name: "Bilateral Chambers", count: 4 },
      { id: "regional", name: "Regional Chambers", count: 2 },
      { id: "industry", name: "Industry Chambers", count: 2 }
    ]
  }
];

const TradeInvestmentAgencies = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgency, setSelectedAgency] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [agencies, setAgencies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchBookmarks } = useBookmarks();
  
  // Upload Enterprise Ireland logo when component mounts
  useEnterpriseIrelandLogo();

  useEffect(() => {
    fetchBookmarks();
    fetchAgencies();
  }, [fetchBookmarks]);

  const fetchAgencies = async () => {
    try {
      const { data, error } = await supabase
        .from('trade_investment_agencies')
        .select('*')
        .order('name');

      if (error) throw error;

      const transformedData: Company[] = data.map((agency: TradeAgency) => {
        // Type-safe conversion of JSON fields
        let experienceTiles: ExperienceTile[] = [];
        let contactPersons: ContactPerson[] = [];

        // Parse experience_tiles if it exists and is an array
        if (agency.experience_tiles && Array.isArray(agency.experience_tiles)) {
          experienceTiles = (agency.experience_tiles as any[]).filter(tile => 
            tile && typeof tile === 'object' && tile.id && tile.name
          ) as ExperienceTile[];
        }

        // Parse contact_persons if it exists and is an array
        if (agency.contact_persons && Array.isArray(agency.contact_persons)) {
          contactPersons = (agency.contact_persons as any[]).filter(person => 
            person && typeof person === 'object' && person.id && person.name
          ) as ContactPerson[];
        }

        return {
          id: agency.id,
          name: agency.name,
          description: agency.description,
          location: agency.location,
          founded: agency.founded,
          employees: agency.employees,
          services: agency.services || [],
          website: agency.website || undefined,
          contact: agency.contact || undefined,
          logo: agency.logo || undefined,
          experienceTiles,
          contactPersons
        };
      });

      setAgencies(transformedData);
    } catch (error) {
      console.error('Error fetching agencies:', error);
      toast.error('Failed to load trade & investment agencies');
    } finally {
      setLoading(false);
    }
  };

  const filteredAgencies = agencies.filter(agency => {
    const matchesSearch = agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agency.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agency.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategories = selectedCategories.length === 0 || 
                             agency.services.some(service => 
                               selectedCategories.some(catId => {
                                 const category = serviceCategories.find(c => c.id === catId) ||
                                                categoryGroups.flatMap(g => g.categories).find(c => c.id === catId);
                                 return category && service.toLowerCase().includes(category.name.toLowerCase());
                               })
                             );

    const matchesLocation = selectedLocations.length === 0 || 
                           selectedLocations.includes(agency.location);
    
    return matchesSearch && matchesCategories && matchesLocation;
  });

  const handleViewProfile = (agency: Company) => {
    setSelectedAgency(agency);
    setIsModalOpen(true);
  };

  const handleContact = (agency: Company) => {
    toast.success(`Contact request sent to ${agency.name}!`);
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Loading agencies...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Trade & Investment Agencies</h1>
              <p className="text-muted-foreground">
                {filteredAgencies.length} government agencies and chambers of commerce found
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <UsageBanner />
        
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className={`w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <SearchFilters
              categories={serviceCategories}
              categoryGroups={categoryGroups}
              selectedCategories={selectedCategories}
              onCategoryChange={setSelectedCategories}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedLocations={selectedLocations}
              onLocationChange={setSelectedLocations}
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {filteredAgencies.length === 0 ? (
              <div className="text-center py-12">
                <Grid3X3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No agencies found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or filters to find more agencies.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredAgencies.map((agency) => (
                  <FreemiumGate
                    key={agency.id}
                    contentType="trade_investment_agencies"
                    itemId={agency.id}
                  >
                    <CompanyCard
                      company={agency}
                      onViewProfile={handleViewProfile}
                      onContact={handleContact}
                    />
                  </FreemiumGate>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Agency Modal */}
      <CompanyModal
        company={selectedAgency}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContact={handleContact}
      />
    </div>
  );
};

export default TradeInvestmentAgencies;
