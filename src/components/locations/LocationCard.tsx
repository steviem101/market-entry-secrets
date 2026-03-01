
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, TrendingUp, Building2, ExternalLink } from "lucide-react";
import { LocationData } from "@/hooks/useLocations";

interface LocationCardProps {
  location: LocationData;
}

export const LocationCard = ({ location }: LocationCardProps) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'state': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'city': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'region': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getEcosystemColor = (strength: string | null) => {
    switch (strength) {
      case 'Strong': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Growing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Emerging': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300 group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-primary" />
            <Badge className={getTypeColor(location.location_type)}>
              {location.location_type.charAt(0).toUpperCase() + location.location_type.slice(1)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {location.country === 'New Zealand' ? 'NZ' : 'AU'}
            </Badge>
          </div>
          {location.business_environment_score && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>{location.business_environment_score}/100</span>
            </div>
          )}
        </div>
        
        <CardTitle className="group-hover:text-primary transition-colors">
          {location.name}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {location.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {location.population && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{location.population.toLocaleString()} residents</span>
          </div>
        )}
        
        {location.startup_ecosystem_strength && (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <Badge className={getEcosystemColor(location.startup_ecosystem_strength)}>
              {location.startup_ecosystem_strength} Ecosystem
            </Badge>
          </div>
        )}
        
        {location.key_industries.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Key Industries:</p>
            <div className="flex flex-wrap gap-1">
              {location.key_industries.slice(0, 3).map((industry) => (
                <Badge key={industry} variant="outline" className="text-xs">
                  {industry}
                </Badge>
              ))}
              {location.key_industries.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{location.key_industries.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {location.government_agency_name && (
          <div className="text-sm">
            <p className="font-medium">Supported by:</p>
            <p className="text-muted-foreground">{location.government_agency_name}</p>
          </div>
        )}
        
        <div className="pt-4">
          <Link to={`/locations/${location.slug}`}>
            <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              Explore {location.name}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
