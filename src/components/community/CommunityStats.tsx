
import { Users, MapPin } from "lucide-react";

interface CommunityStatsProps {
  memberCount: number;
  locationCount: number;
}

export const CommunityStats = ({ 
  memberCount, 
  locationCount 
}: CommunityStatsProps) => {
  return (
    <div className="bg-muted/50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-center gap-8 md:gap-16">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {memberCount}
              </div>
              <div className="text-sm text-muted-foreground">
                Experts
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {locationCount}
              </div>
              <div className="text-sm text-muted-foreground">
                Locations
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
