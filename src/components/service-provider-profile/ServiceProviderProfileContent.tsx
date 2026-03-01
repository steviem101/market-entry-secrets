import { Badge } from "@/components/ui/badge";
import { Company } from "@/components/CompanyCard";
import { parseJsonArray, getExperienceTileImage, getContactPersonImage } from "@/components/company-card/CompanyCardHelpers";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ServiceProviderReviews } from "./ServiceProviderReviews";
import { ServiceProviderSidebar } from "./ServiceProviderSidebar";

interface Review {
  id: string;
  reviewer_name: string;
  reviewer_company: string | null;
  reviewer_country: string | null;
  rating: number;
  title: string | null;
  review_text: string | null;
  is_verified: boolean;
  created_at: string;
}

interface Contact {
  id: string;
  full_name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  avatar_url: string | null;
  is_primary: boolean;
}

interface ServiceProviderProfileContentProps {
  provider: Company;
  reviews: Review[];
  contacts: Contact[];
  relatedProviders: Company[];
}

export const ServiceProviderProfileContent = ({
  provider,
  reviews,
  contacts,
  relatedProviders,
}: ServiceProviderProfileContentProps) => {
  const experienceTiles = parseJsonArray(provider.experience_tiles || provider.experienceTiles || []);
  const contactPersons = parseJsonArray(provider.contact_persons || provider.contactPersons || []);

  // Use junction table contacts first, fall back to JSONB contact_persons
  const displayContacts = contacts.length > 0 ? contacts : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">About</h2>
            <p className="text-muted-foreground whitespace-pre-line">{provider.description}</p>
          </section>

          {/* Why Work With Us */}
          {provider.why_work_with_us && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Why Work With Us</h2>
              <p className="text-muted-foreground whitespace-pre-line">{provider.why_work_with_us}</p>
            </section>
          )}

          {/* Services & Specialties */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Services & Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {provider.services.map((service) => (
                <Badge key={service} variant="secondary" className="text-sm py-1 px-3">
                  {service}
                </Badge>
              ))}
            </div>
          </section>

          {/* Sectors */}
          {provider.sectors && provider.sectors.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Sectors</h2>
              <div className="flex flex-wrap gap-2">
                {provider.sectors.map((sector) => (
                  <Badge key={sector} variant="secondary" className="text-sm py-1 px-3 bg-blue-50 text-blue-700">
                    {sector}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Experience Tiles */}
          {experienceTiles.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Experience With</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {experienceTiles.map((tile, index) => (
                  <div
                    key={tile.id}
                    className="bg-white border rounded-lg p-3 flex flex-col items-center gap-2"
                  >
                    <img
                      src={tile.logo || getExperienceTileImage(index)}
                      alt={tile.name}
                      className="w-12 h-12 object-contain"
                    />
                    <span className="text-xs text-center text-muted-foreground truncate w-full">
                      {tile.name}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Contact Persons (from JSONB, if no junction table contacts) */}
          {contacts.length === 0 && contactPersons.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Persons</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contactPersons.map((person, index) => (
                  <div key={person.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={person.image || getContactPersonImage(index)} alt={person.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {person.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{person.name}</p>
                      {person.role && (
                        <p className="text-sm text-muted-foreground">{person.role}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
            <ServiceProviderReviews reviews={reviews} />
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <ServiceProviderSidebar
            provider={provider}
            contacts={displayContacts}
            relatedProviders={relatedProviders}
          />
        </div>
      </div>
    </div>
  );
};
