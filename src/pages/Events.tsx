import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { CalendarDays, MapPin, Clock, Users, Filter } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { EventSubmissionForm } from "@/components/events/EventSubmissionForm";
import { EventSearch } from "@/components/events/EventSearch";
import { supabase } from "@/integrations/supabase/client";

const Events = () => {
  const {
    events,
    loading,
    error,
    refetch,
    searchEvents,
    clearSearch,
    isSearching
  } = useEvents();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [allEvents, setAllEvents] = useState<any[]>([]);

  // Fetch all events for featured section (unfiltered)
  const fetchAllEvents = async () => {
    try {
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      setAllEvents(data || []);
    } catch (error) {
      console.error('Error fetching all events:', error);
    }
  };

  // Load all events on component mount
  useEffect(() => {
    fetchAllEvents();
  }, []);

  const handleEventSubmitted = () => {
    refetch();
    fetchAllEvents(); // Also refresh the all events for featured section
  };

  const handleSearch = (query: string) => {
    searchEvents(query);
    setSelectedCategory("All"); // Reset category filter when searching
  };

  const handleClearSearch = () => {
    clearSearch();
    setSelectedCategory("All");
  };

  if (loading) {
    return <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading events...</div>
        </div>
      </div>;
  }

  if (error) {
    return <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">Error loading events: {error}</div>
        </div>
      </div>;
  }

  const categories = ["All", ...Array.from(new Set(events.map(event => event.category)))];
  const filteredEvents = selectedCategory === "All" ? events : events.filter(event => event.category === selectedCategory);
  const upcomingEvents = filteredEvents.slice(0, 3);
  const featuredEvents = allEvents.slice(0, 3); // Always use unfiltered events for featured section

  return <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section - Updated to match site branding */}
      <div className="bg-gradient-to-br from-background via-muted/30 to-background border-b border-border">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                <CalendarDays className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Australian Market Entry Events
            </h1>
            <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
              Your go-to calendar for all market entry events happening across Australia. 
              Connect with founders, operators, investors, and community builders.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Times in GMT+10</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <EventSubmissionForm onEventSubmitted={handleEventSubmitted} />
              <Button variant="outline">
                Subscribe to Updates
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Event Info */}
        <div className="mb-8">
          <p className="text-muted-foreground mb-8 text-center max-w-3xl mx-auto">
            Hosting an event for founders, operators, investors or community builders? Submit it above. 
            Want to collaborate? Contact us at <span className="text-primary font-medium">hello@marketentrysecrets.com.au</span>
          </p>

          {/* Featured Events Carousel */}
          {featuredEvents.length > 0 && <div className="mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-6">Featured Events</h3>
              <Carousel className="w-full">
                <CarouselContent>
                  {featuredEvents.map(event => <CarouselItem key={event.id} className="md:basis-1/2 lg:basis-1/3">
                      <Card className="h-full hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary">{event.category}</Badge>
                            <Badge variant="outline">{event.type}</Badge>
                          </div>
                          
                          <h4 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                            {event.title}
                          </h4>
                          
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                            {event.description}
                          </p>
                          
                          <div className="space-y-2 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="w-4 h-4" />
                              <span>
                                {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            weekday: 'short'
                          })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span className="line-clamp-1">{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>{event.attendees} attending</span>
                            </div>
                          </div>
                          
                          <Button className="w-full" size="sm">
                            Register
                          </Button>
                        </CardContent>
                      </Card>
                    </CarouselItem>)}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>}
        </div>

        <div className="flex gap-8">
          {/* Left Column - Events List */}
          <div className="flex-1">
            {/* Events Header */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-foreground mb-4">Events</h3>
              
              {/* Controls Row */}
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Search Bar */}
                <div className="flex-1 max-w-md">
                  <EventSearch
                    onSearch={handleSearch}
                    onClear={handleClearSearch}
                    isSearching={isSearching}
                  />
                </div>
                
                {/* Buttons */}
                <div className="flex flex-wrap items-center gap-4">
                  <Button variant="outline" size="sm">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    Calendar View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    List View
                  </Button>
                  <EventSubmissionForm onEventSubmitted={handleEventSubmitted} />
                </div>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map(category => <Button key={category} variant={selectedCategory === category ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(category)} className="rounded-full">
                  {category}
                  {category !== "All" && <Badge variant="secondary" className="ml-2">
                      {events.filter(e => e.category === category).length}
                    </Badge>}
                </Button>)}
            </div>

            {/* Location Filters */}
            <div className="flex gap-2 mb-8 flex-wrap">
              <Badge variant="outline">Sydney 8</Badge>
              <Badge variant="outline">Melbourne 6</Badge>
              <Badge variant="outline">Brisbane 4</Badge>
              <Badge variant="outline">Perth 3</Badge>
              <Badge variant="outline">Adelaide 2</Badge>
              <Badge variant="outline">Canberra 1</Badge>
              <Badge variant="outline">+2</Badge>
            </div>

            {/* Events List */}
            <div className="space-y-6">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {isSearching ? "No events found matching your search." : "No events found."}
                  </p>
                </div>
              ) : (
                filteredEvents.map(event => <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })} • {new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'long'
                          })}
                            </span>
                            <Badge variant="secondary">{event.category}</Badge>
                            <Badge variant="outline">{event.type}</Badge>
                          </div>
                          
                          <h3 className="text-xl font-semibold text-foreground mb-2">
                            {event.title}
                          </h3>
                          
                          <p className="text-muted-foreground mb-3">
                            {event.description}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{event.attendees} attending</span>
                            </div>
                          </div>
                          
                          <div className="mt-3 text-sm text-muted-foreground">
                            Organized by {event.organizer}
                          </div>
                        </div>
                        
                        <Button className="self-start sm:ml-4">
                          Register
                        </Button>
                      </div>
                    </CardContent>
                  </Card>)
              )}
            </div>
          </div>

          {/* Right Column - Calendar */}
          <div className="w-80 hidden lg:block">
            <div className="sticky top-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">June</h3>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">‹</Button>
                      <Button variant="ghost" size="sm">›</Button>
                    </div>
                  </div>
                  
                  <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md border-0" />
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Upcoming Events</h3>
                  <div className="space-y-3">
                    {upcomingEvents.map(event => <div key={event.id} className="border-l-2 border-primary pl-3">
                        <div className="text-sm font-medium">{event.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })} • {event.time.split(' - ')[0]}
                        </div>
                      </div>)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>;
};

export default Events;
