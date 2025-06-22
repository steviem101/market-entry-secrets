
import { useFeaturedCountries } from "@/hooks/useCountries";
import CountryCard from "./CountryCard";

const FeaturedCountriesSection = () => {
  const { data: featuredCountries = [], isLoading } = useFeaturedCountries();

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Countries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (featuredCountries.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Countries</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore the most active markets for Australian business expansion with strong trade relationships and established support networks.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCountries.map((country) => (
            <CountryCard key={country.id} country={country} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCountriesSection;
