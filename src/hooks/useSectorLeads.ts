import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { LeadDatabase } from "@/types/leadDatabase";

export const useSectorLeads = (sectorSlug: string, leadKeywords: string[] | undefined, industries: string[] | undefined) => {
  return useQuery({
    queryKey: ['sector-leads', sectorSlug, leadKeywords, industries],
    queryFn: async () => {
      if (!leadKeywords?.length && !industries?.length) return [];

      // Build OR filter: keyword match + industry match in sector column
      const filters = [
        ...(leadKeywords || []).flatMap(kw => [
          `title.ilike.%${kw}%`,
          `description.ilike.%${kw}%`,
          `sector.ilike.%${kw}%`,
        ]),
        ...(industries || []).map(ind => `sector.ilike.%${ind}%`),
      ];

      const { data, error } = await (supabase as any)
        .from('lead_databases')
        .select('*')
        .eq('status', 'active')
        .or(filters.join(','))
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as LeadDatabase[];
    },
    enabled: !!(leadKeywords?.length || industries?.length)
  });
};
