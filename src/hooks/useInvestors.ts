import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useInvestors = () => {
  return useQuery({
    queryKey: ['investors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investors')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching investors:', error);
        throw error;
      }

      return data;
    }
  });
};

export const useInvestorById = (id: string) => {
  return useQuery({
    queryKey: ['investor', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investors')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
};

export const useRelatedInvestors = (currentId: string, investorType: string, location: string) => {
  return useQuery({
    queryKey: ['related-investors', currentId],
    queryFn: async () => {
      const locationPrefix = location.split(',')[0].trim();
      const { data, error } = await supabase
        .from('investors')
        .select('*')
        .neq('id', currentId)
        .or(`investor_type.eq.${investorType},location.ilike.%${locationPrefix}%`)
        .limit(3);

      if (error) throw error;
      return data;
    },
    enabled: !!currentId && !!investorType
  });
};
