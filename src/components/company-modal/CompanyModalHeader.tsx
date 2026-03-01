
import { Link } from "react-router-dom";
import { MapPin, Users, Calendar, CheckCircle, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { BookmarkButton } from "@/components/BookmarkButton";
import { Company } from "../CompanyCard";

interface CompanyModalHeaderProps {
  company: Company;
}

export const CompanyModalHeader = ({ company }: CompanyModalHeaderProps) => {
  const foundedDisplay = company.founded_year ? String(company.founded_year) : company.founded;
  const teamDisplay = company.team_size_range || company.employees;

  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <DialogTitle className="text-2xl font-bold">
            {company.name}
          </DialogTitle>
          {company.is_verified && (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          )}
        </div>
        {company.tagline && (
          <p className="text-sm text-muted-foreground italic mb-2">{company.tagline}</p>
        )}
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {company.location}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Founded {foundedDisplay}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {teamDisplay} employees
          </div>
          {company.category_name && (
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
              {company.category_name}
            </Badge>
          )}
        </div>
        {company.slug && (
          <Button variant="link" size="sm" className="p-0 h-auto" asChild>
            <Link to={`/service-providers/${company.slug}`}>
              <ExternalLink className="w-3 h-3 mr-1" />
              View Full Profile
            </Link>
          </Button>
        )}
      </div>
      <BookmarkButton
        contentType="service_provider"
        contentId={company.id}
        title={company.name}
        description={company.description}
        metadata={{
          location: company.location,
          founded: company.founded,
          employees: company.employees,
          services: company.services
        }}
        size="default"
        variant="outline"
      />
    </div>
  );
};
