
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
      
      {/* Hero Section */}
      <div className="relative">
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-5xl font-bold mb-4">AUSTRALIAN MARKET ENTRY EVENTS</h1>
                <div className="flex items-center gap-6 mb-6">
                  
                  
                  
                  
                  
                </div>
              </div>
              <Button className="bg-white/20 text-white border border-white/30 hover:bg-white/30">
                Subscribed
              </Button>
            </div>
          </div>
        </div>
        
        {/* Logo positioned over the gradient */}
        <div className="absolute bottom-0 left-8 transform translate-y-1/2">
          <div className="w-24 h-24 bg-blue-500 rounded-xl flex items-center justify-center">
            <div className="text-white text-2xl font-bold">📅</div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 mt-8">
        {/* Event Info */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Australian Market Entry Events Calendar</h2>
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Clock className="w-4 h-4" />
            <span>Times in GMT+10 — 5:15 PM</span>
          </div>
          <p className="text-muted-foreground mb-8">
            Your go-to for all the market entry events happening in Australia. Hosting an event for founders, operators, investors or community builders? Submit it here. 
            Collaborate? <span className="text-primary">hello@marketentrysecrets.com.au</span>
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
            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-2xl font-bold text-foreground">Events</h3>
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

            {/* Search Bar */}
            <div className="mb-6">
              <EventSearch
                onSearch={handleSearch}
                onClear={handleClearSearch}
                isSearching={isSearching}
              />
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
