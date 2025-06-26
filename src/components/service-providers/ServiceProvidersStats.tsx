
import { Building2, MapPin } from "lucide-react";

interface ServiceProvidersStatsProps {
  organizationCount: number;
  locationCount: number;
}

export const ServiceProvidersStats = ({ 
  organizationCount, 
  locationCount 
}: ServiceProvidersStatsProps) => {
  return (
    <div className="bg-muted/50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-center gap-8 md:gap-16">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {organizationCount}
              </div>
              <div className="text-sm text-muted-foreground">
                Organizations
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MapPin className="w-6 h-6 text-primary" />
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
