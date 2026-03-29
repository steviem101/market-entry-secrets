
import { useState } from "react";
import CountriesHero from "@/components/countries/CountriesHero";
import FeaturedCountriesSection from "@/components/countries/FeaturedCountriesSection";
import AllCountriesSection from "@/components/countries/AllCountriesSection";
import CountriesCallToAction from "@/components/countries/CountriesCallToAction";
import { UsageBanner } from "@/components/UsageBanner";
import { SEOHead } from "@/components/common/SEOHead";

const Countries = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <SEOHead
        title="Source Countries | Market Entry Secrets"
        description="Explore market entry resources by country of origin for businesses expanding to Australia."
        canonicalPath="/countries"
      />
      <main>
        <div className="container mx-auto px-4 pt-4">
          <UsageBanner />
        </div>
        <CountriesHero
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery} 
        />
        
        {!searchQuery && <FeaturedCountriesSection />}
        
        <AllCountriesSection searchQuery={searchQuery} />
        
        <CountriesCallToAction />
      </main>
      
    </>
  );
};

export default Countries;
