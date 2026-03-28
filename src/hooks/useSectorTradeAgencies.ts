
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSectorTradeAgencies = (sectorSlug: string, keywords: string[] | undefined) => {
  return useQuery({
    queryKey: ['sector-trade-agencies', sectorSlug],
    queryFn: async () => {
      if (!keywords?.length) return [];

      // Try with is_active filter (available after migration)
      let result = await (supabase as any)
        .from('trade_investment_agencies')
        .select('*')
        .eq('is_active', true)
        .order('name');

      // Fallback if is_active column doesn't exist yet
      if (result.error?.message?.includes('is_active')) {
        result = await (supabase as any)
          .from('trade_investment_agencies')
          .select('*')
          .order('name');
      }

      if (result.error) throw result.error;
      const data = result.data;

      // Filter based on sector keywords
      return (data || []).filter((agency: any) => {
        const searchText = `${agency.name || ''} ${agency.description || ''} ${agency.services?.join(' ') || ''}`.toLowerCase();
        return keywords.some(keyword =>
          searchText.includes(keyword.toLowerCase())
        );
      });
    },
    enabled: !!keywords?.length
  });
};
