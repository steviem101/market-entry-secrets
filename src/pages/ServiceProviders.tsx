import { useState, useEffect } from "react";
import { Filter, Grid3X3 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import CompanyCard, { Company } from "@/components/CompanyCard";
import SearchFilters from "@/components/SearchFilters";
import CompanyModal from "@/components/CompanyModal";
import { useBookmarks } from "@/hooks/useBookmarks";
import { toast } from "sonner";
import { companies, serviceCategories, categoryGroups } from "@/data/mockData";

const ServiceProviders = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const { fetchBookmarks } = useBookmarks();

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

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
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Filters Toggle Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Service Providers</h1>
              <p className="text-muted-foreground">
                {filteredCompanies.length} service providers found
              </p>
            </div>
            <div className="flex items-center gap-2">
              <SearchFilters
                categories={[]}
                categoryGroups={[]}
                selectedCategories={[]}
                onCategoryChange={() => {}}
                searchTerm=""
                onSearchChange={() => {}}
                selectedLocations={selectedLocations}
                onLocationChange={setSelectedLocations}
                showLocationFilter={true}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
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
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-12">
                <Grid3X3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No service providers found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or filters to find more providers.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredCompanies.map((company) => (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    onViewProfile={handleViewProfile}
                    onContact={handleContact}
                  />
                ))}
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
    </div>
  );
};

export default ServiceProviders;
