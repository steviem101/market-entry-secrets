import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { InnovationEcosystemHero } from "@/components/innovation-ecosystem/InnovationEcosystemHero";
import InnovationEcosystemResults from "@/components/innovation-ecosystem/InnovationEcosystemResults";
import { DirectoryFilterBar, type FilterOption, type SelectFilterConfig } from "@/components/common/DirectoryFilterBar";
import { ListPagination } from "@/components/common/ListPagination";
import { UsageBanner } from "@/components/UsageBanner";
import { getStandardTypes } from "@/utils/sectorMapping";
import { useInnovationEcosystem } from "@/hooks/useInnovationEcosystem";
import { useDirectoryFilters } from "@/hooks/useDirectoryFilters";
import type { FilterSpec } from "@/lib/directoryFilters";
import { filterOrganisations } from "@/lib/innovationFilters";
import { curateValues, coerceToValidOption } from "@/lib/filterCuration";
import { sectorLabel } from "@/lib/sectorLabels";

const PAGE_SIZE = 12;

const INNOVATION_FILTER_SPEC: FilterSpec = {
  search: { param: "search", default: "" },
  type: { param: "type", default: "all" },
  location: { param: "location", default: "all" },
  service: { param: "service", default: "all" },
  sector: { param: "sector", default: "all" },
};

const InnovationEcosystem = () => {
  const { filters, page, setFilter, setPage, clearAll, hasActiveFilters } =
    useDirectoryFilters(INNOVATION_FILTER_SPEC);

  const { data: organizations, isLoading, error } = useInnovationEcosystem();

  // MES-130: popularity-ranked, zero-hidden; the long location/service tails are searchable.
  const locationOptions = useMemo(
    () => curateValues((organizations ?? []).map((org) => org.location)),
    [organizations]
  );
  const serviceOptions = useMemo(
    () => curateValues((organizations ?? []).flatMap((org) => org.services || [])),
    [organizations]
  );
  // Canonical sector_tags (MES-110) with the shared friendly labels; untagged
  // orgs simply don't contribute options and stay reachable via "All Sectors".
  const sectorOptions = useMemo(
    () => curateValues((organizations ?? []).flatMap((org) => org.sector_tags || []), { labelFor: sectorLabel }),
    [organizations]
  );

  // Coerce a stale/case-variant ?sector= to a valid option (or "all") so it
  // never silently renders an empty grid; derived from the curated options so
  // it stays consistent with the dropdown.
  const safeSector = coerceToValidOption(filters.sector, sectorOptions);
  const effectiveFilters = useMemo(() => ({ ...filters, sector: safeSector }), [filters, safeSector]);

  const filteredOrganizations = useMemo(
    () => (organizations ? filterOrganisations(organizations, effectiveFilters) : []),
    [organizations, effectiveFilters]
  );

  const totalPages = Math.ceil(filteredOrganizations.length / PAGE_SIZE);
  // Clamp an out-of-range ?page= (bookmarked deep page, or a result set that
  // shrank) to the last page so it shows results instead of a blank grid.
  const clampedPage = Math.max(1, Math.min(page, totalPages || 1));
  const paginatedOrganizations = filteredOrganizations.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  // Data-driven, MULTI-VALUE Type tabs (MES-100 spin-off): an org's `type[]` can list
  // several roles, so it's counted under each tab. Curated order first, then any novel
  // value appended so nothing is silently dropped (mirrors the Leads pattern).
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const org of organizations ?? []) {
      for (const t of org.type ?? []) counts[t] = (counts[t] ?? 0) + 1;
    }
    return counts;
  }, [organizations]);
  const typeValues = useMemo(() => {
    const known = getStandardTypes.innovationEcosystem;
    const inData = Object.keys(typeCounts);
    return [
      ...known.filter((t) => inData.includes(t)),
      ...inData.filter((t) => !known.includes(t)).sort(),
    ];
  }, [typeCounts]);
  const typeTabs: FilterOption[] = [
    { value: "all", label: "All", count: organizations?.length ?? 0 },
    ...typeValues.map((t) => ({ value: t, label: t, count: typeCounts[t] ?? 0 })),
  ];

  const selects: SelectFilterConfig[] = [
    { key: "location", allLabel: "All Locations", options: locationOptions, searchable: true },
    { key: "sector", allLabel: "All Sectors", options: sectorOptions, searchable: true },
    { key: "service", allLabel: "All Services", options: serviceOptions, searchable: true },
  ];

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          Error loading innovation ecosystem: {error.message}
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Innovation Ecosystem | Market Entry Secrets</title>
        <meta
          name="description"
          content="Discover incubators, accelerators, innovation hubs, and startup ecosystems. Find partners to help scale your business and access the Australian market."
        />
        <meta property="og:title" content="Innovation Ecosystem | Market Entry Secrets" />
        <meta
          property="og:description"
          content="Discover incubators, accelerators, innovation hubs, and startup ecosystems worldwide."
        />
        <link rel="canonical" href={`${window.location.origin}/innovation-ecosystem`} />
      </Helmet>

      <InnovationEcosystemHero
        organizationCount={organizations?.length || 0}
        locationCount={locationOptions.length}
      />

      <DirectoryFilterBar
        filters={effectiveFilters}
        onFilterChange={setFilter}
        onClearAll={clearAll}
        hasActiveFilters={hasActiveFilters}
        noun="organisations"
        shownCount={paginatedOrganizations.length}
        totalCount={filteredOrganizations.length}
        tabs={{ key: "type", options: typeTabs }}
        search={{ key: "search", placeholder: "Search organizations, services, or locations..." }}
        selects={selects}
      />

      <div className="container mx-auto px-4 py-8">
        <UsageBanner />

        <InnovationEcosystemResults
          filteredOrganizations={paginatedOrganizations}
          totalFilteredCount={filteredOrganizations.length}
          isLoading={isLoading}
          onClearFilters={clearAll}
        />

        <ListPagination
          currentPage={clampedPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </>
  );
};

export default InnovationEcosystem;
