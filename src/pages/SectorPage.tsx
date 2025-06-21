
import { useParams } from "react-router-dom";
import { useSectorData } from "@/hooks/useSectorData";
import SectorsHero from "@/components/sectors/SectorsHero";
import SectorContent from "@/components/sectors/SectorContent";
import SectorStats from "@/components/sectors/SectorStats";
import { useState } from "react";

const SectorPage = () => {
  const { sectorId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  
  const {
    sector,
    serviceProviders,
    events,
    leads,
    communityMembers,
    innovationEcosystem,
    tradeAgencies,
    contentItems,
    isLoading
  } = useSectorData(sectorId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SectorsHero 
          searchQuery=""
          onSearchChange={() => {}}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!sector) {
    return (
      <div className="min-h-screen bg-background">
        <SectorsHero 
          searchQuery=""
          onSearchChange={() => {}}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Sector Not Found</h1>
            <p className="text-muted-foreground">
              The sector you're looking for doesn't exist or has been moved.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              {sector.hero_title}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {sector.hero_description}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Sector Statistics */}
        <SectorStats
          serviceProviders={serviceProviders}
          events={events}
          leads={leads}
          communityMembers={communityMembers}
          innovationEcosystem={innovationEcosystem}
          tradeAgencies={tradeAgencies}
          contentItems={contentItems}
        />

        {/* Main Content */}
        <SectorContent
          serviceProviders={serviceProviders}
          events={events}
          leads={leads}
          communityMembers={communityMembers}
          innovationEcosystem={innovationEcosystem}
          tradeAgencies={tradeAgencies}
          contentItems={contentItems}
          sectorName={sector.name}
        />
      </div>
    </div>
  );
};

export default SectorPage;
