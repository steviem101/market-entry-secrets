
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Person, ExperienceTile } from "@/components/PersonCard";

export const useCommunityMembers = () => {
  return useQuery({
    queryKey: ['community-members'],
    queryFn: async (): Promise<Person[]> => {
      const { data, error } = await supabase
        .from('community_members_public')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        throw error;
      }

      // Transform the database data to match the Person interface
      return data.map(member => ({
        id: member.id,
        name: member.name,
        title: member.title,
        description: member.description,
        location: member.location,
        experience: member.experience,
        specialties: member.specialties || [],
        // contact and website are excluded from community_members_public view
        // (Workstream A3 — anon must not read PII). Detail pages can fetch them
        // via an authenticated tier-gated path when needed.
        website: null,
        contact: null,
        image: member.image,
        company: member.company,
        isAnonymous: member.is_anonymous,
        serves_personas: (member as any).serves_personas || [],
        experienceTiles: member.experience_tiles ?
          (Array.isArray(member.experience_tiles) ?
            (member.experience_tiles as unknown as ExperienceTile[]) :
            []) :
          []
      }));
    },
    staleTime: 15 * 60 * 1000
  });
};
