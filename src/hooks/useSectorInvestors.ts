import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSectorInvestors = (sectorSlug: string, keywords: string[] | undefined) => {
  return useQuery({
    queryKey: ['sector-investors', sectorSlug, keywords],
    queryFn: async () => {
      if (!keywords?.length) return [];

      const { data, error } = await (supabase as any)
        .from('investors')
        .select('*')
        .order('name');

      if (error) throw error;

      return data.filter(investor => {
        const searchText = `${investor.name} ${investor.description} ${(investor.sector_focus || []).join(' ')}`.toLowerCase();
        return keywords.some(keyword =>
          searchText.includes(keyword.toLowerCase())
        );
      });
    },
    enabled: !!keywords?.length
  });
};
