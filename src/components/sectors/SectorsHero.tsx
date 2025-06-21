
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SectorsHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const SectorsHero = ({ searchQuery, onSearchChange }: SectorsHeroProps) => {
  return (
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
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </section>
  );
};

export default SectorsHero;
