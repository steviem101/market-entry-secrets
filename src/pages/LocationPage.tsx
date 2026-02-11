
import { useParams } from "react-router-dom";
import { useLocationBySlug } from "@/hooks/useLocations";
import { LocationHero } from "@/components/locations/LocationHero";
import { LocationStats } from "@/components/locations/LocationStats";
import { LocationContent } from "@/components/locations/LocationContent";
import { GovernmentAgencySection } from "@/components/locations/GovernmentAgencySection";
import { PageSkeleton } from "@/components/ui/page-skeleton";

const LocationPage = () => {
  const { locationSlug } = useParams<{ locationSlug: string }>();
  const { data: location, isLoading, error } = useLocationBySlug(locationSlug || "");

  if (isLoading) {
    return (
      <>
        <PageSkeleton />
      </>
    );
  }

  if (error || !location) {
    return (
      <>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Location Not Found</h1>
          <p className="text-muted-foreground">The location you're looking for doesn't exist.</p>
        </div>
      </>
    );
  }

  return (
    <>
      
      <main className="pt-4">
        <LocationHero location={location} />
        <LocationStats location={location} />
        <GovernmentAgencySection location={location} />
        <LocationContent location={location} />
      </main>
      
    </>
  );
};

export default LocationPage;
