
import { useParams } from "react-router-dom";
import { getSectorConfig } from "@/config/sectors";
import Navigation from "@/components/Navigation";
import { 
  useSectorServiceProviders, 
  useSectorEvents, 
  useSectorLeads, 
  useSectorCommunityMembers,
  useSectorInnovationEcosystem,
  useSectorTradeAgencies
} from "@/hooks/useSectorData";
import NotFound from "./NotFound";
import SectorHero from "@/components/sectors/SectorHero";
import SectorStats from "@/components/sectors/SectorStats";
import SectorContent from "@/components/sectors/SectorContent";

const SectorPage = () => {
  const { sectorId } = useParams<{ sectorId: string }>();
  const sectorConfig = getSectorConfig(sectorId || '');

  const { data: serviceProviders = [], isLoading: providersLoading } = useSectorServiceProviders(sectorId || '');
  const { data: events = [], isLoading: eventsLoading } = useSectorEvents(sectorId || '');
  const { data: leads = [], isLoading: leadsLoading } = useSectorLeads(sectorId || '');
  const { data: communityMembers = [], isLoading: communityLoading } = useSectorCommunityMembers(sectorId || '');
  const { data: innovationEcosystem = [], isLoading: innovationLoading } = useSectorInnovationEcosystem(sectorId || '');
  const { data: tradeAgencies = [], isLoading: tradeLoading } = useSectorTradeAgencies(sectorId || '');

  if (!sectorConfig) {
    return <NotFound />;
  }

  const isLoading = providersLoading || eventsLoading || leadsLoading || communityLoading || innovationLoading || tradeLoading;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <SectorHero 
        title={sectorConfig.heroTitle}
        description={sectorConfig.heroDescription}
      />

      {/* Stats and Content Section */}
      <div className="container mx-auto px-4 py-8">
        <SectorStats
          serviceProvidersCount={serviceProviders.length}
          eventsCount={events.length}
          leadsCount={leads.length}
          communityMembersCount={communityMembers.length}
          innovationEcosystemCount={innovationEcosystem.length}
          tradeAgenciesCount={tradeAgencies.length}
        />

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading sector data...</p>
          </div>
        ) : (
          <SectorContent
            serviceProviders={serviceProviders}
            events={events}
            leads={leads}
            communityMembers={communityMembers}
            innovationEcosystem={innovationEcosystem}
            tradeAgencies={tradeAgencies}
            sectorName={sectorConfig.name}
          />
        )}
      </div>
    </div>
  );
};

export default SectorPage;
