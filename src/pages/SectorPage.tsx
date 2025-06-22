
import { useParams } from "react-router-dom";
import { useSectorBySlug } from "@/hooks/useSectors";
import Navigation from "@/components/Navigation";
import { useSectorServiceProviders } from "@/hooks/useSectorServiceProviders";
import { useSectorEvents } from "@/hooks/useSectorEvents";
import { useSectorLeads } from "@/hooks/useSectorLeads";
import { useSectorCommunityMembers } from "@/hooks/useSectorCommunityMembers";
import { useSectorInnovationEcosystem } from "@/hooks/useSectorInnovationEcosystem";
import { useSectorTradeAgencies } from "@/hooks/useSectorTradeAgencies";
import { useSectorContent } from "@/hooks/useSectorContent";
import NotFound from "./NotFound";
import SectorHero from "@/components/sectors/SectorHero";
import SectorStats from "@/components/sectors/SectorStats";
import SectorContent from "@/components/sectors/SectorContent";

const SectorPage = () => {
  const { sectorId } = useParams<{ sectorId: string }>();
  const { data: sectorConfig, isLoading: sectorLoading, error } = useSectorBySlug(sectorId || '');

  const { data: serviceProviders = [], isLoading: providersLoading } = useSectorServiceProviders(sectorId || '');
  const { data: events = [], isLoading: eventsLoading } = useSectorEvents(sectorId || '');
  const { data: leads = [], isLoading: leadsLoading } = useSectorLeads(sectorId || '');
  const { data: communityMembers = [], isLoading: communityLoading } = useSectorCommunityMembers(sectorId || '');
  const { data: innovationEcosystem = [], isLoading: innovationLoading } = useSectorInnovationEcosystem(sectorId || '');
  const { data: tradeAgencies = [], isLoading: tradeLoading } = useSectorTradeAgencies(sectorId || '');
  const { data: contentItems = [], isLoading: contentLoading } = useSectorContent(sectorId || '');

  if (sectorLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading sector...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !sectorConfig) {
    return <NotFound />;
  }

  const isLoading = providersLoading || eventsLoading || leadsLoading || communityLoading || innovationLoading || tradeLoading || contentLoading;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <SectorHero 
        title={sectorConfig.hero_title}
        description={sectorConfig.hero_description}
      />

      {/* Stats and Content Section */}
      <div className="container mx-auto px-4 py-8">
        <SectorStats
          serviceProviders={serviceProviders}
          events={events}
          leads={leads}
          communityMembers={communityMembers}
          innovationEcosystem={innovationEcosystem}
          tradeAgencies={tradeAgencies}
          contentItems={contentItems}
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
            contentItems={contentItems}
            sectorName={sectorConfig.name}
          />
        )}
      </div>
    </div>
  );
};

export default SectorPage;
