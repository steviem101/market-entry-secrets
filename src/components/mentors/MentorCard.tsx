import { MapPin, Phone, CheckCircle, Star, Globe, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BookmarkButton } from "@/components/BookmarkButton";
import { useNavigate } from "react-router-dom";
import type { Mentor } from "@/hooks/useMentors";

interface MentorCardProps {
  mentor: Mentor;
  onContact: (mentor: Mentor) => void;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const AvailabilityBadge = ({ availability }: { availability: string | null }) => {
  if (!availability) return null;
  const config: Record<string, { label: string; className: string }> = {
    available: { label: "Available", className: "bg-green-100 text-green-700 border-green-200" },
    limited: { label: "Limited", className: "bg-amber-100 text-amber-700 border-amber-200" },
    unavailable: { label: "Unavailable", className: "bg-gray-100 text-gray-500 border-gray-200" },
  };
  const c = config[availability] || config.unavailable;
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${c.className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1" />
      {c.label}
    </span>
  );
};

const MarketFlag = ({ market }: { market: string }) => {
  const flags: Record<string, string> = {
    australia: "🇦🇺",
    new_zealand: "🇳🇿",
    global: "🌏",
  };
  return (
    <span className="inline-flex items-center text-xs bg-muted px-1.5 py-0.5 rounded">
      {flags[market] || "🌏"} {market === "new_zealand" ? "NZ" : market === "australia" ? "AU" : "Global"}
    </span>
  );
};

const ExperienceTileItem = ({ tile }: { tile: { id?: string; name: string; logo?: string } }) => {
  const initials = tile.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex-shrink-0 w-10 h-10 rounded-lg border bg-white flex items-center justify-center overflow-hidden" title={tile.name}>
      {tile.logo ? (
        <img
          src={tile.logo}
          alt={tile.name}
          className="w-full h-full object-contain p-0.5"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent) {
              const fallback = document.createElement("span");
              fallback.className = "text-xs font-semibold text-primary";
              fallback.textContent = initials;
              parent.appendChild(fallback);
            }
          }}
        />
      ) : (
        <span className="text-xs font-semibold text-primary">{initials}</span>
      )}
    </div>
  );
};

const MentorCard = ({ mentor, onContact }: MentorCardProps) => {
  const navigate = useNavigate();
  const displayName = mentor.is_anonymous ? mentor.title : mentor.name;
  const profileUrl = `/mentors/${mentor.category_slug || "experts"}/${mentor.slug || mentor.id}`;

  const experienceTiles = mentor.experience_tiles
    ? (Array.isArray(mentor.experience_tiles)
        ? (mentor.experience_tiles as { id?: string; name: string; logo?: string }[])
        : [])
    : [];

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative">
      {/* Featured ribbon */}
      {mentor.is_featured && (
        <div className="absolute top-3 left-3">
          <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-xs">
            <Star className="w-3 h-3 mr-1 fill-current" />
            Featured
          </Badge>
        </div>
      )}

      <div className="flex items-start gap-4 mb-4">
        {/* Avatar with verified badge */}
        <div className="relative flex-shrink-0">
          <Avatar className="w-16 h-16">
            {mentor.is_anonymous ? (
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                <Globe className="w-8 h-8" />
              </AvatarFallback>
            ) : (
              <>
                <AvatarImage
                  src={mentor.avatar_url || mentor.image || undefined}
                  alt={mentor.name}
                />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {getInitials(mentor.name)}
                </AvatarFallback>
              </>
            )}
          </Avatar>
          {mentor.is_verified && (
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full">
              <CheckCircle className="w-5 h-5 text-primary fill-primary/10" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground mb-0.5 truncate">
                {displayName}
              </h3>
              {!mentor.is_anonymous && (
                <p className="text-primary font-medium text-sm mb-0.5 truncate">
                  {mentor.title}
                  {mentor.company && (
                    <span className="text-muted-foreground font-normal"> at {mentor.company}</span>
                  )}
                </p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center text-muted-foreground text-sm">
                  <MapPin className="w-3.5 h-3.5 mr-1" />
                  {mentor.location_city && mentor.location_state
                    ? `${mentor.location_city}, ${mentor.location_state}`
                    : mentor.location}
                </span>
                <AvailabilityBadge availability={mentor.availability} />
              </div>
            </div>
            <BookmarkButton
              contentType="community_member"
              contentId={mentor.id}
              title={displayName}
              description={mentor.description}
              metadata={{
                title: mentor.title,
                company: mentor.company,
                location: mentor.location,
                specialties: mentor.specialties,
              }}
              size="sm"
              variant="ghost"
            />
          </div>
        </div>
      </div>

      {/* Tagline */}
      {mentor.tagline && (
        <p className="text-muted-foreground text-sm italic mb-3">{mentor.tagline}</p>
      )}

      {/* Bio excerpt */}
      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
        {mentor.description.length > 120
          ? mentor.description.slice(0, 120) + "..."
          : mentor.description}
      </p>

      {/* Specialties */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {mentor.specialties.slice(0, 3).map((specialty) => (
          <Badge key={specialty} variant="secondary" className="text-xs">
            {specialty}
          </Badge>
        ))}
        {mentor.specialties.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{mentor.specialties.length - 3} more
          </Badge>
        )}
      </div>

      {/* Markets served */}
      {mentor.markets_served && mentor.markets_served.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {mentor.markets_served.map((market) => (
            <MarketFlag key={market} market={market} />
          ))}
        </div>
      )}

      {/* Experience with - text fallback, no grey boxes */}
      {experienceTiles.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-medium text-muted-foreground mb-1.5">Experience with:</h4>
          <div className="flex gap-1.5 overflow-x-auto">
            {experienceTiles.slice(0, 4).map((tile, index) => (
              <ExperienceTileItem key={tile.id || index} tile={tile} />
            ))}
            {experienceTiles.length > 4 && (
              <div className="flex-shrink-0 w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-xs text-muted-foreground">+{experienceTiles.length - 4}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Years experience + engagement model */}
      <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-muted-foreground">
        {mentor.years_experience && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {mentor.years_experience}+ years
          </span>
        )}
        {mentor.engagement_model &&
          mentor.engagement_model.map((model) => (
            <Badge key={model} variant="outline" className="text-xs capitalize">
              {model.replace(/_/g, " ")}
            </Badge>
          ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(profileUrl)}
          className="flex-1"
        >
          View Profile
        </Button>
        <Button
          size="sm"
          onClick={() => onContact(mentor)}
          className="flex-1"
        >
          <Phone className="w-4 h-4 mr-1" />
          Contact
        </Button>
      </div>
    </div>
  );
};

export default MentorCard;
