import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardGridSkeleton } from "@/components/common/CardGridSkeleton";
import { useMentors, useMentorCategories } from "@/hooks/useMentors";
import { ListingPageGate } from "@/components/ListingPageGate";
import { UsageBanner } from "@/components/UsageBanner";
import { MentorsHero } from "@/components/mentors/MentorsHero";
import MentorCard from "@/components/mentors/MentorCard";
import { MentorContactModal } from "@/components/mentors/MentorContactModal";
import { DirectoryFilterBar, type FilterOption, type SelectFilterConfig } from "@/components/common/DirectoryFilterBar";
import { ListPagination } from "@/components/common/ListPagination";
import { EmptyState } from "@/components/common/EmptyState";
import { useDirectoryFilters } from "@/hooks/useDirectoryFilters";
import type { FilterSpec } from "@/lib/directoryFilters";
import { filterMentors } from "@/lib/mentorFilters";
import { humanizeSlug } from "@/lib/humanizeSlug";
import type { Mentor } from "@/hooks/useMentors";

const PAGE_SIZE = 12;

const MENTOR_FILTER_SPEC: FilterSpec = {
  search: { param: "search", default: "" },
  category: { param: "category", default: "all" },
  location: { param: "location", default: "all" },
  sector: { param: "sector", default: "all" },
  corridor: { param: "corridor", default: "all" },
  persona: { param: "persona", default: "all" },
  sort: { param: "sort", default: "featured", presentation: true },
};

const SORT_OPTIONS: FilterOption[] = [
  { value: "featured", label: "Featured first" },
  { value: "views", label: "Most viewed" },
  { value: "experience", label: "Most experienced" },
  { value: "az", label: "A-Z" },
];

// Display labels for corridor origins (market_corridors are `${origin}-to-${destination}`).
const ORIGIN_LABELS: Record<string, string> = {
  uk: "🇬🇧 UK", ireland: "🇮🇪 Ireland", usa: "🇺🇸 USA", canada: "🇨🇦 Canada",
  france: "🇫🇷 France", germany: "🇩🇪 Germany", singapore: "🇸🇬 Singapore",
  hong_kong: "🇭🇰 Hong Kong", china: "🇨🇳 China", korea: "🇰🇷 Korea",
  south_africa: "🇿🇦 South Africa", other_asia: "🌏 Other Asia", other_eu: "🇪🇺 Other EU",
};
const originLabel = (o: string) => ORIGIN_LABELS[o] || humanizeSlug(o);

