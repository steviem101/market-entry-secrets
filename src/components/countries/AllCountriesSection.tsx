
import { useCountries } from "@/hooks/useCountries";
import CountryCard from "./CountryCard";
import { useState, useMemo } from "react";

interface AllCountriesSectionProps {
  searchQuery: string;
}

const AllCountriesSection = ({ searchQuery }: AllCountriesSectionProps) => {
  const { data: countries = [], isLoading } = useCountries();

  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countries;
    
    return countries.filter(country =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.key_industries.some(industry => 
        industry.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [countries, searchQuery]);

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">All Countries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">
          {searchQuery ? 'Search Results' : 'All Countries'}
        </h2>
        {filteredCountries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? 'No countries found matching your search.' : 'No countries available.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCountries.map((country) => (
              <CountryCard key={country.id} country={country} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AllCountriesSection;
