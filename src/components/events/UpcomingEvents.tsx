
import { Card, CardContent } from "@/components/ui/card";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: string;
  category: string;
  attendees: number;
  description: string;
  organizer: string;
}

interface UpcomingEventsProps {
  events: Event[];
}

const UpcomingEvents = ({ events }: UpcomingEventsProps) => {
  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <h3 className="font-semibold mb-4">Upcoming Events</h3>
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="border-l-2 border-primary pl-3">
              <div className="text-sm font-medium">{event.title}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(event.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })} • {event.time.split(' - ')[0]}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingEvents;
