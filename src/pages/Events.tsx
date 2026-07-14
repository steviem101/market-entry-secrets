import { useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Calendar, AlertCircle } from "lucide-react";
import { CardGridSkeleton } from "@/components/common/CardGridSkeleton";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/EventCard";
import { EventsHero } from "@/components/events/EventsHero";
import { DirectoryFilterBar, type FilterOption, type SelectFilterConfig } from "@/components/common/DirectoryFilterBar";
import { ListPagination } from "@/components/common/ListPagination";
import { EmptyState } from "@/components/common/EmptyState";
import { useEvents } from "@/hooks/useEvents";
import { ListingPageGate } from "@/components/ListingPageGate";
import { UsageBanner } from "@/components/UsageBanner";
import { useDirectoryFilters } from "@/hooks/useDirectoryFilters";
import type { FilterSpec } from "@/lib/directoryFilters";
import { filterEvents } from "@/lib/eventFilters";
import { curateOptions, curateValues } from "@/lib/filterCuration";
import { resolveEventBucket, EVENT_TYPE_BUCKET_LABEL } from "@/lib/eventTypeBuckets";

const PAGE_SIZE = 12;

// 2026-07-14 filter bar consistency sweep: the primary tab axis is the canonical
// event-type bucket; category/topic/persona/source were retired (stale URL params
// for them are simply not parsed). `tab` is kept as the time param name and
// `city` as the location param name for backward-compat with shared links. Time
// partitions the base set, so it is a presentation dimension (URL-synced,
// excluded from clear-all / active-filters).
const EVENT_FILTER_SPEC: FilterSpec = {
  search: { param: "search", default: "" },
  type: { param: "type", default: "all" },
  city: { param: "city", default: "all" },
  sector: { param: "sector", default: "all" },
  time: { param: "tab", default: "upcoming", presentation: true },
};

