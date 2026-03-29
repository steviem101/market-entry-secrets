
import { CountryData } from "@/hooks/useCountries";
import ServiceProvidersSection from "@/components/sectors/ServiceProvidersSection";
import EventsSection from "@/components/sectors/EventsSection";
import ContentSection from "@/components/sectors/ContentSection";
import LeadsSection from "@/components/sectors/LeadsSection";
import CommunityMembersSection from "@/components/sectors/CommunityMembersSection";
import TradeOrganizationsSection from "./TradeOrganizationsSection";
import { useCountryServiceProviders } from "@/hooks/useCountryServiceProviders";
import { useCountryEvents } from "@/hooks/useCountryEvents";
import { useCountryContent } from "@/hooks/useCountryContent";
import { useCountryLeads } from "@/hooks/useCountryLeads";
import { useCountryCommunityMembers } from "@/hooks/useCountryCommunityMembers";

interface CountryContentProps {
  country: CountryData;
}

export const CountryContent = ({ country }: CountryContentProps) => {
  const { data: serviceProviders = [] } = useCountryServiceProviders(country.slug, country.service_keywords);
  const { data: events = [] } = useCountryEvents(country.slug, country.event_keywords);
  const { data: contentItems = [] } = useCountryContent(country.slug, country.content_keywords);
  const { data: leads = [] } = useCountryLeads(country.slug, country.lead_keywords, country.key_industries);
  const { data: communityMembers = [] } = useCountryCommunityMembers(country.slug, country.name, country.keywords);

  return (
    <div className="space-y-0">
      <TradeOrganizationsSection countrySlug={country.slug} />
      <ContentSection contentItems={contentItems} />
      <CommunityMembersSection communityMembers={communityMembers} />
      <ServiceProvidersSection serviceProviders={serviceProviders} />
      <EventsSection events={events} />
      <LeadsSection leads={leads} />
    </div>
  );
};