const MentorsDirectory = () => {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const { data: mentors = [], isLoading, error } = useMentors();
  const { data: categories = [] } = useMentorCategories();
  const { filters, page, setFilter, setPage, clearAll, hasActiveFilters } =
    useDirectoryFilters(MENTOR_FILTER_SPEC);
  const [contactMentor, setContactMentor] = useState<Mentor | null>(null);

  // Pre-filter by category from the URL path (/mentors/:categorySlug).
  useEffect(() => {
    if (categorySlug && categorySlug !== filters.category) {
      setFilter("category", categorySlug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug]);

  const filteredMentors = useMemo(() => filterMentors(mentors, filters), [mentors, filters]);

  const totalPages = Math.ceil(filteredMentors.length / PAGE_SIZE);
  const paginatedMentors = filteredMentors.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const allLocations = useMemo(() => Array.from(new Set(mentors.map((m) => m.location))).sort(), [mentors]);
  const allSectors = useMemo(() => Array.from(new Set(mentors.flatMap((m) => m.sector_tags || []))).sort(), [mentors]);
  const allOrigins = useMemo(() => {
    const origins = new Set<string>();
    mentors.forEach((m) => (m.market_corridors || []).forEach((c) => {
      const o = c.split("-to-")[0];
      if (o) origins.add(o);
    }));
    return Array.from(origins).sort();
  }, [mentors]);

  const currentCategory = categories.find((c) => c.slug === filters.category);

  const categoryTabs: FilterOption[] = useMemo(() => [
    { value: "all", label: "All", count: mentors.length },
    ...categories.map((c) => ({ value: c.slug, label: c.name, count: mentors.filter((m) => m.category_slug === c.slug).length })),
  ], [categories, mentors]);

  const selects: SelectFilterConfig[] = [
    { key: "location", allLabel: "All Locations", options: allLocations.map((l) => ({ value: l, label: l })) },
  ];

  const advancedPanel = (allOrigins.length > 0 || allSectors.length > 0) ? (
    <div className="space-y-4">
      {allOrigins.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-muted-foreground mr-1">Experience entering from:</span>
          <Button variant={filters.corridor === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("corridor", "all")}>
            All origins
          </Button>
          {allOrigins.map((o) => (
            <Button key={o} variant={filters.corridor === o ? "default" : "outline"} size="sm" onClick={() => setFilter("corridor", o)}>
              {originLabel(o)}
            </Button>
          ))}
        </div>
      )}
      {allSectors.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-muted-foreground mr-1">Sector:</span>
          <Button variant={filters.sector === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("sector", "all")}>
            All Sectors
          </Button>
          {allSectors.map((s) => (
            <Button key={s} variant={filters.sector === s ? "default" : "outline"} size="sm" onClick={() => setFilter("sector", s)}>
              {humanizeSlug(s)}
            </Button>
          ))}
        </div>
      )}
    </div>
  ) : undefined;

  const pageTitle = currentCategory
    ? `${currentCategory.name} Mentors | Market Entry Secrets`
    : "Market Entry Mentors & Experts | Market Entry Secrets";
  const pageDescription = currentCategory
    ? `Connect with ${currentCategory.name.toLowerCase()} experts helping companies enter the Australian and New Zealand markets.`
    : "Connect with experienced mentors and experts who help international companies enter the Australian and New Zealand markets.";

  if (isLoading) {
    return (
      <>
        <Helmet><title>{pageTitle}</title></Helmet>
        <div className="container mx-auto px-4 py-8">
          <CardGridSkeleton count={6} />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet><title>Error | Market Entry Secrets</title></Helmet>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Error Loading Mentors</h2>
            <p className="text-muted-foreground mb-6">{(error as Error).message || "Failed to load mentors"}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={`${window.location.origin}/mentors${categorySlug ? `/${categorySlug}` : ""}`} />
      </Helmet>

      <MentorsHero
        totalExperts={mentors.length}
        totalLocations={allLocations.length}
      />

      <DirectoryFilterBar
        filters={filters}
        onFilterChange={setFilter}
        onClearAll={clearAll}
        hasActiveFilters={hasActiveFilters}
        noun="mentors"
        shownCount={paginatedMentors.length}
        totalCount={filteredMentors.length}
        tabs={{ key: "category", options: categoryTabs }}
        search={{ key: "search", placeholder: "Search mentors, specialties, or locations..." }}
        selects={selects}
        sort={{ key: "sort", options: SORT_OPTIONS }}
        audience={{ key: "persona" }}
      >
        {advancedPanel}
      </DirectoryFilterBar>

      <div className="container mx-auto px-4 py-8">
        <UsageBanner />

        {filteredMentors.length === 0 ? (
          <EmptyState
            icon={<Users className="w-16 h-16" />}
            title="No mentors found"
            description="Try adjusting your search criteria or filters to find more mentors."
            actionLabel={hasActiveFilters ? "Clear all filters" : undefined}
            onAction={hasActiveFilters ? clearAll : undefined}
          />
        ) : (
          <>
            <h2 className="sr-only">Mentor results</h2>
            <ListingPageGate contentType="community_members">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {paginatedMentors.map((mentor) => (
                  <MentorCard key={mentor.id} mentor={mentor} onContact={setContactMentor} />
                ))}
              </div>
            </ListingPageGate>
            <ListPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <MentorContactModal
        mentor={contactMentor}
        isOpen={!!contactMentor}
        onClose={() => setContactMentor(null)}
      />
    </>
  );
};

export default MentorsDirectory;
