
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSectorBySlug } from "@/hooks/useSectors";

export const useSectorLeads = (sectorSlug: string) => {
  const { data: sectorConfig } = useSectorBySlug(sectorSlug);
  
  return useQuery({
    queryKey: ['sector-leads', sectorSlug],
    queryFn: async () => {
      if (!sectorConfig) return [];
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter based on sector keywords and industries
      return data.filter(lead => {
        const searchText = `${lead.name} ${lead.description} ${lead.industry} ${lead.category}`.toLowerCase();
        return sectorConfig.lead_keywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        ) || sectorConfig.industries.some(industry =>
          lead.industry?.toLowerCase().includes(industry.toLowerCase())
        );
      });
    },
    enabled: !!sectorConfig
  });
};
