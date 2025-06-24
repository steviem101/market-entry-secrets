
import { Calendar, Users, Globe, ExternalLink } from "lucide-react";
import { Company } from "../CompanyCard";

interface CompanyModalDetailsProps {
  company: Company;
}

export const CompanyModalDetails = ({ company }: CompanyModalDetailsProps) => {
  return (
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
  );
};
