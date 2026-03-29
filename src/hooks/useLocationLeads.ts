import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { LeadDatabase } from "@/types/leadDatabase";

export const useLocationLeads = (locationSlug: string, leadKeywords: string[] | undefined, keyIndustries: string[] | undefined) => {
  return useQuery({
    queryKey: ['location-leads', locationSlug, leadKeywords, keyIndustries],
    queryFn: async () => {
      if (!leadKeywords?.length && !keyIndustries?.length) return [];

      const filters: string[] = [];

      (leadKeywords || []).forEach((kw: string) => {
        filters.push(
          `title.ilike.%${kw}%`,
          `description.ilike.%${kw}%`,
          `sector.ilike.%${kw}%`,
          `list_type.ilike.%${kw}%`,
          `location.ilike.%${kw}%`,
        );
      });

      (keyIndustries || []).forEach((industry: string) => {
        filters.push(`sector.ilike.%${industry}%`);
      });

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
    enabled: !!(leadKeywords?.length || keyIndustries?.length)
  });
};
