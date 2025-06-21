
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import SectorCard from "@/components/sectors/SectorCard";
import { SectorData } from "@/hooks/useSectors";

interface AllSectorsSectionProps {
  filteredSectors: SectorData[];
  searchQuery: string;
  onClearSearch: () => void;
}

const AllSectorsSection = ({ filteredSectors, searchQuery, onClearSearch }: AllSectorsSectionProps) => {
  return (
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
          <Button onClick={onClearSearch} variant="outline" size="lg">
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
  );
};

export default AllSectorsSection;
