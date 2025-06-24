
import { Calendar, Users, Globe, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Company } from "@/components/CompanyCard";

interface CompanyCardFooterProps {
  company: Company;
  onViewProfile: (company: Company) => void;
  onContact: (company: Company) => void;
}

const CompanyCardFooter = ({ company, onViewProfile, onContact }: CompanyCardFooterProps) => {
  return (
    <>
      <div className="grid grid-cols-3 gap-4 mb-4 text-xs text-muted-foreground">
        <div className="flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          <span className="truncate">{company.founded}</span>
        </div>
        <div className="flex items-center">
          <Users className="w-3 h-3 mr-1" />
          <span className="truncate">{company.employees}</span>
        </div>
        {company.website && (
          <div className="flex items-center">
            <Globe className="w-3 h-3 mr-1" />
            <span className="truncate">Website</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewProfile(company)}
          className="flex-1"
        >
          View Profile
        </Button>
        <Button
          size="sm"
          onClick={() => onContact(company)}
          className="flex-1"
        >
          <Phone className="w-4 h-4 mr-1" />
          Contact
        </Button>
      </div>
    </>
  );
};

export default CompanyCardFooter;
