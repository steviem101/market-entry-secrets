
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCountryCommunityMembers = (countrySlug: string, countryName: string | undefined, keywords: string[] | undefined) => {
  return useQuery({
    queryKey: ['country-community-members', countrySlug, keywords, countryName],
    queryFn: async () => {
      if (!countryName || !keywords?.length) return [];

      // Build OR filter: match origin_country, or keyword match in text fields
      const keywordFilters = keywords.flatMap(kw => [
        `name.ilike.%${kw}%`,
        `title.ilike.%${kw}%`,
        `description.ilike.%${kw}%`,
        `location.ilike.%${kw}%`,
      ]);

      const filters = [
        `origin_country.ilike.%${countryName}%`,
        `associated_countries.cs.{${countryName}}`,
        ...keywordFilters,
      ];

      const { data, error } = await supabase
        .from('community_members')
        .select('*')
        .or(filters.join(','))
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching community members:', error);
        throw error;
      }

      return data;
    },
    enabled: !!countryName && !!keywords?.length
  });
};
