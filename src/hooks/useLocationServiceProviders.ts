
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useLocationServiceProviders = (locationSlug: string, keywords: string[] | undefined) => {
  return useQuery({
    queryKey: ['location-service-providers', locationSlug, keywords],
    queryFn: async () => {
      if (!keywords?.length) return [];

      const filters = keywords.flatMap(kw => [
        `name.ilike.%${kw}%`,
        `description.ilike.%${kw}%`,
        `location.ilike.%${kw}%`,
      ]);

      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .or(filters.join(','))
        .order('name')
        .limit(100);

      if (error) throw error;

      return data || [];
    },
    enabled: !!keywords?.length
  });
};
