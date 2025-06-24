
import { Json } from "@/integrations/supabase/types";
import CompanyCardHeader from "./company-card/CompanyCardHeader";
import CompanyCardContent from "./company-card/CompanyCardContent";
import CompanyCardFooter from "./company-card/CompanyCardFooter";

export interface ContactPerson {
  id: string;
  name: string;
  image?: string;
  role?: string;
}

export interface ExperienceTile {
  id: string;
  name: string;
  logo: string;
}

export interface Company {
  id: string;
  name: string;
  description: string;
  location: string;
  founded: string;
  employees: string;
  services: string[];
  website?: string;
  contact?: string;
  logo?: string;
  basic_info?: string;
  why_work_with_us?: string;
  contact_persons?: ContactPerson[] | Json;
  experience_tiles?: ExperienceTile[] | Json;
  experienceTiles?: ExperienceTile[];
  contactPersons?: ContactPerson[];
}

interface CompanyCardProps {
  company: Company;
  onViewProfile: (company: Company) => void;
  onContact: (company: Company) => void;
}

const CompanyCard = ({ company, onViewProfile, onContact }: CompanyCardProps) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CompanyCardHeader company={company} />
      <CompanyCardContent company={company} />
      <CompanyCardFooter 
        company={company} 
        onViewProfile={onViewProfile} 
        onContact={onContact} 
      />
    </div>
  );
};

export default CompanyCard;
