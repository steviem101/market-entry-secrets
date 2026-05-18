import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCountryAgencies = (
  countryName: string | undefined,
  keywords: string[] | undefined,
) => {
  return useQuery({
    queryKey: ["country-agencies", countryName, keywords],
    queryFn: async () => {
      if (!countryName) return [];

      let result = await (supabase as any)
        .from("trade_investment_agencies")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (result.error?.message?.includes("is_active")) {
        result = await (supabase as any)
          .from("trade_investment_agencies")
          .select("*")
          .order("name");
      }
      if (result.error) throw result.error;

      const terms = [countryName, ...(keywords || [])]
        .filter(Boolean)
        .map((t) => t.toLowerCase());

      return (result.data || []).filter((agency: any) => {
        const haystack = `${agency.name || ""} ${agency.description || ""} ${(agency.services || []).join(" ")} ${agency.location || ""}`.toLowerCase();
        return terms.some((t) => haystack.includes(t));
      });
    },
    enabled: !!countryName,
    staleTime: 30 * 60 * 1000,
  });
};
