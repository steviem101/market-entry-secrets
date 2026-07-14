import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { publishedOrigin } from "@/lib/publishedOrigin";
import { ServiceProvidersHero } from "@/components/service-providers/ServiceProvidersHero";
import { ServiceProvidersDataProvider } from "@/components/service-providers/ServiceProvidersDataProvider";
import { ServiceProvidersList } from "@/components/service-providers/ServiceProvidersList";
import { DirectoryFilterBar, type FilterOption, type SelectFilterConfig } from "@/components/common/DirectoryFilterBar";
import { ListPagination } from "@/components/common/ListPagination";
import { UsageBanner } from "@/components/UsageBanner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { mapServicesToSectors } from "@/utils/sectorMapping";
import { curateValues } from "@/lib/filterCuration";
import { type PersonaFilterValue } from "@/components/PersonaFilter";
import { useServiceProviderCategories } from "@/hooks/useServiceProviders";
import { useDirectoryFilters, type UseDirectoryFiltersResult } from "@/hooks/useDirectoryFilters";
import { useContextPersonaSeed } from "@/hooks/useContextPersonaSeed";
import type { FilterSpec } from "@/lib/directoryFilters";

const PAGE_SIZE = 12;

const SP_FILTER_SPEC: FilterSpec = {
  search: { param: "search", default: "" },
  category: { param: "category", default: "all" },
  location: { param: "location", default: "all" },
  sector: { param: "sector", default: "all" },
  verified: { param: "verified", default: "false" },
  persona: { param: "persona", default: "all" },
  sort: { param: "sort", default: "featured", presentation: true },
};

const SORT_OPTIONS: FilterOption[] = [
  { value: "featured", label: "Featured first" },
  { value: "name", label: "A-Z" },
  { value: "views", label: "Most viewed" },
];

interface Category { slug: string; name: string }

// Inner component so option/tab derivations that depend only on `companies`
// can be memoised (hooks aren't available inside the data-provider render prop).
const ServiceProvidersContent = ({
  companies,
  filteredCompanies,
  totalCompanies,
  uniqueLocations,
  totalServices,
  categories,
  filterState,
}: {
  companies: any[];
  filteredCompanies: any[];
  totalCompanies: number;
  uniqueLocations: number;
  totalServices: number;
  categories: Category[];
  filterState: UseDirectoryFiltersResult;
}) => {
  const { filters, page, setFilter, setPage, clearAll, hasActiveFilters } = filterState;
  const verifiedOnly = filters.verified === "true";

  // MES-130: popularity-ranked, zero-hidden. Sector is derived via the service→
  // sector mapper; location ranks by how many providers sit in each place.
  const sectorOptions = useMemo(
    () => curateValues(companies.flatMap((c) => mapServicesToSectors(c.services || []))),
    [companies]
  );
  const locationOptions = useMemo(
    () => curateValues(companies.map((c) => c.location)),
    [companies]
  );

  const categoryTabs: FilterOption[] = useMemo(() => {
    const counts: Record<string, number> = {};
    companies.forEach((c) => {
      const slug = c.category_slug;
      if (slug) counts[slug] = (counts[slug] || 0) + 1;
    });
    return [
      { value: "all", label: "All", count: companies.length },
      ...categories.map((c) => ({ value: c.slug, label: c.name, count: counts[c.slug] ?? 0 })),
    ];
  }, [companies, categories]);

  const selects: SelectFilterConfig[] = useMemo(() => [
    { key: "location", allLabel: "All Locations", options: locationOptions, searchable: true },
    { key: "sector", allLabel: "All Sectors", options: sectorOptions },
  ], [locationOptions, sectorOptions]);

  const totalPages = Math.ceil(filteredCompanies.length / PAGE_SIZE);
  // Clamp an out-of-range page to the last page for display (derived, no
  // setState-during-render / URL write-back) so it shows results, not a blank grid.
  const clampedPage = Math.max(1, Math.min(page, totalPages || 1));
  const paginatedCompanies = filteredCompanies.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  return (
    <>
      <ServiceProvidersHero
        totalCompanies={totalCompanies}
        uniqueLocations={uniqueLocations}
        totalServices={totalServices}
      />

      <DirectoryFilterBar
        filters={filters}
        onFilterChange={setFilter}
        onClearAll={clearAll}
        hasActiveFilters={hasActiveFilters}
        noun="service providers"
        shownCount={paginatedCompanies.length}
        totalCount={filteredCompanies.length}
        tabs={{ key: "category", options: categoryTabs }}
        search={{ key: "search", placeholder: "Search service providers..." }}
        selects={selects}
        sort={{ key: "sort", options: SORT_OPTIONS }}
        audience={{ key: "persona" }}
      >
        <div className="flex items-center gap-2">
          <Switch
            id="verified-only"
            checked={verifiedOnly}
            onCheckedChange={(v) => setFilter("verified", v ? "true" : "false")}
          />
          <Label htmlFor="verified-only" className="text-sm text-muted-foreground cursor-pointer">
            Verified only
          </Label>
        </div>
      </DirectoryFilterBar>

      <div className="container mx-auto px-4 py-8">
        <UsageBanner />
        <h2 className="sr-only">Service provider results</h2>

        <ServiceProvidersList companies={paginatedCompanies} />

        <ListPagination
          currentPage={clampedPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </>
  );
};

const ServiceProviders = () => {
  const filterState = useDirectoryFilters(SP_FILTER_SPEC);
  const { filters } = filterState;
  useContextPersonaSeed(filterState.setFilter);
  const { data: categories = [] } = useServiceProviderCategories();

  return (
    <>
      <Helmet>
        <title>Service Providers | Market Entry Secrets</title>
        <meta
          name="description"
          content="Find expert service providers who specialize in international market entry to Australia and New Zealand. Legal, accounting, recruitment, strategy, and more."
        />
        <meta property="og:title" content="Service Providers | Market Entry Secrets" />
        <meta
          property="og:description"
          content="Connect with verified service providers for your market entry into Australia and New Zealand."
        />
        <meta property="og:url" content={`${publishedOrigin()}/service-providers`} />
        <link rel="canonical" href={`${publishedOrigin()}/service-providers`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Service Providers Directory",
            description:
              "Directory of vetted service providers specializing in market entry to Australia and New Zealand.",
            url: `${publishedOrigin()}/service-providers`,
          })}
        </script>
      </Helmet>

      <ServiceProvidersDataProvider
        selectedLocations={filters.location === "all" ? [] : [filters.location]}
        searchTerm={filters.search}
        selectedType="all"
        selectedSector={filters.sector}
        selectedCategory={filters.category}
        verifiedOnly={filters.verified === "true"}
        sortBy={filters.sort}
        personaFilter={filters.persona as PersonaFilterValue}
      >
        {({ companies, filteredCompanies, totalCompanies, uniqueLocations, totalServices }) => (
          <ServiceProvidersContent
            companies={companies}
            filteredCompanies={filteredCompanies}
            totalCompanies={totalCompanies}
            uniqueLocations={uniqueLocations}
            totalServices={totalServices}
            categories={categories}
            filterState={filterState}
          />
        )}
      </ServiceProvidersDataProvider>
    </>
  );
};

export default ServiceProviders;
