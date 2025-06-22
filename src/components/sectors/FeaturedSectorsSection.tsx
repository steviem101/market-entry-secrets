
import SectorCard from "@/components/sectors/SectorCard";
import { SectorData } from "@/hooks/useSectors";

interface FeaturedSectorsSectionProps {
  featuredSectors: SectorData[];
  searchQuery: string;
}

const FeaturedSectorsSection = ({ featuredSectors, searchQuery }: FeaturedSectorsSectionProps) => {
  if (searchQuery || featuredSectors.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Featured Sectors</h2>
        <p className="text-muted-foreground">Explore our most popular market entry opportunities</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {featuredSectors.map((sector) => (
          <SectorCard key={sector.id} sector={sector} featured={true} compact={true} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedSectorsSection;
