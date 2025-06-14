
import { X, MapPin, Users, Calendar, Globe, Phone, Mail, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BookmarkButton } from "@/components/BookmarkButton";
import { Company } from "./CompanyCard";

interface CompanyModalProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
  onContact: (company: Company) => void;
}

const CompanyModal = ({ company, isOpen, onClose, onContact }: CompanyModalProps) => {
  if (!company) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2">
                {company.name}
              </DialogTitle>
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {company.location}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Founded {company.founded}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {company.employees} employees
                </div>
              </div>
            </div>
            <BookmarkButton
              contentType="community_member"
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
        </DialogHeader>

        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-semibold mb-3">Basic Info</h3>
            <p className="text-muted-foreground leading-relaxed">
              {company.description}
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">Why work with us</h3>
            <p className="text-muted-foreground leading-relaxed">
              At <span className="text-primary font-medium">{company.name}</span>, we streamline business solutions, 
              enabling brands to connect globally through our unique and cost-effective platform. Partnering with us 
              helps brands connect with clients who align with their values, elevating visibility, building trust, 
              and enhancing growth through authentic engagement.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">Services</h3>
            <div className="flex flex-wrap gap-2">
              {company.services.map((service) => (
                <Badge key={service} variant="secondary">
                  {service}
                </Badge>
              ))}
            </div>
          </section>

          {company.experienceTiles && company.experienceTiles.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-3">Working with</h3>
              <div className="flex flex-wrap gap-3">
                {company.experienceTiles.map((tile, index) => (
                  <div key={tile.id} className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                    <div className="w-12 h-12 bg-white border rounded-lg p-1">
                      <img 
                        src={tile.logo || getExperienceTileImage(index)} 
                        alt={tile.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <span className="text-sm font-medium">{tile.name}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {company.contactPersons && company.contactPersons.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-3">Contact person(s)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {company.contactPersons.map((person, index) => (
                  <div key={person.id} className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={person.image || getContactPersonImage(index)} alt={person.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {person.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{person.name}</div>
                      {person.role && (
                        <div className="text-sm text-muted-foreground">{person.role}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="text-lg font-semibold mb-3">Company Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Year founded</div>
                  <div className="font-medium">{company.founded}</div>
                </div>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">No of Employees</div>
                  <div className="font-medium">{company.employees}</div>
                </div>
              </div>
              {company.website && (
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Website</div>
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline flex items-center"
                    >
                      Visit Site <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="flex gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
            <Button 
              onClick={() => onContact(company)}
              className="flex-1"
            >
              <Phone className="w-4 h-4 mr-2" />
              Contact
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyModal;
