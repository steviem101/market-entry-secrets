import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useInnovationEcosystem = () => {
  return useQuery({
    queryKey: ['innovation-ecosystem'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('innovation_ecosystem')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching innovation ecosystem:', error);
        throw error;
      }

      return data;
    }
  });
};

export const useInnovationOrgById = (id: string) => {
  return useQuery({
    queryKey: ['innovation-org', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('innovation_ecosystem')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
};

export const useRelatedInnovationOrgs = (currentId: string, location: string) => {
  return useQuery({
    queryKey: ['related-innovation-orgs', currentId],
    queryFn: async () => {
      const locationPrefix = location.split(',')[0].trim();
      const { data, error } = await supabase
        .from('innovation_ecosystem')
        .select('*')
        .neq('id', currentId)
        .ilike('location', `%${locationPrefix}%`)
        .limit(3);

      if (error) throw error;
      return data;
    },
    enabled: !!currentId && !!location
  });
};
