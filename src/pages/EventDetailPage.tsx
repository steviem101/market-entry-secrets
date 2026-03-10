import { useParams } from "react-router-dom";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { EventDetailHero } from "@/components/events/EventDetailHero";
import { EventDetailContent } from "@/components/events/EventDetailContent";
import { useEventBySlug, useRelatedEvents } from "@/hooks/useEventBySlug";
import { FreemiumGate } from "@/components/FreemiumGate";
import { EntityBreadcrumb } from "@/components/common/EntityBreadcrumb";
import { SEOHead } from "@/components/common/SEOHead";
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
    return <PageSkeleton />;
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
        <p className="text-muted-foreground">
          The event you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  const formattedDate = format(new Date(event.date), "d MMMM yyyy");
  const pageDescription = `${event.title} - ${formattedDate}${event.location ? ` in ${event.location}` : ""}. ${(event.description || "").slice(0, 120)}`;

  return (
    <>
      <SEOHead
        title={`${event.title} | Market Entry Secrets`}
        description={pageDescription}
        canonicalPath={`/events/${event.slug}`}
        ogImage={event.image_url || event.event_logo_url}
        jsonLd={{
          type: "Event",
          data: {
            name: event.title,
            description: event.description,
            startDate: event.date,
            location: {
              "@type": "Place",
              name: event.location,
            },
            organizer: event.organizer
              ? {
                  "@type": "Organization",
                  name: event.organizer,
                }
              : undefined,
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            ...(event.registration_url ? { url: event.registration_url } : {}),
            ...(event.image_url ? { image: event.image_url } : {}),
          },
        }}
      />

      <FreemiumGate
        contentType="events"
        itemId={event.id}
        contentTitle={event.title}
        contentDescription={event.description}
      >
        <main>
          <EntityBreadcrumb
            segments={[
              { label: "Events", href: "/events" },
              { label: event.title },
            ]}
          />
          <EventDetailHero event={event} />
          <EventDetailContent event={event} relatedEvents={relatedEvents} />
        </main>
      </FreemiumGate>
    </>
  );
};

export default EventDetailPage;
