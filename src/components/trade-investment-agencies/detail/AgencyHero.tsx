import { Link } from "react-router-dom";
import { MapPin, Calendar, Users, Globe, ArrowLeft, ChevronRight, Shield, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/BookmarkButton";
import { getCompanyInitials } from "@/components/company-card/CompanyCardHelpers";

interface AgencyHeroProps {
  agency: {
    id: string;
    name: string;
    description: string;
    tagline?: string;
    location: string;
    founded: string;
    employees: string;
    website: string | null;
    website_url?: string | null;
    logo: string | null;
    services: string[];
    category_slug?: string;
    organisation_type?: string;
    is_government_funded?: boolean;
    grants_available?: boolean;
    is_verified?: boolean;
  };
  categoryName?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  'federal-agencies': 'Federal Trade Agency',
  'state-investment-bodies': 'State & Territory Body',
  'nz-government': 'NZ Government',
  'industry-associations': 'Industry Association',
  'chambers-of-commerce': 'Chamber of Commerce',
  'bilateral-organisations': 'Bilateral Organisation',
  'accelerators-programs': 'Landing Program',
};

export const AgencyHero = ({ agency, categoryName }: AgencyHeroProps) => {
  const siteUrl = agency.website_url || agency.website;
  const categoryLabel = categoryName || (agency.category_slug ? CATEGORY_LABELS[agency.category_slug] : null);

  return (
    <section className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/government-support" className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" />
            Government & Industry Support
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium truncate">{agency.name}</span>
        </nav>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Logo / Initials */}
          <div className="w-28 h-28 bg-white rounded-xl shadow-sm border flex items-center justify-center flex-shrink-0 overflow-hidden">
            {agency.logo ? (
              <img
                src={agency.logo}
                alt={`${agency.name} logo`}
                className="w-full h-full object-contain p-3"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-100 text-green-600 font-bold text-3xl ${agency.logo ? 'hidden' : 'flex'}`}
              style={{ display: agency.logo ? 'none' : 'flex' }}
            >
              {getCompanyInitials(agency.name)}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {categoryLabel && (
                <Badge variant="secondary" className="text-xs">
                  {categoryLabel}
                </Badge>
              )}
              {agency.is_government_funded && (
                <Badge variant="outline" className="text-xs border-green-300 text-green-700 bg-green-50">
                  <Shield className="w-3 h-3 mr-1" />
                  Government Funded
                </Badge>
              )}
              {agency.grants_available && (
                <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 bg-amber-50">
                  <Award className="w-3 h-3 mr-1" />
                  Grants Available
                </Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {agency.name}
            </h1>

            {agency.tagline && (
              <p className="text-lg text-gray-600 mb-3">{agency.tagline}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {agency.location}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Founded {agency.founded}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {agency.employees} employees
              </div>
            </div>

            <p className="text-gray-600 mb-6 max-w-2xl line-clamp-2">
              {agency.description}
            </p>

            <div className="flex flex-wrap gap-3">
              {siteUrl && (
                <Button asChild>
                  <a href={siteUrl} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4 mr-2" />
                    Visit Website
                  </a>
                </Button>
              )}
              <BookmarkButton
                contentType="trade_investment_agencies"
                contentId={agency.id}
                title={agency.name}
                description={agency.description}
                metadata={{
                  company: agency.name,
                  location: agency.location,
                  services: agency.services,
                  founded: agency.founded,
                  employees: agency.employees
                }}
                size="default"
                variant="outline"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
