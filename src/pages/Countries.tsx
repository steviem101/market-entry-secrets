
import { useState } from "react";
import Navigation from "@/components/Navigation";
import CountriesHero from "@/components/countries/CountriesHero";
import FeaturedCountriesSection from "@/components/countries/FeaturedCountriesSection";
import AllCountriesSection from "@/components/countries/AllCountriesSection";
import CountriesCallToAction from "@/components/countries/CountriesCallToAction";

const Countries = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main>
        <CountriesHero 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery} 
        />
        
        {!searchQuery && <FeaturedCountriesSection />}
        
        <AllCountriesSection searchQuery={searchQuery} />
        
        <CountriesCallToAction />
      </main>
    </div>
  );
};

export default Countries;
