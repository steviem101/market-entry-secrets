
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Company } from "../CompanyCard";

interface CompanyModalSectionsProps {
  company: Company;
  experienceTiles: any[];
  contactPersons: any[];
  getExperienceTileImage: (index: number) => string;
  getContactPersonImage: (index: number) => string;
}

export const CompanyModalSections = ({ 
  company, 
  experienceTiles, 
  contactPersons, 
  getExperienceTileImage, 
  getContactPersonImage 
}: CompanyModalSectionsProps) => {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Basic Info</h3>
        <p className="text-muted-foreground leading-relaxed">
          {company.basic_info || company.description}
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Why work with us</h3>
        <p className="text-muted-foreground leading-relaxed">
          {company.why_work_with_us || `At ${company.name}, we streamline business solutions, 
          enabling brands to connect globally through our unique and cost-effective platform. Partnering with us 
          helps brands connect with clients who align with their values, elevating visibility, building trust, 
          and enhancing growth through authentic engagement.`}
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

      {experienceTiles && experienceTiles.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-3">Working with</h3>
          <div className="flex flex-wrap gap-3">
            {experienceTiles.map((tile, index) => (
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

      {contactPersons && contactPersons.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-3">Contact person(s)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contactPersons.map((person, index) => (
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
    </div>
  );
};
