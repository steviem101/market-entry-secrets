import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CountryCaseStudy } from "@/lib/countryPageContent";

export const useCountryCaseStudies = (countryId: string | undefined) => {
  return useQuery({
    queryKey: ["country-case-studies", countryId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("country_case_studies")
        .select("*, content_items(slug)")
        .eq("country_id", countryId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      const rows = (data as Array<CountryCaseStudy & { content_items?: { slug: string } | null }>) ?? [];
      return rows.map((r) => ({ ...r, content_item_slug: r.content_items?.slug ?? null }));
    },
    enabled: !!countryId,
    staleTime: 30 * 60 * 1000,
  });
};
