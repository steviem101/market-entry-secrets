
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { LocationsHero } from "@/components/locations/LocationsHero";
import { FeaturedLocationsSection } from "@/components/locations/FeaturedLocationsSection";
import { AllLocationsSection } from "@/components/locations/AllLocationsSection";
import { LocationsCallToAction } from "@/components/locations/LocationsCallToAction";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search } from "lucide-react";

const Locations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-4">
        <LocationsHero />
        
        <FeaturedLocationsSection />
        
        {/* Search and Filter Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-8">Explore All Locations</h2>
              
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full md:w-48">
                    <MapPin className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="state">States</SelectItem>
                    <SelectItem value="city">Cities</SelectItem>
                    <SelectItem value="region">Regions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>
        
        <AllLocationsSection searchTerm={searchTerm} filterType={filterType} />
        
        <LocationsCallToAction />
      </main>
      
      <Footer />
    </div>
  );
};

export default Locations;
