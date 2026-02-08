import { Calendar, MapPin, TrendingUp } from "lucide-react";
import { SubmissionButton } from "@/components/directory-submissions/SubmissionButton";

interface EventsHeroProps {
  totalEvents: number;
  totalLocations: number;
  upcomingCount?: number;
}

export const EventsHero = ({
  totalEvents,
  totalLocations,
  upcomingCount,
}: EventsHeroProps) => {
  return (
    <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-20">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-primary/20 rounded-full">
            <Calendar className="w-12 h-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
          Industry <span className="text-primary">Events</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Connect with industry professionals and expand your network at
          upcoming conferences, trade shows, meetups and events
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <SubmissionButton submissionType="event" variant="hero" size="lg" />
        </div>

        <div className="flex flex-wrap justify-center gap-8 text-center">
          <div className="bg-card/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
            <div className="text-3xl font-bold text-primary mb-1">{totalEvents}</div>
            <div className="text-sm text-muted-foreground">Total Events</div>
          </div>
          {upcomingCount !== undefined && (
            <div className="bg-card/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
              <div className="text-3xl font-bold text-primary mb-1">{upcomingCount}</div>
              <div className="text-sm text-muted-foreground">Upcoming</div>
            </div>
          )}
          <div className="bg-card/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
            <div className="text-3xl font-bold text-accent mb-1">{totalLocations}</div>
            <div className="text-sm text-muted-foreground">Locations</div>
          </div>
        </div>
      </div>
    </section>
  );
};
