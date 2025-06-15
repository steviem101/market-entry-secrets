
import { Building2, Calendar, Database, Users, Lightbulb, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SectorStatsProps {
  serviceProvidersCount: number;
  eventsCount: number;
  leadsCount: number;
  communityMembersCount: number;
  innovationEcosystemCount: number;
  tradeAgenciesCount: number;
}

const SectorStats = ({ 
  serviceProvidersCount, 
  eventsCount, 
  leadsCount, 
  communityMembersCount,
  innovationEcosystemCount,
  tradeAgenciesCount
}: SectorStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Service Providers</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{serviceProvidersCount}</div>
          <p className="text-xs text-muted-foreground">
            Specialized providers
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{eventsCount}</div>
          <p className="text-xs text-muted-foreground">
            Industry events
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Leads</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{leadsCount}</div>
          <p className="text-xs text-muted-foreground">
            Data opportunities
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expert Members</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{communityMembersCount}</div>
          <p className="text-xs text-muted-foreground">
            Industry experts
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Innovation Hub</CardTitle>
          <Lightbulb className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{innovationEcosystemCount}</div>
          <p className="text-xs text-muted-foreground">
            Ecosystem partners
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Trade Agencies</CardTitle>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{tradeAgenciesCount}</div>
          <p className="text-xs text-muted-foreground">
            Government support
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SectorStats;