const Events = () => {
  const { filters, page, setFilter, setPage, clearAll, hasActiveFilters } =
    useDirectoryFilters(EVENT_FILTER_SPEC);

  const {
    events, upcomingEvents, pastEvents, loading, searchLoading, error,
    setSearchTerm, isSearching,
  } = useEvents();

  // Drive the hook's server-side search from the URL-synced search value.
  // (Scroll-stability on filter change is handled by DirectoryFilterBar.)
  useEffect(() => {
    setSearchTerm(filters.search);
  }, [filters.search, setSearchTerm]);

  // Time partition (Upcoming default; Past/All one click away in the bar).
  // Coerce an out-of-set ?tab= value so the select can't show the wrong
  // partition behind its placeholder (e.g. a truncated ?tab=al link).
  const safeTime = filters.time === "past" || filters.time === "all" ? filters.time : "upcoming";
  const baseEvents = safeTime === "past" ? pastEvents : safeTime === "all" ? events : upcomingEvents;

  // MES-130 curation, computed from the time-partitioned set so tab counts and
  // option lists always describe what selecting them will show. Type is the
  // small canonical bucket axis (zero-hidden); city/sector are popularity-ranked
  // with the long tail searchable. Sector here is the raw events.sector display
  // value (free text), not the canonical sector_tags vocabulary.
  const typeOptions = useMemo(
    () =>
      curateOptions(
        Object.entries(
          baseEvents.reduce<Record<string, number>>((acc, e) => {
            const b = resolveEventBucket(e);
            acc[b] = (acc[b] ?? 0) + 1;
            return acc;
          }, {}),
        ).map(([value, count]) => ({ value, label: EVENT_TYPE_BUCKET_LABEL[value] ?? value, count })),
      ),
    [baseEvents],
  );
  const cityOptions = useMemo(() => curateValues(baseEvents.map((e) => e.city)), [baseEvents]);
  const sectorOptions = useMemo(() => curateValues(baseEvents.map((e) => e.sector)), [baseEvents]);

  // Distinct-locations hero stat is a directory-wide figure, so it's derived
  // from ALL events — not the time-partitioned cityOptions above (which drives
  // the select), so it doesn't shrink to upcoming-only or mutate with the tab.
  const totalLocations = useMemo(() => curateValues(events.map((e) => e.city)).length, [events]);

  // Coerce `type` to "all" unless the selected canonical bucket is actually
  // present in the CURRENT partition's options. This drops stale/raw ?type=
  // links AND Object.prototype keys (?type=constructor), and prevents a
  // valid-but-empty bucket from leaving an invisible active tab after a time
  // switch. Don't coerce while options are still loading (empty set).
  const typeValues = useMemo(() => new Set(typeOptions.map((o) => o.value)), [typeOptions]);
  const safeType =
    filters.type === "all" || typeValues.size === 0 || typeValues.has(filters.type)
      ? filters.type
      : "all";
  const effectiveFilters = useMemo(
    () => ({ ...filters, time: safeTime, type: safeType }),
    [filters, safeTime, safeType],
  );

  const filteredEvents = useMemo(() => filterEvents(baseEvents, effectiveFilters), [baseEvents, effectiveFilters]);

  const totalPages = Math.ceil(filteredEvents.length / PAGE_SIZE);
  // Clamp an out-of-range ?page= (deep bookmark, or a result set that shrank)
  // to the last page so it shows results instead of a blank grid — matches the
  // other directories (InnovationEcosystem/ServiceProviders).
  const clampedPage = Math.max(1, Math.min(page, totalPages || 1));
  const paginatedEvents = filteredEvents.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  const typeTabs: FilterOption[] = useMemo(
    () => [{ value: "all", label: "All", count: baseEvents.length }, ...typeOptions],
    [baseEvents.length, typeOptions],
  );

  const selects: SelectFilterConfig[] = [
    {
      key: "time",
      allLabel: "All events",
      options: [
        { value: "upcoming", label: "Upcoming", count: upcomingEvents.length },
        { value: "past", label: "Past", count: pastEvents.length },
      ],
      widthClass: "w-full sm:w-36",
    },
    { key: "city", allLabel: "All Locations", options: cityOptions, searchable: true },
    { key: "sector", allLabel: "All Sectors", options: sectorOptions, searchable: true },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <CardGridSkeleton count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Error Loading Events</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Events & Conferences | Market Entry Secrets</title>
        <meta
          name="description"
          content="Discover upcoming events, conferences, and networking opportunities for companies entering the Australian and New Zealand markets."
        />
        <link rel="canonical" href={`${typeof window !== "undefined" ? window.location.origin : "https://marketentrysecrets.com"}/events`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Australian Market Entry Events & Conferences",
            itemListElement: upcomingEvents.slice(0, 25).map((ev: any, i: number) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `https://marketentrysecrets.com/events/${ev.slug}`,
              name: ev.title,
            })),
          })}
        </script>
      </Helmet>

      <EventsHero
        totalEvents={events.length}
        totalLocations={totalLocations}
        upcomingCount={upcomingEvents.length}
      />

      <DirectoryFilterBar
        filters={effectiveFilters}
        onFilterChange={setFilter}
        onClearAll={clearAll}
        hasActiveFilters={hasActiveFilters}
        noun="events"
        shownCount={paginatedEvents.length}
        totalCount={filteredEvents.length}
        tabs={{ key: "type", options: typeTabs }}
        search={{ key: "search", placeholder: "Search events, locations, or organizers...", loading: searchLoading }}
        selects={selects}
      />

      <div className="container mx-auto px-4 py-8">
        <UsageBanner />

        {filteredEvents.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-16 h-16" />}
            title="No events found"
            description={
              isSearching
                ? "Try adjusting your search criteria to find more events."
                : safeTime === "upcoming"
                  ? "No upcoming events at the moment. Check back soon!"
                  : "There are no events matching your current filters."
            }
            actionLabel={hasActiveFilters ? "Clear all filters" : undefined}
            onAction={hasActiveFilters ? clearAll : undefined}
          />
        ) : (
          <>
            <ListingPageGate contentType="events">
              <h2 className="sr-only">Event results</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {paginatedEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </ListingPageGate>
            <ListPagination
              currentPage={clampedPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </>
  );
};

export default Events;
