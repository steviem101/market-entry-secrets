import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { LeadCard } from "@/components/LeadCard";
import { LeadsHero } from "@/components/leads/LeadsHero";
import { LeadPreviewModal } from "@/components/leads/LeadPreviewModal";
import { DirectoryFilterBar, type FilterOption, type SelectFilterConfig } from "@/components/common/DirectoryFilterBar";
import { ListPagination } from "@/components/common/ListPagination";
import { EmptyState } from "@/components/common/EmptyState";
import { TrendingUp } from "lucide-react";
import { useLeadCheckout } from "@/hooks/useLeadCheckout";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { ListingPageGate } from "@/components/ListingPageGate";
import { UsageBanner } from "@/components/UsageBanner";
import { getStandardTypes } from "@/utils/sectorMapping";
import { useLeadDatabases, useLeadDatabaseStats } from "@/hooks/useLeadDatabases";
import { useDirectoryFilters } from "@/hooks/useDirectoryFilters";
import type { FilterSpec } from "@/lib/directoryFilters";
import { filterAndSortLeads } from "@/lib/leadFilters";
import { curateValues } from "@/lib/filterCuration";
import { sectorLabel } from "@/lib/sectorLabels";
import type { LeadDatabase } from "@/types/leadDatabase";

const PAGE_SIZE = 12;

const LEAD_FILTER_SPEC: FilterSpec = {
  search: { param: "search", default: "" },
  type: { param: "type", default: "all" },
  location: { param: "location", default: "all" },
  sector: { param: "sector", default: "all" },
  sort: { param: "sort", default: "newest", presentation: true },
};

const SORT_OPTIONS: FilterOption[] = [
  { value: "newest", label: "Newest" },
  { value: "most_records", label: "Most Records" },
];

const Leads = () => {
  const { startLeadCheckout } = useLeadCheckout();
  const { data: leadDatabases, isLoading, error } = useLeadDatabases();
  const { data: stats } = useLeadDatabaseStats();

  // MES-177 C1: the sector facet is canonical `sector_tags` (friendly labels via the
  // shared map); stale/case-variant ?sector= coerces to "all" against the curated
  // options so it never renders a phantom option or an empty grid.
  const sectorOptions = useMemo(
    () => curateValues((leadDatabases ?? []).flatMap((l) => l.sector_tags || []), { labelFor: sectorLabel }),
    [leadDatabases]
  );
  const allowedValues = useMemo(
    () => ({ sector: sectorOptions.map((o) => o.value) }),
    [sectorOptions]
  );
  const { filters, page, setFilter, setPage, clearAll, hasActiveFilters } =
    useDirectoryFilters(LEAD_FILTER_SPEC, { allowedValues });
  const [previewLead, setPreviewLead] = useState<LeadDatabase | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const sortedLeads = useMemo(
    () => (leadDatabases ? filterAndSortLeads(leadDatabases, filters) : []),
    [leadDatabases, filters]
  );

  const totalPages = Math.ceil(sortedLeads.length / PAGE_SIZE);
  const paginatedLeads = sortedLeads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // MES-130: popularity-ranked, zero-hidden location options; the long tail is searchable.
  const locationOptions = useMemo(
    () => curateValues((leadDatabases ?? []).map((l) => l.location)),
    [leadDatabases]
  );

  const countsByType = stats?.countsByType ?? {};
  // Data-driven type tabs: show the curated types in their canonical order, then
  // append any list_type value that exists in the data but isn't in the standard
  // list — so a new DB type surfaces instead of being silently dropped (MES-100).
  const typeValues = useMemo(() => {
    const known = getStandardTypes.leads;
    const inData = Object.keys(countsByType);
    return [
      ...known.filter((t) => inData.includes(t)),
      ...inData.filter((t) => !known.includes(t)).sort(),
    ];
  }, [countsByType]);
  const typeTabs: FilterOption[] = [
    { value: "all", label: "All", count: stats?.totalDatabases ?? leadDatabases?.length ?? 0 },
    ...typeValues.map((t) => ({ value: t, label: t, count: countsByType[t] ?? 0 })),
  ];

  const selects: SelectFilterConfig[] = [
    { key: "location", allLabel: "All Locations", options: locationOptions },
    { key: "sector", allLabel: "All Sectors", options: sectorOptions, searchable: true },
  ];

  const handleCheckout = async (lead: LeadDatabase) => {
    const result = await startLeadCheckout(lead);
    if (result.needsAuth) setShowAuthDialog(true);
  };

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
        <title>B2B Lead Databases for Australian Market Entry</title>
        <meta
          name="description"
          content="Pre-verified B2B contact lists for the sectors you're entering. Lead databases, market data, and TAM maps — updated monthly."
        />
        <meta property="og:title" content="B2B Lead Databases for Australian Market Entry" />
        <meta
          property="og:description"
          content="Pre-verified B2B contact lists for the sectors you're entering. Lead databases, market data, and TAM maps — updated monthly."
        />
        <meta property="og:url" content="https://marketentrysecrets.com/leads" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://marketentrysecrets.com/leads" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "B2B Lead Databases for Australian Market Entry",
            description:
              "Directory of pre-verified B2B contact lists, market data, and TAM maps for companies entering the Australian and ANZ market.",
            url: "https://marketentrysecrets.com/leads",
            mainEntity: {
              "@type": "ItemList",
              name: "Lead Databases",
              numberOfItems: sortedLeads.length,
              itemListElement: paginatedLeads.map((lead, i) => ({
                "@type": "ListItem",
                position: (page - 1) * PAGE_SIZE + i + 1,
                name: lead.title,
                url: `https://marketentrysecrets.com/leads/${lead.slug}`,
              })),
            },
          })}
        </script>
      </Helmet>

      <LeadsHero
        totalDatabases={stats?.totalDatabases || 0}
        totalRecords={stats?.totalRecords || 0}
        countsByType={stats?.countsByType || {}}
      />

      <DirectoryFilterBar
        filters={filters}
        onFilterChange={setFilter}
        onClearAll={clearAll}
        hasActiveFilters={hasActiveFilters}
        noun="lead databases"
        shownCount={paginatedLeads.length}
        totalCount={sortedLeads.length}
        tabs={{ key: "type", options: typeTabs }}
        search={{ key: "search", placeholder: "Search lead databases, sectors, or tags..." }}
        selects={selects}
        sort={{ key: "sort", options: SORT_OPTIONS }}
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
              <ListingPageGate contentType="leads">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {paginatedLeads.map(lead => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onPreview={setPreviewLead}
                      onCheckout={handleCheckout}
                    />
                  ))}
                </div>
              </ListingPageGate>
              <ListPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          ) : (
            <EmptyState
              icon={<TrendingUp className="w-16 h-16" />}
              title="No lead databases found"
              description="Try adjusting your search criteria or filters"
              actionLabel={hasActiveFilters ? "Clear all filters" : undefined}
              onAction={hasActiveFilters ? clearAll : undefined}
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
