
import { LocationData } from "@/hooks/useLocations";
import { ServiceProvidersSection } from "@/components/sectors/ServiceProvidersSection";
import { EventsSection } from "@/components/sectors/EventsSection";
import { ContentSection } from "@/components/sectors/ContentSection";
import { LeadsSection } from "@/components/sectors/LeadsSection";
import { CommunityMembersSection } from "@/components/sectors/CommunityMembersSection";

interface LocationContentProps {
  location: LocationData;
}

export const LocationContent = ({ location }: LocationContentProps) => {
  return (
    <div className="space-y-16">
      <ServiceProvidersSection 
        title={`Service Providers in ${location.name}`}
        keywords={location.service_keywords}
      />
      
      <EventsSection 
        title={`Events in ${location.name}`}
        keywords={location.event_keywords}
      />
      
      <ContentSection 
        title={`Market Entry Content for ${location.name}`}
        keywords={location.content_keywords}
      />
      
      <LeadsSection 
        title={`Business Leads in ${location.name}`}
        keywords={location.lead_keywords}
      />
      
      <CommunityMembersSection 
        title={`Local Mentors in ${location.name}`}
        keywords={location.keywords}
      />
    </div>
  );
};
