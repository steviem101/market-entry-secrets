import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { TradeInvestmentAgenciesHero } from "@/components/trade-investment-agencies/TradeInvestmentAgenciesHero";
import TradeInvestmentAgenciesResults from "@/components/trade-investment-agencies/TradeInvestmentAgenciesResults";
import { DirectoryFilterBar, type FilterOption, type SelectFilterConfig } from "@/components/common/DirectoryFilterBar";
import { ListPagination } from "@/components/common/ListPagination";
import { UsageBanner } from "@/components/UsageBanner";
import { useTradeAgencies, useOrganisationCategories } from "@/hooks/useTradeAgencies";
import { useDirectoryFilters } from "@/hooks/useDirectoryFilters";
import type { FilterSpec } from "@/lib/directoryFilters";
import { filterAgencies } from "@/lib/agencyFilters";
import { humanizeSlug } from "@/lib/humanizeSlug";
import { curateValues } from "@/lib/filterCuration";
import { publishedOrigin } from "@/lib/publishedOrigin";

const PAGE_SIZE = 12;

const AGENCY_FILTER_SPEC: FilterSpec = {
  search: { param: "search", default: "" },
  category: { param: "category", default: "all" },
  location: { param: "location", default: "all" },
  type: { param: "type", default: "all" },
  sector: { param: "sector", default: "all" },
};

const TradeInvestmentAgencies = () => {
  const { filters, page, setFilter, setPage, clearAll, hasActiveFilters } =
    useDirectoryFilters(AGENCY_FILTER_SPEC);

  const { data: agencies, isLoading, error } = useTradeAgencies();
  const { data: categories = [] } = useOrganisationCategories();

  const filteredAgencies = useMemo(
    () => (agencies ? filterAgencies(agencies, filters) : []),
    [agencies, filters]
  );

  const totalPages = Math.ceil(filteredAgencies.length / PAGE_SIZE);
  const paginatedAgencies = filteredAgencies.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // MES-130: popularity-ranked, zero-hidden; long location/sector tails searchable.
  const locationOptions = useMemo(
    () => curateValues((agencies ?? []).map((a) => a.location)),
    [agencies]
  );
  const sectorOptions = useMemo(
    () => curateValues(
      (agencies ?? []).flatMap((a) => ((a as any).sectors_supported || []).filter((s: string) => s && s !== "all")),
      { labelFor: humanizeSlug },
    ),
    [agencies]
  );
  const typeOptions = useMemo(
    () => curateValues((agencies ?? []).map((a) => (a as any).organisation_type), { labelFor: humanizeSlug }),
    [agencies]
  );

  // Category tabs (primary axis) with per-category counts.
  const categoryTabs: FilterOption[] = useMemo(() => {
    const counts: Record<string, number> = {};
    (agencies ?? []).forEach((a) => {
      const slug = (a as any).category_slug;
      if (slug) counts[slug] = (counts[slug] || 0) + 1;
    });
    return [
      { value: "all", label: "All", count: agencies?.length ?? 0 },
      ...categories.map((c: any) => ({ value: c.slug, label: c.name, count: counts[c.slug] ?? 0 })),
    ];
  }, [agencies, categories]);

  const selects: SelectFilterConfig[] = [
    { key: "location", allLabel: "All Locations", options: locationOptions, searchable: true },
    { key: "type", allLabel: "All Types", options: typeOptions },
    { key: "sector", allLabel: "All Sectors", options: sectorOptions, searchable: true },
  ];

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          Error loading organisations: {error.message}
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Government & Industry Support | Market Entry Secrets</title>
        <meta
          name="description"
          content="Connect with government agencies, industry associations, chambers of commerce, and bilateral trade organisations supporting international business expansion into Australia and New Zealand."
        />
        <meta property="og:title" content="Government & Industry Support | Market Entry Secrets" />
        <meta
          property="og:description"
          content="Connect with government agencies, industry associations, and chambers supporting market entry into Australia and New Zealand."
        />
        <link rel="canonical" href={`${publishedOrigin()}/government-support`} />
      </Helmet>

      <TradeInvestmentAgenciesHero
        agencyCount={agencies?.length || 0}
        locationCount={locationOptions.length}
        categories={categories}
        agencies={agencies || []}
      />

      <DirectoryFilterBar
        filters={filters}
        onFilterChange={setFilter}
        onClearAll={clearAll}
        hasActiveFilters={hasActiveFilters}
        noun="organisations"
        shownCount={paginatedAgencies.length}
        totalCount={filteredAgencies.length}
        tabs={{ key: "category", options: categoryTabs }}
        search={{ key: "search", placeholder: "Search agencies, associations, or services..." }}
        selects={selects}
      />

      <div className="container mx-auto px-4 py-8">
        <UsageBanner />

        <TradeInvestmentAgenciesResults
          filteredAgencies={paginatedAgencies}
          isLoading={isLoading}
          onClearFilters={clearAll}
        />

        <ListPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </>
  );
};

export default TradeInvestmentAgencies;
