
import { Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EventsHeroProps {
  totalEvents: number;
  totalLocations: number;
}

export const EventsHero = ({ 
  totalEvents, 
  totalLocations 
}: EventsHeroProps) => {
  return (
    <section className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 py-20">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-green-500/20 rounded-full">
            <Calendar className="w-12 h-12 text-green-600" />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
          Industry <span className="text-green-600">Events</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Connect with industry professionals and expand your network at upcoming events
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Badge variant="secondary" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {totalEvents} Events
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {totalLocations} Locations
          </Badge>
        </div>
      </div>
    </section>
  );
};
