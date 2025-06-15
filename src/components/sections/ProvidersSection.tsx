
import { useState } from "react";
import { ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import CompanyCard, { Company } from "@/components/CompanyCard";
import SearchFilters from "@/components/SearchFilters";
import CompanyModal from "@/components/CompanyModal";
import { toast } from "sonner";
import { companies, serviceCategories, categoryGroups } from "@/data/mockData";

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

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Featured Service Providers</h2>
            <p className="text-muted-foreground">
              {filteredCompanies.length} providers ready to help you succeed
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => onShowFiltersChange(!showFilters)}
            className="lg:hidden"
          >
            Filters
          </Button>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="w-80 flex-shrink-0">
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
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1">
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No providers found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search criteria to find more providers.
                </p>
                <Button onClick={() => {
                  onCategoryChange([]);
                  onLocationChange([]);
                }}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredCompanies.slice(0, 9).map((company) => (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    onViewProfile={handleViewProfile}
                    onContact={handleContact}
                  />
                ))}
              </div>
            )}
            
            {filteredCompanies.length > 9 && (
              <div className="text-center mt-12">
                <Button size="lg" className="group">
                  View All Providers
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
