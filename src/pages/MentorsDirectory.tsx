import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardGridSkeleton } from "@/components/common/CardGridSkeleton";
import { useMentors } from "@/hooks/useMentors";
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
import { filterMentors, archetypeToSlug } from "@/lib/mentorFilters";
import { humanizeSlug } from "@/lib/humanizeSlug";
import { sectorLabel } from "@/lib/sectorLabels";
import { curateValues, curateOptions } from "@/lib/filterCuration";
import type { Mentor } from "@/hooks/useMentors";

const PAGE_SIZE = 12;

// The persona/audience dimension was dropped (2026-07-14 filter bar consistency
// sweep) — a stale ?persona= param is not in the spec, so it's parsed away silently.
const MENTOR_FILTER_SPEC: FilterSpec = {
  search: { param: "search", default: "" },
  category: { param: "category", default: "all" },
  location: { param: "location", default: "all" },
  sector: { param: "sector", default: "all" },
  corridor: { param: "corridor", default: "all" },
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
  const { filters, page, setFilter, setFilters, setPage, clearAll, hasActiveFilters } =
    useDirectoryFilters(MENTOR_FILTER_SPEC);
  const [rawParams] = useSearchParams();
  const [contactMentor, setContactMentor] = useState<Mentor | null>(null);

  // Mount seed (applied atomically so the parts don't clobber each other):
  //  - category from the URL path (/mentors/:categorySlug)
  //  - legacy ?q= search param when ?search= is absent (pre-MES-94 links)
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    const seed: Record<string, string> = {};
    if (categorySlug && categorySlug !== filters.category) seed.category = categorySlug;
    const q = rawParams.get("q");
    if (q && !rawParams.has("search")) seed.search = q;
    if (Object.keys(seed).length) setFilters(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Post-mount: react to /mentors/:categorySlug route changes (skips the mount
  // run, which the seed above already handles, to avoid clobbering it).
  const didMountCat = useRef(false);
  useEffect(() => {
    if (!didMountCat.current) { didMountCat.current = true; return; }
    if (categorySlug && categorySlug !== filters.category) {
      setFilter("category", categorySlug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug]);

  // Coerce a stale ?sector= (value outside the canonical option set) to "all"
  // so it never silently renders an empty grid — mirrors Investors' safeSector.
  const validSectors = useMemo(
    () => new Set(mentors.flatMap((m) => m.sector_tags || [])),
    [mentors],
  );
  const safeSector =
    filters.sector === "all" || validSectors.size === 0 || validSectors.has(filters.sector)
      ? filters.sector
      : "all";
  const effectiveFilters = useMemo(() => ({ ...filters, sector: safeSector }), [filters, safeSector]);

  const filteredMentors = useMemo(() => filterMentors(mentors, effectiveFilters), [mentors, effectiveFilters]);

  const totalPages = Math.ceil(filteredMentors.length / PAGE_SIZE);
  const paginatedMentors = filteredMentors.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // MES-130: popularity-ranked, zero-hidden location options; long tail searchable.
  const locationOptions = useMemo(() => curateValues(mentors.map((m) => m.location)), [mentors]);
  // Sector lives in the main bar (2026-07-14 sweep): canonical sector_tags slugs
  // as values, friendly shared labels for display. Predicate unchanged.
  const sectorOptions = useMemo(
    () => curateValues(mentors.flatMap((m) => m.sector_tags || []), { labelFor: sectorLabel }),
    [mentors],
  );
  const allOrigins = useMemo(() => {
    const origins = new Set<string>();
    mentors.forEach((m) => (m.market_corridors || []).forEach((c) => {
      const o = c.split("-to-")[0];
      if (o) origins.add(o);
    }));
    return Array.from(origins).sort();
  }, [mentors]);

  // Primary tabs are the mentor archetype (MES-130) — the `mentor_categories`
  // table the old tabs read never existed, so they rendered empty. Curated
  // (popularity-ranked, zero-hidden); the slug also drives /mentors/:categorySlug.
  const archetypeMeta = useMemo(() => {
    const meta: Record<string, { label: string; count: number }> = {};
    for (const m of mentors) {
      const slug = archetypeToSlug(m.archetype);
      if (!slug) continue;
      if (!meta[slug]) meta[slug] = { label: m.archetype as string, count: 0 };
      meta[slug].count++;
    }
    return meta;
  }, [mentors]);

  const currentCategoryName = archetypeMeta[filters.category]?.label ?? null;

  const categoryTabs: FilterOption[] = useMemo(() => [
    { value: "all", label: "All", count: mentors.length },
    ...curateOptions(Object.entries(archetypeMeta).map(([value, m]) => ({ value, label: m.label, count: m.count }))),
  ], [archetypeMeta, mentors.length]);

  const selects: SelectFilterConfig[] = [
    { key: "location", allLabel: "All Locations", options: locationOptions, searchable: true },
    { key: "sector", allLabel: "All Sectors", options: sectorOptions, searchable: true },
  ];

  // Corridor (secondary axis) stays in the advanced panel.
  const advancedPanel = allOrigins.length > 0 ? (
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
  ) : undefined;

  const pageTitle = currentCategoryName
    ? `${currentCategoryName} Mentors | Market Entry Secrets`
    : "Market Entry Mentors & Experts | Market Entry Secrets";
  const pageDescription = currentCategoryName
    ? `Connect with ${currentCategoryName.toLowerCase()} experts helping companies enter the Australian and New Zealand markets.`
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
        totalLocations={locationOptions.length}
      />

      <DirectoryFilterBar
        filters={effectiveFilters}
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
