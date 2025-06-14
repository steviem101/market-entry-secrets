
import { Calendar, MapPin, Users, Clock, Building } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/BookmarkButton";
import { Event } from "@/hooks/useEvents";

interface EventCardProps {
  event: Event;
}

export const EventCard = ({ event }: EventCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2 mb-2">
              {event.title}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{event.time}</span>
              </div>
            </div>
          </div>
          <BookmarkButton
            contentType="event"
            contentId={event.id}
            title={event.title}
            description={event.description}
            metadata={{
              date: event.date,
              location: event.location,
              organizer: event.organizer,
              category: event.category,
              attendees: event.attendees
            }}
            size="sm"
            variant="ghost"
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <CardDescription className="line-clamp-3 mb-4">
          {event.description}
        </CardDescription>
        
        <div className="flex items-center justify-between mb-3">
          <Badge variant="secondary" className="text-xs">
            {event.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {event.type}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Building className="w-3 h-3" />
            <span className="truncate">{event.organizer}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{event.attendees} attending</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
