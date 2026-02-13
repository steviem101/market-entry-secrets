import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import CompanyCard from "@/components/CompanyCard";
import { useAuth } from "@/hooks/useAuth";
import { parseJsonArray } from "@/components/company-card/CompanyCardHelpers";

interface InnovationEcosystemResultsProps {
  filteredOrganizations: any[] | undefined;
  isLoading: boolean;
  onClearFilters: () => void;
}

const InnovationEcosystemResults = ({
  filteredOrganizations,
  isLoading,
  onClearFilters,
}: InnovationEcosystemResultsProps) => {
  const { user } = useAuth();

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (!filteredOrganizations || filteredOrganizations.length === 0) {
    return (
      <section className="py-8">
        <div className="text-center py-16">
          <Lightbulb className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium text-foreground mb-2">No organizations found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search criteria or filters
          </p>
          <Button
            onClick={onClearFilters}
            variant="outline"
          >
            Clear all filters
          </Button>
        </div>
      </section>
    );
  }

  // Limit to 3 items for non-authenticated users
  const displayedOrganizations = user ? filteredOrganizations : filteredOrganizations.slice(0, 3);

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-foreground">
          {filteredOrganizations.length} Innovator{filteredOrganizations.length !== 1 ? 's' : ''} Found
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedOrganizations.map((org) => (
          <CompanyCard
            key={org.id}
            company={{
              id: org.id,
              name: org.name,
              description: org.description,
              location: org.location,
              founded: org.founded,
              employees: org.employees,
              services: org.services,
              website: org.website,
              contact: org.contact,
              logo: org.logo,
              basic_info: org.basic_info,
              why_work_with_us: org.why_work_with_us,
              contact_persons: parseJsonArray(org.contact_persons),
              experience_tiles: parseJsonArray(org.experience_tiles)
            }}
            detailUrl={`/innovation-ecosystem/${org.id}`}
          />
        ))}
      </div>
      {!user && filteredOrganizations.length > 3 && (
        <div className="text-center mt-8 py-6 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground mb-2">
            Sign in to see all {filteredOrganizations.length} organizations
          </p>
        </div>
      )}
    </section>
  );
};

export default InnovationEcosystemResults;
