
import CompanyCard from "@/components/CompanyCard";
import { EventCard } from "@/components/EventCard";
import { LeadCard } from "@/components/LeadCard";
import PersonCard from "@/components/PersonCard";
import { ContentCard } from "@/components/content/ContentCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SectorSection from "./SectorSection";
import { useSectorHandlers } from "@/hooks/useSectorHandlers";

interface SectorContentProps {
  serviceProviders: any[];
  events: any[];
  leads: any[];
  communityMembers: any[];
  innovationEcosystem: any[];
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
  tradeAgencies,
  contentItems,
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
  if (serviceProviders.length === 0 && events.length === 0 && leads.length === 0 && 
      communityMembers.length === 0 && innovationEcosystem.length === 0 && tradeAgencies.length === 0 && 
      contentItems.length === 0) {
    return <NoDataMessage />;
  }

  return (
    <div className="space-y-12">
      {/* Content Section */}
      <SectorSection
        title="Industry Insights & Analysis"
        viewAllLink="/content"
        viewAllText="View All Content"
        isEmpty={contentItems.length === 0}
      >
        {contentItems.slice(0, 6).map((content) => (
          <ContentCard key={content.id} content={content} />
        ))}
      </SectorSection>

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

      {/* Innovation Ecosystem Section */}
      <SectorSection
        title="Innovation Ecosystem Partners"
        viewAllLink="/innovation-ecosystem"
        viewAllText="View All Partners"
        isEmpty={innovationEcosystem.length === 0}
      >
        {innovationEcosystem.slice(0, 6).map((entity) => (
          <CompanyCard
            key={entity.id}
            company={{
              id: entity.id,
              name: entity.name,
              description: entity.description,
              location: entity.location,
              founded: entity.founded,
              employees: entity.employees,
              services: entity.services || [],
              website: entity.website,
              contact: entity.contact,
              logo: entity.logo,
              experienceTiles: entity.experience_tiles ? (Array.isArray(entity.experience_tiles) ? entity.experience_tiles as any[] : []) : [],
              contactPersons: entity.contact_persons ? (Array.isArray(entity.contact_persons) ? entity.contact_persons as any[] : []) : []
            }}
            onViewProfile={handleViewProfile}
            onContact={handleContact}
          />
        ))}
      </SectorSection>

      {/* Trade & Investment Agencies Section */}
      <SectorSection
        title="Trade & Investment Agencies"
        viewAllLink="/trade-investment-agencies"
        viewAllText="View All Agencies"
        isEmpty={tradeAgencies.length === 0}
      >
        {tradeAgencies.slice(0, 6).map((agency) => (
          <CompanyCard
            key={agency.id}
            company={{
              id: agency.id,
              name: agency.name,
              description: agency.description,
              location: agency.location,
              founded: agency.founded,
              employees: agency.employees,
              services: agency.services || [],
              website: agency.website,
              contact: agency.contact,
              logo: agency.logo,
              experienceTiles: agency.experience_tiles ? (Array.isArray(agency.experience_tiles) ? agency.experience_tiles as any[] : []) : [],
              contactPersons: agency.contact_persons ? (Array.isArray(agency.contact_persons) ? agency.contact_persons as any[] : []) : []
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
