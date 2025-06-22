
import { CountryData } from "@/hooks/useCountries";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, MapPin, Building } from "lucide-react";

interface CountryHeroProps {
  country: CountryData;
}

export const CountryHero = ({ country }: CountryHeroProps) => {
  const economicData = country.economic_indicators;

  return (
    <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <h1 className="text-4xl md:text-5xl font-bold">{country.hero_title}</h1>
            {country.trade_relationship_strength && (
              <Badge variant={
                country.trade_relationship_strength === 'Strong' ? 'default' :
                country.trade_relationship_strength === 'Growing' ? 'secondary' : 'outline'
              } className="text-sm">
                {country.trade_relationship_strength} Trade Relations
              </Badge>
            )}
          </div>
          
          <p className="text-xl text-muted-foreground mb-8">
            {country.hero_description}
          </p>

          {/* Economic Indicators Grid */}
          {economicData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/50 backdrop-blur-sm rounded-lg p-6">
              {economicData.gdp && (
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">{economicData.gdp}</div>
                  <div className="text-sm text-muted-foreground">GDP</div>
                </div>
              )}
              {economicData.population && (
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">{economicData.population}</div>
                  <div className="text-sm text-muted-foreground">Population</div>
                </div>
              )}
              {economicData.trade_volume_aud && (
                <div className="text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <div className="text-2xl font-bold">{economicData.trade_volume_aud}</div>
                  <div className="text-sm text-muted-foreground">Annual Trade</div>
                </div>
              )}
              {economicData.major_exports && economicData.major_exports.length > 0 && (
                <div className="text-center">
                  <Building className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold">{economicData.major_exports.length}</div>
                  <div className="text-sm text-muted-foreground">Major Exports</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
