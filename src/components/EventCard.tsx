import { memo } from "react";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "@/components/BookmarkButton";
import { AddToCalendarButton } from "@/components/events/AddToCalendarButton";
import { Event } from "@/hooks/useEvents";
import { Link } from "react-router-dom";
import CompanyLogo from "@/components/shared/CompanyLogo";
import {
  formatEventDateLong,
  isEventPast as computeIsEventPast,
  daysUntilLabel,
  canAddToCalendar,
} from "@/lib/eventDate";

interface EventCardProps {
  event: Event;
  onViewDetails?: (event: Event) => void;
  useModal?: boolean;
}

export const EventCard = memo(({ event, onViewDetails, useModal = false }: EventCardProps) => {
  const isEventPast = computeIsEventPast(event);
  const dateLabel = formatEventDateLong(event);
  const daysLabel = daysUntilLabel(event);
  const showCalendarButton = !isEventPast && canAddToCalendar(event);
  const isApproximateDate = (event.date_precision ?? "exact") !== "exact";
  const timeLabel = event.time ?? (isApproximateDate ? "See website for time" : null);
  const organizerLabel = event.organizer ?? "Organizer TBC";
  const isCommunity = event.source === "apify_events_finder";
  const isOnline = event.event_format === "virtual";
  const platformLabel = event.source_platform
    ? event.source_platform.charAt(0).toUpperCase() + event.source_platform.slice(1)
    : null;

  const handleViewDetails = (e: React.MouseEvent) => {
    if (useModal && onViewDetails) {
      e.preventDefault();
      e.stopPropagation();
      onViewDetails(event);
    }
  };

  const cardContent = (
    <Card className={`h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${isEventPast ? "opacity-70" : ""}`}>
      {event.image_url && (
        <div className="relative w-full h-40 overflow-hidden bg-muted">
          <img
            src={event.image_url}
            alt={event.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          {isCommunity && platformLabel && (
            <Badge className="absolute left-2 top-2 border border-border bg-background/85 text-foreground backdrop-blur-sm">
              Community · {platformLabel}
            </Badge>
          )}
        </div>
      )}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Lead with the organizer logo only when there is no banner image */}
            {!event.image_url && (
              <CompanyLogo
                websiteUrl={event.organizer_website || event.website_url}
                existingLogoUrl={event.event_logo_url}
                companyName={organizerLabel || event.title}
                size="lg"
                className="w-14 h-14 md:w-16 md:h-16 rounded-lg border border-border flex-shrink-0"
                fallbackClassName="bg-primary/10 text-primary rounded-lg"
                imgClassName="object-contain p-1"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {isEventPast ? (
                  <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                    Past Event
                  </Badge>
                ) : daysLabel ? (
                  <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {daysLabel}
                  </Badge>
                ) : isApproximateDate ? (
                  <Badge variant="outline" className="text-xs">
                    Date TBC
                  </Badge>
                ) : null}
                {isOnline && (
                  <Badge variant="outline" className="text-xs">Online</Badge>
                )}
                {isCommunity && !event.image_url && platformLabel && (
                  <Badge variant="outline" className="text-xs">Community · {platformLabel}</Badge>
                )}
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
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>{dateLabel}</span>
          </div>
          {timeLabel ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>{timeLabel}</span>
            </div>
          ) : null}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate flex-1">{event.location}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground truncate min-w-0 flex-1">{organizerLabel}</span>
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
          {showCalendarButton && (
            <AddToCalendarButton
              title={event.title}
              description={event.description}
              date={event.date}
              time={event.time ?? ""}
              location={event.location}
              size="sm"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );

  return cardContent;
});

EventCard.displayName = "EventCard";
