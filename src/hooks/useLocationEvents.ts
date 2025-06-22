
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLocationBySlug } from "@/hooks/useLocations";

export const useLocationEvents = (locationSlug: string) => {
  const { data: locationConfig } = useLocationBySlug(locationSlug);
  
  return useQuery({
    queryKey: ['location-events', locationSlug],
    queryFn: async () => {
      if (!locationConfig) return [];
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      // Filter based on location keywords
      return data.filter(event => {
        const searchText = `${event.title} ${event.description} ${event.category} ${event.location}`.toLowerCase();
        return locationConfig.event_keywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
      });
    },
    enabled: !!locationConfig
  });
};
