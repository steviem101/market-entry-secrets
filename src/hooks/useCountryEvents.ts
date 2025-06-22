
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCountryBySlug } from "@/hooks/useCountries";

export const useCountryEvents = (countrySlug: string) => {
  const { data: countryConfig } = useCountryBySlug(countrySlug);
  
  return useQuery({
    queryKey: ['country-events', countrySlug],
    queryFn: async () => {
      if (!countryConfig) {
        console.log('No country config found for events:', countrySlug);
        return [];
      }

      console.log('Fetching events for country:', countryConfig.name);
      console.log('Event keywords:', countryConfig.event_keywords);
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        throw error;
      }

      // Filter based on country keywords
      const filteredEvents = data.filter(event => {
        const searchText = `${event.title} ${event.description} ${event.category} ${event.location}`.toLowerCase();
        const hasMatch = countryConfig.event_keywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
        if (hasMatch) {
          console.log('Event match found:', event.title);
        }
        return hasMatch;
      });

      console.log('Filtered events count:', filteredEvents.length);
      return filteredEvents;
    },
    enabled: !!countryConfig
  });
};
