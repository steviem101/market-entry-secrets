
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays, MapPin, Clock, Users, Plus, Search, Filter } from "lucide-react";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: string;
  category: string;
  attendees: number;
  description: string;
  organizer: string;
}

const Events = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const events: Event[] = [
    {
      id: "1",
      title: "FinTech Innovation Summit Australia",
      date: "2024-06-15",
      time: "9:00 AM - 5:00 PM",
      location: "Sydney Convention Centre",
      type: "Conference",
      category: "Finance",
      attendees: 500,
      description: "Australia's premier fintech conference bringing together industry leaders, startups, and investors.",
      organizer: "FinTech Australia"
    },
    {
      id: "2",
      title: "Telecom Network Transformation Forum",
      date: "2024-06-18",
      time: "10:00 AM - 4:00 PM",
      location: "Melbourne Exhibition Centre",
      type: "Forum",
      category: "Telecoms",
      attendees: 300,
      description: "Exploring the future of telecommunications infrastructure and 5G deployment in Australia.",
      organizer: "Telecom Industry Association"
    },
    {
      id: "3",
      title: "Digital Banking Workshop",
      date: "2024-06-20",
      time: "2:00 PM - 6:00 PM",
      location: "Brisbane Technology Park",
      type: "Workshop",
      category: "Finance",
      attendees: 150,
      description: "Hands-on workshop covering digital banking technologies and customer experience design.",
      organizer: "Australian Banking Association"
    },
    {
      id: "4",
      title: "5G & IoT Innovation Showcase",
      date: "2024-06-22",
      time: "11:00 AM - 3:00 PM",
      location: "Perth Convention Centre",
      type: "Showcase",
      category: "Telecoms",
      attendees: 250,
      description: "Showcasing cutting-edge 5G applications and IoT solutions for enterprise and consumer markets.",
      organizer: "Communications Alliance"
    },
    {
      id: "5",
      title: "RegTech & Compliance Forum",
      date: "2024-06-25",
      time: "9:30 AM - 4:30 PM",
      location: "Adelaide Convention Centre",
      type: "Forum",
      category: "Finance",
      attendees: 200,
      description: "Regulatory technology solutions for financial services compliance and risk management.",
      organizer: "RegTech Association"
    },
    {
      id: "6",
      title: "Satellite Communications Conference",
      date: "2024-06-28",
      time: "8:00 AM - 6:00 PM",
      location: "Canberra Convention Centre",
      type: "Conference",
      category: "Telecoms",
      attendees: 400,
      description: "Latest developments in satellite technology and space communications infrastructure.",
      organizer: "Space Industry Association"
    }
  ];

  const categories = ["All", "Finance", "Telecoms"];

  const filteredEvents = selectedCategory === "All" 
    ? events 
    : events.filter(event => event.category === selectedCategory);

  const upcomingEvents = filteredEvents.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section - Updated with blue theme */}
      <div className="relative">
        <div className="bg-gradient-to-r from-primary via-blue-500 to-primary text-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl font-bold mb-6">Your Gateway to the</h1>
              <h2 className="text-5xl font-bold mb-6 text-primary-foreground">Australian Market</h2>
              <p className="text-xl mb-8 opacity-90">
                Connect with vetted service providers, learn from success stories, and accelerate your market entry with expert guidance.
              </p>
              <div className="flex justify-center">
                <Button className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg">
                  Submit Event
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="bg-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
              <div>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarDays className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground">500+</div>
                <div className="text-muted-foreground">Upcoming Events</div>
              </div>
              <div>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground">1,200+</div>
                <div className="text-muted-foreground">Industry Leaders</div>
              </div>
              <div>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground">94%</div>
                <div className="text-muted-foreground">Networking Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Event Info */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Australian Market Entry Events Calendar</h2>
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Clock className="w-4 h-4" />
            <span>Times in GMT+10 — 5:15 PM</span>
          </div>
          <p className="text-muted-foreground mb-4">
            Your go-to for all the market entry events happening in Australia. Hosting an event for founders, operators, investors or community builders? Submit it here. 
            Collaborate? <span className="text-primary">hello@marketentrysecrets.com.au</span>
          </p>
        </div>

        <div className="flex gap-8">
          {/* Left Column - Events List */}
          <div className="flex-1">
            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-foreground">Events</h3>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Calendar View
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  List View
                </Button>
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Event
                </Button>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 mb-6">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full"
                >
                  {category}
                  {category !== "All" && (
                    <Badge variant="secondary" className="ml-2">
                      {events.filter(e => e.category === category).length}
                    </Badge>
                  )}
                </Button>
              ))}
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
              {filteredEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            {new Date(event.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })} • {new Date(event.date).toLocaleDateString('en-US', { 
                              weekday: 'long' 
                            })}
                          </span>
                          <Badge variant="secondary" className="bg-primary/10 text-primary">{event.category}</Badge>
                          <Badge variant="outline">{event.type}</Badge>
                        </div>
                        
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {event.title}
                        </h3>
                        
                        <p className="text-muted-foreground mb-3">
                          {event.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                      
                      <Button className="ml-4 bg-primary text-primary-foreground hover:bg-primary/90">
                        Register
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Column - Calendar */}
          <div className="w-80">
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
                  
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border-0"
                  />
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Upcoming Events</h3>
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="border-l-2 border-primary pl-3">
                        <div className="text-sm font-medium">{event.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(event.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })} • {event.time.split(' - ')[0]}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;
