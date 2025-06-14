import { useState, useEffect } from "react";
import { Filter, Grid3X3 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import PersonCard, { Person } from "@/components/PersonCard";
import PersonModal from "@/components/PersonModal";
import SearchFilters from "@/components/SearchFilters";
import { useCommunityMembers } from "@/hooks/useCommunityMembers";
import { useBookmarks } from "@/hooks/useBookmarks";
import { toast } from "sonner";

const mockPeople: Person[] = [
  {
    id: "1",
    name: "John Doe",
    title: "Software Engineer",
    description: "Passionate about building scalable web applications.",
    location: "Sydney, NSW",
    experience: "5+ years",
    specialties: ["React", "Node.js", "GraphQL"],
    website: "https://johndoe.com",
    contact: "john.doe@example.com",
    image: "/placeholder.svg",
    experienceTiles: [
      { id: "1", name: "Atlassian", logo: "/placeholder.svg" },
      { id: "2", name: "Canva", logo: "/placeholder.svg" },
      { id: "3", name: "Afterpay", logo: "/placeholder.svg" }
    ],
    company: "Atlassian"
  },
  {
    id: "2",
    name: "Jane Smith",
    title: "Data Scientist",
    description: "Expert in machine learning and data analysis.",
    location: "Melbourne, VIC",
    experience: "3+ years",
    specialties: ["Python", "TensorFlow", "Data Visualization"],
    website: "https://janesmith.com",
    contact: "jane.smith@example.com",
    image: "/placeholder.svg",
    experienceTiles: [
      { id: "1", name: "Google", logo: "/placeholder.svg" },
      { id: "2", name: "Amazon", logo: "/placeholder.svg" },
      { id: "3", name: "Microsoft", logo: "/placeholder.svg" }
    ],
    company: "Google"
  },
  {
    id: "3",
    name: "Alice Johnson",
    title: "Product Manager",
    description: "Experienced in leading cross-functional teams to deliver successful products.",
    location: "Brisbane, QLD",
    experience: "7+ years",
    specialties: ["Agile", "Scrum", "Product Strategy"],
    website: "https://alicejohnson.com",
    contact: "alice.johnson@example.com",
    image: "/placeholder.svg",
    experienceTiles: [
      { id: "1", name: "Facebook", logo: "/placeholder.svg" },
      { id: "2", name: "Instagram", logo: "/placeholder.svg" },
      { id: "3", name: "WhatsApp", logo: "/placeholder.svg" }
    ],
    company: "Facebook"
  },
  {
    id: "4",
    name: "Bob Williams",
    title: "UX Designer",
    description: "Creating intuitive and user-friendly designs.",
    location: "Perth, WA",
    experience: "4+ years",
    specialties: ["UI Design", "User Research", "Prototyping"],
    website: "https://bobwilliams.com",
    contact: "bob.williams@example.com",
    image: "/placeholder.svg",
    experienceTiles: [
      { id: "1", name: "Apple", logo: "/placeholder.svg" },
      { id: "2", name: "Samsung", logo: "/placeholder.svg" },
      { id: "3", name: "LG", logo: "/placeholder.svg" }
    ],
    company: "Apple"
  },
  {
    id: "5",
    name: "Charlie Brown",
    title: "Marketing Manager",
    description: "Driving brand awareness and customer engagement.",
    location: "Adelaide, SA",
    experience: "6+ years",
    specialties: ["Digital Marketing", "Social Media", "Content Creation"],
    website: "https://charliebrown.com",
    contact: "charlie.brown@example.com",
    image: "/placeholder.svg",
    experienceTiles: [
      { id: "1", name: "Coca-Cola", logo: "/placeholder.svg" },
      { id: "2", name: "Pepsi", logo: "/placeholder.svg" },
      { id: "3", name: "Red Bull", logo: "/placeholder.svg" }
    ],
    company: "Coca-Cola"
  },
  {
    id: "6",
    name: "Diana Miller",
    title: "Project Manager",
    description: "Delivering projects on time and within budget.",
    location: "Hobart, TAS",
    experience: "8+ years",
    specialties: ["Project Planning", "Risk Management", "Stakeholder Communication"],
    website: "https://dianamiller.com",
    contact: "diana.miller@example.com",
    image: "/placeholder.svg",
    experienceTiles: [
      { id: "1", name: "IBM", logo: "/placeholder.svg" },
      { id: "2", name: "Accenture", logo: "/placeholder.svg" },
      { id: "3", name: "Deloitte", logo: "/placeholder.svg" }
    ],
    company: "IBM"
  }
];

const serviceCategories = [
  { id: "software", name: "Software Development", count: 12 },
  { id: "data", name: "Data Science", count: 8 },
  { id: "marketing", name: "Digital Marketing", count: 15 },
  { id: "design", name: "UX/UI Design", count: 10 },
  { id: "consulting", name: "Business Consulting", count: 18 },
  { id: "finance", name: "Financial Services", count: 6 }
];

const categoryGroups = [
  {
    id: "tech",
    name: "Technology",
    totalCount: 25,
    categories: [
      { id: "software", name: "Software Development", count: 12 },
      { id: "data", name: "Data Science", count: 8 },
      { id: "cloud", name: "Cloud Computing", count: 5 }
    ]
  },
  {
    id: "business",
    name: "Business Services",
    totalCount: 30,
    categories: [
      { id: "marketing", name: "Digital Marketing", count: 15 },
      { id: "consulting", name: "Business Consulting", count: 10 },
      { id: "finance", name: "Financial Services", count: 5 }
    ]
  }
];

const Community = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const { data: communityMembers, isLoading, error } = useCommunityMembers();
  const { fetchBookmarks } = useBookmarks();

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const filteredPeople = (communityMembers || mockPeople).filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.specialties.some(specialty => specialty.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategories = selectedCategories.length === 0 || 
                             person.specialties.some(specialty => 
                               selectedCategories.some(catId => {
                                 const category = serviceCategories.find(c => c.id === catId) ||
                                                categoryGroups.flatMap(g => g.categories).find(c => c.id === catId);
                                 return category && specialty.toLowerCase().includes(category?.name.toLowerCase() || '');
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
    toast.success(`Contact request sent to ${person.isAnonymous ? person.title : person.name}!`);
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-muted-foreground">Loading community members...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-red-500">Error: {error.message}</p>
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
              <h1 className="text-2xl font-bold text-foreground">Community</h1>
              <p className="text-muted-foreground">
                {filteredPeople.length} community members found
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
            {filteredPeople.length === 0 ? (
              <div className="text-center py-12">
                <Grid3X3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No community members found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or filters to find more members.
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

      {/* Person Modal */}
      <PersonModal
        person={selectedPerson}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContact={handleContact}
      />
    </div>
  );
};

export default Community;
