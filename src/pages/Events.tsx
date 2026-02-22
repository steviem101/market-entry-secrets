import { useState } from "react";
import { Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/EventCard";
import { EventsHero } from "@/components/events/EventsHero";
import { StandardDirectoryFilters } from "@/components/common/StandardDirectoryFilters";
import { useEvents, Event } from "@/hooks/useEvents";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useAuth } from "@/hooks/useAuth";
import { PaywallModal } from "@/components/PaywallModal";
import { UsageBanner } from "@/components/UsageBanner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
const Events = () => {
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("upcoming");

  const { events, upcomingEvents, pastEvents, loading, searchLoading, error, setSearchTerm, clearSearch, searchQuery, isSearching } = useEvents();
  const { user, loading: authLoading } = useAuth();
  const { hasReachedLimit } = useUsageTracking();

  // Get unique categories, types, locations, and sectors for filters
  const categories = Array.from(new Set(events.map(event => event.category))).sort();
  const types = Array.from(new Set(events.map(event => event.type))).sort();
  const locations = Array.from(new Set(events.map(event => event.location))).sort();
  const sectors = Array.from(new Set(events.map(event => event.sector).filter(Boolean))).sort();

  // Choose events based on active tab
  const baseEvents = activeTab === "upcoming" ? upcomingEvents : activeTab === "past" ? pastEvents : events;

  // Filter events based on selected filters
  const filteredEvents = baseEvents.filter(event => {
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    const matchesType = selectedType === "all" || event.type === selectedType;
    const matchesLocation = selectedLocation === "all" || event.location === selectedLocation;
    const matchesSector = selectedSector === "all" || event.sector === selectedSector;
    return matchesCategory && matchesType && matchesLocation && matchesSector;
  });

  const handleSearch = (query: string) => {
    setLocalSearchQuery(query);
    setSearchTerm(query);
  };

  const handleClearFilters = () => {
    setLocalSearchQuery("");
    setSelectedCategory("all");
    setSelectedType("all");
    setSelectedLocation("all");
    setSelectedSector("all");
    clearSearch();
  };

  const hasActiveFilters = selectedCategory !== "all" || selectedType !== "all" || 
    selectedLocation !== "all" || selectedSector !== "all";

  if (loading) {
    return (
      <>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading events...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Error Loading Events</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      
      <EventsHero 
        totalEvents={events.length}
        totalLocations={locations.length}
        upcomingCount={upcomingEvents.length}
      />

      <StandardDirectoryFilters
        searchTerm={localSearchQuery}
        onSearchChange={handleSearch}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedSector={selectedSector}
        onSectorChange={setSelectedSector}
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
        {/* Advanced Filters - Categories */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-muted-foreground">Category:</span>
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </StandardDirectoryFilters>

      <div className="container mx-auto px-4 py-8">
        <UsageBanner />

        {/* Tabs for Upcoming / Past / All */}
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingEvents.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastEvents.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({events.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-6">
              {isSearching 
                ? "Try adjusting your search criteria to find more events."
                : activeTab === "upcoming"
                  ? "No upcoming events at the moment. Check back soon!"
                  : "There are no events matching your current filters."
              }
            </p>
            {(localSearchQuery || hasActiveFilters) && (
              <Button onClick={handleClearFilters} variant="outline">
                Clear all filters
              </Button>
            )}
          </div>
        ) : !authLoading && hasReachedLimit && !user ? (
          <PaywallModal contentType="events" />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
      
    </>
  );
};

export default Events;
