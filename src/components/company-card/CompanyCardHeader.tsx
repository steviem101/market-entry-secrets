
import { MapPin, CheckCircle, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/BookmarkButton";
import { Company } from "@/components/CompanyCard";
import { getCompanyInitials } from "./CompanyCardHelpers";

interface CompanyCardHeaderProps {
  company: Company;
}

const CompanyCardHeader = ({ company }: CompanyCardHeaderProps) => {
  const logoSrc = company.logo_url || company.logo;

  return (
    <div className="flex items-start gap-4 mb-4">
      <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
        {logoSrc ? (
          <img
            src={logoSrc}
            alt={`${company.name} logo`}
            className="w-full h-full object-contain p-2"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallbackElement = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallbackElement) {
                fallbackElement.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <div
          className={`w-full h-full flex items-center justify-center text-primary font-bold text-lg ${logoSrc ? 'hidden' : 'flex'}`}
          style={{ display: logoSrc ? 'none' : 'flex' }}
        >
          {getCompanyInitials(company.name)}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-semibold text-foreground truncate">
                {company.name}
              </h3>
              {company.is_verified && (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              )}
              {company.is_featured && (
                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 flex-shrink-0">
                  <Star className="w-3 h-3 mr-0.5" />
                  Featured
                </Badge>
              )}
            </div>
            {company.tagline && (
              <p className="text-sm text-muted-foreground mb-1 truncate italic">
                {company.tagline}
              </p>
            )}
            <div className="flex items-center text-muted-foreground text-sm mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              {company.location}
            </div>
          </div>
          <BookmarkButton
            contentType="service_provider"
            contentId={company.id}
            title={company.name}
            description={company.description}
            metadata={{
              company: company.name,
              location: company.location,
              services: company.services,
              founded: company.founded,
              employees: company.employees
            }}
            size="sm"
            variant="ghost"
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyCardHeader;
