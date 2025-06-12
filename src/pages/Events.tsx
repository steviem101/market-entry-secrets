
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Clock } from "lucide-react";
import EventsHero from "@/components/events/EventsHero";
import EventsStats from "@/components/events/EventsStats";
import EventFilters from "@/components/events/EventFilters";
import EventCard from "@/components/events/EventCard";
import EventsSidebar from "@/components/events/EventsSidebar";

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
      
      <EventsHero />
      <EventsStats />

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
            <EventFilters 
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              events={events}
            />

            {/* Events List */}
            <div className="space-y-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>

          {/* Right Column - Calendar */}
          <EventsSidebar upcomingEvents={upcomingEvents} />
        </div>
      </div>
    </div>
  );
};

export default Events;
