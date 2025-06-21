
import SectorCard from "@/components/sectors/SectorCard";
import { SectorData } from "@/hooks/useSectors";

interface FeaturedSectorsSectionProps {
  featuredSectors: SectorData[];
  searchQuery: string;
}

const FeaturedSectorsSection = ({ featuredSectors, searchQuery }: FeaturedSectorsSectionProps) => {
  if (searchQuery || featuredSectors.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold mb-8 text-center">Featured Sectors</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {featuredSectors.map((sector) => (
          <SectorCard key={sector.id} sector={sector} featured={true} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedSectorsSection;
