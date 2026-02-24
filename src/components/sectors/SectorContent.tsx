
import NoDataMessage from "./NoDataMessage";
import ContentSection from "./ContentSection";
import ServiceProvidersSection from "./ServiceProvidersSection";
import InnovationEcosystemSection from "./InnovationEcosystemSection";
import InvestorSection from "./InvestorSection";
import TradeAgenciesSection from "./TradeAgenciesSection";
import EventsSection from "./EventsSection";
import LeadsSection from "./LeadsSection";
import CommunityMembersSection from "./CommunityMembersSection";

interface SectorContentProps {
  serviceProviders: any[];
  events: any[];
  leads: any[];
  communityMembers: any[];
  innovationEcosystem: any[];
  investors: any[];
  tradeAgencies: any[];
  contentItems: any[];
  sectorName: string;
}

const SectorContent = ({
  serviceProviders,
  events,
  leads,
  communityMembers,
  innovationEcosystem,
  investors,
  tradeAgencies,
  contentItems,
  sectorName
}: SectorContentProps) => {
  // If no data at all, show message
  if (serviceProviders.length === 0 && events.length === 0 && leads.length === 0 &&
      communityMembers.length === 0 && innovationEcosystem.length === 0 && investors.length === 0 && tradeAgencies.length === 0 &&
      contentItems.length === 0) {
    return <NoDataMessage sectorName={sectorName} />;
  }

  return (
    <div className="space-y-12">
      <ContentSection contentItems={contentItems} />
      <ServiceProvidersSection serviceProviders={serviceProviders} />
      <InnovationEcosystemSection innovationEcosystem={innovationEcosystem} />
      <InvestorSection investors={investors} />
      <TradeAgenciesSection tradeAgencies={tradeAgencies} />
      <EventsSection events={events} />
      <LeadsSection leads={leads} />
      <CommunityMembersSection communityMembers={communityMembers} />
    </div>
  );
};

export default SectorContent;
