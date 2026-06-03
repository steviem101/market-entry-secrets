import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CountryPageContent } from "@/lib/countryPageContent";

export const useCountryPageContent = (countryId: string | undefined) => {
  return useQuery({
    queryKey: ["country-page-content", countryId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("country_page_content")
        .select("*")
        .eq("country_id", countryId)
        .maybeSingle();

      if (error) throw error;
      return (data as CountryPageContent) ?? null;
    },
    enabled: !!countryId,
    staleTime: 30 * 60 * 1000,
  });
};
