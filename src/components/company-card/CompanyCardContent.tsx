
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Company } from "@/components/CompanyCard";
import { parseJsonArray, getExperienceTileImage, getContactPersonImage } from "./CompanyCardHelpers";

interface CompanyCardContentProps {
  company: Company;
}

const CompanyCardContent = ({ company }: CompanyCardContentProps) => {
  // Use the correct property names from the database with proper parsing
  const experienceTiles = parseJsonArray(company.experience_tiles || company.experienceTiles || []);
  const contactPersons = parseJsonArray(company.contact_persons || company.contactPersons || []);

  return (
    <>
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
    </>
  );
};

export default CompanyCardContent;
