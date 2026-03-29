
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCountryCommunityMembers = (countrySlug: string, countryName: string | undefined, keywords: string[] | undefined) => {
  return useQuery({
    queryKey: ['country-community-members', countrySlug, keywords, countryName],
    queryFn: async () => {
      if (!countryName || !keywords?.length) return [];

      const { data, error } = await supabase
        .from('community_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching community members:', error);
        throw error;
      }

      // Filter based on origin country or associated countries
      const filteredMembers = data.filter(member => {
        // Check if origin_country matches
        if (member.origin_country?.toLowerCase() === countryName.toLowerCase()) {
          return true;
        }

        // Check if country is in associated_countries array
        if (member.associated_countries?.some(country =>
          country.toLowerCase() === countryName.toLowerCase()
        )) {
          return true;
        }

        // Fallback to keyword matching
        const searchText = `${member.name} ${member.title} ${member.description} ${member.specialties?.join(' ')} ${member.experience} ${member.location}`.toLowerCase();
        return keywords.some(keyword =>
          searchText.includes(keyword.toLowerCase())
        );
      });

      return filteredMembers;
    },
    enabled: !!countryName && !!keywords?.length
  });
};
