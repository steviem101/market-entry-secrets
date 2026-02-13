import { Link } from "react-router-dom";
import { MapPin, Calendar, Users, Globe, ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "@/components/BookmarkButton";
import { getCompanyInitials } from "@/components/company-card/CompanyCardHelpers";

interface InnovationOrgHeroProps {
  org: {
    id: string;
    name: string;
    description: string;
    location: string;
    founded: string;
    employees: string;
    website: string | null;
    logo: string | null;
    services: string[];
  };
}

export const InnovationOrgHero = ({ org }: InnovationOrgHeroProps) => {
  return (
    <section className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/innovation-ecosystem" className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" />
            Innovation Ecosystem
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium truncate">{org.name}</span>
        </nav>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Logo / Initials */}
          <div className="w-28 h-28 bg-white rounded-xl shadow-sm border flex items-center justify-center flex-shrink-0 overflow-hidden">
            {org.logo ? (
              <img
                src={org.logo}
                alt={`${org.name} logo`}
                className="w-full h-full object-contain p-3"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100 text-orange-600 font-bold text-3xl ${org.logo ? 'hidden' : 'flex'}`}
              style={{ display: org.logo ? 'none' : 'flex' }}
            >
              {getCompanyInitials(org.name)}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {org.name}
            </h1>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {org.location}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Founded {org.founded}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {org.employees} employees
              </div>
            </div>

            <p className="text-gray-600 mb-6 max-w-2xl line-clamp-2">
              {org.description}
            </p>

            <div className="flex flex-wrap gap-3">
              {org.website && (
                <Button asChild>
                  <a href={org.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4 mr-2" />
                    Visit Website
                  </a>
                </Button>
              )}
              <BookmarkButton
                contentType="community_member"
                contentId={org.id}
                title={org.name}
                description={org.description}
                metadata={{
                  company: org.name,
                  location: org.location,
                  services: org.services,
                  founded: org.founded,
                  employees: org.employees
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
