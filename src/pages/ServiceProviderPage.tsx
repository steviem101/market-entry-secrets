import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { FreemiumGate } from "@/components/FreemiumGate";
import { ServiceProviderBreadcrumb } from "@/components/service-provider-profile/ServiceProviderBreadcrumb";
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
  const pageDescription = provider.meta_description || provider.tagline || provider.description?.slice(0, 160);

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={provider.name} />
        <meta property="og:description" content={pageDescription} />
        {(provider.cover_image_url || provider.logo_url || provider.logo) && (
          <meta property="og:image" content={provider.cover_image_url || provider.logo_url || provider.logo} />
        )}
        <link
          rel="canonical"
          href={`https://market-entry-secrets.lovable.app/service-providers/${provider.slug}`}
        />
      </Helmet>

      <FreemiumGate
        contentType="service_providers"
        itemId={provider.id}
        contentTitle={provider.name}
        contentDescription={provider.description}
      >
        <main>
          <ServiceProviderBreadcrumb
            providerName={provider.name}
            categoryName={provider.category_name}
          />
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
