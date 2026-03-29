import { Link } from "react-router-dom";
import { Calendar, Users, Globe, Handshake, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Company } from "@/components/CompanyCard";

interface CompanyCardFooterProps {
  company: Company;
  onViewProfile: (company: Company) => void;
  onContact: (company: Company) => void;
  detailUrl?: string;
}

const CompanyCardFooter = ({ company, onViewProfile, onContact, detailUrl }: CompanyCardFooterProps) => {
  const foundedDisplay = company.founded_year ? String(company.founded_year) : company.founded;
  const teamDisplay = company.team_size_range || company.employees;
  const websiteUrl = company.website_url || company.website;

  return (
    <>
      {/* Engagement model tags */}
      {company.engagement_model && company.engagement_model.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {company.engagement_model.map((model) => (
            <Badge key={model} variant="outline" className="text-xs capitalize">
              {model}
            </Badge>
          ))}
        </div>
      )}

      {(foundedDisplay || teamDisplay || websiteUrl || (company.avg_rating != null && company.avg_rating > 0)) && (
      <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
        {foundedDisplay && (
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            <span className="truncate">{foundedDisplay}</span>
          </div>
        )}
        {teamDisplay && (
          <div className="flex items-center">
            <Users className="w-3 h-3 mr-1" />
            <span className="truncate">{teamDisplay}</span>
          </div>
        )}
        {websiteUrl && (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:text-primary transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Globe className="w-3 h-3 mr-1" />
            <span className="truncate">Website</span>
          </a>
        )}
        {company.avg_rating != null && company.avg_rating > 0 && (
          <div className="flex items-center ml-auto">
            <Star className="w-3 h-3 mr-0.5 text-yellow-500 fill-yellow-500" />
            <span>{company.avg_rating}</span>
            {company.review_count != null && company.review_count > 0 && (
              <span className="ml-0.5 text-muted-foreground">({company.review_count})</span>
            )}
          </div>
        )}
      </div>
      )}

      <div className="flex gap-2">
        {detailUrl ? (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            asChild
            onClick={(e) => e.stopPropagation()}
          >
            <Link to={detailUrl}>
              View Profile
            </Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onViewProfile(company);
            }}
            className="flex-1"
          >
            View Profile
          </Button>
        )}
        {(company.contact_email || company.contact) ? (
          <Button
            size="sm"
            className="flex-1"
            asChild
            onClick={(e) => e.stopPropagation()}
          >
            <a href={`mailto:${company.contact_email || company.contact}`}>
              <Handshake className="w-4 h-4 mr-1" />
              Get Warm Intro
            </a>
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onContact(company);
            }}
            className="flex-1"
          >
            <Handshake className="w-4 h-4 mr-1" />
            Get Warm Intro
          </Button>
        )}
      </div>
    </>
  );
};

export default CompanyCardFooter;
