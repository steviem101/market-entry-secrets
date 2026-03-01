import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Globe, MapPin, Calendar, Users, Mail, Phone, Linkedin, Shield, Award, ExternalLink } from "lucide-react";
import CompanyCard from "@/components/CompanyCard";
import { parseJsonArray } from "@/components/company-card/CompanyCardHelpers";
import { useAgencyContacts, useAgencyResources } from "@/hooks/useTradeAgencies";

interface AgencyContentProps {
  agency: {
    id: string;
    name: string;
    description: string;
    description_full?: string;
    basic_info?: string | null;
    why_work_with_us?: string | null;
    location: string;
    location_city?: string;
    location_country?: string;
    founded: string;
    employees: string;
    services: string[];
    website: string | null;
    website_url?: string | null;
    email?: string | null;
    phone?: string | null;
    linkedin_url?: string | null;
    contact?: string | null;
    logo: string | null;
    contact_persons?: any;
    experience_tiles?: any;
    organisation_type?: string;
    category_slug?: string;
    government_level?: string;
    jurisdiction?: string[];
    sectors_supported?: string[];
    support_types?: string[];
    target_company_origin?: string[];
    is_government_funded?: boolean;
    is_free_to_access?: boolean;
    grants_available?: boolean;
    max_grant_aud?: number;
    membership_required?: boolean;
    membership_fee_aud?: number;
  };
  relatedAgencies: any[];
  categoryName?: string;
}

const formatLabel = (value: string) => {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const AgencyContent = ({ agency, relatedAgencies, categoryName }: AgencyContentProps) => {
  const { data: contacts = [] } = useAgencyContacts(agency.id);
  const { data: resources = [] } = useAgencyResources(agency.id);

  const legacyContacts = parseJsonArray(agency.contact_persons);
  const allContacts = contacts.length > 0 ? contacts : legacyContacts;
  const siteUrl = agency.website_url || agency.website;
  const contactEmail = agency.email || agency.contact;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">About</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {agency.description_full || agency.basic_info || agency.description}
            </p>
          </section>

          {/* Why Work With Us */}
          {agency.why_work_with_us && (
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Why Work With Us</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {agency.why_work_with_us}
              </p>
            </section>
          )}

          {/* Services / Support Types */}
          {agency.services && agency.services.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Services & Support</h2>
              <div className="flex flex-wrap gap-2">
                {agency.services.map((service) => (
                  <Badge key={service} variant="secondary" className="text-sm px-3 py-1">
                    {service}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Support Types (from new column) */}
          {agency.support_types && agency.support_types.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Types of Support</h2>
              <div className="flex flex-wrap gap-2">
                {agency.support_types.map((type) => (
                  <Badge key={type} variant="outline" className="text-sm px-3 py-1">
                    {formatLabel(type)}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Sectors Supported */}
          {agency.sectors_supported && agency.sectors_supported.length > 0 && agency.sectors_supported[0] !== 'all' && (
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Sectors Supported</h2>
              <div className="flex flex-wrap gap-2">
                {agency.sectors_supported.map((sector) => (
                  <Badge key={sector} variant="outline" className="text-sm px-3 py-1">
                    {formatLabel(sector)}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Jurisdiction */}
          {agency.jurisdiction && agency.jurisdiction.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Jurisdiction</h2>
              <div className="flex flex-wrap gap-2">
                {agency.jurisdiction.map((region) => (
                  <Badge key={region} variant="outline" className="text-sm px-3 py-1">
                    {formatLabel(region)}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Resources / Grants */}
          {resources.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Resources & Programs</h2>
              <div className="space-y-3">
                {resources.map((resource: any) => (
                  <div key={resource.id} className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">{resource.title}</h3>
                        {resource.description && (
                          <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                        )}
                        {resource.max_value_aud && (
                          <p className="text-sm text-green-600 font-medium mt-1">
                            Up to ${resource.max_value_aud.toLocaleString()} AUD
                          </p>
                        )}
                      </div>
                      {resource.url && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Learn More
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Contact Persons */}
          {allContacts.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Team</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allContacts.map((person: any, index: number) => (
                  <div key={person.id || index} className="flex items-center gap-4 bg-muted/50 rounded-lg p-4">
                    <Avatar className="w-14 h-14">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {(person.full_name || person.name || '')
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-foreground">{person.full_name || person.name}</div>
                      {(person.title || person.role) && (
                        <div className="text-sm text-muted-foreground">{person.title || person.role}</div>
                      )}
                      {person.linkedin_url && (
                        <a
                          href={person.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                        >
                          <Linkedin className="w-3 h-3" />
                          LinkedIn
                        </a>
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
              {categoryName && (
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>{categoryName}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>{agency.location}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>Founded {agency.founded}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>{agency.employees} employees</span>
              </div>
              {siteUrl && (
                <div className="flex items-center gap-3 text-sm">
                  <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <a
                    href={siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate"
                  >
                    {siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </a>
                </div>
              )}
              {contactEmail && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <a href={`mailto:${contactEmail}`} className="text-primary hover:underline truncate">
                    {contactEmail}
                  </a>
                </div>
              )}
              {agency.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <a href={`tel:${agency.phone}`} className="text-primary hover:underline">
                    {agency.phone}
                  </a>
                </div>
              )}
              {agency.linkedin_url && (
                <div className="flex items-center gap-3 text-sm">
                  <Linkedin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <a
                    href={agency.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    LinkedIn
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Funding & Access */}
          {(agency.is_government_funded || agency.is_free_to_access || agency.grants_available || agency.membership_required) && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Funding & Access</h3>
              <div className="space-y-3">
                {agency.is_government_funded && (
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Government Funded</span>
                  </div>
                )}
                {agency.is_free_to_access && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-600 font-medium">Free to access</span>
                  </div>
                )}
                {agency.grants_available && (
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>
                      Grants Available
                      {agency.max_grant_aud && ` (up to $${agency.max_grant_aud.toLocaleString()})`}
                    </span>
                  </div>
                )}
                {agency.membership_required && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Membership required</span>
                    {agency.membership_fee_aud && (
                      <span className="text-muted-foreground"> — ${agency.membership_fee_aud.toLocaleString()}/yr</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Services Quick View */}
          {agency.services && agency.services.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Services</h3>
              <div className="flex flex-wrap gap-1.5">
                {agency.services.slice(0, 6).map((service) => (
                  <Badge key={service} variant="outline" className="text-xs">
                    {service}
                  </Badge>
                ))}
                {agency.services.length > 6 && (
                  <Badge variant="outline" className="text-xs">
                    +{agency.services.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Target Audience */}
          {agency.target_company_origin && agency.target_company_origin.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Who Is This For?</h3>
              <div className="flex flex-wrap gap-1.5">
                {agency.target_company_origin.map((origin) => (
                  <Badge key={origin} variant="outline" className="text-xs">
                    {formatLabel(origin)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Organisations */}
      {relatedAgencies && relatedAgencies.length > 0 && (
        <section className="mt-12 pt-8 border-t">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Related Organisations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedAgencies.map((related: any) => (
              <CompanyCard
                key={related.id}
                company={{
                  id: related.id,
                  name: related.name,
                  description: related.description,
                  location: related.location,
                  founded: related.founded,
                  employees: related.employees,
                  services: related.services || [],
                  website: related.website_url || related.website,
                  contact: related.email || related.contact,
                  logo: related.logo,
                  basic_info: related.basic_info,
                  why_work_with_us: related.why_work_with_us,
                  contact_persons: [],
                  experience_tiles: []
                }}
                detailUrl={`/government-support/${related.slug || related.id}`}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
