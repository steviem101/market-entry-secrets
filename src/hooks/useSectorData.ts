
import { useSectorBySlug } from "@/hooks/useSectors";
import { useSectorServiceProviders } from "@/hooks/useSectorServiceProviders";
import { useSectorEvents } from "@/hooks/useSectorEvents";
import { useSectorLeads } from "@/hooks/useSectorLeads";
import { useSectorCommunityMembers } from "@/hooks/useSectorCommunityMembers";
import { useSectorInnovationEcosystem } from "@/hooks/useSectorInnovationEcosystem";
import { useSectorTradeAgencies } from "@/hooks/useSectorTradeAgencies";
import { useSectorContent } from "@/hooks/useSectorContent";

// Main hook that combines all sector data
export function useSectorData(sectorId: string | undefined) {
  const sectorSlug = sectorId || '';
  const { data: sector, isLoading: sectorLoading } = useSectorBySlug(sectorSlug);
  
  const { data: serviceProviders = [] } = useSectorServiceProviders(sectorSlug);
  const { data: events = [] } = useSectorEvents(sectorSlug);
  const { data: leads = [] } = useSectorLeads(sectorSlug);
  const { data: communityMembers = [] } = useSectorCommunityMembers(sectorSlug);
  const { data: innovationEcosystem = [] } = useSectorInnovationEcosystem(sectorSlug);
  const { data: tradeAgencies = [] } = useSectorTradeAgencies(sectorSlug);
  const { data: contentItems = [] } = useSectorContent(sectorSlug);

  return {
    sector,
    serviceProviders,
    events,
    leads,
    communityMembers,
    innovationEcosystem,
    tradeAgencies,
    contentItems,
    isLoading: sectorLoading
  };
}
