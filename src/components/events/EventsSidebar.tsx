
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import UpcomingEvents from "./UpcomingEvents";

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

interface EventsSidebarProps {
  upcomingEvents: Event[];
}

const EventsSidebar = ({ upcomingEvents }: EventsSidebarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  return (
    <div className="w-80">
      <div className="sticky top-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">June</h3>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm">‹</Button>
                <Button variant="ghost" size="sm">›</Button>
              </div>
            </div>
            
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border-0"
            />
          </CardContent>
        </Card>

        <UpcomingEvents events={upcomingEvents} />
      </div>
    </div>
  );
};

export default EventsSidebar;
