import { useState, useEffect } from "react";
import { Filter, Grid3X3 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import CompanyCard, { Company } from "@/components/CompanyCard";
import SearchFilters from "@/components/SearchFilters";
import CompanyModal from "@/components/CompanyModal";
import { useBookmarks } from "@/hooks/useBookmarks";
import { toast } from "sonner";

const ecosystemEntities: Company[] = [
  {
    id: "1",
    name: "Techstars Sydney",
    description: "Leading global accelerator program helping early-stage startups scale rapidly in the Australian market. We provide mentorship, funding, and access to a global network of entrepreneurs and investors.",
    location: "Sydney, NSW",
    founded: "2015",
    employees: "25-50",
    services: ["Startup Acceleration", "Mentorship", "Seed Funding", "Network Access", "Demo Day"],
    website: "https://techstars.com/sydney",
    contact: "sydney@techstars.com",
    experienceTiles: [
      { id: "1", name: "Atlassian", logo: "/placeholder.svg" },
      { id: "2", name: "Canva", logo: "/placeholder.svg" },
      { id: "3", name: "Afterpay", logo: "/placeholder.svg" }
    ],
    contactPersons: [
      { id: "1", name: "Sarah Chen", role: "Managing Director", image: "/placeholder.svg" },
      { id: "2", name: "Michael Torres", role: "Program Manager", image: "/placeholder.svg" }
    ]
  },
  {
    id: "2",
    name: "CSIRO Innovation Centre",
    description: "Australia's national science agency fostering innovation through research collaboration and technology transfer. We connect researchers with industry to drive breakthrough innovations.",
    location: "Multiple Locations",
    founded: "1916",
    employees: "5000+",
    services: ["Research Collaboration", "Technology Transfer", "IP Licensing", "Innovation Consulting", "Startup Incubation"],
    website: "https://csiro.au",
    contact: "innovation@csiro.au",
    experienceTiles: [
      { id: "1", name: "BHP", logo: "/placeholder.svg" },
      { id: "2", name: "Woolworths", logo: "/placeholder.svg" },
      { id: "3", name: "QANTAS", logo: "/placeholder.svg" }
    ],
    contactPersons: [
      { id: "1", name: "Dr. Emma Watson", role: "Innovation Director", image: "/placeholder.svg" },
      { id: "2", name: "James Mitchell", role: "Technology Transfer Manager", image: "/placeholder.svg" }
    ]
  },
  {
    id: "3",
    name: "Blackbird Ventures",
    description: "Australia's largest venture capital fund investing in exceptional founders building global companies. We provide seed to growth stage funding and strategic support.",
    location: "Sydney, NSW",
    founded: "2012",
    employees: "50-100",
    services: ["Venture Capital", "Seed Funding", "Growth Capital", "Strategic Advisory", "Portfolio Support"],
    website: "https://blackbird.vc",
    contact: "hello@blackbird.vc",
    experienceTiles: [
      { id: "1", name: "Canva", logo: "/placeholder.svg" },
      { id: "2", name: "SafetyCulture", logo: "/placeholder.svg" },
      { id: "3", name: "Culture Amp", logo: "/placeholder.svg" }
    ],
    contactPersons: [
      { id: "1", name: "Niki Scevak", role: "Co-founder & Partner", image: "/placeholder.svg" },
      { id: "2", name: "Rick Baker", role: "Co-founder & Partner", image: "/placeholder.svg" }
    ]
  },
  {
    id: "4",
    name: "Melbourne Innovation District",
    description: "World-class innovation precinct connecting startups, corporates, and research institutions. We create collaborative spaces and programs to drive innovation in health and life sciences.",
    location: "Melbourne, VIC",
    founded: "2017",
    employees: "100-200",
    services: ["Innovation Hub", "Coworking Spaces", "Corporate Innovation", "Research Partnerships", "Event Hosting"],
    website: "https://mid.org.au",
    contact: "connect@mid.org.au",
    experienceTiles: [
      { id: "1", name: "CSL", logo: "/placeholder.svg" },
      { id: "2", name: "NAB", logo: "/placeholder.svg" },
      { id: "3", name: "University of Melbourne", logo: "/placeholder.svg" }
    ],
    contactPersons: [
      { id: "1", name: "Dr. Lisa Park", role: "CEO", image: "/placeholder.svg" },
      { id: "2", name: "David Kim", role: "Head of Partnerships", image: "/placeholder.svg" }
    ]
  },
  {
    id: "5",
    name: "BlueChilli",
    description: "Corporate venture studio and accelerator building and scaling tech startups across Australia. We partner with corporates to create new ventures and accelerate existing startups.",
    location: "Sydney, NSW",
    founded: "2011",
    employees: "50-100",
    services: ["Venture Studio", "Corporate Acceleration", "Startup Development", "Digital Transformation", "Innovation Strategy"],
    website: "https://bluechilli.com",
    contact: "hello@bluechilli.com",
    experienceTiles: [
      { id: "1", name: "Westpac", logo: "/placeholder.svg" },
      { id: "2", name: "Telstra", logo: "/placeholder.svg" },
      { id: "3", name: "RACV", logo: "/placeholder.svg" }
    ],
    contactPersons: [
      { id: "1", name: "Sebastien Eckersley-Maslin", role: "CEO", image: "/placeholder.svg" },
      { id: "2", name: "Annie Parker", role: "Head of Programs", image: "/placeholder.svg" }
    ]
  },
  {
    id: "6",
    name: "University of Sydney Innovation Hub",
    description: "Connecting academic research with industry to drive innovation and entrepreneurship. We support student startups, research commercialization, and industry partnerships.",
    location: "Sydney, NSW",
    founded: "2018",
    employees: "25-50",
    services: ["Research Commercialization", "Student Startups", "Industry Partnerships", "IP Management", "Entrepreneur Education"],
    website: "https://sydney.edu.au/innovation",
    contact: "innovation@sydney.edu.au",
    experienceTiles: [
      { id: "1", name: "Google", logo: "/placeholder.svg" },
      { id: "2", name: "Microsoft", logo: "/placeholder.svg" },
      { id: "3", name: "Johnson & Johnson", logo: "/placeholder.svg" }
    ],
    contactPersons: [
      { id: "1", name: "Prof. Rachel Thompson", role: "Director", image: "/placeholder.svg" },
      { id: "2", name: "Mark Stevens", role: "Commercialization Manager", image: "/placeholder.svg" }
    ]
  }
];

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
  const { fetchBookmarks } = useBookmarks();

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const filteredEntities = ecosystemEntities.filter(entity => {
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
