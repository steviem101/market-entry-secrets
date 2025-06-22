
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CountriesHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const CountriesHero = ({ searchQuery, onSearchChange }: CountriesHeroProps) => {
  return (
    <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
          Market Entry by <span className="text-primary">Country</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Discover success stories, trade organizations, and market entry support for businesses expanding to Australia from specific countries
        </p>
        
        {/* Search Bar */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search countries..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </section>
  );
};

export default CountriesHero;
