import { EventCard } from "@/components/EventCard";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useAuth } from "@/hooks/useAuth";
import { PaywallModal } from "@/components/PaywallModal";
import SectorSection from "./SectorSection";

interface EventsSectionProps {
  events: any[];
  onViewEventDetails?: (event: any) => void;
}

const EventsSection = ({ events, onViewEventDetails }: EventsSectionProps) => {
  const { user, loading: authLoading } = useAuth();
  const { hasReachedLimit } = useUsageTracking();

  if (events.length === 0) return null;

  if (!authLoading && hasReachedLimit && !user) {
    return <PaywallModal contentType="events" />;
  }

  return (
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
  );
};

export default EventsSection;
