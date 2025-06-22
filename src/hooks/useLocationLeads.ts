
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLocationBySlug } from "@/hooks/useLocations";

export const useLocationLeads = (locationSlug: string) => {
  const { data: locationConfig } = useLocationBySlug(locationSlug);
  
  return useQuery({
    queryKey: ['location-leads', locationSlug],
    queryFn: async () => {
      if (!locationConfig) return [];
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter based on location keywords and industries
      return data.filter(lead => {
        const searchText = `${lead.name} ${lead.description} ${lead.industry} ${lead.category} ${lead.location}`.toLowerCase();
        return locationConfig.lead_keywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        ) || locationConfig.key_industries.some(industry =>
          lead.industry?.toLowerCase().includes(industry.toLowerCase())
        );
      });
    },
    enabled: !!locationConfig
  });
};
