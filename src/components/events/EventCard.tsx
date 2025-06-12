
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Users } from "lucide-react";

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

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
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
  );
};

export default EventCard;
