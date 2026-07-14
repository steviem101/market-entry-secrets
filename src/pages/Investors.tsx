import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { publishedOrigin } from "@/lib/publishedOrigin";
import { InvestorsHero } from "@/components/investors/InvestorsHero";
import { DirectoryFilterBar, type FilterOption } from "@/components/common/DirectoryFilterBar";
import InvestorResults from "@/components/investors/InvestorResults";
import { ListPagination } from "@/components/common/ListPagination";
import { UsageBanner } from "@/components/UsageBanner";
import { useInvestors } from "@/hooks/useInvestors";
import { useDirectoryFilters } from "@/hooks/useDirectoryFilters";
import type { FilterSpec } from "@/lib/directoryFilters";
import { filterInvestors } from "@/lib/investorFilters";
import { curateValues } from "@/lib/filterCuration";
import { sectorLabel } from "@/lib/sectorLabels";

const PAGE_SIZE = 12;

// Fixed, curated primary axis — the scannable taxonomy the whole audit is modelled on.
const INVESTOR_TYPES: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "vc", label: "VCs" },
  { value: "angel", label: "Angels & Syndicates" },
  { value: "venture_debt", label: "Venture Debt" },
  { value: "accelerator", label: "Accelerators" },
  { value: "grant", label: "Grants" },
  { value: "other", label: "Other" },
];

const INVESTOR_FILTER_SPEC: FilterSpec = {
  search: { param: "search", default: "" },
  type: { param: "type", default: "all" },
  location: { param: "location", default: "all" },
  stage: { param: "stage", default: "all" },
  sector: { param: "sector", default: "all" },
};

const Investors = () => {
  const { data: investors, isLoading, error } = useInvestors();

  // MES-130: popularity-ranked, zero-hidden option lists. Location/stage curate
  // the raw free-text columns; sector now uses the canonical sector_tags slugs
  // (MES-110), exposed on investors_public by the accompanying migration. Falls
  // back gracefully to an empty list during any deploy window before the view
  // swap lands (rows simply carry no sector_tags yet).
  const locationOptions = useMemo(
    () => curateValues((investors ?? []).map((inv) => inv.location)),
    [investors],
  );

  const stageOptions = useMemo(
    () => curateValues((investors ?? []).flatMap((inv) => inv.stage_focus || [])),
    [investors],
  );

  const sectorOptions = useMemo(
    () => curateValues((investors ?? []).flatMap((inv) => inv.sector_tags || []), { labelFor: sectorLabel }),
    [investors],
  );

  // Sector matches canonical sector_tags: a stale/legacy/case-variant ?sector=
  // (old free-text sector_focus, e.g. "fintech") is coerced against the curated
  // options by the hook, so it never silently shows an empty directory.
  const allowedValues = useMemo(
    () => ({ sector: sectorOptions.map((o) => o.value) }),
    [sectorOptions],
  );
  const { filters, page, setFilter, setPage, clearAll, hasActiveFilters } =
    useDirectoryFilters(INVESTOR_FILTER_SPEC, { allowedValues });

  const filteredInvestors = useMemo(
    () => (investors ? filterInvestors(investors, filters) : []),
    [investors, filters],
  );

  // Per-type counts for the hero cards AND the tab suffixes.
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (investors ?? []).forEach((inv) => {
      counts[inv.investor_type] = (counts[inv.investor_type] || 0) + 1;
    });
    return counts;
  }, [investors]);

  // MES-130: hide zero-count type tabs (e.g. "Other" with no rows) so the row
  // only shows tabs that lead somewhere; "All" always stays. Mirrors Case
  // Studies / Content. While data loads, counts are 0 and only "All" renders.
  const tabOptions: FilterOption[] = useMemo(
    () =>
      INVESTOR_TYPES.map((t) => ({
        ...t,
        count: t.value === "all" ? (investors?.length ?? 0) : (typeCounts[t.value] ?? 0),
      })).filter((t) => t.value === "all" || (t.count ?? 0) > 0),
    [investors, typeCounts],
  );

  const totalPages = Math.ceil(filteredInvestors.length / PAGE_SIZE);
  const paginatedInvestors = filteredInvestors.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          Error loading investors: {error.message}
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Australian Investors | Market Entry Secrets</title>
        <meta
          name="description"
          content="Find Australian venture capital firms, angel investors, accelerators, grants, and venture debt providers for your market entry."
        />
        <meta property="og:title" content="Australian Investors | Market Entry Secrets" />
        <meta
          property="og:description"
          content="Discover VCs, angels, accelerators, grants, and venture debt providers in Australia."
        />
        <link rel="canonical" href={`${publishedOrigin()}/investors`} />
      </Helmet>

      <InvestorsHero
        investorCount={investors?.length || 0}
        typeCounts={typeCounts}
      />

      <DirectoryFilterBar
        filters={filters}
        onFilterChange={setFilter}
        onClearAll={clearAll}
        hasActiveFilters={hasActiveFilters}
        noun="investors"
        shownCount={paginatedInvestors.length}
        totalCount={filteredInvestors.length}
        tabs={{ key: "type", options: tabOptions }}
        search={{ key: "search", placeholder: "Search investors, sectors, or locations..." }}
        selects={[
          { key: "location", allLabel: "All Locations", options: locationOptions, searchable: true },
          { key: "stage", allLabel: "All Stages", options: stageOptions, searchable: true },
          { key: "sector", allLabel: "All Sectors", options: sectorOptions, searchable: true },
        ]}
      />

      <div className="container mx-auto px-4 py-8">
        <UsageBanner />

        <InvestorResults
          filteredInvestors={paginatedInvestors}
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

export default Investors;
