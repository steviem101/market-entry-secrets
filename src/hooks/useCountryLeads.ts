
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCountryBySlug } from "@/hooks/useCountries";

export const useCountryLeads = (countrySlug: string) => {
  const { data: countryConfig } = useCountryBySlug(countrySlug);
  
  return useQuery({
    queryKey: ['country-leads', countrySlug],
    queryFn: async () => {
      if (!countryConfig) {
        console.log('No country config found for leads:', countrySlug);
        return [];
      }

      console.log('Fetching leads for country:', countryConfig.name);
      console.log('Lead keywords:', countryConfig.lead_keywords);
      console.log('Key industries:', countryConfig.key_industries);
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leads:', error);
        throw error;
      }

      // Filter based on country keywords and industries
      const filteredLeads = data.filter(lead => {
        const searchText = `${lead.name} ${lead.description} ${lead.industry} ${lead.category} ${lead.location}`.toLowerCase();
        
        // Check keyword matching
        const keywordMatch = countryConfig.lead_keywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
        
        // Check industry matching
        const industryMatch = countryConfig.key_industries.some(industry =>
          lead.industry?.toLowerCase().includes(industry.toLowerCase())
        );
        
        const hasMatch = keywordMatch || industryMatch;
        if (hasMatch) {
          console.log('Lead match found:', lead.name, keywordMatch ? '(keyword)' : '(industry)');
        }
        return hasMatch;
      });

      console.log('Filtered leads count:', filteredLeads.length);
      return filteredLeads;
    },
    enabled: !!countryConfig
  });
};
