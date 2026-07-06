import { useEffect, useMemo, useRef, useLayoutEffect } from "react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDirectoryFilters } from "@/hooks/useDirectoryFilters";
import type { FilterSpec } from "@/lib/directoryFilters";
import { filterEvents, matchesSource, COMMUNITY_SOURCE, TOPIC_TAGS } from "@/lib/eventFilters";

const PAGE_SIZE = 12;

// `city` param name and `tab` (time) param name are kept for backward-compat
// with existing shared links. Source + time partition the base set, so they are
// presentation dimensions (URL-synced, excluded from clear-all / active-filters).
const EVENT_FILTER_SPEC: FilterSpec = {
  search: { param: "search", default: "" },
  category: { param: "category", default: "all" },
  type: { param: "type", default: "all" },
  city: { param: "city", default: "all" },
  sector: { param: "sector", default: "all" },
  topic: { param: "topic", default: "all" },
  persona: { param: "persona", default: "all" },
  source: { param: "source", default: "curated", presentation: true },
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
  useEffect(() => {
    setSearchTerm(filters.search);
  }, [filters.search, setSearchTerm]);

  // Keep the page still when a filter changes. Radix tabs/selects move focus to
  // the clicked control and the browser scrolls it into view; swapping the card
  // list also reflows height and clamps scroll. Snapshot scroll at interaction
  // start (capture phase, before focus moves), then pin it back for a few frames.
  const restoreScrollY = useRef<number | null>(null);
  useEffect(() => {
    const snapshot = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest?.('[data-radix-popper-content-wrapper],[role="listbox"],[role="menu"],[role="dialog"]')) return;
      restoreScrollY.current = window.scrollY;
    };
    document.addEventListener("pointerdown", snapshot, true);
    document.addEventListener("keydown", snapshot, true);
    return () => {
      document.removeEventListener("pointerdown", snapshot, true);
      document.removeEventListener("keydown", snapshot, true);
    };
  }, []);
  const filterSignature = `${filters.source}|${filters.time}|${filters.category}|${filters.type}|${filters.city}|${filters.sector}|${filters.topic}|${filters.persona}|${filters.search}`;
  const didMountRef = useRef(false);
  useLayoutEffect(() => {
    if (!didMountRef.current) { didMountRef.current = true; return; }
    const target = restoreScrollY.current;
    if (target == null) return;
    let frame = 0;
    let count = 0;
    const pin = () => {
      if (Math.abs(window.scrollY - target) > 1) window.scrollTo(0, target);
      if (count++ < 4) frame = requestAnimationFrame(pin);
    };
    pin();
    return () => cancelAnimationFrame(frame);
  }, [filterSignature]);

  const categories = useMemo(() => Array.from(new Set(events.map((e) => e.category))).sort(), [events]);
  const types = useMemo(() => Array.from(new Set(events.map((e) => e.type))).sort(), [events]);
  const cities = useMemo(() => Array.from(new Set(events.map((e) => e.city).filter(Boolean) as string[])).sort(), [events]);
  const sectors = useMemo(() => Array.from(new Set(events.map((e) => e.sector).filter(Boolean) as string[])).sort(), [events]);
  const topics = useMemo(() => TOPIC_TAGS.filter((t) => events.some((e) => (e.tags ?? []).includes(t))), [events]);

  const baseEvents = filters.time === "upcoming" ? upcomingEvents : filters.time === "past" ? pastEvents : events;
  const curatedCount = baseEvents.filter((e) => e.source !== COMMUNITY_SOURCE).length;
  const communityCount = baseEvents.filter((e) => e.source === COMMUNITY_SOURCE).length;

  const sourceFiltered = useMemo(
    () => baseEvents.filter((e) => matchesSource(e, filters.source)),
    [baseEvents, filters.source]
  );
  const filteredEvents = useMemo(() => filterEvents(sourceFiltered, filters), [sourceFiltered, filters]);

  const totalPages = Math.ceil(filteredEvents.length / PAGE_SIZE);
  const paginatedEvents = filteredEvents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const categoryTabs: FilterOption[] = useMemo(() => [
    { value: "all", label: "All", count: sourceFiltered.length },
    ...categories.map((c) => ({ value: c, label: c, count: sourceFiltered.filter((e) => e.category === c).length })),
  ], [categories, sourceFiltered]);

  const selects: SelectFilterConfig[] = [
    { key: "city", allLabel: "All Locations", options: cities.map((c) => ({ value: c, label: c })) },
    { key: "type", allLabel: "All Types", options: types.map((t) => ({ value: t, label: t })) },
    { key: "sector", allLabel: "All Sectors", options: sectors.map((s) => ({ value: s, label: s })) },
  ];

  const advancedPanel = topics.length > 0 ? (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm font-medium text-muted-foreground">Topic:</span>
      <Button variant={filters.topic === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("topic", "all")}>
        All Topics
      </Button>
      {topics.map((topic) => (
        <Button key={topic} variant={filters.topic === topic ? "default" : "outline"} size="sm" onClick={() => setFilter("topic", topic)}>
          {topic}
        </Button>
      ))}
    </div>
  ) : undefined;

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
        totalLocations={cities.length}
        upcomingCount={upcomingEvents.length}
      />

      <DirectoryFilterBar
        filters={filters}
        onFilterChange={setFilter}
        onClearAll={clearAll}
        hasActiveFilters={hasActiveFilters}
        noun="events"
        shownCount={paginatedEvents.length}
        totalCount={filteredEvents.length}
        tabs={{ key: "category", options: categoryTabs }}
        search={{ key: "search", placeholder: "Search events, locations, or organizers...", loading: searchLoading }}
        selects={selects}
        audience={{ key: "persona" }}
      >
        {advancedPanel}
      </DirectoryFilterBar>

      <div className="container mx-auto px-4 py-8">
        <UsageBanner />

        {/* Source partition: keep editorial (Curated) and scraped (Community) distinct. */}
        <div className="mb-4">
          <Tabs value={filters.source} onValueChange={(v) => setFilter("source", v)}>
            <TabsList>
              <TabsTrigger value="curated">Curated ({curatedCount})</TabsTrigger>
              <TabsTrigger value="community">Community ({communityCount})</TabsTrigger>
              <TabsTrigger value="all">All ({baseEvents.length})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="mb-6">
          <Tabs value={filters.time} onValueChange={(v) => setFilter("time", v)}>
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming ({upcomingEvents.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({pastEvents.length})</TabsTrigger>
              <TabsTrigger value="all">All ({events.length})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {filteredEvents.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-16 h-16" />}
            title="No events found"
            description={
              isSearching
                ? "Try adjusting your search criteria to find more events."
                : filters.source === "community"
                  ? "No community events match your filters yet. New ones arrive from the weekly scrape."
                  : filters.time === "upcoming"
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
              currentPage={page}
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
