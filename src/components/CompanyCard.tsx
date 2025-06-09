
import { Building2, MapPin, Users, Calendar, Globe, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface Company {
  id: string;
  name: string;
  description: string;
  location: string;
  founded: string;
  employees: string;
  services: string[];
  website?: string;
  contact?: string;
  logo?: string;
}

interface CompanyCardProps {
  company: Company;
  onViewProfile: (company: Company) => void;
  onContact: (company: Company) => void;
}

const CompanyCard = ({ company, onViewProfile, onContact }: CompanyCardProps) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 className="w-8 h-8 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-foreground mb-1 truncate">
            {company.name}
          </h3>
          <div className="flex items-center text-muted-foreground text-sm mb-2">
            <MapPin className="w-4 h-4 mr-1" />
            {company.location}
          </div>
        </div>
      </div>

      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
        {company.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {company.services.slice(0, 3).map((service) => (
          <Badge key={service} variant="secondary" className="text-xs">
            {service}
          </Badge>
        ))}
        {company.services.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{company.services.length - 3}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4 text-xs text-muted-foreground">
        <div className="flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          <span className="truncate">{company.founded}</span>
        </div>
        <div className="flex items-center">
          <Users className="w-3 h-3 mr-1" />
          <span className="truncate">{company.employees}</span>
        </div>
        {company.website && (
          <div className="flex items-center">
            <Globe className="w-3 h-3 mr-1" />
            <span className="truncate">Website</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewProfile(company)}
          className="flex-1"
        >
          View Profile
        </Button>
        <Button
          size="sm"
          onClick={() => onContact(company)}
          className="flex-1 bg-teal-600 hover:bg-teal-700"
        >
          <Phone className="w-4 h-4 mr-1" />
          Contact
        </Button>
      </div>
    </div>
  );
};

export default CompanyCard;
