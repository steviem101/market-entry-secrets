
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCountryEvents = (countrySlug: string, keywords: string[] | undefined) => {
  return useQuery({
    queryKey: ['country-events', countrySlug],
    queryFn: async () => {
      if (!keywords?.length) return [];

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
        return keywords.some(keyword =>
          searchText.includes(keyword.toLowerCase())
        );
      });

      return filteredEvents;
    },
    enabled: !!keywords?.length
  });
};
