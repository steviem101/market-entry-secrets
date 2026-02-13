import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Globe, MapPin, Calendar, Users, Mail } from "lucide-react";
import CompanyCard from "@/components/CompanyCard";
import {
  parseJsonArray,
  getExperienceTileImage,
  getContactPersonImage,
  getCompanyInitials
} from "@/components/company-card/CompanyCardHelpers";

interface InnovationOrgContentProps {
  org: {
    id: string;
    name: string;
    description: string;
    location: string;
    founded: string;
    employees: string;
    services: string[];
    website: string | null;
    logo: string | null;
    basic_info: string | null;
    why_work_with_us: string | null;
    contact: string | null;
    contact_persons: any;
    experience_tiles: any;
  };
  relatedOrgs: any[];
}

export const InnovationOrgContent = ({ org, relatedOrgs }: InnovationOrgContentProps) => {
  const experienceTiles = parseJsonArray(org.experience_tiles);
  const contactPersons = parseJsonArray(org.contact_persons);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">About</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {org.basic_info || org.description}
            </p>
          </section>

          {/* Why Work With Us */}
          {org.why_work_with_us && (
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Why Work With Us</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {org.why_work_with_us}
              </p>
            </section>
          )}

          {/* Services */}
          {org.services && org.services.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Services</h2>
              <div className="flex flex-wrap gap-2">
                {org.services.map((service) => (
                  <Badge key={service} variant="secondary" className="text-sm px-3 py-1">
                    {service}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Experience / Working With */}
          {experienceTiles.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Working With</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {experienceTiles.map((tile: any, index: number) => (
                  <div key={tile.id || index} className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
                    <div className="w-12 h-12 bg-white border rounded-lg p-1 flex-shrink-0">
                      <img
                        src={tile.logo || getExperienceTileImage(index)}
                        alt={tile.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <span className="text-sm font-medium truncate">{tile.name}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Contact Persons */}
          {contactPersons.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Team</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contactPersons.map((person: any, index: number) => (
                  <div key={person.id || index} className="flex items-center gap-4 bg-muted/50 rounded-lg p-4">
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={person.image || getContactPersonImage(index)} alt={person.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {person.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-foreground">{person.name}</div>
                      {person.role && (
                        <div className="text-sm text-muted-foreground">{person.role}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* At a Glance */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">At a Glance</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>{org.location}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>Founded {org.founded}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>{org.employees} employees</span>
              </div>
              {org.website && (
                <div className="flex items-center gap-3 text-sm">
                  <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <a
                    href={org.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate"
                  >
                    {org.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </a>
                </div>
              )}
              {org.contact && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <a href={`mailto:${org.contact}`} className="text-primary hover:underline truncate">
                    {org.contact}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Services Quick View */}
          {org.services && org.services.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Services</h3>
              <div className="flex flex-wrap gap-1.5">
                {org.services.slice(0, 6).map((service) => (
                  <Badge key={service} variant="outline" className="text-xs">
                    {service}
                  </Badge>
                ))}
                {org.services.length > 6 && (
                  <Badge variant="outline" className="text-xs">
                    +{org.services.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Organizations */}
      {relatedOrgs && relatedOrgs.length > 0 && (
        <section className="mt-12 pt-8 border-t">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Related Organizations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedOrgs.map((relatedOrg) => (
              <CompanyCard
                key={relatedOrg.id}
                company={{
                  id: relatedOrg.id,
                  name: relatedOrg.name,
                  description: relatedOrg.description,
                  location: relatedOrg.location,
                  founded: relatedOrg.founded,
                  employees: relatedOrg.employees,
                  services: relatedOrg.services,
                  website: relatedOrg.website,
                  contact: relatedOrg.contact,
                  logo: relatedOrg.logo,
                  basic_info: relatedOrg.basic_info,
                  why_work_with_us: relatedOrg.why_work_with_us,
                  contact_persons: parseJsonArray(relatedOrg.contact_persons),
                  experience_tiles: parseJsonArray(relatedOrg.experience_tiles)
                }}
                detailUrl={`/innovation-ecosystem/${relatedOrg.id}`}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
