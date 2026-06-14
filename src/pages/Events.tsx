import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Calendar, AlertCircle } from "lucide-react";
import { CardGridSkeleton } from "@/components/common/CardGridSkeleton";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/EventCard";
import { EventsHero } from "@/components/events/EventsHero";
import { StandardDirectoryFilters } from "@/components/common/StandardDirectoryFilters";
import { ListPagination } from "@/components/common/ListPagination";
import { EmptyState } from "@/components/common/EmptyState";
import { useEvents } from "@/hooks/useEvents";
import { ListingPageGate } from "@/components/ListingPageGate";
import { UsageBanner } from "@/components/UsageBanner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonaFilter, type PersonaFilterValue } from "@/components/PersonaFilter";
import { usePersona } from "@/contexts/PersonaContext";

const PAGE_SIZE = 12;

// The event function axis (Appendix D categories), carried in `tags`. Kept as a
// fixed allowlist so the Topic filter shows clean function chips rather than the
// noisy location/keyword tags some curated rows also carry (australia, b2b, etc).
const TOPIC_TAGS = [
  "AI/ML", "Founders/Startup", "Investing", "Networking",
  "Growth/Marketing", "Product", "Design", "Dev/Engineering", "Web3/Crypto",
];

const COMMUNITY_SOURCE = "apify_events_finder";

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { persona } = usePersona();
  const [personaFilterValue, setPersonaFilterValue] = useState<PersonaFilterValue>(
    (searchParams.get("persona") as PersonaFilterValue) ?? (persona as PersonaFilterValue) ?? 'all'
  );
  const [localSearchQuery, setLocalSearchQuery] = useState(searchParams.get("search") ?? "");
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") ?? "all");
  const [selectedType, setSelectedType] = useState<string>(searchParams.get("type") ?? "all");
  const [selectedCity, setSelectedCity] = useState<string>(searchParams.get("city") ?? "all");
  const [selectedSector, setSelectedSector] = useState<string>(searchParams.get("sector") ?? "all");
  const [selectedTopic, setSelectedTopic] = useState<string>(searchParams.get("topic") ?? "all");
  // Source axis: default to curated so scraped community volume never dominates the brand.
  const [selectedSource, setSelectedSource] = useState<string>(searchParams.get("source") ?? "curated");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(searchParams.get("tab") ?? "upcoming");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);

  useEffect(() => {
    const p = new URLSearchParams();
    if (localSearchQuery) p.set("search", localSearchQuery);
    if (selectedCategory !== "all") p.set("category", selectedCategory);
    if (selectedType !== "all") p.set("type", selectedType);
    if (selectedCity !== "all") p.set("city", selectedCity);
    if (selectedSector !== "all") p.set("sector", selectedSector);
    if (selectedTopic !== "all") p.set("topic", selectedTopic);
    if (selectedSource !== "curated") p.set("source", selectedSource);
    if (activeTab !== "upcoming") p.set("tab", activeTab);
    if (personaFilterValue !== "all") p.set("persona", personaFilterValue);
    if (currentPage > 1) p.set("page", String(currentPage));
    setSearchParams(p, { replace: true });
  }, [localSearchQuery, selectedCategory, selectedType, selectedCity, selectedSector, selectedTopic, selectedSource, activeTab, personaFilterValue, currentPage, setSearchParams]);

  // Preserve scroll position across filter changes. Changing a filter swaps the
  // card list for a different set (new React keys); the browser loses its scroll
  // anchor and clamps the page upward (no scrollTo is involved). Capture the user's
  // last scroll position and restore it in a layout effect, before paint, so the
  // page stays put instead of jumping toward the filter bar.
  const lastScrollY = useRef(0);
  useEffect(() => {
    const onScroll = () => { lastScrollY.current = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const filterSignature = `${selectedSource}|${activeTab}|${selectedCategory}|${selectedType}|${selectedCity}|${selectedSector}|${selectedTopic}|${personaFilterValue}|${localSearchQuery}`;
  const didMountRef = useRef(false);
  useLayoutEffect(() => {
    if (!didMountRef.current) { didMountRef.current = true; return; }
    window.scrollTo(0, lastScrollY.current);
  }, [filterSignature]);

  const { events, upcomingEvents, pastEvents, loading, searchLoading, error, setSearchTerm, clearSearch, searchQuery, isSearching } = useEvents();

  const categories = Array.from(new Set(events.map(event => event.category))).sort();
  const types = Array.from(new Set(events.map(event => event.type))).sort();
  const cities = Array.from(new Set(events.map(event => event.city).filter(Boolean) as string[])).sort();
  const sectors = Array.from(new Set(events.map(event => event.sector).filter(Boolean))).sort();
  const topics = TOPIC_TAGS.filter(t => events.some(e => (e.tags ?? []).includes(t)));

  const baseEvents = activeTab === "upcoming" ? upcomingEvents : activeTab === "past" ? pastEvents : events;

  const curatedCount = baseEvents.filter(e => e.source !== COMMUNITY_SOURCE).length;
  const communityCount = baseEvents.filter(e => e.source === COMMUNITY_SOURCE).length;

  const filteredEvents = baseEvents.filter(event => {
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    const matchesType = selectedType === "all" || event.type === selectedType;
    const matchesCity = selectedCity === "all" || event.city === selectedCity;
    const matchesSector = selectedSector === "all" || event.sector === selectedSector;
    const matchesTopic = selectedTopic === "all" || (event.tags ?? []).includes(selectedTopic);
    const matchesSource = selectedSource === "all" ||
      (selectedSource === "curated" && event.source !== COMMUNITY_SOURCE) ||
      (selectedSource === "community" && event.source === COMMUNITY_SOURCE);
    const matchesPersona = (() => {
      if (personaFilterValue === 'all') return true;
      const hasTarget = !!event.target_personas?.length;
      const hasPersona = !!event.persona;
      // Don't hide events we can't classify on either signal.
      if (!hasTarget && !hasPersona) return true;
      const targetMatch = hasTarget && event.target_personas!.includes(personaFilterValue);
      // Community events carry the persona column (international_entrant | local_founder | both).
      const personaMatch = hasPersona && (
        event.persona === 'both' ||
        (personaFilterValue === 'international_entrant' && event.persona === 'international_entrant') ||
        (personaFilterValue === 'local_startup' && event.persona === 'local_founder')
      );
      return targetMatch || personaMatch;
    })();
    return matchesCategory && matchesType && matchesCity && matchesSector && matchesTopic && matchesSource && matchesPersona;
  });

  const totalPages = Math.ceil(filteredEvents.length / PAGE_SIZE);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleSearch = (query: string) => {
    setLocalSearchQuery(query);
    setSearchTerm(query);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setLocalSearchQuery("");
    setSelectedCategory("all");
    setSelectedType("all");
    setSelectedCity("all");
    setSelectedSector("all");
    setSelectedTopic("all");
    clearSearch();
    setCurrentPage(1);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSourceChange = (source: string) => {
    setSelectedSource(source);
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedCategory !== "all" || selectedType !== "all" ||
    selectedCity !== "all" || selectedSector !== "all" || selectedTopic !== "all";

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
        <link rel="canonical" href={`${typeof window !== "undefined" ? window.location.origin : "https://market-entry-secrets.lovable.app"}/events`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Australian Market Entry Events & Conferences",
            itemListElement: upcomingEvents.slice(0, 25).map((ev: any, i: number) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `https://market-entry-secrets.lovable.app/events/${ev.slug}`,
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

      <StandardDirectoryFilters
        searchTerm={localSearchQuery}
        onSearchChange={handleSearch}
        selectedLocation={selectedCity}
        onLocationChange={(c) => { setSelectedCity(c); setCurrentPage(1); }}
        selectedType={selectedType}
        onTypeChange={(t) => { setSelectedType(t); setCurrentPage(1); }}
        selectedSector={selectedSector}
        onSectorChange={(s) => { setSelectedSector(s); setCurrentPage(1); }}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        locations={cities}
        types={types}
        sectors={sectors}
        searchPlaceholder="Search events, locations, or organizers..."
        searchLoading={searchLoading}
      >
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-muted-foreground">Category:</span>
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => { setSelectedCategory("all"); setCurrentPage(1); }}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => { setSelectedCategory(category); setCurrentPage(1); }}
              >
                {category}
              </Button>
            ))}
          </div>

          {topics.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-muted-foreground">Topic:</span>
              <Button
                variant={selectedTopic === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => { setSelectedTopic("all"); setCurrentPage(1); }}
              >
                All Topics
              </Button>
              {topics.map((topic) => (
                <Button
                  key={topic}
                  variant={selectedTopic === topic ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setSelectedTopic(topic); setCurrentPage(1); }}
                >
                  {topic}
                </Button>
              ))}
            </div>
          )}
        </div>
      </StandardDirectoryFilters>

      <div className="container mx-auto px-4 py-8">
        <UsageBanner />

        <div className="mb-6">
          <PersonaFilter value={personaFilterValue} onChange={(v) => { setPersonaFilterValue(v); setCurrentPage(1); }} />
        </div>

        {/* Source axis: keep editorial (Curated) and scraped (Community) events distinct. */}
        <div className="mb-4">
          <Tabs value={selectedSource} onValueChange={handleSourceChange}>
            <TabsList>
              <TabsTrigger value="curated">Curated ({curatedCount})</TabsTrigger>
              <TabsTrigger value="community">Community ({communityCount})</TabsTrigger>
              <TabsTrigger value="all">All ({baseEvents.length})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming ({upcomingEvents.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({pastEvents.length})</TabsTrigger>
              <TabsTrigger value="all">All ({events.length})</TabsTrigger>
            </TabsList>
          </Tabs>
          <p className="text-muted-foreground text-sm">
            Showing {paginatedEvents.length} of {filteredEvents.length} events
          </p>
        </div>

        {filteredEvents.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-16 h-16" />}
            title="No events found"
            description={
              isSearching
                ? "Try adjusting your search criteria to find more events."
                : selectedSource === "community"
                  ? "No community events match your filters yet. New ones arrive from the weekly scrape."
                  : activeTab === "upcoming"
                    ? "No upcoming events at the moment. Check back soon!"
                    : "There are no events matching your current filters."
            }
            actionLabel={(localSearchQuery || hasActiveFilters) ? "Clear all filters" : undefined}
            onAction={(localSearchQuery || hasActiveFilters) ? handleClearFilters : undefined}
          />
        ) : (
          <>
            <ListingPageGate contentType="events">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {paginatedEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </ListingPageGate>
            <ListPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </>
  );
};

export default Events;
