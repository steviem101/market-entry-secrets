import { useState } from "react";
import CountriesHero from "@/components/countries/CountriesHero";
import CountriesDirectorySection from "@/components/countries/CountriesDirectorySection";
import CountriesCallToAction from "@/components/countries/CountriesCallToAction";
import { SEOHead } from "@/components/common/SEOHead";

const Countries = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <SEOHead
        title="Source Countries | Market Entry Secrets"
        description="Explore market entry playbooks by country of origin for businesses expanding to Australia: case studies, mentors, agencies, and investors per corridor."
        canonicalPath="/countries"
      />
      <main>
        <CountriesHero
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <CountriesDirectorySection searchQuery={searchQuery} />

        <CountriesCallToAction />
      </main>
    </>
  );
};

export default Countries;
