import { EventCard } from "@/components/EventCard";
import { ListingPageGate } from "@/components/ListingPageGate";
import SectorSection from "./SectorSection";

interface EventsSectionProps {
  events: any[];
  onViewEventDetails?: (event: any) => void;
}

const EventsSection = ({ events, onViewEventDetails }: EventsSectionProps) => {
  if (events.length === 0) return null;

  return (
    <ListingPageGate contentType="events">
      <SectorSection
        title="Upcoming Industry Events"
        viewAllLink="/events"
        viewAllText="View All Events"
        isEmpty={false}
      >
        {events.slice(0, 6).map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onViewDetails={onViewEventDetails}
            useModal={!!onViewEventDetails}
          />
        ))}
      </SectorSection>
    </ListingPageGate>
  );
};

export default EventsSection;
