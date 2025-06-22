
import { Lightbulb, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface InnovationEcosystemHeroProps {
  organizationCount: number;
  locationCount: number;
}

const InnovationEcosystemHero = ({ organizationCount, locationCount }: InnovationEcosystemHeroProps) => {
  return (
    <section className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-orange-500/20 rounded-full">
              <Lightbulb className="w-12 h-12 text-orange-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Innovation Ecosystem
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Connect with innovation hubs, accelerators, incubators, and research institutions that drive entrepreneurship and technological advancement
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge variant="secondary" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              {organizationCount} Organizations
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {locationCount} Locations
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InnovationEcosystemHero;
