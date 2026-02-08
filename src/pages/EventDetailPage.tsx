import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { EventDetailHero } from "@/components/events/EventDetailHero";
import { EventDetailContent } from "@/components/events/EventDetailContent";
import { useEventBySlug, useRelatedEvents } from "@/hooks/useEventBySlug";
import { format } from "date-fns";

const EventDetailPage = () => {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const { data: event, isLoading, error } = useEventBySlug(eventSlug || "");
  const { data: relatedEvents = [] } = useRelatedEvents(
    event?.id || "",
    event?.category || "",
    event?.sector
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <PageSkeleton />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="text-muted-foreground">
            The event you're looking for doesn't exist or has been removed.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  const formattedDate = format(new Date(event.date), "d MMMM yyyy");

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{event.title} | Market Entry Secrets</title>
        <meta
          name="description"
          content={`${event.title} - ${formattedDate} in ${event.location}. ${event.description.slice(0, 120)}...`}
        />
        <meta property="og:title" content={event.title} />
        <meta
          property="og:description"
          content={`${formattedDate} in ${event.location}. ${event.description.slice(0, 120)}`}
        />
        <link rel="canonical" href={`https://market-entry-secrets.lovable.app/events/${event.slug}`} />
      </Helmet>

      <Navigation />

      <main>
        <EventDetailHero event={event} />
        <EventDetailContent event={event} relatedEvents={relatedEvents} />
      </main>

      <Footer />
    </div>
  );
};

export default EventDetailPage;
