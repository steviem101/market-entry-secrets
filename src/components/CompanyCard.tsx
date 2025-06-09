import { Building2, MapPin, Users, Calendar, Globe, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export interface ContactPerson {
  id: string;
  name: string;
  image?: string;
  role?: string;
}

export interface ExperienceTile {
  id: string;
  name: string;
  logo: string;
}

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
  experienceTiles?: ExperienceTile[];
  contactPersons?: ContactPerson[];
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

      {company.experienceTiles && company.experienceTiles.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Working with:</h4>
          <div className="flex gap-2 overflow-x-auto">
            {company.experienceTiles.slice(0, 3).map((tile) => (
              <div key={tile.id} className="flex-shrink-0 w-12 h-12 bg-white border rounded-lg p-1">
                <img 
                  src={tile.logo} 
                  alt={tile.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
            {company.experienceTiles.length > 3 && (
              <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-xs text-muted-foreground">+{company.experienceTiles.length - 3}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {company.contactPersons && company.contactPersons.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Contact person(s):</h4>
          <div className="flex gap-2">
            {company.contactPersons.slice(0, 3).map((person) => (
              <Avatar key={person.id} className="w-10 h-10">
                <AvatarImage src={person.image} alt={person.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {person.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {company.contactPersons.length > 3 && (
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                <span className="text-xs text-muted-foreground">+{company.contactPersons.length - 3}</span>
              </div>
            )}
          </div>
        </div>
      )}

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
          className="flex-1"
        >
          <Phone className="w-4 h-4 mr-1" />
          Contact
        </Button>
      </div>
    </div>
  );
};

export default CompanyCard;
