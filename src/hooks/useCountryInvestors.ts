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
        .from("investors_public")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("name");

      if (error) throw error;

      const terms = [countryName, ...(keywords || [])]
        .filter(Boolean)
        .map((t) => (t as string).toLowerCase());

      if (!terms.length) return data || [];

      return (data || []).filter((inv: any) => {
        // Note: `details` was previously concatenated into the haystack but is
        // excluded from investors_public (Workstream A2 — keep PII server-side).
        // Search now matches on name/description/sector_focus/location only;
        // queries that previously hit `details.*` keywords will miss. Move
        // search server-side via an RPC if this becomes a real UX issue.
        const haystack = `${inv.name || ""} ${inv.description || ""} ${(inv.sector_focus || []).join(" ")} ${inv.location || ""}`.toLowerCase();
        return terms.some((t) => haystack.includes(t));
      });
    },
    enabled: !!countryName,
    staleTime: 30 * 60 * 1000,
  });
};
