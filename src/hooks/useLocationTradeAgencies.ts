
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useLocationTradeAgencies = (locationSlug: string, keywords: string[] | undefined) => {
  return useQuery({
    queryKey: ['location-trade-agencies', locationSlug, keywords],
    queryFn: async () => {
      if (!keywords?.length) return [];

      const { data, error } = await supabase
        .from('trade_investment_agencies')
        .select('*')
        .order('name');

      if (error) throw error;

      return data.filter(agency => {
        const searchText = `${agency.name} ${agency.description} ${agency.services?.join(' ')} ${agency.location}`.toLowerCase();
        return keywords.some(keyword =>
          searchText.includes(keyword.toLowerCase())
        );
      });
    },
    enabled: !!keywords?.length
  });
};
