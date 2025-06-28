
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FeaturedItem {
  id: string;
  name: string;
  description: string;
  location: string;
  type: 'service_provider' | 'event' | 'innovation_hub' | 'trade_agency';
  website?: string;
  logo?: string;
  contact?: string;
  services?: string[];
  date?: string;
  category?: string;
  employees?: string;
}

export const useFeaturedItems = () => {
  return useQuery({
    queryKey: ['featured-items'],
    queryFn: async () => {
      const featuredItems: FeaturedItem[] = [];

      // Fetch featured service providers
      const { data: serviceProviders } = await supabase
        .from('service_providers')
        .select('*')
        .limit(6);

      if (serviceProviders) {
        featuredItems.push(...serviceProviders.map(provider => ({
          id: provider.id,
          name: provider.name,
          description: provider.description,
          location: provider.location,
          type: 'service_provider' as const,
          website: provider.website,
          logo: provider.logo,
          contact: provider.contact,
          services: provider.services,
          employees: provider.employees
        })));
      }

      // Fetch featured events
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })
        .limit(3);

      if (events) {
        featuredItems.push(...events.map(event => ({
          id: event.id,
          name: event.title,
          description: event.description,
          location: event.location,
          type: 'event' as const,
          date: event.date,
          category: event.category
        })));
      }

      // Fetch featured innovation ecosystem
      const { data: innovationHubs } = await supabase
        .from('innovation_ecosystem')
        .select('*')
        .limit(3);

      if (innovationHubs) {
        featuredItems.push(...innovationHubs.map(hub => ({
          id: hub.id,
          name: hub.name,
          description: hub.description,
          location: hub.location,
          type: 'innovation_hub' as const,
          website: hub.website,
          logo: hub.logo,
          contact: hub.contact,
          services: hub.services,
          employees: hub.employees
        })));
      }

      // Fetch featured trade agencies
      const { data: tradeAgencies } = await supabase
        .from('trade_investment_agencies')
        .select('*')
        .limit(3);

      if (tradeAgencies) {
        featuredItems.push(...tradeAgencies.map(agency => ({
          id: agency.id,
          name: agency.name,
          description: agency.description,
          location: agency.location,
          type: 'trade_agency' as const,
          website: agency.website,
          logo: agency.logo,
          contact: agency.contact,
          services: agency.services,
          employees: agency.employees
        })));
      }

      // Shuffle and return random selection
      const shuffled = featuredItems.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 9); // Return 9 items for rotation
    },
  });
};
