import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { LeadDatabase } from "@/types/leadDatabase";

export const useCountryLeads = (countrySlug: string, leadKeywords: string[] | undefined, keyIndustries: string[] | undefined) => {
  return useQuery({
    queryKey: ['country-leads', countrySlug, leadKeywords, keyIndustries],
    queryFn: async () => {
      if (!leadKeywords?.length && !keyIndustries?.length) return [];

      // Build OR filter: keyword match in text fields + industry match in sector
      const filters = [
        ...(leadKeywords || []).flatMap(kw => [
          `title.ilike.%${kw}%`,
          `description.ilike.%${kw}%`,
          `sector.ilike.%${kw}%`,
          `location.ilike.%${kw}%`,
        ]),
        ...(keyIndustries || []).map(ind => `sector.ilike.%${ind}%`),
      ];

      const { data, error } = await (supabase as any)
        .from('lead_databases')
        .select('*')
        .eq('status', 'active')
        .or(filters.join(','))
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching lead databases:', error);
        throw error;
      }

      return data as LeadDatabase[];
    },
    enabled: !!(leadKeywords?.length || keyIndustries?.length)
  });
};
