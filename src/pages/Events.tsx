import { useState, useEffect } from "react";
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

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { persona } = usePersona();
  const [personaFilterValue, setPersonaFilterValue] = useState<PersonaFilterValue>(
    (searchParams.get("persona") as PersonaFilterValue) ?? (persona as PersonaFilterValue) ?? 'all'
  );
  const [localSearchQuery, setLocalSearchQuery] = useState(searchParams.get("search") ?? "");
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") ?? "all");
  const [selectedType, setSelectedType] = useState<string>(searchParams.get("type") ?? "all");
  const [selectedLocation, setSelectedLocation] = useState<string>(searchParams.get("location") ?? "all");
  const [selectedSector, setSelectedSector] = useState<string>(searchParams.get("sector") ?? "all");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(searchParams.get("tab") ?? "upcoming");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);

  useEffect(() => {
    const p = new URLSearchParams();
    if (localSearchQuery) p.set("search", localSearchQuery);
    if (selectedCategory !== "all") p.set("category", selectedCategory);
    if (selectedType !== "all") p.set("type", selectedType);
    if (selectedLocation !== "all") p.set("location", selectedLocation);
    if (selectedSector !== "all") p.set("sector", selectedSector);
    if (activeTab !== "upcoming") p.set("tab", activeTab);
    if (personaFilterValue !== "all") p.set("persona", personaFilterValue);
    if (currentPage > 1) p.set("page", String(currentPage));
    setSearchParams(p, { replace: true });
  }, [localSearchQuery, selectedCategory, selectedType, selectedLocation, selectedSector, activeTab, personaFilterValue, currentPage, setSearchParams]);

  const { events, upcomingEvents, pastEvents, loading, searchLoading, error, setSearchTerm, clearSearch, searchQuery, isSearching } = useEvents();

  const categories = Array.from(new Set(events.map(event => event.category))).sort();
  const types = Array.from(new Set(events.map(event => event.type))).sort();
  const locations = Array.from(new Set(events.map(event => event.location))).sort();
  const sectors = Array.from(new Set(events.map(event => event.sector).filter(Boolean))).sort();

  const baseEvents = activeTab === "upcoming" ? upcomingEvents : activeTab === "past" ? pastEvents : events;

  const filteredEvents = baseEvents.filter(event => {
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    const matchesType = selectedType === "all" || event.type === selectedType;
    const matchesLocation = selectedLocation === "all" || event.location === selectedLocation;
    const matchesSector = selectedSector === "all" || event.sector === selectedSector;
    const matchesPersona = personaFilterValue === 'all' ||
      !event.target_personas?.length ||
      event.target_personas.includes(personaFilterValue);
    return matchesCategory && matchesType && matchesLocation && matchesSector && matchesPersona;
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
    setSelectedLocation("all");
    setSelectedSector("all");
    clearSearch();
    setCurrentPage(1);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedCategory !== "all" || selectedType !== "all" ||
    selectedLocation !== "all" || selectedSector !== "all";

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
      </Helmet>

      <EventsHero
        totalEvents={events.length}
        totalLocations={locations.length}
        upcomingCount={upcomingEvents.length}
      />

      <StandardDirectoryFilters
        searchTerm={localSearchQuery}
        onSearchChange={handleSearch}
        selectedLocation={selectedLocation}
        onLocationChange={(l) => { setSelectedLocation(l); setCurrentPage(1); }}
        selectedType={selectedType}
        onTypeChange={(t) => { setSelectedType(t); setCurrentPage(1); }}
        selectedSector={selectedSector}
        onSectorChange={(s) => { setSelectedSector(s); setCurrentPage(1); }}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        locations={locations}
        types={types}
        sectors={sectors}
        searchPlaceholder="Search events, locations, or organizers..."
        searchLoading={searchLoading}
      >
        <div className="flex flex-wrap gap-2">
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
      </StandardDirectoryFilters>

      <div className="container mx-auto px-4 py-8">
        <UsageBanner />

        <div className="mb-6">
          <PersonaFilter value={personaFilterValue} onChange={(v) => { setPersonaFilterValue(v); setCurrentPage(1); }} />
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
