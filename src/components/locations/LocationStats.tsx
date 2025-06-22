
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Building2, Target, Zap } from "lucide-react";
import { LocationData } from "@/hooks/useLocations";

interface LocationStatsProps {
  location: LocationData;
}

export const LocationStats = ({ location }: LocationStatsProps) => {
  const getEcosystemColor = (strength: string | null) => {
    switch (strength) {
      case 'Strong': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Growing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Emerging': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Location Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {location.business_environment_score && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Business Environment</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{location.business_environment_score}/100</div>
                  <p className="text-xs text-muted-foreground">Overall score</p>
                </CardContent>
              </Card>
            )}

            {location.startup_ecosystem_strength && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Startup Ecosystem</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <Badge className={getEcosystemColor(location.startup_ecosystem_strength)}>
                    {location.startup_ecosystem_strength}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Growth potential</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Key Industries</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{location.key_industries.length}</div>
                <p className="text-xs text-muted-foreground">Major sectors</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Market Focus</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{location.location_type}</div>
                <p className="text-xs text-muted-foreground">Market type</p>
              </CardContent>
            </Card>
          </div>

          {location.key_industries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Key Industries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {location.key_industries.map((industry) => (
                    <Badge key={industry} variant="outline">
                      {industry}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};
