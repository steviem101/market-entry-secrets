
import { Users, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CommunityHeroProps {
  totalExperts: number;
  totalLocations: number;
}

export const CommunityHero = ({ totalExperts, totalLocations }: CommunityHeroProps) => {
  return (
    <section className="bg-gradient-to-r from-purple-500/10 to-violet-500/10 py-20">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-purple-500/20 rounded-full">
            <Users className="w-12 h-12 text-purple-600" />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
          Market Entry <span className="text-purple-600">Experts</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Connect with experienced professionals who have successfully navigated market entry challenges. Get expert guidance from those who've been there before.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Badge variant="secondary" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {totalExperts} Experts
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {totalLocations} Locations
          </Badge>
        </div>
      </div>
    </section>
  );
};
