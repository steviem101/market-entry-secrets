import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCountryBySlug } from "@/hooks/useCountries";
import type { LeadDatabase } from "@/types/leadDatabase";

export const useCountryLeads = (countrySlug: string) => {
  const { data: countryConfig } = useCountryBySlug(countrySlug);

  return useQuery({
    queryKey: ['country-leads', countrySlug],
    queryFn: async () => {
      if (!countryConfig) {
        return [];
      }

      const { data, error } = await (supabase as any)
        .from('lead_databases')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching lead databases:', error);
        throw error;
      }

      // Filter based on country keywords and industries
      return (data as LeadDatabase[]).filter(lead => {
        const searchText = `${lead.title} ${lead.description || ''} ${lead.sector || ''} ${lead.list_type || ''} ${lead.location || ''} ${lead.tags?.join(' ') || ''}`.toLowerCase();

        // Check keyword matching
        const keywordMatch = countryConfig.lead_keywords.some((keyword: string) =>
          searchText.includes(keyword.toLowerCase())
        );

        // Check industry matching
        const industryMatch = countryConfig.key_industries.some((industry: string) =>
          (lead.sector || '').toLowerCase().includes(industry.toLowerCase())
        );

        return keywordMatch || industryMatch;
      });
    },
    enabled: !!countryConfig
  });
};
