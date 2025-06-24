
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Company } from "../CompanyCard";

interface CompanyModalFooterProps {
  company: Company;
  onClose: () => void;
  onContact: (company: Company) => void;
}

export const CompanyModalFooter = ({ company, onClose, onContact }: CompanyModalFooterProps) => {
  return (
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
  );
};
