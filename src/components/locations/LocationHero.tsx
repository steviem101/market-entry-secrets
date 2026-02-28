
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink, Users, TrendingUp } from "lucide-react";
import { LocationData } from "@/hooks/useLocations";

interface LocationHeroProps {
  location: LocationData;
}

export const LocationHero = ({ location }: LocationHeroProps) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'state': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'city': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'region': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <section className="bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="h-8 w-8 text-primary" />
            <Badge className={getTypeColor(location.location_type)}>
              {location.location_type.charAt(0).toUpperCase() + location.location_type.slice(1)}
            </Badge>
            <Badge variant="outline">
              {location.country === 'New Zealand' ? 'NZ' : 'AU'}
            </Badge>
            {location.business_environment_score && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Score: {location.business_environment_score}/100
              </Badge>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {location.hero_title}
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl">
            {location.hero_description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {location.government_agency_website && (
              <Button asChild>
                <a href={location.government_agency_website} target="_blank" rel="noopener noreferrer">
                  Visit {location.government_agency_name}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
          
          {location.population && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-5 w-5" />
              <span className="text-lg">Population: {location.population.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
