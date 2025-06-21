
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { useSectors, useFeaturedSectors } from "@/hooks/useSectors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { TrendingUp, Search } from "lucide-react";
import SectorCard from "@/components/sectors/SectorCard";

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
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Featured Sectors</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {featuredSectors.map((sector) => (
                <SectorCard key={sector.id} sector={sector} featured={true} />
              ))}
            </div>
          </section>
        )}

        {/* All Sectors Grid */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center">
            {searchQuery ? 'Search Results' : 'All Sectors'}
          </h2>
          
          {filteredSectors.length === 0 ? (
            <div className="text-center py-16">
              <div className="p-4 rounded-full bg-muted/50 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <TrendingUp className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">No Sectors Found</h3>
              <p className="text-muted-foreground mb-8 text-lg">
                No sectors found matching your search criteria.
              </p>
              <Button onClick={() => setSearchQuery("")} variant="outline" size="lg">
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
              {filteredSectors.map((sector) => (
                <SectorCard key={sector.id} sector={sector} />
              ))}
            </div>
          )}
        </section>

        {/* Call to Action */}
        <div className="text-center mt-20 py-16 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl">
          <h2 className="text-3xl font-bold mb-4">Don't see your sector?</h2>
          <p className="text-muted-foreground mb-8 text-lg max-w-2xl mx-auto">
            We're continuously expanding our sector coverage. Contact us to discuss your specific industry needs.
          </p>
          <Link to="/contact">
            <Button size="lg" className="px-8">Get in Touch</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sectors;
