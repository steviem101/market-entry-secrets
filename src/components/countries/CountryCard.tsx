
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, Users } from "lucide-react";
import { CountryData } from "@/hooks/useCountries";
import { Link } from "react-router-dom";

interface CountryCardProps {
  country: CountryData;
}

const CountryCard = ({ country }: CountryCardProps) => {
  const economicData = country.economic_indicators;
  
  return (
    <Link to={`/countries/${country.slug}`}>
      <Card className="h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{country.name}</CardTitle>
            {country.trade_relationship_strength && (
              <Badge variant={
                country.trade_relationship_strength === 'Strong' ? 'default' :
                country.trade_relationship_strength === 'Growing' ? 'secondary' : 'outline'
              }>
                {country.trade_relationship_strength}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4 line-clamp-2">
            {country.description}
          </p>
          
          {/* Economic Indicators */}
          {economicData && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              {economicData.gdp && (
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                  <span>GDP: {economicData.gdp}</span>
                </div>
              )}
              {economicData.population && (
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-2 text-blue-500" />
                  <span>Pop: {economicData.population}</span>
                </div>
              )}
              {economicData.trade_volume_aud && (
                <div className="flex items-center text-sm col-span-2">
                  <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                  <span>Trade Volume: {economicData.trade_volume_aud}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Key Industries */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Key Industries:</p>
            <div className="flex flex-wrap gap-1">
              {country.key_industries.slice(0, 3).map((industry) => (
                <Badge key={industry} variant="outline" className="text-xs">
                  {industry}
                </Badge>
              ))}
              {country.key_industries.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{country.key_industries.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CountryCard;
