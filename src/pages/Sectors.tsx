
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { useSectors, useFeaturedSectors } from "@/hooks/useSectors";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { TrendingUp, Users, Building2, Calendar, FileText, Search } from "lucide-react";
import SectorHero from "@/components/sectors/SectorHero";

const Sectors = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: allSectors = [], isLoading: sectorsLoading } = useSectors();
  const { data: featuredSectors = [], isLoading: featuredLoading } = useFeaturedSectors();

  // Filter sectors based on search query
  const filteredSectors = allSectors.filter(sector =>
    searchQuery === "" || 
    sector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sector.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sector.industries.some(industry => 
      industry.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (sectorsLoading || featuredLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading sectors...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section with Search */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Industry <span className="text-primary">Sectors</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Explore specialized market entry solutions across different industries
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search sectors..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Sectors Section */}
        {!searchQuery && featuredSectors.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Featured Sectors</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredSectors.map((sector) => (
                <Card key={sector.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-6 w-6 text-primary" />
                      <CardTitle className="text-xl">{sector.name}</CardTitle>
                      <span className="ml-auto bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs">
                        Featured
                      </span>
                    </div>
                    <CardDescription className="text-base">
                      {sector.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Key Industries */}
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">KEY INDUSTRIES</h4>
                        <div className="flex flex-wrap gap-2">
                          {sector.industries.slice(0, 4).map((industry) => (
                            <span
                              key={industry}
                              className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs"
                            >
                              {industry}
                            </span>
                          ))}
                          {sector.industries.length > 4 && (
                            <span className="text-xs text-muted-foreground">
                              +{sector.industries.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Features Available */}
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">AVAILABLE RESOURCES</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            <span>Service Providers</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Events</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <span>Content</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>Experts</span>
                          </div>
                        </div>
                      </div>

                      <Link to={`/sectors/${sector.slug}`}>
                        <Button className="w-full">
                          Explore {sector.name}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* All Sectors Grid */}
        <section>
          <h2 className="text-2xl font-bold mb-6">
            {searchQuery ? 'Search Results' : 'All Sectors'}
          </h2>
          
          {filteredSectors.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Sectors Found</h3>
              <p className="text-muted-foreground mb-6">
                No sectors found matching your search criteria.
              </p>
              <Button onClick={() => setSearchQuery("")} variant="outline">
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {filteredSectors.map((sector) => (
                <Card key={sector.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-6 w-6 text-primary" />
                      <CardTitle className="text-xl">{sector.name}</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                      {sector.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Key Industries */}
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">KEY INDUSTRIES</h4>
                        <div className="flex flex-wrap gap-2">
                          {sector.industries.slice(0, 3).map((industry) => (
                            <span
                              key={industry}
                              className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs"
                            >
                              {industry}
                            </span>
                          ))}
                          {sector.industries.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{sector.industries.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Features Available */}
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">AVAILABLE RESOURCES</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            <span>Service Providers</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Events</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <span>Content</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>Experts</span>
                          </div>
                        </div>
                      </div>

                      <Link to={`/sectors/${sector.slug}`}>
                        <Button className="w-full">
                          Explore {sector.name}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold mb-4">Don't see your sector?</h2>
          <p className="text-muted-foreground mb-6">
            We're continuously expanding our sector coverage. Contact us to discuss your specific industry needs.
          </p>
          <Link to="/contact">
            <Button size="lg">Get in Touch</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sectors;
