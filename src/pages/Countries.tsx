
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Building, TrendingUp } from "lucide-react";

interface Country {
  id: string;
  name: string;
  code: string;
  description: string;
  regions: string[];
  majorCities: string[];
  population: string;
  economy: string;
  marketOpportunities: string[];
  keyIndustries: string[];
}

const mockCountries: Country[] = [
  {
    id: "australia",
    name: "Australia",
    code: "AU",
    description: "A developed country with a strong economy and diverse business opportunities across multiple sectors.",
    regions: ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania"],
    majorCities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra"],
    population: "26.6 million",
    economy: "$1.7 trillion GDP",
    marketOpportunities: ["Mining & Resources", "Agriculture", "Tourism", "Technology", "Healthcare"],
    keyIndustries: ["Mining", "Agriculture", "Manufacturing", "Services", "Technology"]
  },
  {
    id: "singapore",
    name: "Singapore",
    code: "SG",
    description: "A global financial hub and gateway to Southeast Asia with excellent business infrastructure.",
    regions: ["Central Region", "East Region", "North Region", "North-East Region", "West Region"],
    majorCities: ["Singapore City", "Jurong", "Tampines", "Woodlands", "Sengkang"],
    population: "5.9 million",
    economy: "$397 billion GDP",
    marketOpportunities: ["Financial Services", "Technology", "Logistics", "Healthcare", "Education"],
    keyIndustries: ["Financial Services", "Manufacturing", "Trade & Logistics", "Technology", "Tourism"]
  },
  {
    id: "new-zealand",
    name: "New Zealand",
    code: "NZ",
    description: "An innovative economy with strong agricultural and technology sectors, known for business-friendly policies.",
    regions: ["Auckland", "Wellington", "Canterbury", "Waikato", "Bay of Plenty", "Otago"],
    majorCities: ["Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga", "Dunedin"],
    population: "5.2 million",
    economy: "$249 billion GDP",
    marketOpportunities: ["Agriculture", "Technology", "Tourism", "Renewable Energy", "Film & Creative"],
    keyIndustries: ["Agriculture", "Tourism", "Manufacturing", "Technology", "Creative Industries"]
  }
];

const Countries = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCountries = mockCountries.filter(country =>
    searchQuery === "" || 
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.regions.some(region => region.toLowerCase().includes(searchQuery.toLowerCase())) ||
    country.majorCities.some(city => city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Market Entry Countries
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Explore key markets and locations for your business expansion. Find detailed information about regions, cities, and market opportunities.
            </p>
            
            {/* Search */}
            <div className="max-w-md mx-auto">
              <Input
                type="text"
                placeholder="Search countries, regions, or cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-lg py-3"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Countries Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {filteredCountries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No countries found matching your search criteria.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredCountries.map((country) => (
                <Card key={country.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-6 bg-gradient-to-r from-primary to-primary/60 rounded flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{country.code}</span>
                      </div>
                      <CardTitle className="text-xl">{country.name}</CardTitle>
                    </div>
                    <CardDescription className="text-sm">
                      {country.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Key Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{country.population}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span>{country.economy}</span>
                      </div>
                    </div>

                    {/* Major Cities */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Major Cities
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {country.majorCities.slice(0, 4).map((city) => (
                          <Badge key={city} variant="secondary" className="text-xs">
                            {city}
                          </Badge>
                        ))}
                        {country.majorCities.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{country.majorCities.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Key Industries */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Key Industries
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {country.keyIndustries.slice(0, 3).map((industry) => (
                          <Badge key={industry} variant="outline" className="text-xs">
                            {industry}
                          </Badge>
                        ))}
                        {country.keyIndustries.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{country.keyIndustries.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Market Opportunities */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Market Opportunities</h4>
                      <div className="flex flex-wrap gap-1">
                        {country.marketOpportunities.slice(0, 3).map((opportunity) => (
                          <Badge key={opportunity} className="text-xs">
                            {opportunity}
                          </Badge>
                        ))}
                        {country.marketOpportunities.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{country.marketOpportunities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Enter a New Market?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get personalized guidance and connect with local experts to make your market entry successful.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors">
              Get Expert Consultation
            </button>
            <button className="border border-primary text-primary px-6 py-3 rounded-md hover:bg-primary/5 transition-colors">
              View Market Reports
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Countries;
