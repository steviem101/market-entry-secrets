
import CompanyCard from "@/components/CompanyCard";
import { EventCard } from "@/components/EventCard";
import { LeadCard } from "@/components/LeadCard";
import PersonCard from "@/components/PersonCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SectorSection from "./SectorSection";
import { useSectorHandlers } from "@/hooks/useSectorHandlers";

interface SectorContentProps {
  serviceProviders: any[];
  events: any[];
  leads: any[];
  communityMembers: any[];
  sectorName: string;
}

const SectorContent = ({
  serviceProviders,
  events,
  leads,
  communityMembers,
  sectorName
}: SectorContentProps) => {
  const { handleViewProfile, handleContact, handleDownload, handlePreview } = useSectorHandlers();

  // No Data Message Component
  const NoDataMessage = () => (
    <div className="text-center py-12">
      <h3 className="text-xl font-semibold mb-4">No {sectorName} Data Available</h3>
      <p className="text-muted-foreground mb-6">
        We're currently building our {sectorName} ecosystem. Check back soon for updates!
      </p>
      <Link to="/">
        <Button>Explore Other Sectors</Button>
      </Link>
    </div>
  );

  // If no data at all, show message
  if (serviceProviders.length === 0 && events.length === 0 && leads.length === 0 && communityMembers.length === 0) {
    return <NoDataMessage />;
  }

  return (
    <div className="space-y-12">
      {/* Service Providers Section */}
      <SectorSection
        title="Specialized Service Providers"
        viewAllLink="/service-providers"
        viewAllText="View All Providers"
        isEmpty={serviceProviders.length === 0}
      >
        {serviceProviders.slice(0, 6).map((provider) => (
          <CompanyCard
            key={provider.id}
            company={{
              id: provider.id,
              name: provider.name,
              description: provider.description,
              location: provider.location,
              founded: provider.founded,
              employees: provider.employees,
              services: provider.services || [],
              website: provider.website,
              contact: provider.contact,
              logo: provider.logo,
              experienceTiles: provider.experience_tiles ? (Array.isArray(provider.experience_tiles) ? provider.experience_tiles as any[] : []) : [],
              contactPersons: provider.contact_persons ? (Array.isArray(provider.contact_persons) ? provider.contact_persons as any[] : []) : []
            }}
            onViewProfile={handleViewProfile}
            onContact={handleContact}
          />
        ))}
      </SectorSection>

      {/* Events Section */}
      <SectorSection
        title="Upcoming Industry Events"
        viewAllLink="/events"
        viewAllText="View All Events"
        isEmpty={events.length === 0}
      >
        {events.slice(0, 6).map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </SectorSection>

      {/* Leads Section */}
      <SectorSection
        title="Available Market Data"
        viewAllLink="/leads"
        viewAllText="View All Leads"
        isEmpty={leads.length === 0}
      >
        {leads.slice(0, 6).map((lead) => (
          <LeadCard 
            key={lead.id} 
            lead={{
              ...lead,
              type: lead.type as "csv_list" | "tam_map"
            }}
            onDownload={handleDownload}
            onPreview={handlePreview}
          />
        ))}
      </SectorSection>

      {/* Community Members Section */}
      <SectorSection
        title="Industry Experts & Mentors"
        viewAllLink="/mentors"
        viewAllText="View All Experts"
        isEmpty={communityMembers.length === 0}
      >
        {communityMembers.slice(0, 6).map((member) => (
          <PersonCard
            key={member.id}
            person={{
              id: member.id,
              name: member.name,
              title: member.title,
              description: member.description,
              location: member.location,
              experience: member.experience,
              specialties: member.specialties || [],
              website: member.website,
              contact: member.contact,
              image: member.image,
              company: member.company,
              isAnonymous: member.is_anonymous,
              experienceTiles: member.experience_tiles ? (Array.isArray(member.experience_tiles) ? member.experience_tiles as any[] : []) : []
            }}
            onViewProfile={handleViewProfile}
            onContact={handleContact}
          />
        ))}
      </SectorSection>
    </div>
  );
};

export default SectorContent;
