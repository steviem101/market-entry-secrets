import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLocationBySlug } from "@/hooks/useLocations";
import type { LeadDatabase } from "@/types/leadDatabase";

export const useLocationLeads = (locationSlug: string) => {
  const { data: locationConfig } = useLocationBySlug(locationSlug);

  return useQuery({
    queryKey: ['location-leads', locationSlug],
    queryFn: async () => {
      if (!locationConfig) return [];

      const { data, error } = await (supabase as any)
        .from('lead_databases')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter based on location keywords and industries
      return (data as LeadDatabase[]).filter(lead => {
        const searchText = `${lead.title} ${lead.description || ''} ${lead.sector || ''} ${lead.list_type || ''} ${lead.location || ''} ${lead.tags?.join(' ') || ''}`.toLowerCase();
        return locationConfig.lead_keywords.some((keyword: string) =>
          searchText.includes(keyword.toLowerCase())
        ) || locationConfig.key_industries.some((industry: string) =>
          (lead.sector || '').toLowerCase().includes(industry.toLowerCase())
        );
      });
    },
    enabled: !!locationConfig
  });
};
