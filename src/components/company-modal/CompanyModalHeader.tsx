
import { MapPin, Users, Calendar } from "lucide-react";
import { DialogTitle } from "@/components/ui/dialog";
import { BookmarkButton } from "@/components/BookmarkButton";
import { Company } from "../CompanyCard";

interface CompanyModalHeaderProps {
  company: Company;
}

export const CompanyModalHeader = ({ company }: CompanyModalHeaderProps) => {
  return (
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
  );
};
