
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Person } from "@/components/PersonCard";

export const useCommunityMembers = () => {
  return useQuery({
    queryKey: ['community-members'],
    queryFn: async (): Promise<Person[]> => {
      console.log('Fetching community members from Supabase...');
      
      const { data, error } = await supabase
        .from('community_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching community members:', error);
        throw error;
      }

      console.log('Fetched community members:', data);

      // Transform the database data to match the Person interface
      return data.map(member => ({
        id: member.id,
        name: member.name,
        title: member.title,
        description: member.description,
        location: member.location,
        experience: member.experience,
        specialties: member.specialties || [],
        website: member.website,
        contact: member.contact,
        image: member.image,
        company: member.company,
        isAnonymous: member.is_anonymous,
        experienceTiles: member.experience_tiles ? 
          (Array.isArray(member.experience_tiles) ? member.experience_tiles : []) : []
      }));
    }
  });
};
