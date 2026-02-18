import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSectorBySlug } from "@/hooks/useSectors";

export const useSectorInvestors = (sectorSlug: string) => {
  const { data: sectorConfig } = useSectorBySlug(sectorSlug);

  return useQuery({
    queryKey: ['sector-investors', sectorSlug],
    queryFn: async () => {
      if (!sectorConfig) return [];

      const { data, error } = await supabase
        .from('investors')
        .select('*')
        .order('name');

      if (error) throw error;

      return data.filter(investor => {
        const searchText = `${investor.name} ${investor.description} ${(investor.sector_focus || []).join(' ')}`.toLowerCase();
        return sectorConfig.keywords.some(keyword =>
          searchText.includes(keyword.toLowerCase())
        );
      });
    },
    enabled: !!sectorConfig
  });
};
