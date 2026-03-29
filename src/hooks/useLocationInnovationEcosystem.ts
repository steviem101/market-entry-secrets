
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useLocationInnovationEcosystem = (locationSlug: string, keywords: string[] | undefined) => {
  return useQuery({
    queryKey: ['location-innovation-ecosystem', locationSlug, keywords],
    queryFn: async () => {
      if (!keywords?.length) return [];

      const { data, error } = await supabase
        .from('innovation_ecosystem')
        .select('*')
        .order('name');

      if (error) throw error;

      return data.filter(org => {
        const searchText = `${org.name} ${org.description} ${org.services?.join(' ')} ${org.location}`.toLowerCase();
        return keywords.some(keyword =>
          searchText.includes(keyword.toLowerCase())
        );
      });
    },
    enabled: !!keywords?.length
  });
};
