
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCountryBySlug } from "@/hooks/useCountries";

export const useCountryEvents = (countrySlug: string) => {
  const { data: countryConfig } = useCountryBySlug(countrySlug);
  
  return useQuery({
    queryKey: ['country-events', countrySlug],
    queryFn: async () => {
      if (!countryConfig) return [];
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      // Filter based on country keywords
      return data.filter(event => {
        const searchText = `${event.title} ${event.description} ${event.category} ${event.location}`.toLowerCase();
        return countryConfig.event_keywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
      });
    },
    enabled: !!countryConfig
  });
};
