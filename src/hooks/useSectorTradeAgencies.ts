
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSectorBySlug } from "@/hooks/useSectors";

export const useSectorTradeAgencies = (sectorSlug: string) => {
  const { data: sectorConfig } = useSectorBySlug(sectorSlug);
  
  return useQuery({
    queryKey: ['sector-trade-agencies', sectorSlug],
    queryFn: async () => {
      if (!sectorConfig) return [];
      
      const { data, error } = await (supabase as any)
        .from('trade_investment_agencies')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      // Filter based on sector keywords
      return (data || []).filter((agency: any) => {
        const searchText = `${agency.name || ''} ${agency.description || ''} ${agency.services?.join(' ') || ''}`.toLowerCase();
        return sectorConfig.keywords.some(keyword =>
          searchText.includes(keyword.toLowerCase())
        );
      });
    },
    enabled: !!sectorConfig
  });
};
