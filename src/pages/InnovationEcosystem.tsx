
import { useState, useEffect } from "react";
import { Filter, Grid3X3 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import CompanyCard, { Company, ExperienceTile, ContactPerson } from "@/components/CompanyCard";
import SearchFilters from "@/components/SearchFilters";
import CompanyModal from "@/components/CompanyModal";
import { useBookmarks } from "@/hooks/useBookmarks";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Use the Supabase-generated type
import { Tables } from "@/integrations/supabase/types";

type InnovationEntity = Tables<'innovation_ecosystem'>;

const serviceCategories = [
  { id: "acceleration", name: "Startup Acceleration", count: 12 },
  { id: "funding", name: "Venture Capital", count: 8 },
  { id: "research", name: "Research Collaboration", count: 15 },
  { id: "incubation", name: "Startup Incubation", count: 10 },
  { id: "mentorship", name: "Mentorship Programs", count: 18 },
  { id: "coworking", name: "Coworking Spaces", count: 6 }
];

const categoryGroups = [
  {
    id: "funding",
    name: "Funding & Investment",
    totalCount: 25,
    categories: [
      { id: "vc", name: "Venture Capital", count: 8 },
      { id: "angel", name: "Angel Investment", count: 12 },
      { id: "grants", name: "Government Grants", count: 5 }
    ]
  },
  {
    id: "support",
    name: "Business Support",
    totalCount: 30,
    categories: [
      { id: "acceleration", name: "Acceleration Programs", count: 12 },
      { id: "incubation", name: "Incubation Services", count: 10 },
      { id: "mentorship", name: "Mentorship", count: 8 }
    ]
  }
];

const InnovationEcosystem = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [entities, setEntities] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchBookmarks } = useBookmarks();

  useEffect(() => {
    fetchBookmarks();
    fetchInnovationEntities();
  }, [fetchBookmarks]);

  const fetchInnovationEntities = async () => {
    try {
      const { data, error } = await supabase
        .from('innovation_ecosystem')
        .select('*')
        .order('name');

      if (error) throw error;

      const transformedData: Company[] = data.map((entity: InnovationEntity) => {
        // Type-safe conversion of JSON fields
        let experienceTiles: ExperienceTile[] = [];
        let contactPersons: ContactPerson[] = [];

        // Parse experience_tiles if it exists and is an array
        if (entity.experience_tiles && Array.isArray(entity.experience_tiles)) {
          experienceTiles = (entity.experience_tiles as any[]).filter(tile => 
            tile && typeof tile === 'object' && tile.id && tile.name
          ) as ExperienceTile[];
        }

        // Parse contact_persons if it exists and is an array
        if (entity.contact_persons && Array.isArray(entity.contact_persons)) {
          contactPersons = (entity.contact_persons as any[]).filter(person => 
            person && typeof person === 'object' && person.id && person.name
          ) as ContactPerson[];
        }

        return {
          id: entity.id,
          name: entity.name,
          description: entity.description,
          location: entity.location,
          founded: entity.founded,
          employees: entity.employees,
          services: entity.services || [],
          website: entity.website || undefined,
          contact: entity.contact || undefined,
          logo: entity.logo || undefined,
          experienceTiles,
          contactPersons
        };
      });

      setEntities(transformedData);
    } catch (error) {
      console.error('Error fetching innovation entities:', error);
      toast.error('Failed to load innovation ecosystem entities');
    } finally {
      setLoading(false);
    }
  };

  const filteredEntities = entities.filter(entity => {
    const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entity.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategories = selectedCategories.length === 0 || 
                             entity.services.some(service => 
                               selectedCategories.some(catId => {
                                 const category = serviceCategories.find(c => c.id === catId) ||
                                                categoryGroups.flatMap(g => g.categories).find(c => c.id === catId);
                                 return category && service.toLowerCase().includes(category.name.toLowerCase());
                               })
                             );

    const matchesLocation = selectedLocations.length === 0 || 
                           selectedLocations.includes(entity.location);
    
    return matchesSearch && matchesCategories && matchesLocation;
  });

  const handleViewProfile = (entity: Company) => {
    setSelectedEntity(entity);
    setIsModalOpen(true);
  };

  const handleContact = (entity: Company) => {
    toast.success(`Contact request sent to ${entity.name}!`);
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Loading innovation ecosystem...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Filters Toggle Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Innovation Ecosystem</h1>
              <p className="text-muted-foreground">
                {filteredEntities.length} ecosystem partners found
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
            {filteredEntities.length === 0 ? (
              <div className="text-center py-12">
                <Grid3X3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No ecosystem partners found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or filters to find more partners.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredEntities.map((entity) => (
                  <CompanyCard
                    key={entity.id}
                    company={entity}
                    onViewProfile={handleViewProfile}
                    onContact={handleContact}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Entity Modal */}
      <CompanyModal
        company={selectedEntity}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContact={handleContact}
      />
    </div>
  );
};

export default InnovationEcosystem;
