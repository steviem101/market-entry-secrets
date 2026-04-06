import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  LINKEDIN_TAXONOMY,
  LINKEDIN_SECTORS,
  INDUSTRY_GROUP_OPTIONS,
  INDUSTRY_GROUP_TO_SECTOR,
} from '@/constants/linkedinTaxonomy';

export interface LinkedInIndustryRow {
  id: string;
  sector: string;
  industry_group: string;
  sub_industry: string | null;
  display_name: string;
  slug: string;
  sector_slug: string;
  display_order: number;
}

/**
 * Fetches the full LinkedIn industry taxonomy from Supabase.
 * Falls back to the static constant if the query fails.
 */
export function useLinkedInIndustries() {
  return useQuery({
    queryKey: ['linkedin-industries'],
    queryFn: async (): Promise<LinkedInIndustryRow[]> => {
      const { data, error } = await supabase
        .from('linkedin_industries')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return (data || []) as LinkedInIndustryRow[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour — taxonomy rarely changes
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

/**
 * Returns the static taxonomy for synchronous access (no DB call needed).
 * Use this when you just need the list of industry groups for a form.
 */
export function useStaticLinkedInTaxonomy() {
  return {
    sectors: LINKEDIN_SECTORS,
    taxonomy: LINKEDIN_TAXONOMY,
    industryGroups: INDUSTRY_GROUP_OPTIONS,
    getParentSector: (group: string) => INDUSTRY_GROUP_TO_SECTOR[group] || null,
  };
}
