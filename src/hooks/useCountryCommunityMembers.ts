
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCountryBySlug } from "@/hooks/useCountries";

export const useCountryCommunityMembers = (countrySlug: string) => {
  const { data: countryConfig } = useCountryBySlug(countrySlug);
  
  return useQuery({
    queryKey: ['country-community-members', countrySlug],
    queryFn: async () => {
      if (!countryConfig) {
        console.log('No country config found for community members:', countrySlug);
        return [];
      }

      console.log('Fetching community members for country:', countryConfig.name);
      
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
        if (member.origin_country?.toLowerCase() === countryConfig.name.toLowerCase()) {
          console.log('Community member origin match found:', member.name);
          return true;
        }
        
        // Check if country is in associated_countries array
        if (member.associated_countries?.some(country => 
          country.toLowerCase() === countryConfig.name.toLowerCase()
        )) {
          console.log('Community member association match found:', member.name);
          return true;
        }
        
        // Fallback to keyword matching
        const searchText = `${member.name} ${member.title} ${member.description} ${member.specialties?.join(' ')} ${member.experience} ${member.location}`.toLowerCase();
        const hasMatch = countryConfig.keywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
        if (hasMatch) {
          console.log('Community member keyword match found:', member.name);
        }
        return hasMatch;
      });

      console.log('Filtered community members count:', filteredMembers.length);
      return filteredMembers;
    },
    enabled: !!countryConfig
  });
};
