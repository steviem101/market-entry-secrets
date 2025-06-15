
import { useState, useEffect } from "react";
import { ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import CompanyCard, { Company, ExperienceTile, ContactPerson } from "@/components/CompanyCard";
import SearchFilters from "@/components/SearchFilters";
import CompanyModal from "@/components/CompanyModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { serviceCategories, categoryGroups } from "@/data/mockData";
import { Tables } from "@/integrations/supabase/types";

type ServiceProvider = Tables<'service_providers'>;

interface ProvidersSectionProps {
  selectedCategories: string[];
  selectedLocations: string[];
  searchTerm: string;
  showFilters: boolean;
  onCategoryChange: (categories: string[]) => void;
  onLocationChange: (locations: string[]) => void;
  onShowFiltersChange: (show: boolean) => void;
}

export const ProvidersSection = ({
  selectedCategories,
  selectedLocations,
  searchTerm,
  showFilters,
  onCategoryChange,
  onLocationChange,
  onShowFiltersChange
}: ProvidersSectionProps) => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServiceProviders();
  }, []);

  const fetchServiceProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .order('name')
        .limit(9); // Limit to 9 for the featured section

      if (error) throw error;

      const transformedData: Company[] = data.map((provider: ServiceProvider) => {
        // Type-safe conversion of JSON fields
        let experienceTiles: ExperienceTile[] = [];
        let contactPersons: ContactPerson[] = [];

        // Parse experience_tiles if it exists and is an array
        if (provider.experience_tiles && Array.isArray(provider.experience_tiles)) {
          experienceTiles = (provider.experience_tiles as any[]).filter(tile => 
            tile && typeof tile === 'object' && tile.id && tile.name
          ) as ExperienceTile[];
        }

        // Parse contact_persons if it exists and is an array
        if (provider.contact_persons && Array.isArray(provider.contact_persons)) {
          contactPersons = (provider.contact_persons as any[]).filter(person => 
            person && typeof person === 'object' && person.id && person.name
          ) as ContactPerson[];
        }

        return {
          id: provider.id,
          name: provider.name,
          description: provider.description,
          location: provider.location,
          founded: provider.founded,
          employees: provider.employees,
          services: provider.services || [],
          website: provider.website || undefined,
          contact: provider.contact || undefined,
          logo: provider.logo || undefined,
          experienceTiles,
          contactPersons
        };
      });

      setCompanies(transformedData);
    } catch (error) {
      console.error('Error fetching service providers:', error);
      toast.error('Failed to load service providers');
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategories = selectedCategories.length === 0 || 
                             company.services.some(service => 
                               selectedCategories.some(catId => {
                                 const category = serviceCategories.find(c => c.id === catId) ||
                                                categoryGroups.flatMap(g => g.categories).find(c => c.id === catId);
                                 return category && service.toLowerCase().includes(category.name.toLowerCase());
                               })
                             );

    const matchesLocation = selectedLocations.length === 0 || 
                           selectedLocations.includes(company.location);
    
    return matchesSearch && matchesCategories && matchesLocation;
  });

  const handleViewProfile = (company: Company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const handleContact = (company: Company) => {
    toast.success(`Contact request sent to ${company.name}!`);
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <section className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background" />
        <div className="relative container mx-auto px-4">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Loading service providers...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background" />
      <div className="relative container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Featured Service Providers</h2>
            <p className="text-xl text-muted-foreground">
              {filteredCompanies.length} providers ready to help you succeed
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => onShowFiltersChange(!showFilters)}
            className="lg:hidden bg-background/60 backdrop-blur-sm border-border/50"
          >
            Filters
          </Button>
        </div>

        <div className="flex gap-10">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="w-80 flex-shrink-0">
              <div className="sticky top-4 bg-card/60 backdrop-blur-sm rounded-2xl border border-border/40 p-6 soft-shadow">
                <SearchFilters
                  categories={serviceCategories}
                  categoryGroups={categoryGroups}
                  selectedCategories={selectedCategories}
                  onCategoryChange={onCategoryChange}
                  searchTerm=""
                  onSearchChange={() => {}}
                  selectedLocations={selectedLocations}
                  onLocationChange={onLocationChange}
                />
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1">
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-16 bg-card/40 backdrop-blur-sm rounded-2xl border border-border/30">
                <div className="w-20 h-20 bg-gradient-to-br from-muted to-muted/60 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">No providers found</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Try adjusting your search criteria to find more providers.
                </p>
                <Button 
                  onClick={() => {
                    onCategoryChange([]);
                    onLocationChange([]);
                  }}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {filteredCompanies.slice(0, 9).map((company, index) => (
                  <div 
                    key={company.id}
                    style={{ animationDelay: `${index * 100}ms` }}
                    className="animate-fade-in"
                  >
                    <CompanyCard
                      company={company}
                      onViewProfile={handleViewProfile}
                      onContact={handleContact}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {filteredCompanies.length > 9 && (
              <div className="text-center mt-16">
                <Button 
                  size="lg" 
                  className="group bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 px-8 py-3 text-lg"
                >
                  View All Providers
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Company Modal */}
      <CompanyModal
        company={selectedCompany}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContact={handleContact}
      />
    </section>
  );
};
