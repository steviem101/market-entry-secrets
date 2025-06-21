
import { useState } from "react";
import { Search, Calendar, MapPin, Users, AlertCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EventCard } from "@/components/EventCard";
import { EventSearch } from "@/components/events/EventSearch";
import { EventSubmissionForm } from "@/components/events/EventSubmissionForm";
import { useEvents } from "@/hooks/useEvents";
import { FreemiumGate } from "@/components/FreemiumGate";
import { UsageBanner } from "@/components/UsageBanner";

const Events = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  const { events, loading, error, searchEvents, clearSearch, isSearching } = useEvents();

  // Get unique categories and locations for filters
  const categories = Array.from(new Set(events.map(event => event.category))).sort();
  const locations = Array.from(new Set(events.map(event => event.location))).sort();

  // Filter events based on selected filters
  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    const matchesLocation = selectedLocation === "all" || event.location === selectedLocation;
    return matchesCategory && matchesLocation;
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
    setSelectedLocation("all");
    clearSearch();
  };

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
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Industry <span className="text-primary">Events</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with industry professionals and expand your network at upcoming events
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground justify-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{events.length} Events</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Multiple Locations</span>
            </div>
          </div>
          <div className="mt-6">
            <EventSubmissionForm />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <UsageBanner />
        
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <EventSearch 
            searchQuery={searchQuery}
            onSearchChange={handleSearch}
            isSearching={isSearching}
          />
          
          {/* Category and Location Filters */}
          <div className="flex flex-wrap gap-4">
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
            
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground">Location:</span>
              <Button
                variant={selectedLocation === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLocation("all")}
              >
                All Locations
              </Button>
              {locations.map((location) => (
                <Button
                  key={location}
                  variant={selectedLocation === location ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLocation(location)}
                >
                  {location}
                </Button>
              ))}
            </div>
          </div>
        </div>

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
            {(searchQuery || selectedCategory !== "all" || selectedLocation !== "all") && (
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
              >
                <EventCard event={event} />
              </FreemiumGate>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
