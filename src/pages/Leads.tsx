import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { LeadCard } from "@/components/LeadCard";
import { LeadsHero } from "@/components/leads/LeadsHero";
import { StandardDirectoryFilters } from "@/components/common/StandardDirectoryFilters";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp } from "lucide-react";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useAuth } from "@/hooks/useAuth";
import { PaywallModal } from "@/components/PaywallModal";
import { UsageBanner } from "@/components/UsageBanner";
import { getStandardTypes } from "@/utils/sectorMapping";
import { useLeadDatabases, useLeadDatabaseStats } from "@/hooks/useLeadDatabases";
import type { LeadDatabase } from "@/types/leadDatabase";

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'most_records', label: 'Most Records' },
  { value: 'highest_quality', label: 'Highest Quality' },
  { value: 'price_low_high', label: 'Price: Low to High' },
  { value: 'price_high_low', label: 'Price: High to Low' },
];

const sortLeads = (leads: LeadDatabase[], sortBy: string): LeadDatabase[] => {
  const sorted = [...leads];
  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    case 'most_records':
      return sorted.sort((a, b) => (b.record_count || 0) - (a.record_count || 0));
    case 'highest_quality':
      return sorted.sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0));
    case 'price_low_high':
      return sorted.sort((a, b) => (a.price_aud || 0) - (b.price_aud || 0));
    case 'price_high_low':
      return sorted.sort((a, b) => (b.price_aud || 0) - (a.price_aud || 0));
    default:
      return sorted;
  }
};

const Leads = () => {
  const { user, loading: authLoading } = useAuth();
  const { hasReachedLimit } = useUsageTracking();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("newest");
  const [showFilters, setShowFilters] = useState(false);

  const { data: leadDatabases, isLoading, error } = useLeadDatabases();
  const { data: stats } = useLeadDatabaseStats();

  const filteredLeads = leadDatabases?.filter(lead => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      lead.title.toLowerCase().includes(searchLower) ||
      (lead.description || '').toLowerCase().includes(searchLower) ||
      (lead.short_description || '').toLowerCase().includes(searchLower) ||
      lead.tags?.some(tag => tag.toLowerCase().includes(searchLower));
    const matchesType = selectedType === "all" || lead.list_type === selectedType;
    const matchesLocation = selectedLocation === "all" || lead.location === selectedLocation;
    const matchesSector = selectedSector === "all" || lead.sector === selectedSector;
    return matchesSearch && matchesType && matchesLocation && matchesSector;
  });

  const sortedLeads = filteredLeads ? sortLeads(filteredLeads, selectedSort) : [];

  const types = getStandardTypes.leads;
  const locations = Array.from(new Set(leadDatabases?.map(lead => lead.location).filter(Boolean) as string[] || []));
  const sectors = Array.from(new Set(leadDatabases?.map(lead => lead.sector).filter(Boolean) as string[] || [])).sort();

  const handleClearFilters = () => {
    setSelectedType("all");
    setSelectedLocation("all");
    setSelectedSector("all");
    setSearchTerm("");
    setSelectedSort("newest");
  };

  const hasActiveFilters = selectedType !== "all" || selectedLocation !== "all" ||
    selectedSector !== "all" || searchTerm !== "";

  if (error) {
    return (
      <>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">
            Error loading lead databases: {(error as Error).message}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Sales Leads & Market Intelligence | Market Entry Secrets</title>
        <meta
          name="description"
          content="Access premium lead databases, market data, and TAM maps to accelerate your Australian market entry and sales strategy."
        />
      </Helmet>

      <LeadsHero
        totalDatabases={stats?.totalDatabases || 0}
        totalRecords={stats?.totalRecords || 0}
        countsByType={stats?.countsByType || {}}
      />

      <StandardDirectoryFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedSector={selectedSector}
        onSectorChange={setSelectedSector}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        locations={locations}
        types={types}
        sectors={sectors}
        searchPlaceholder="Search lead databases, sectors, or tags..."
      />

      <div className="container mx-auto px-4 py-8">
        <UsageBanner />

        {/* Results */}
        <section className="py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : !authLoading && hasReachedLimit && !user ? (
            <PaywallModal contentType="leads" />
          ) : sortedLeads && sortedLeads.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-foreground">
                  {sortedLeads.length} Database{sortedLeads.length !== 1 ? 's' : ''} Available
                </h2>
                <div className="w-48">
                  <Select value={selectedSort} onValueChange={setSelectedSort}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedLeads.map(lead => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">No lead databases found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or filters
              </p>
              <Button onClick={handleClearFilters} variant="outline">
                Clear all filters
              </Button>
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default Leads;
