import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { LeadDatabase } from "@/types/leadDatabase";

export const useCountryLeads = (countrySlug: string, leadKeywords: string[] | undefined, keyIndustries: string[] | undefined) => {
  return useQuery({
    queryKey: ['country-leads', countrySlug],
    queryFn: async () => {
      if (!leadKeywords?.length && !keyIndustries?.length) return [];

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
        const keywordMatch = (leadKeywords || []).some((keyword: string) =>
          searchText.includes(keyword.toLowerCase())
        );

        // Check industry matching
        const industryMatch = (keyIndustries || []).some((industry: string) =>
          (lead.sector || '').toLowerCase().includes(industry.toLowerCase())
        );

        return keywordMatch || industryMatch;
      });
    },
    enabled: !!(leadKeywords?.length || keyIndustries?.length)
  });
};
