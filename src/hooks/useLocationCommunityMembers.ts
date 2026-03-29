
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useLocationCommunityMembers = (locationSlug: string, keywords: string[] | undefined) => {
  return useQuery({
    queryKey: ['location-community-members', locationSlug, keywords],
    queryFn: async () => {
      if (!keywords?.length) return [];

      const filters = keywords.flatMap(kw => [
        `name.ilike.%${kw}%`,
        `title.ilike.%${kw}%`,
        `description.ilike.%${kw}%`,
        `experience.ilike.%${kw}%`,
        `location.ilike.%${kw}%`,
      ]);

      const { data, error } = await supabase
        .from('community_members')
        .select('*')
        .or(filters.join(','))
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      return data;
    },
    enabled: !!keywords?.length
  });
};
