
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCountryBySlug } from "@/hooks/useCountries";

export const useCountryLeads = (countrySlug: string) => {
  const { data: countryConfig } = useCountryBySlug(countrySlug);
  
  return useQuery({
    queryKey: ['country-leads', countrySlug],
    queryFn: async () => {
      if (!countryConfig) return [];
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter based on country keywords and industries
      return data.filter(lead => {
        const searchText = `${lead.name} ${lead.description} ${lead.industry} ${lead.category} ${lead.location}`.toLowerCase();
        return countryConfig.lead_keywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        ) || countryConfig.key_industries.some(industry =>
          lead.industry?.toLowerCase().includes(industry.toLowerCase())
        );
      });
    },
    enabled: !!countryConfig
  });
};
