import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { InnovationEcosystemHero } from "@/components/innovation-ecosystem/InnovationEcosystemHero";
import InnovationEcosystemResults from "@/components/innovation-ecosystem/InnovationEcosystemResults";
import { DirectoryFilterBar, type SelectFilterConfig } from "@/components/common/DirectoryFilterBar";
import { ListPagination } from "@/components/common/ListPagination";
import { UsageBanner } from "@/components/UsageBanner";
import { useInnovationEcosystem } from "@/hooks/useInnovationEcosystem";
import { useDirectoryFilters } from "@/hooks/useDirectoryFilters";
import type { FilterSpec } from "@/lib/directoryFilters";
import { filterOrganisations } from "@/lib/innovationFilters";

const PAGE_SIZE = 12;

const INNOVATION_FILTER_SPEC: FilterSpec = {
  search: { param: "search", default: "" },
  location: { param: "location", default: "all" },
  service: { param: "service", default: "all" },
};

const InnovationEcosystem = () => {
  const { filters, page, setFilter, setPage, clearAll, hasActiveFilters } =
    useDirectoryFilters(INNOVATION_FILTER_SPEC);

  const { data: organizations, isLoading, error } = useInnovationEcosystem();

  const filteredOrganizations = useMemo(
    () => (organizations ? filterOrganisations(organizations, filters) : []),
    [organizations, filters]
  );

  const totalPages = Math.ceil(filteredOrganizations.length / PAGE_SIZE);
  const paginatedOrganizations = filteredOrganizations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const uniqueLocations = useMemo(
    () => [...new Set((organizations ?? []).map((org) => org.location).filter(Boolean))].sort() as string[],
    [organizations]
  );
  const uniqueServices = useMemo(
    () => [...new Set((organizations ?? []).flatMap((org) => org.services || []))].sort() as string[],
    [organizations]
  );

  const selects: SelectFilterConfig[] = [
    { key: "location", allLabel: "All Locations", options: uniqueLocations.map((l) => ({ value: l, label: l })) },
    { key: "service", allLabel: "All Services", options: uniqueServices.map((s) => ({ value: s, label: s })) },
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
        locationCount={uniqueLocations.length}
      />

      <DirectoryFilterBar
        filters={filters}
        onFilterChange={setFilter}
        onClearAll={clearAll}
        hasActiveFilters={hasActiveFilters}
        noun="organisations"
        shownCount={paginatedOrganizations.length}
        totalCount={filteredOrganizations.length}
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
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </>
  );
};

export default InnovationEcosystem;
