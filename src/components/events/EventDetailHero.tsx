import { Calendar, MapPin, Clock, Users, User, ArrowLeft, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "@/components/BookmarkButton";
import { AddToCalendarButton } from "./AddToCalendarButton";
import { EventDetail } from "@/hooks/useEventBySlug";
import { Link } from "react-router-dom";
import { differenceInDays, isPast, format } from "date-fns";

interface EventDetailHeroProps {
  event: EventDetail;
}

export const EventDetailHero = ({ event }: EventDetailHeroProps) => {
  const eventDate = new Date(event.date);
  const isEventPast = isPast(eventDate);
  const daysUntil = differenceInDays(eventDate, new Date());

  return (
    <section className="bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/events" className="hover:text-primary flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Events
            </Link>
            <span>/</span>
            <span className="text-foreground truncate">{event.title}</span>
          </nav>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Logo */}
            <div className="flex-shrink-0">
              {event.event_logo_url ? (
                <img
                  src={event.event_logo_url}
                  alt={`${event.title} logo`}
                  className="w-20 h-20 rounded-xl object-cover border border-border"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-primary" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="secondary">{event.category}</Badge>
                <Badge variant="outline">{event.type}</Badge>
                {event.sector && <Badge variant="outline">{event.sector}</Badge>}
                {isEventPast ? (
                  <Badge variant="secondary" className="bg-muted text-muted-foreground">
                    Past Event
                  </Badge>
                ) : daysUntil <= 30 ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {daysUntil === 0 ? "Today!" : `In ${daysUntil} days`}
                  </Badge>
                ) : null}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                {event.title}
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>
                    {format(eventDate, "EEEE, d MMMM yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>{event.attendees.toLocaleString()} expected attendees</span>
                </div>
              </div>

              {event.price && (
                <p className="text-lg font-semibold text-primary mb-4">{event.price}</p>
              )}

              <div className="flex flex-wrap gap-3">
                {event.registration_url && !isEventPast && (
                  <Button asChild>
                    <a href={event.registration_url} target="_blank" rel="noopener noreferrer">
                      Register Now
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </a>
                  </Button>
                )}
                {event.website_url && (
                  <Button variant="outline" asChild>
                    <a href={event.website_url} target="_blank" rel="noopener noreferrer">
                      Event Website
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </a>
                  </Button>
                )}
                {!isEventPast && (
                  <AddToCalendarButton
                    title={event.title}
                    description={event.description}
                    date={event.date}
                    time={event.time}
                    location={event.location}
                  />
                )}
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
                  }}
                  variant="outline"
                  size="default"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
