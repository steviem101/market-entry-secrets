
import { Calendar, MapPin } from "lucide-react";
import { SubmissionButton } from "@/components/directory-submissions/SubmissionButton";

interface EventsHeroProps {
  totalEvents: number;
  totalLocations: number;
}

export const EventsHero = ({ 
  totalEvents, 
  totalLocations 
}: EventsHeroProps) => {
  return (
    <section className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 py-20">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-green-500/20 rounded-full">
            <Calendar className="w-12 h-12 text-green-600" />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
          Industry <span className="text-green-600">Events</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Connect with industry professionals and expand your network at upcoming events
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <SubmissionButton submissionType="event" variant="hero" size="lg" />
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
            <div className="text-3xl font-bold text-green-600 mb-1">{totalEvents}</div>
            <div className="text-sm text-gray-600">Events</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
            <div className="text-3xl font-bold text-emerald-600 mb-1">{totalLocations}</div>
            <div className="text-sm text-gray-600">Locations</div>
          </div>
        </div>
      </div>
    </section>
  );
};
