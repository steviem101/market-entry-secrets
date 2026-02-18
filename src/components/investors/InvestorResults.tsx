import { Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import InvestorCard from "./InvestorCard";
import { useAuth } from "@/hooks/useAuth";

interface InvestorResultsProps {
  filteredInvestors: any[] | undefined;
  isLoading: boolean;
  onClearFilters: () => void;
}

const InvestorResults = ({
  filteredInvestors,
  isLoading,
  onClearFilters,
}: InvestorResultsProps) => {
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

  if (!filteredInvestors || filteredInvestors.length === 0) {
    return (
      <section className="py-8">
        <div className="text-center py-16">
          <Landmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium text-foreground mb-2">No investors found</h3>
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

  const displayedInvestors = user ? filteredInvestors : filteredInvestors.slice(0, 3);

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-foreground">
          {filteredInvestors.length} Investor{filteredInvestors.length !== 1 ? 's' : ''} Found
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedInvestors.map((investor) => (
          <InvestorCard key={investor.id} investor={investor} />
        ))}
      </div>
      {!user && filteredInvestors.length > 3 && (
        <div className="text-center mt-8 py-6 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground mb-2">
            Sign in to see all {filteredInvestors.length} investors
          </p>
        </div>
      )}
    </section>
  );
};

export default InvestorResults;
