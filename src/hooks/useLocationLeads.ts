import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { LeadDatabase } from "@/types/leadDatabase";

export const useLocationLeads = (locationSlug: string, leadKeywords: string[] | undefined, keyIndustries: string[] | undefined) => {
  return useQuery({
    queryKey: ['location-leads', locationSlug, leadKeywords, keyIndustries],
    queryFn: async () => {
      if (!leadKeywords?.length && !keyIndustries?.length) return [];

      const { data, error } = await (supabase as any)
        .from('lead_databases')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter based on location keywords and industries
      return (data as LeadDatabase[]).filter(lead => {
        const searchText = `${lead.title} ${lead.description || ''} ${lead.sector || ''} ${lead.list_type || ''} ${lead.location || ''} ${lead.tags?.join(' ') || ''}`.toLowerCase();
        return (leadKeywords || []).some((keyword: string) =>
          searchText.includes(keyword.toLowerCase())
        ) || (keyIndustries || []).some((industry: string) =>
          (lead.sector || '').toLowerCase().includes(industry.toLowerCase())
        );
      });
    },
    enabled: !!(leadKeywords?.length || keyIndustries?.length)
  });
};
