
import { X, MapPin, Globe, Phone, Mail, Building } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BookmarkButton } from "@/components/BookmarkButton";
import { Person } from "./PersonCard";

interface PersonModalProps {
  person: Person | null;
  isOpen: boolean;
  onClose: () => void;
  onContact: (person: Person) => void;
}

const PersonModal = ({ person, isOpen, onClose, onContact }: PersonModalProps) => {
  if (!person) return null;

  const displayName = person.isAnonymous ? person.title : person.name;

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <Avatar className="w-20 h-20 flex-shrink-0">
                {person.isAnonymous ? (
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    <Building className="w-10 h-10" />
                  </AvatarFallback>
                ) : (
                  <>
                    <AvatarImage src={person.image || getPersonImage(parseInt(person.id) || 0)} alt={person.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {person.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </>
                )}
              </Avatar>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold mb-2">
                  {displayName}
                </DialogTitle>
                {!person.isAnonymous && (
                  <p className="text-primary font-medium text-lg mb-2">
                    {person.title}
                  </p>
                )}
                {person.company && (
                  <p className="text-muted-foreground mb-2">
                    {person.company}
                  </p>
                )}
                <div className="flex items-center text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  {person.location}
                </div>
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
              size="default"
              variant="outline"
            />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">About</h3>
            <p className="text-muted-foreground leading-relaxed">
              {person.description}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {person.specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Experience</h3>
            <p className="text-muted-foreground">
              {person.experience}
            </p>
          </div>

          {person.experienceTiles && person.experienceTiles.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Experience with:</h3>
              <div className="grid grid-cols-4 gap-3">
                {person.experienceTiles.map((tile, index) => (
                  <div key={tile.id} className="flex flex-col items-center p-3 bg-white border rounded-lg">
                    <img 
                      src={tile.logo || getExperienceTileImage(index)} 
                      alt={tile.name}
                      className="w-12 h-12 object-contain mb-2"
                    />
                    <span className="text-xs text-center text-muted-foreground">
                      {tile.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            {person.website && (
              <Button variant="outline" asChild>
                <a href={person.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="w-4 h-4 mr-2" />
                  Website
                </a>
              </Button>
            )}
            <Button onClick={() => onContact(person)} className="flex-1">
              <Phone className="w-4 h-4 mr-2" />
              Contact
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PersonModal;
