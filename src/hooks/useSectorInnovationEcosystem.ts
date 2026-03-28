
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSectorInnovationEcosystem = (sectorSlug: string, keywords: string[] | undefined) => {
  return useQuery({
    queryKey: ['sector-innovation-ecosystem', sectorSlug],
    queryFn: async () => {
      if (!keywords?.length) return [];

      const { data, error } = await supabase
        .from('innovation_ecosystem')
        .select('*')
        .order('name');

      if (error) throw error;

      // Filter based on sector keywords
      return data.filter(entity => {
        const searchText = `${entity.name} ${entity.description} ${entity.services?.join(' ')}`.toLowerCase();
        return keywords.some(keyword =>
          searchText.includes(keyword.toLowerCase())
        );
      });
    },
    enabled: !!keywords?.length
  });
};
