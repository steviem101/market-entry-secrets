
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useLocationCommunityMembers = (locationSlug: string, keywords: string[] | undefined) => {
  return useQuery({
    queryKey: ['location-community-members', locationSlug, keywords],
    queryFn: async () => {
      if (!keywords?.length) return [];

      const { data, error } = await supabase
        .from('community_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter based on location keywords
      return data.filter(member => {
        const searchText = `${member.name} ${member.title} ${member.description} ${member.specialties?.join(' ')} ${member.experience} ${member.location}`.toLowerCase();
        return keywords.some(keyword =>
          searchText.includes(keyword.toLowerCase())
        );
      });
    },
    enabled: !!keywords?.length
  });
};
