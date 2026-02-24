
import { User, MapPin, Calendar, Globe, Phone, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BookmarkButton } from "@/components/BookmarkButton";

export interface ExperienceTile {
  id: string;
  name: string;
  logo: string;
}

export interface Person {
  id: string;
  name: string;
  title: string;
  description: string;
  location: string;
  experience: string;
  specialties: string[];
  website?: string;
  contact?: string;
  image?: string;
  experienceTiles?: ExperienceTile[];
  company?: string;
  isAnonymous?: boolean;
  serves_personas?: string[] | null;
}

interface PersonCardProps {
  person: Person;
  onViewProfile: (person: Person) => void;
  onContact: (person: Person) => void;
}

const PersonCard = ({ person, onViewProfile, onContact }: PersonCardProps) => {
  const displayName = person.isAnonymous ? person.title : person.name;
  const shouldBlurImage = person.isAnonymous;

  // Placeholder images for experience tiles (company logos/work samples)
  const getExperienceTileImage = (index: number) => {
    const images = [
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=150&h=150&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150&h=150&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=150&h=150&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1558655146-d09347e92766?w=150&h=150&fit=crop&crop=center"
    ];
    return images[index % images.length];
  };

  // Placeholder images for person profile pictures
  const getPersonImage = (index: number) => {
    const images = [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    ];
    return images[index % images.length];
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start gap-4 mb-4">
        <Avatar className="w-16 h-16 flex-shrink-0">
          {person.isAnonymous ? (
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              <User className="w-8 h-8" />
            </AvatarFallback>
          ) : (
            <>
              <AvatarImage 
                src={person.image || getPersonImage(parseInt(person.id) || 0)} 
                alt={person.name}
                className={shouldBlurImage ? "blur-sm" : ""}
              />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {person.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </>
          )}
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-foreground mb-1 truncate">
                {displayName}
              </h3>
              {!person.isAnonymous && (
                <p className="text-primary font-medium text-sm mb-1 truncate">
                  {person.title}
                </p>
              )}
              <div className="flex items-center text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                {person.location}
              </div>
            </div>
            <BookmarkButton
              contentType="community_member"
              contentId={person.id}
              title={displayName}
              description={person.description}
              metadata={{
                title: person.title,
                company: person.company,
                location: person.location,
                specialties: person.specialties
              }}
              size="sm"
              variant="ghost"
            />
          </div>
        </div>
      </div>

      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
        {person.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {person.specialties.slice(0, 3).map((specialty) => (
          <Badge key={specialty} variant="secondary" className="text-xs">
            {specialty}
          </Badge>
        ))}
        {person.specialties.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{person.specialties.length - 3}
          </Badge>
        )}
      </div>

      {person.experienceTiles && person.experienceTiles.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Experience with:</h4>
          <div className="flex gap-2 overflow-x-auto">
            {person.experienceTiles.slice(0, 3).map((tile, index) => (
              <div key={tile.id} className="flex-shrink-0 w-12 h-12 bg-white border rounded-lg p-1">
                <img 
                  src={tile.logo || getExperienceTileImage(index)} 
                  alt={tile.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
            {person.experienceTiles.length > 3 && (
              <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-xs text-muted-foreground">+{person.experienceTiles.length - 3}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewProfile(person)}
          className="flex-1"
        >
          View Profile
        </Button>
        <Button
          size="sm"
          onClick={() => onContact(person)}
          className="flex-1"
        >
          <Phone className="w-4 h-4 mr-1" />
          Contact
        </Button>
      </div>
    </div>
  );
};

export default PersonCard;
