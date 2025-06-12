
import { CalendarDays, Users, MapPin } from "lucide-react";

const EventsStats = () => {
  return (
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
  );
};

export default EventsStats;
