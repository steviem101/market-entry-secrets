import { MapPin, CheckCircle, Star, Globe, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "@/components/BookmarkButton";
import { Company } from "@/components/CompanyCard";
import { getCompanyInitials } from "@/components/company-card/CompanyCardHelpers";

interface ServiceProviderProfileHeroProps {
  provider: Company;
}

export const ServiceProviderProfileHero = ({ provider }: ServiceProviderProfileHeroProps) => {
  const logoSrc = provider.logo_url || provider.logo;
  const websiteUrl = provider.website_url || provider.website;

  return (
    <section className="relative">
      {/* Cover image or gradient */}
      <div className="h-48 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {provider.cover_image_url && (
          <img
            src={provider.cover_image_url}
            alt={`${provider.name} cover`}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="container mx-auto px-4">
        <div className="relative -mt-16 flex flex-col md:flex-row items-start gap-6 pb-8">
          {/* Logo */}
          <div className="w-32 h-32 bg-white border-4 border-white rounded-xl shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={`${provider.name} logo`}
                className="w-full h-full object-contain p-3"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`w-full h-full flex items-center justify-center text-primary font-bold text-3xl bg-gradient-to-br from-primary/10 to-primary/20 ${logoSrc ? 'hidden' : 'flex'}`}
              style={{ display: logoSrc ? 'none' : 'flex' }}
            >
              {getCompanyInitials(provider.name)}
            </div>
          </div>

          {/* Provider info */}
          <div className="flex-1 pt-4 md:pt-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">{provider.name}</h1>
                  {provider.is_verified && (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  )}
                  {provider.is_featured && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>

                {provider.tagline && (
                  <p className="text-lg text-muted-foreground mb-3 italic">{provider.tagline}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {provider.location}
                  </div>
                  {provider.category_name && (
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      {provider.category_name}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <BookmarkButton
                  contentType="service_provider"
                  contentId={provider.id}
                  title={provider.name}
                  description={provider.description}
                  metadata={{
                    company: provider.name,
                    location: provider.location,
                    services: provider.services,
                  }}
                  size="default"
                  variant="outline"
                />
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              {(provider.contact_email || provider.contact) && (
                <Button asChild>
                  <a href={`mailto:${provider.contact_email || provider.contact}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Contact
                  </a>
                </Button>
              )}
              {provider.contact_phone && (
                <Button variant="outline" asChild>
                  <a href={`tel:${provider.contact_phone}`}>
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </a>
                </Button>
              )}
              {websiteUrl && (
                <Button variant="outline" asChild>
                  <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4 mr-2" />
                    Visit Website
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
