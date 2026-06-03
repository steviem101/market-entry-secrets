import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CountryFundingInstrument } from "@/lib/countryPageContent";

export interface CountryFundingGrouped {
  origin: CountryFundingInstrument[];
  destination: CountryFundingInstrument[];
}

export const useCountryFunding = (countryId: string | undefined) => {
  return useQuery({
    queryKey: ["country-funding", countryId],
    queryFn: async (): Promise<CountryFundingGrouped> => {
      const { data, error } = await (supabase as any)
        .from("country_funding_instruments")
        .select("*")
        .eq("country_id", countryId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      const rows = (data as CountryFundingInstrument[]) ?? [];
      return {
        origin: rows.filter((r) => r.side === "origin"),
        destination: rows.filter((r) => r.side === "destination"),
      };
    },
    enabled: !!countryId,
    staleTime: 30 * 60 * 1000,
  });
};
