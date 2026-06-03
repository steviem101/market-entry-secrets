import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CountryFaq } from "@/lib/countryPageContent";

export const useCountryFAQs = (countryId: string | undefined) => {
  return useQuery({
    queryKey: ["country-faqs", countryId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("country_faqs")
        .select("*")
        .eq("country_id", countryId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return (data as CountryFaq[]) ?? [];
    },
    enabled: !!countryId,
    staleTime: 30 * 60 * 1000,
  });
};
