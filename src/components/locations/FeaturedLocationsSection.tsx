
import { useFeaturedLocations } from "@/hooks/useLocations";
import { LocationCard } from "./LocationCard";
import { Skeleton } from "@/components/ui/skeleton";

export const FeaturedLocationsSection = () => {
  const { data: locations, isLoading } = useFeaturedLocations();

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Locations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!locations || locations.length === 0) {
    return null;
  }

  // Limit to only 3 featured locations
  const featuredLocations = locations.slice(0, 3);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Locations</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore Australia's premier business destinations and discover the ideal location for your market entry.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredLocations.map((location) => (
            <LocationCard key={location.id} location={location} />
          ))}
        </div>
      </div>
    </section>
  );
};
