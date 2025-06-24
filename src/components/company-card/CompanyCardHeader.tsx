
import { MapPin } from "lucide-react";
import { BookmarkButton } from "@/components/BookmarkButton";
import { Company } from "@/components/CompanyCard";
import { getCompanyInitials } from "./CompanyCardHelpers";

interface CompanyCardHeaderProps {
  company: Company;
}

const CompanyCardHeader = ({ company }: CompanyCardHeaderProps) => {
  return (
    <div className="flex items-start gap-4 mb-4">
      <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
        {company.logo ? (
          <img 
            src={company.logo} 
            alt={`${company.name} logo`}
            className="w-full h-full object-contain p-2"
            onError={(e) => {
              console.log(`Logo failed to load for ${company.name}, falling back to initials`);
              e.currentTarget.style.display = 'none';
              const fallbackElement = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallbackElement) {
                fallbackElement.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <div 
          className={`w-full h-full flex items-center justify-center text-primary font-bold text-lg ${company.logo ? 'hidden' : 'flex'}`}
          style={{ display: company.logo ? 'none' : 'flex' }}
        >
          {getCompanyInitials(company.name)}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-foreground mb-1 truncate">
              {company.name}
            </h3>
            <div className="flex items-center text-muted-foreground text-sm mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              {company.location}
            </div>
          </div>
          <BookmarkButton
            contentType="community_member"
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
