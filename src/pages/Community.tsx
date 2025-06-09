
import { useState } from "react";
import { Filter, Grid3X3, Loader2 } from "lucide-react";
import PersonCard, { Person } from "@/components/PersonCard";
import SearchFilters from "@/components/SearchFilters";
import CompanyModal from "@/components/CompanyModal";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { serviceCategories, categoryGroups } from "@/data/mockData";
import { useCommunityMembers } from "@/hooks/useCommunityMembers";

const Community = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const { data: people = [], isLoading, error } = useCommunityMembers();

  const filteredPeople = people.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.specialties.some(specialty => specialty.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         person.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategories = selectedCategories.length === 0 || 
                             person.specialties.some(specialty => 
                               selectedCategories.some(catId => {
                                 const category = serviceCategories.find(c => c.id === catId) ||
                                                categoryGroups.flatMap(g => g.categories).find(c => c.id === catId);
                                 return category && specialty.toLowerCase().includes(category.name.toLowerCase());
                               })
                             );

    const matchesLocation = selectedLocations.length === 0 || 
                           selectedLocations.includes(person.location);
    
    return matchesSearch && matchesCategories && matchesLocation;
  });

  const handleViewProfile = (person: Person) => {
    setSelectedPerson(person);
    setIsModalOpen(true);
  };

  const handleContact = (person: Person) => {
    const displayName = person.isAnonymous ? person.title : person.name;
    toast.success(`Contact request sent to ${displayName}!`);
    setIsModalOpen(false);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2 text-destructive">Error loading mentors</h3>
            <p className="text-muted-foreground">
              There was an error loading the mentor data. Please try refreshing the page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation />

      {/* Page Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Market Entry Mentors</h1>
          <p className="text-lg text-muted-foreground">
            Connect with Australia's leading market entry professionals who help companies enter and scale in the Australian market
          </p>
        </div>
      </div>

      {/* Filters Toggle Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {isLoading ? 'Loading...' : `${filteredPeople.length} mentors found`}
            </span>
            <div className="flex items-center gap-2">
              {/* Location Filter Button */}
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
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-spin" />
                <h3 className="text-xl font-semibold mb-2">Loading mentors...</h3>
                <p className="text-muted-foreground">
                  Please wait while we fetch the latest mentor data.
                </p>
              </div>
            ) : filteredPeople.length === 0 ? (
              <div className="text-center py-12">
                <Grid3X3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No mentors found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or filters to find more mentors.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredPeople.map((person) => (
                  <PersonCard
                    key={person.id}
                    person={person}
                    onViewProfile={handleViewProfile}
                    onContact={handleContact}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Person Modal - Updated to handle anonymous data properly */}
      {selectedPerson && (
        <CompanyModal
          company={{
            id: selectedPerson.id,
            name: selectedPerson.isAnonymous ? selectedPerson.title : selectedPerson.name,
            description: selectedPerson.description,
            location: selectedPerson.location,
            founded: selectedPerson.experience,
            employees: selectedPerson.company || "Independent",
            services: selectedPerson.specialties,
            website: selectedPerson.isAnonymous ? undefined : selectedPerson.website,
            contact: selectedPerson.isAnonymous ? undefined : selectedPerson.contact,
            experienceTiles: selectedPerson.experienceTiles
          }}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onContact={() => handleContact(selectedPerson)}
        />
      )}
    </div>
  );
};

export default Community;
