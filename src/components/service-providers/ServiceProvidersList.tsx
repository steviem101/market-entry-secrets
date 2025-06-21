
import { Grid3X3 } from "lucide-react";
import CompanyCard, { Company } from "@/components/CompanyCard";
import { FreemiumGate } from "../FreemiumGate";

interface ServiceProvidersListProps {
  companies: Company[];
  onViewProfile: (company: Company) => void;
  onContact: (company: Company) => void;
}

export const ServiceProvidersList = ({
  companies,
  onViewProfile,
  onContact
}: ServiceProvidersListProps) => {
  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <Grid3X3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No service providers found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search criteria or filters to find more providers.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {companies.map((company) => (
        <FreemiumGate
          key={company.id}
          contentType="service_providers"
          itemId={company.id}
          contentTitle={company.name}
          contentDescription={company.description}
        >
          <CompanyCard
            company={company}
            onViewProfile={onViewProfile}
            onContact={onContact}
          />
        </FreemiumGate>
      ))}
    </div>
  );
};
