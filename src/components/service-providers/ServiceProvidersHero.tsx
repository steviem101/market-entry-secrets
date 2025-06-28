
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Briefcase } from "lucide-react";

interface ServiceProvidersHeroProps {
  totalCompanies: number;
  uniqueLocations: number;
  totalServices: number;
}

export const ServiceProvidersHero = ({
  totalCompanies,
  uniqueLocations,
  totalServices
}: ServiceProvidersHeroProps) => {
  return (
    <section className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 py-20">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-blue-500/20 rounded-full">
            <Users className="w-12 h-12 text-blue-600" />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
          Service <span className="text-blue-600">Providers</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Connect with trusted service providers who specialize in helping businesses 
          successfully enter and expand in new markets.
        </p>
        
        {/* Database Counters */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Badge variant="secondary" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {totalCompanies} Companies
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {uniqueLocations} Locations
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            {totalServices} Services
          </Badge>
        </div>
      </div>
    </section>
  );
};
