
import { Building2, MapPin, Users, Calendar, Globe, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BookmarkButton } from "@/components/BookmarkButton";
import { Json } from "@/integrations/supabase/types";

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
  basic_info?: string;
  why_work_with_us?: string;
  contact_persons?: ContactPerson[] | Json;
  experience_tiles?: ExperienceTile[] | Json;
  experienceTiles?: ExperienceTile[];
  contactPersons?: ContactPerson[];
}

interface CompanyCardProps {
  company: Company;
  onViewProfile: (company: Company) => void;
  onContact: (company: Company) => void;
}

const CompanyCard = ({ company, onViewProfile, onContact }: CompanyCardProps) => {
  // Helper function to safely parse JSONB arrays
  const parseJsonArray = (jsonData: any): any[] => {
    if (!jsonData) return [];
    if (Array.isArray(jsonData)) return jsonData;
    if (typeof jsonData === 'string') {
      try {
        const parsed = JSON.parse(jsonData);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  // Placeholder images for experience tiles (company logos/work samples)
  const getExperienceTileImage = (index: number) => {
    const images = [
      "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=150&h=150&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=150&h=150&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=150&h=150&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=150&h=150&fit=crop&crop=center"
    ];
    return images[index % images.length];
  };

  // Placeholder images for contact persons
  const getContactPersonImage = (index: number) => {
    const images = [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    ];
    return images[index % images.length];
  };

  // Generate company initials for fallback
  const getCompanyInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Use the correct property names from the database with proper parsing
  const experienceTiles = parseJsonArray(company.experience_tiles || company.experienceTiles || []);
  const contactPersons = parseJsonArray(company.contact_persons || company.contactPersons || []);

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
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

      {experienceTiles && experienceTiles.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Working with:</h4>
          <div className="flex gap-2 overflow-x-auto">
            {experienceTiles.slice(0, 3).map((tile, index) => (
              <div key={tile.id} className="flex-shrink-0 w-12 h-12 bg-white border rounded-lg p-1">
                <img 
                  src={tile.logo || getExperienceTileImage(index)} 
                  alt={tile.name}
                  className="w-full h-full object-cover rounded"
                />
              </div>
            ))}
            {experienceTiles.length > 3 && (
              <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-xs text-muted-foreground">+{experienceTiles.length - 3}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {contactPersons && contactPersons.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Contact person(s):</h4>
          <div className="flex gap-2">
            {contactPersons.slice(0, 3).map((person, index) => (
              <Avatar key={person.id} className="w-10 h-10">
                <AvatarImage src={person.image || getContactPersonImage(index)} alt={person.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {person.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {contactPersons.length > 3 && (
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                <span className="text-xs text-muted-foreground">+{contactPersons.length - 3}</span>
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
