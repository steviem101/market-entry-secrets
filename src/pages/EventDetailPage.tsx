import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { EventDetailHero } from "@/components/events/EventDetailHero";
import { EventDetailContent } from "@/components/events/EventDetailContent";
import { useEventBySlug, useRelatedEvents } from "@/hooks/useEventBySlug";
import { FreemiumGate } from "@/components/FreemiumGate";
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
      <>
        <PageSkeleton />
      </>
    );
  }

  if (error || !event) {
    return (
      <>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="text-muted-foreground">
            The event you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </>
    );
  }

  const formattedDate = format(new Date(event.date), "d MMMM yyyy");

  return (
    <>
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


      <FreemiumGate
        contentType="events"
        itemId={event.id}
        contentTitle={event.title}
        contentDescription={event.description}
      >
        <main>
          <EventDetailHero event={event} />
          <EventDetailContent event={event} relatedEvents={relatedEvents} />
        </main>
      </FreemiumGate>

    </>
  );
};

export default EventDetailPage;
