
import { useState } from "react";
import { useSectors, useFeaturedSectors } from "@/hooks/useSectors";
import SectorsHero from "@/components/sectors/SectorsHero";
import FeaturedSectorsSection from "@/components/sectors/FeaturedSectorsSection";
import AllSectorsSection from "@/components/sectors/AllSectorsSection";
import SectorsCallToAction from "@/components/sectors/SectorsCallToAction";

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

  const handleClearSearch = () => setSearchQuery("");

  if (sectorsLoading || featuredLoading) {
    return (
      <>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading sectors...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      
      <SectorsHero 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="container mx-auto px-4 py-12">
        <FeaturedSectorsSection 
          featuredSectors={featuredSectors}
          searchQuery={searchQuery}
        />

        <AllSectorsSection 
          filteredSectors={filteredSectors}
          searchQuery={searchQuery}
          onClearSearch={handleClearSearch}
        />

        <SectorsCallToAction />
      </div>
      
    </>
  );
};

export default Sectors;
