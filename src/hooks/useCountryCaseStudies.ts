import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CountryCaseStudy } from "@/lib/countryPageContent";

export const useCountryCaseStudies = (countryId: string | undefined) => {
  return useQuery({
    queryKey: ["country-case-studies", countryId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("country_case_studies")
        .select("*")
        .eq("country_id", countryId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return (data as CountryCaseStudy[]) ?? [];
    },
    enabled: !!countryId,
    staleTime: 30 * 60 * 1000,
  });
};
