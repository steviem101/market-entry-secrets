import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CountryTradeMetric } from "@/lib/countryPageContent";

export const useCountryTradeMetrics = (countryId: string | undefined) => {
  return useQuery({
    queryKey: ["country-trade-metrics", countryId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("country_trade_metrics")
        .select("*")
        .eq("country_id", countryId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return (data as CountryTradeMetric[]) ?? [];
    },
    enabled: !!countryId,
    staleTime: 30 * 60 * 1000,
  });
};
