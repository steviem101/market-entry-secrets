import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCountryInvestors = (
  countryName: string | undefined,
  keywords: string[] | undefined,
) => {
  return useQuery({
    queryKey: ["country-investors", countryName, keywords],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investors")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("name");

      if (error) throw error;

      const terms = [countryName, ...(keywords || [])]
        .filter(Boolean)
        .map((t) => (t as string).toLowerCase());

      if (!terms.length) return data || [];

      return (data || []).filter((inv: any) => {
        const haystack = `${inv.name || ""} ${inv.description || ""} ${(inv.sector_focus || []).join(" ")} ${inv.location || ""} ${JSON.stringify(inv.details || {})}`.toLowerCase();
        return terms.some((t) => haystack.includes(t));
      });
    },
    enabled: !!countryName,
    staleTime: 30 * 60 * 1000,
  });
};
