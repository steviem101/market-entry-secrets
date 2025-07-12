import { useState } from "react";
import { Calendar, AlertCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/EventCard";
import { EventModal } from "@/components/EventModal";
import { EventsHero } from "@/components/events/EventsHero";
import { StandardDirectoryFilters } from "@/components/common/StandardDirectoryFilters";
import { useEvents, Event } from "@/hooks/useEvents";
import { FreemiumGate } from "@/components/FreemiumGate";
import { UsageBanner } from "@/components/UsageBanner";
import { getStandardTypes, STANDARD_SECTORS } from "@/utils/sectorMapping";

const Events = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { events, loading, error, searchEvents, clearSearch, isSearching } = useEvents();

  // Get unique categories, types, locations, and sectors for filters
  const categories = Array.from(new Set(events.map(event => event.category))).sort();
  const types = Array.from(new Set(events.map(event => event.type))).sort();
  const locations = Array.from(new Set(events.map(event => event.location))).sort();
  const sectors = Array.from(new Set(events.map(event => event.sector).filter(Boolean))).sort();

  // Filter events based on selected filters
  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    const matchesType = selectedType === "all" || event.type === selectedType;
    const matchesLocation = selectedLocation === "all" || event.location === selectedLocation;
    const matchesSector = selectedSector === "all" || event.sector === selectedSector;
    return matchesCategory && matchesType && matchesLocation && matchesSector;
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchEvents(query);
    } else {
      clearSearch();
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedType("all");
    setSelectedLocation("all");
    setSelectedSector("all");
    clearSearch();
  };

  const handleViewEventDetails = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const hasActiveFilters = selectedCategory !== "all" || selectedType !== "all" || 
    selectedLocation !== "all" || selectedSector !== "all";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <EventsHero 
        totalEvents={events.length}
        totalLocations={locations.length}
      />

      <StandardDirectoryFilters
        searchTerm={searchQuery}
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

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-6">
              {isSearching 
                ? "Try adjusting your search criteria to find more events."
                : "There are no events matching your current filters."
              }
            </p>
            {(searchQuery || hasActiveFilters) && (
              <Button onClick={handleClearFilters} variant="outline">
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <FreemiumGate
                key={event.id}
                contentType="events"
                itemId={event.id}
                contentTitle={event.title}
                contentDescription={event.description}
              >
                <EventCard 
                  event={event} 
                  onViewDetails={handleViewEventDetails}
                />
              </FreemiumGate>
            ))}
          </div>
        )}
      </div>

      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Events;
