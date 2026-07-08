
import { memo } from "react";
import { User, MapPin, Calendar, Globe, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/BookmarkButton";
import CompanyLogo from "@/components/shared/CompanyLogo";
import { ContactAvatar } from "@/components/shared/ContactAvatar";
import { domainToWebsite } from "@/lib/logoUtils";
import { DirectoryCard } from "@/components/directory/DirectoryCard";
import { CardCTA } from "@/components/directory/CardCTA";

export interface ExperienceTile {
  id: string;
  name: string;
  logo: string;
  domain?: string;
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
  /** @deprecated warm intro now routes through the shared IntroRequestProvider. */
  onContact?: (person: Person) => void;
}

const PersonCard = memo(({ person, onViewProfile }: PersonCardProps) => {
  const displayName = person.isAnonymous ? person.title : person.name;

  return (
    <DirectoryCard className="min-w-0">
      <div className="flex items-start gap-4 mb-4">
        <ContactAvatar
          name={person.name}
          src={person.isAnonymous ? undefined : person.image}
          className="w-16 h-16 flex-shrink-0 text-lg"
          fallback={person.isAnonymous ? <User className="w-8 h-8" /> : undefined}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 min-w-0">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-foreground mb-1 truncate">
                {displayName}
              </h3>
              {!person.isAnonymous && (
                <p className="text-primary font-medium text-sm mb-1 truncate">
                  {person.title}
                </p>
              )}
              <div className="flex items-center text-muted-foreground text-sm min-w-0">
                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">{person.location}</span>
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
            {person.experienceTiles.slice(0, 3).map((tile) => (
              <CompanyLogo
                key={tile.id}
                existingLogoUrl={tile.logo && tile.logo !== "/placeholder.svg" ? tile.logo : undefined}
                websiteUrl={domainToWebsite(tile.domain)}
                companyName={tile.name}
                size="md"
                className="flex-shrink-0 w-12 h-12 bg-white border rounded-lg"
                fallbackClassName="bg-white text-primary"
                imgClassName="object-contain"
              />
            ))}
            {person.experienceTiles.length > 3 && (
              <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-xs text-muted-foreground">+{person.experienceTiles.length - 3}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <CardCTA
        entity="mentor"
        target={{ entity: "mentor", id: person.id, name: displayName }}
        onSecondary={() => onViewProfile(person)}
      />
    </DirectoryCard>
  );
});

PersonCard.displayName = "PersonCard";

export default PersonCard;
