import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { LeadCard } from "@/components/LeadCard";
import { LeadsHero } from "@/components/leads/LeadsHero";
import { LeadPreviewModal } from "@/components/leads/LeadPreviewModal";
import { StandardDirectoryFilters } from "@/components/common/StandardDirectoryFilters";
import { ListPagination } from "@/components/common/ListPagination";
import { EmptyState } from "@/components/common/EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp } from "lucide-react";
import { useLeadCheckout } from "@/hooks/useLeadCheckout";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { ListingPageGate } from "@/components/ListingPageGate";
import { UsageBanner } from "@/components/UsageBanner";
import { getStandardTypes } from "@/utils/sectorMapping";
import { useLeadDatabases, useLeadDatabaseStats } from "@/hooks/useLeadDatabases";
import type { LeadDatabase } from "@/types/leadDatabase";

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'most_records', label: 'Most Records' },
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
    case 'price_low_high':
      return sorted.sort((a, b) => (a.price_aud || 0) - (b.price_aud || 0));
    case 'price_high_low':
      return sorted.sort((a, b) => (b.price_aud || 0) - (a.price_aud || 0));
    default:
      return sorted;
  }
};

const Leads = () => {
  const { startLeadCheckout, loading: checkoutLoading } = useLeadCheckout();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") ?? "");
  const [selectedType, setSelectedType] = useState<string>(searchParams.get("type") ?? "all");
  const [selectedLocation, setSelectedLocation] = useState<string>(searchParams.get("location") ?? "all");
  const [selectedSector, setSelectedSector] = useState<string>(searchParams.get("sector") ?? "all");
  const [selectedSort, setSelectedSort] = useState<string>(searchParams.get("sort") ?? "newest");
  const [showFilters, setShowFilters] = useState(false);
  const [previewLead, setPreviewLead] = useState<LeadDatabase | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);

  useEffect(() => {
    const p = new URLSearchParams();
    if (searchTerm) p.set("search", searchTerm);
    if (selectedType !== "all") p.set("type", selectedType);
    if (selectedLocation !== "all") p.set("location", selectedLocation);
    if (selectedSector !== "all") p.set("sector", selectedSector);
    if (selectedSort !== "newest") p.set("sort", selectedSort);
    if (currentPage > 1) p.set("page", String(currentPage));
    setSearchParams(p, { replace: true });
  }, [searchTerm, selectedType, selectedLocation, selectedSector, selectedSort, currentPage, setSearchParams]);

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

  const totalPages = Math.ceil(sortedLeads.length / PAGE_SIZE);
  const paginatedLeads = sortedLeads.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const types = getStandardTypes.leads;
  const locations = Array.from(new Set(leadDatabases?.map(lead => lead.location).filter(Boolean) as string[] || []));
  const sectors = Array.from(new Set(leadDatabases?.map(lead => lead.sector).filter(Boolean) as string[] || [])).sort();

  const handleClearFilters = () => {
    setSelectedType("all");
    setSelectedLocation("all");
    setSelectedSector("all");
    setSearchTerm("");
    setSelectedSort("newest");
    setCurrentPage(1);
  };

  const handlePreview = (lead: LeadDatabase) => {
    setPreviewLead(lead);
  };

  const handleCheckout = async (lead: LeadDatabase) => {
    const result = await startLeadCheckout(lead);
    if (result.needsAuth) {
      setShowAuthDialog(true);
    }
  };

  const hasActiveFilters = selectedType !== "all" || selectedLocation !== "all" ||
    selectedSector !== "all" || searchTerm !== "";

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          Error loading lead databases: {(error as Error).message}
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>B2B Lead Databases — Find Your First Customers | Market Entry Secrets</title>
        <meta
          name="description"
          content="Pre-verified B2B contact lists for the sectors you're entering. Lead databases, market data, and TAM maps — updated monthly."
        />
      </Helmet>

      <LeadsHero
        totalDatabases={stats?.totalDatabases || 0}
        totalRecords={stats?.totalRecords || 0}
        countsByType={stats?.countsByType || {}}
      />

      <StandardDirectoryFilters
        searchTerm={searchTerm}
        onSearchChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
        selectedLocation={selectedLocation}
        onLocationChange={(v) => { setSelectedLocation(v); setCurrentPage(1); }}
        selectedType={selectedType}
        onTypeChange={(v) => { setSelectedType(v); setCurrentPage(1); }}
        selectedSector={selectedSector}
        onSectorChange={(v) => { setSelectedSector(v); setCurrentPage(1); }}
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

        <section className="py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : sortedLeads.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-foreground">
                  Showing {paginatedLeads.length} of {sortedLeads.length} Database{sortedLeads.length !== 1 ? 's' : ''}
                </h2>
                <div className="w-48">
                  <Select value={selectedSort} onValueChange={(v) => { setSelectedSort(v); setCurrentPage(1); }}>
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
              <ListingPageGate contentType="leads">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {paginatedLeads.map(lead => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onPreview={handlePreview}
                      onCheckout={handleCheckout}
                    />
                  ))}
                </div>
              </ListingPageGate>
              <ListPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <EmptyState
              icon={<TrendingUp className="w-16 h-16" />}
              title="No lead databases found"
              description="Try adjusting your search criteria or filters"
              actionLabel="Clear all filters"
              onAction={handleClearFilters}
            />
          )}
        </section>
      </div>

      {previewLead && (
        <LeadPreviewModal
          open={!!previewLead}
          onOpenChange={(open) => { if (!open) setPreviewLead(null); }}
          lead={previewLead}
          onCheckout={() => {
            setPreviewLead(null);
            handleCheckout(previewLead);
          }}
        />
      )}

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
      />
    </>
  );
};

export default Leads;
