import { Calendar, MapPin, Users, Clock, User, CalendarPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "@/components/BookmarkButton";
import { AddToCalendarButton } from "@/components/events/AddToCalendarButton";
import { Event } from "@/hooks/useEvents";
import { Link } from "react-router-dom";
import { differenceInDays, isPast, format } from "date-fns";

interface EventCardProps {
  event: Event;
  onViewDetails?: (event: Event) => void;
  useModal?: boolean;
}

export const EventCard = ({ event, onViewDetails, useModal = false }: EventCardProps) => {
  const eventDate = new Date(event.date);
  const isEventPast = isPast(eventDate);
  const daysUntil = differenceInDays(eventDate, new Date());
  const monthShort = format(eventDate, "MMM").toUpperCase();
  const dayNum = format(eventDate, "d");

  const handleViewDetails = (e: React.MouseEvent) => {
    if (useModal && onViewDetails) {
      e.preventDefault();
      e.stopPropagation();
      onViewDetails(event);
    }
  };

  const cardContent = (
    <Card className={`h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${isEventPast ? "opacity-70" : ""}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Date Badge */}
            <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-primary/10 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-primary leading-none">{monthShort}</span>
              <span className="text-lg font-bold text-primary leading-tight">{dayNum}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {isEventPast ? (
                  <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                    Past Event
                  </Badge>
                ) : daysUntil <= 14 ? (
                  <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {daysUntil === 0 ? "Today" : `In ${daysUntil} days`}
                  </Badge>
                ) : null}
              </div>
              <CardTitle className="text-lg font-semibold line-clamp-2 leading-tight">
                {event.title}
              </CardTitle>
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
            className="flex-shrink-0"
          />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col pt-0">
        <CardDescription className="line-clamp-2 mb-4 flex-1">
          {event.description}
        </CardDescription>
        
        <div className="flex items-center justify-between gap-2 mb-4">
          <Badge variant="secondary" className="text-xs font-medium">
            {event.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {event.type}
          </Badge>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate flex-1">{event.location}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-3 h-3 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground truncate">{event.organizer}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
              <Users className="w-4 h-4" />
              <span>{event.attendees.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          {useModal ? (
            <Button variant="default" size="sm" className="flex-1" onClick={handleViewDetails}>
              View Details
            </Button>
          ) : (
            <Button variant="default" size="sm" className="flex-1" asChild>
              <Link to={`/events/${event.slug}`}>View Details</Link>
            </Button>
          )}
          {!isEventPast && (
            <AddToCalendarButton
              title={event.title}
              description={event.description}
              date={event.date}
              time={event.time}
              location={event.location}
              size="sm"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );

  return cardContent;
};
