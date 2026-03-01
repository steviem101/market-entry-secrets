
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLocationBySlug } from "@/hooks/useLocations";

export const useLocationTradeAgencies = (locationSlug: string) => {
  const { data: locationConfig } = useLocationBySlug(locationSlug);

  return useQuery({
    queryKey: ['location-trade-agencies', locationSlug],
    queryFn: async () => {
      if (!locationConfig) return [];

      const { data, error } = await supabase
        .from('trade_investment_agencies')
        .select('*')
        .order('name');

      if (error) throw error;

      return data.filter(agency => {
        const searchText = `${agency.name} ${agency.description} ${agency.services?.join(' ')} ${agency.location}`.toLowerCase();
        return locationConfig.service_keywords.some(keyword =>
          searchText.includes(keyword.toLowerCase())
        );
      });
    },
    enabled: !!locationConfig
  });
};
