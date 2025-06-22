
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCountryBySlug } from "@/hooks/useCountries";

export const useCountryCommunityMembers = (countrySlug: string) => {
  const { data: countryConfig } = useCountryBySlug(countrySlug);
  
  return useQuery({
    queryKey: ['country-community-members', countrySlug],
    queryFn: async () => {
      if (!countryConfig) return [];
      
      const { data, error } = await supabase
        .from('community_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter based on origin country or associated countries
      return data.filter(member => {
        // Check if origin_country matches
        if (member.origin_country?.toLowerCase() === countryConfig.name.toLowerCase()) {
          return true;
        }
        
        // Check if country is in associated_countries array
        if (member.associated_countries?.some(country => 
          country.toLowerCase() === countryConfig.name.toLowerCase()
        )) {
          return true;
        }
        
        // Fallback to keyword matching
        const searchText = `${member.name} ${member.title} ${member.description} ${member.specialties?.join(' ')} ${member.experience} ${member.location}`.toLowerCase();
        return countryConfig.keywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
      });
    },
    enabled: !!countryConfig
  });
};
