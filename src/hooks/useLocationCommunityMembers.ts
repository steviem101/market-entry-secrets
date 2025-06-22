
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLocationBySlug } from "@/hooks/useLocations";

export const useLocationCommunityMembers = (locationSlug: string) => {
  const { data: locationConfig } = useLocationBySlug(locationSlug);
  
  return useQuery({
    queryKey: ['location-community-members', locationSlug],
    queryFn: async () => {
      if (!locationConfig) return [];
      
      const { data, error } = await supabase
        .from('community_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter based on location keywords
      return data.filter(member => {
        const searchText = `${member.name} ${member.title} ${member.description} ${member.specialties?.join(' ')} ${member.experience} ${member.location}`.toLowerCase();
        return locationConfig.keywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
      });
    },
    enabled: !!locationConfig
  });
};
