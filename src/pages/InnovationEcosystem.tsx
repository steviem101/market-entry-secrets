
import { useState } from "react";
import { Filter, Grid3X3 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface EcosystemEntity {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  focus: string[];
  website: string;
  contact: string;
}

const ecosystemEntities: EcosystemEntity[] = [
  {
    id: "1",
    name: "Techstars Sydney",
    type: "Accelerator",
    description: "Leading global accelerator program helping early-stage startups scale rapidly in the Australian market.",
    location: "Sydney, NSW",
    focus: ["Fintech", "SaaS", "Enterprise"],
    website: "techstars.com/sydney",
    contact: "sydney@techstars.com"
  },
  {
    id: "2",
    name: "CSIRO Innovation Centre",
    type: "Research Institution",
    description: "Australia's national science agency fostering innovation through research collaboration and technology transfer.",
    location: "Multiple Locations",
    focus: ["Biotech", "CleanTech", "Advanced Manufacturing"],
    website: "csiro.au",
    contact: "innovation@csiro.au"
  },
  {
    id: "3",
    name: "Blackbird Ventures",
    type: "Venture Capital",
    description: "Australia's largest venture capital fund investing in exceptional founders building global companies.",
    location: "Sydney, NSW",
    focus: ["SaaS", "Marketplace", "Deep Tech"],
    website: "blackbird.vc",
    contact: "hello@blackbird.vc"
  },
  {
    id: "4",
    name: "Melbourne Innovation District",
    type: "Innovation Hub",
    description: "World-class innovation precinct connecting startups, corporates, and research institutions.",
    location: "Melbourne, VIC",
    focus: ["Biotech", "Medtech", "Digital Health"],
    website: "mid.org.au",
    contact: "connect@mid.org.au"
  },
  {
    id: "5",
    name: "BlueChilli",
    type: "Startup Studio",
    description: "Corporate venture studio and accelerator building and scaling tech startups across Australia.",
    location: "Sydney, NSW",
    focus: ["Corporate Innovation", "B2B SaaS", "Retail Tech"],
    website: "bluechilli.com",
    contact: "hello@bluechilli.com"
  },
  {
    id: "6",
    name: "University of Sydney Innovation Hub",
    type: "University Hub",
    description: "Connecting academic research with industry to drive innovation and entrepreneurship.",
    location: "Sydney, NSW",
    focus: ["Research Commercialization", "Student Startups", "Industry Partnerships"],
    website: "sydney.edu.au/innovation",
    contact: "innovation@sydney.edu.au"
  }
];

const entityTypes = ["All", "Accelerator", "Venture Capital", "Research Institution", "Innovation Hub", "Startup Studio", "University Hub"];
const locations = ["All", "Sydney, NSW", "Melbourne, VIC", "Brisbane, QLD", "Perth, WA", "Adelaide, SA", "Multiple Locations"];

const InnovationEcosystem = () => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  const filteredEntities = ecosystemEntities.filter(entity => {
    const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entity.focus.some(focus => focus.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(entity.type);
    const matchesLocation = selectedLocations.length === 0 || selectedLocations.includes(entity.location);
    
    return matchesSearch && matchesType && matchesLocation;
  });

  const handleTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes([...selectedTypes, type]);
    } else {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    }
  };

  const handleLocationChange = (location: string, checked: boolean) => {
    if (checked) {
      setSelectedLocations([...selectedLocations, location]);
    } else {
      setSelectedLocations(selectedLocations.filter(l => l !== location));
    }
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

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className={`w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="space-y-6">
              {/* Search */}
              <div>
                <h3 className="font-semibold mb-3">Search</h3>
                <Input
                  placeholder="Search ecosystem partners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Entity Types */}
              <div>
                <h3 className="font-semibold mb-3">Organization Type</h3>
                <div className="space-y-2">
                  {entityTypes.filter(type => type !== "All").map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={selectedTypes.includes(type)}
                        onCheckedChange={(checked) => handleTypeChange(type, checked as boolean)}
                      />
                      <label htmlFor={type} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div>
                <h3 className="font-semibold mb-3">Location</h3>
                <div className="space-y-2">
                  {locations.filter(location => location !== "All").map((location) => (
                    <div key={location} className="flex items-center space-x-2">
                      <Checkbox
                        id={location}
                        checked={selectedLocations.includes(location)}
                        onCheckedChange={(checked) => handleLocationChange(location, checked as boolean)}
                      />
                      <label htmlFor={location} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {location}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
                  <Card key={entity.id} className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{entity.name}</CardTitle>
                          <Badge variant="secondary" className="mt-2">
                            {entity.type}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="text-sm">
                        {entity.description}
                      </CardDescription>
                      
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Location:</span> {entity.location}
                        </p>
                        <div>
                          <p className="text-sm font-medium mb-1">Focus Areas:</p>
                          <div className="flex flex-wrap gap-1">
                            {entity.focus.map((focus, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {focus}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 space-y-2">
                        <Button className="w-full" size="sm">
                          Connect
                        </Button>
                        <Button variant="outline" className="w-full" size="sm">
                          Learn More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default InnovationEcosystem;
