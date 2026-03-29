
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useLocationEvents = (locationSlug: string, keywords: string[] | undefined) => {
  return useQuery({
    queryKey: ['location-events', locationSlug, keywords],
    queryFn: async () => {
      if (!keywords?.length) return [];

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      // Filter based on location keywords
      return data.filter(event => {
        const searchText = `${event.title} ${event.description} ${event.category} ${event.location}`.toLowerCase();
        return keywords.some(keyword =>
          searchText.includes(keyword.toLowerCase())
        );
      });
    },
    enabled: !!keywords?.length
  });
};
