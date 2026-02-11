
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import CompanyCard from "@/components/CompanyCard";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useAuth } from "@/hooks/useAuth";
import { PaywallModal } from "@/components/PaywallModal";

interface TradeInvestmentAgenciesResultsProps {
  filteredAgencies: any[] | undefined;
  isLoading: boolean;
  onViewProfile: (agency: any) => void;
  onContact: (agency: any) => void;
  onClearFilters: () => void;
  parseJsonArray: (jsonData: any) => any[];
}

const TradeInvestmentAgenciesResults = ({
  filteredAgencies,
  isLoading,
  onViewProfile,
  onContact,
  onClearFilters,
  parseJsonArray
}: TradeInvestmentAgenciesResultsProps) => {
  const { user, loading: authLoading } = useAuth();
  const { hasReachedLimit } = useUsageTracking();

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

  if (!filteredAgencies || filteredAgencies.length === 0) {
    return (
      <section className="py-8">
        <div className="text-center py-16">
          <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium text-foreground mb-2">No agencies found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search criteria or filters
          </p>
          <Button onClick={onClearFilters} variant="outline">
            Clear all filters
          </Button>
        </div>
      </section>
    );
  }

  // Limit to 3 items for non-authenticated users
  const displayedAgencies = user ? filteredAgencies : filteredAgencies.slice(0, 3);

  if (!authLoading && hasReachedLimit && !user) {
    return <PaywallModal contentType="trade_investment_agencies" />;
  }

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-foreground">
          {filteredAgencies.length} Agenc{filteredAgencies.length !== 1 ? 'ies' : 'y'} Found
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedAgencies.map((agency, index) => (
          <CompanyCard
            key={agency.id}
            company={{
              id: agency.id,
              name: agency.name,
              description: agency.description,
              location: agency.location,
              founded: agency.founded,
              employees: agency.employees,
              services: agency.services,
              website: agency.website,
              contact: agency.contact,
              logo: agency.logo,
              basic_info: agency.basic_info,
              why_work_with_us: agency.why_work_with_us,
              contact_persons: parseJsonArray(agency.contact_persons),
              experience_tiles: parseJsonArray(agency.experience_tiles)
            }}
            onViewProfile={() => onViewProfile(agency)}
            onContact={() => onContact(agency)}
          />
        ))}
      </div>
    </section>
  );
};

export default TradeInvestmentAgenciesResults;
