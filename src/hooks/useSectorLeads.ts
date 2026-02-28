import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSectorBySlug } from "@/hooks/useSectors";
import type { LeadDatabase } from "@/types/leadDatabase";

export const useSectorLeads = (sectorSlug: string) => {
  const { data: sectorConfig } = useSectorBySlug(sectorSlug);

  return useQuery({
    queryKey: ['sector-leads', sectorSlug],
    queryFn: async () => {
      if (!sectorConfig) return [];

      const { data, error } = await (supabase as any)
        .from('lead_databases')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter based on sector keywords and industries
      return (data as LeadDatabase[]).filter(lead => {
        const searchText = `${lead.title} ${lead.description || ''} ${lead.sector || ''} ${lead.list_type || ''} ${lead.tags?.join(' ') || ''}`.toLowerCase();
        return sectorConfig.lead_keywords.some((keyword: string) =>
          searchText.includes(keyword.toLowerCase())
        ) || sectorConfig.industries.some((industry: string) =>
          (lead.sector || '').toLowerCase().includes(industry.toLowerCase())
        );
      });
    },
    enabled: !!sectorConfig
  });
};
