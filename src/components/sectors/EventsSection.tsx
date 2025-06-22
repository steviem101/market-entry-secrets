
import { EventCard } from "@/components/EventCard";
import { FreemiumGate } from "@/components/FreemiumGate";
import SectorSection from "./SectorSection";

interface EventsSectionProps {
  events: any[];
}

const EventsSection = ({ events }: EventsSectionProps) => {
  if (events.length === 0) return null;

  return (
    <SectorSection
      title="Upcoming Industry Events"
      viewAllLink="/events"
      viewAllText="View All Events"
      isEmpty={false}
    >
      {events.slice(0, 6).map((event) => (
        <FreemiumGate
          key={event.id}
          contentType="events"
          itemId={event.id}
        >
          <EventCard event={event} />
        </FreemiumGate>
      ))}
    </SectorSection>
  );
};

export default EventsSection;
