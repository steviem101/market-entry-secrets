
import { TrendingUp, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TradeInvestmentAgenciesHeroProps {
  agencyCount: number;
  locationCount: number;
}

const TradeInvestmentAgenciesHero = ({ agencyCount, locationCount }: TradeInvestmentAgenciesHeroProps) => {
  return (
    <section className="bg-gradient-to-r from-green-500/10 to-blue-500/10 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-green-500/20 rounded-full">
              <TrendingUp className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Trade & Investment Agencies
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Connect with government trade offices, investment promotion agencies, and bilateral trade organizations that facilitate international business expansion
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge variant="secondary" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {agencyCount} Agencies
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

export default TradeInvestmentAgenciesHero;
