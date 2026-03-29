
import { useParams } from "react-router-dom";
import { useLocationBySlug } from "@/hooks/useLocations";
import { LocationHero } from "@/components/locations/LocationHero";
import { LocationStats } from "@/components/locations/LocationStats";
import { LocationContent } from "@/components/locations/LocationContent";
import { GovernmentAgencySection } from "@/components/locations/GovernmentAgencySection";
import { SEOHead } from "@/components/common/SEOHead";
import { EntityBreadcrumb } from "@/components/common/EntityBreadcrumb";
import { FreemiumGate } from "@/components/FreemiumGate";
import { PageSkeleton } from "@/components/ui/page-skeleton";

const LocationPage = () => {
  const { locationSlug } = useParams<{ locationSlug: string }>();
  const { data: location, isLoading, error } = useLocationBySlug(locationSlug || "");

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error || !location) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Location Not Found</h1>
        <p className="text-muted-foreground">The location you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${location.name} | Market Entry Locations | Market Entry Secrets`}
        description={`Market entry guide for ${location.name}. Key industries: ${(location.key_industries || []).slice(0, 3).join(", ")}.`}
        canonicalPath={`/locations/${location.slug}`}
        jsonLd={{
          type: "Place",
          data: {
            name: location.name,
            description: `Market entry destination: ${location.name}`,
            ...(location.country ? { containedInPlace: { "@type": "Country", name: location.country } } : {}),
          },
        }}
      />

      <FreemiumGate
        contentType="locations"
        itemId={location.id}
        contentTitle={location.name}
        contentDescription={`Market entry guide for ${location.name}`}
      >
        <main className="pt-4">
          <EntityBreadcrumb
            segments={[
              { label: "Locations", href: "/locations" },
              { label: location.name },
            ]}
          />
          <LocationHero location={location} />
          <LocationStats location={location} />
          <GovernmentAgencySection location={location} />
          <LocationContent location={location} />
        </main>
      </FreemiumGate>
    </>
  );
};

export default LocationPage;
