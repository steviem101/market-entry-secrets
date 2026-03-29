import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { LeadDatabase } from "@/types/leadDatabase";

export const useSectorLeads = (sectorSlug: string, leadKeywords: string[] | undefined, industries: string[] | undefined) => {
  return useQuery({
    queryKey: ['sector-leads', sectorSlug, leadKeywords, industries],
    queryFn: async () => {
      if (!leadKeywords?.length && !industries?.length) return [];

      const { data, error } = await (supabase as any)
        .from('lead_databases')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter based on sector keywords and industries
      return (data as LeadDatabase[]).filter(lead => {
        const searchText = `${lead.title} ${lead.description || ''} ${lead.sector || ''} ${lead.list_type || ''} ${lead.tags?.join(' ') || ''}`.toLowerCase();
        return (leadKeywords || []).some((keyword: string) =>
          searchText.includes(keyword.toLowerCase())
        ) || (industries || []).some((industry: string) =>
          (lead.sector || '').toLowerCase().includes(industry.toLowerCase())
        );
      });
    },
    enabled: !!(leadKeywords?.length || industries?.length)
  });
};
