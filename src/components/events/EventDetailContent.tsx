import { User, Mail, Globe, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventDetail } from "@/hooks/useEventBySlug";
import { EventCard } from "@/components/EventCard";
import { Link } from "react-router-dom";

interface EventDetailContentProps {
  event: EventDetail;
  relatedEvents: EventDetail[];
}

export const EventDetailContent = ({ event, relatedEvents }: EventDetailContentProps) => {
  const handleContactOrganizer = () => {
    const email = event.organizer_email || "";
    const subject = encodeURIComponent(`Inquiry about ${event.title}`);
    const body = encodeURIComponent(
      `Hi,\n\nI'm interested in learning more about "${event.title}".\n\nBest regards`
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">About This Event</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </section>

            {event.tags && event.tags.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Related Events */}
            {relatedEvents.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Related Events</h2>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/events">View All Events</Link>
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {relatedEvents.map((relEvent) => (
                    <EventCard key={relEvent.id} event={relEvent} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organizer Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Event Organizer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{event.organizer}</p>
                    <p className="text-sm text-muted-foreground">Organizer</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {event.organizer_email && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={handleContactOrganizer}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Organizer
                    </Button>
                  )}
                  {event.organizer_website && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      asChild
                    >
                      <a
                        href={event.organizer_website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Organizer Website
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </a>
                    </Button>
                  )}
                  {!event.organizer_email && !event.organizer_website && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={handleContactOrganizer}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Organizer
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Event Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Event Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Category</dt>
                    <dd className="font-medium">{event.category}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Type</dt>
                    <dd className="font-medium">{event.type}</dd>
                  </div>
                  {event.sector && (
                    <div>
                      <dt className="text-muted-foreground">Sector</dt>
                      <dd className="font-medium">{event.sector}</dd>
                    </div>
                  )}
                  {event.price && (
                    <div>
                      <dt className="text-muted-foreground">Price</dt>
                      <dd className="font-medium">{event.price}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
