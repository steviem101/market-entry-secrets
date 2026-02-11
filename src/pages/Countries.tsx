
import { useState } from "react";
import CountriesHero from "@/components/countries/CountriesHero";
import FeaturedCountriesSection from "@/components/countries/FeaturedCountriesSection";
import AllCountriesSection from "@/components/countries/AllCountriesSection";
import CountriesCallToAction from "@/components/countries/CountriesCallToAction";

const Countries = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      
      <main>
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
