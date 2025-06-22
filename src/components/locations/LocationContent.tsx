
import { LocationData } from "@/hooks/useLocations";
import ServiceProvidersSection from "@/components/sectors/ServiceProvidersSection";
import EventsSection from "@/components/sectors/EventsSection";
import ContentSection from "@/components/sectors/ContentSection";
import LeadsSection from "@/components/sectors/LeadsSection";
import CommunityMembersSection from "@/components/sectors/CommunityMembersSection";
import { useLocationServiceProviders } from "@/hooks/useLocationServiceProviders";
import { useLocationEvents } from "@/hooks/useLocationEvents";
import { useLocationContent } from "@/hooks/useLocationContent";
import { useLocationLeads } from "@/hooks/useLocationLeads";
import { useLocationCommunityMembers } from "@/hooks/useLocationCommunityMembers";

interface LocationContentProps {
  location: LocationData;
}

export const LocationContent = ({ location }: LocationContentProps) => {
  const { data: serviceProviders = [] } = useLocationServiceProviders(location.slug);
  const { data: events = [] } = useLocationEvents(location.slug);
  const { data: contentItems = [] } = useLocationContent(location.slug);
  const { data: leads = [] } = useLocationLeads(location.slug);
  const { data: communityMembers = [] } = useLocationCommunityMembers(location.slug);

  return (
    <div className="container mx-auto px-4 py-16 space-y-16">
      <ServiceProvidersSection serviceProviders={serviceProviders} />
      <EventsSection events={events} />
      <ContentSection contentItems={contentItems} />
      <LeadsSection leads={leads} />
      <CommunityMembersSection communityMembers={communityMembers} />
    </div>
  );
};
