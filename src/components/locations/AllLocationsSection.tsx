
import { useLocations } from "@/hooks/useLocations";
import { LocationCard } from "./LocationCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

interface AllLocationsSectionProps {
  searchTerm: string;
  filterType: string;
  filterCountry: string;
}

export const AllLocationsSection = ({ searchTerm, filterType, filterCountry }: AllLocationsSectionProps) => {
  const { data: locations, isLoading } = useLocations();

  const filteredLocations = useMemo(() => {
    if (!locations) return [];

    return locations.filter((location) => {
      const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           location.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           location.key_industries.some(industry =>
                             industry.toLowerCase().includes(searchTerm.toLowerCase())
                           );

      const matchesType = filterType === "all" || location.location_type === filterType;
      const matchesCountry = filterCountry === "all" || location.country === filterCountry;

      return matchesSearch && matchesType && matchesCountry;
    });
  }, [locations, searchTerm, filterType, filterCountry]);

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
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

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {filteredLocations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No locations found matching your search criteria.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <p className="text-muted-foreground">
                Showing {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLocations.map((location) => (
                <LocationCard key={location.id} location={location} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
