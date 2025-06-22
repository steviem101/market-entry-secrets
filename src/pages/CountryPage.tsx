
import { useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useCountryBySlug } from "@/hooks/useCountries";
import { CountryHero } from "@/components/countries/CountryHero";
import { CountryContent } from "@/components/countries/CountryContent";
import { PageSkeleton } from "@/components/ui/page-skeleton";

const CountryPage = () => {
  const { countrySlug } = useParams<{ countrySlug: string }>();
  const { data: country, isLoading, error } = useCountryBySlug(countrySlug || "");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <PageSkeleton />
      </div>
    );
  }

  if (error || !country) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Country Not Found</h1>
          <p className="text-muted-foreground">The country you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-4">
        <CountryHero country={country} />
        <CountryContent country={country} />
      </main>
    </div>
  );
};

export default CountryPage;
