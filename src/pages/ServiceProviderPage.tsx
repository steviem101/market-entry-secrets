import { useParams } from "react-router-dom";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { FreemiumGate } from "@/components/FreemiumGate";
import { EntityBreadcrumb } from "@/components/common/EntityBreadcrumb";
import { SEOHead } from "@/components/common/SEOHead";
import { ServiceProviderProfileHero } from "@/components/service-provider-profile/ServiceProviderProfileHero";
import { ServiceProviderProfileContent } from "@/components/service-provider-profile/ServiceProviderProfileContent";
import {
  useServiceProviderBySlug,
  useRelatedServiceProviders,
  useServiceProviderReviews,
  useServiceProviderContacts,
} from "@/hooks/useServiceProviders";

const ServiceProviderPage = () => {
  const { providerSlug } = useParams<{ providerSlug: string }>();
  const { data: provider, isLoading, error } = useServiceProviderBySlug(providerSlug || "");

  const { data: reviews = [] } = useServiceProviderReviews(provider?.id || "");
  const { data: contacts = [] } = useServiceProviderContacts(provider?.id || "");
  const { data: relatedProviders = [] } = useRelatedServiceProviders(
    provider?.id || "",
    provider?.category_slug || null,
    provider?.location || ""
  );

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error || !provider) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Service Provider Not Found</h1>
        <p className="text-muted-foreground">
          The service provider you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  const pageTitle = provider.meta_title || `${provider.name} | Service Providers | Market Entry Secrets`;
  const pageDescription = provider.meta_description || provider.tagline || provider.description?.slice(0, 160) || "";

  const breadcrumbSegments = [
    { label: "Service Providers", href: "/service-providers" },
    ...(provider.category_name ? [{ label: provider.category_name }] : []),
    { label: provider.name },
  ];

  return (
    <>
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonicalPath={`/service-providers/${provider.slug}`}
        ogImage={provider.cover_image_url || provider.logo_url || provider.logo}
        jsonLd={{
          type: "LocalBusiness",
          data: {
            name: provider.name,
            description: provider.description,
            url: provider.website_url || provider.website || undefined,
            image: provider.logo_url || provider.logo || undefined,
            address: {
              "@type": "PostalAddress",
              addressLocality: provider.location_city || undefined,
              addressRegion: provider.location_state || undefined,
              addressCountry: provider.location_country || "Australia",
            },
            ...(provider.founded_year ? { foundingDate: String(provider.founded_year) } : {}),
            ...(provider.contact_email ? { email: provider.contact_email } : {}),
            ...(provider.contact_phone ? { telephone: provider.contact_phone } : {}),
          },
        }}
      />

      <FreemiumGate
        contentType="service_providers"
        itemId={provider.id}
        contentTitle={provider.name}
        contentDescription={provider.description}
      >
        <main>
          <EntityBreadcrumb segments={breadcrumbSegments} />
          <ServiceProviderProfileHero provider={provider} />
          <ServiceProviderProfileContent
            provider={provider}
            reviews={reviews}
            contacts={contacts}
            relatedProviders={relatedProviders}
          />
        </main>
      </FreemiumGate>
    </>
  );
};

export default ServiceProviderPage;
