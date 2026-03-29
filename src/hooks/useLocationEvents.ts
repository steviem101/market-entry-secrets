
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useLocationEvents = (locationSlug: string, keywords: string[] | undefined) => {
  return useQuery({
    queryKey: ['location-events', locationSlug, keywords],
    queryFn: async () => {
      if (!keywords?.length) return [];

      const filters = keywords.flatMap(kw => [
        `title.ilike.%${kw}%`,
        `description.ilike.%${kw}%`,
        `category.ilike.%${kw}%`,
        `location.ilike.%${kw}%`,
      ]);

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .or(filters.join(','))
        .order('date', { ascending: true })
        .limit(100);

      if (error) throw error;

      return data;
    },
    enabled: !!keywords?.length
  });
};
