import { Calendar, Users, Globe, MapPin, DollarSign, Briefcase, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Company } from "@/components/CompanyCard";
import CompanyCard from "@/components/CompanyCard";

interface Contact {
  id: string;
  full_name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  avatar_url: string | null;
  is_primary: boolean;
}

interface ServiceProviderSidebarProps {
  provider: Company;
  contacts: Contact[];
  relatedProviders: Company[];
}

const MARKET_LABELS: Record<string, string> = {
  australia: "Australia",
  new_zealand: "New Zealand",
  global: "Global",
};

export const ServiceProviderSidebar = ({
  provider,
  contacts,
  relatedProviders,
}: ServiceProviderSidebarProps) => {
  const foundedDisplay = provider.founded_year ? String(provider.founded_year) : provider.founded;
  const teamDisplay = provider.team_size_range || provider.employees;
  const websiteUrl = provider.website_url || provider.website;

  return (
    <div className="space-y-6">
      {/* Quick Facts */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Facts</h3>
        <dl className="space-y-3">
          {foundedDisplay && (
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <dt className="text-xs text-muted-foreground">Founded</dt>
                <dd className="text-sm font-medium">{foundedDisplay}</dd>
              </div>
            </div>
          )}
          {teamDisplay && (
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <dt className="text-xs text-muted-foreground">Team Size</dt>
                <dd className="text-sm font-medium">{teamDisplay}</dd>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div>
              <dt className="text-xs text-muted-foreground">Location</dt>
              <dd className="text-sm font-medium">{provider.location}</dd>
            </div>
          </div>
          {websiteUrl && (
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <dt className="text-xs text-muted-foreground">Website</dt>
                <dd className="text-sm font-medium">
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {new URL(websiteUrl).hostname.replace('www.', '')}
                  </a>
                </dd>
              </div>
            </div>
          )}
          {provider.price_range && (
            <div className="flex items-center gap-3">
              <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <dt className="text-xs text-muted-foreground">Price Range</dt>
                <dd className="text-sm font-medium capitalize">{provider.price_range}</dd>
              </div>
            </div>
          )}
        </dl>

        {/* Markets Served */}
        {provider.markets_served && provider.markets_served.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Markets Served</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {provider.markets_served.map((market) => (
                <Badge key={market} variant="secondary" className="text-xs capitalize">
                  {MARKET_LABELS[market.toLowerCase()] || market}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Engagement Model */}
        {provider.engagement_model && provider.engagement_model.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Engagement Model</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {provider.engagement_model.map((model) => (
                <Badge key={model} variant="outline" className="text-xs capitalize">
                  {model}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contact Persons */}
      {contacts.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Contact Persons</h3>
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div key={contact.id} className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  {contact.avatar_url && <AvatarImage src={contact.avatar_url} alt={contact.full_name} />}
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {contact.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{contact.full_name}</p>
                  {contact.role && (
                    <p className="text-xs text-muted-foreground">{contact.role}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Providers */}
      {relatedProviders.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Related Providers</h3>
          <div className="space-y-4">
            {relatedProviders.map((related) => (
              <CompanyCard
                key={related.id}
                company={related}
                detailUrl={related.slug ? `/service-providers/${related.slug}` : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
