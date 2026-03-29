import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useInvestors = () => {
  return useQuery({
    queryKey: ['investors'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('investors')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching investors:', error);
        throw error;
      }

      return data;
    },
    staleTime: 15 * 60 * 1000
  });
};

export const useInvestorById = (id: string) => {
  return useQuery({
    queryKey: ['investor', id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('investors')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: 15 * 60 * 1000
  });
};

export const useInvestorBySlug = (slugOrId: string) => {
  return useQuery({
    queryKey: ['investor-slug', slugOrId],
    queryFn: async () => {
      // Try slug lookup first
      const { data: slugData, error: slugError } = await (supabase as any)
        .from('investors')
        .select('*')
        .eq('slug', slugOrId)
        .maybeSingle();

      if (slugData) return slugData;

      // Fallback to id lookup if slug didn't match and value looks like a UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
      if (isUUID) {
        const { data: idData, error: idError } = await (supabase as any)
          .from('investors')
          .select('*')
          .eq('id', slugOrId)
          .single();

        if (idError) throw idError;
        return idData;
      }

      // Neither slug nor valid UUID — throw original error or not-found
      if (slugError) throw slugError;
      return null;
    },
    enabled: !!slugOrId,
    staleTime: 15 * 60 * 1000
  });
};

export const useRelatedInvestors = (currentId: string, investorType: string, location: string) => {
  return useQuery({
    queryKey: ['related-investors', currentId],
    queryFn: async () => {
      const locationPrefix = location.split(',')[0].trim();
      const { data, error } = await (supabase as any)
        .from('investors')
        .select('*')
        .neq('id', currentId)
        .or(`investor_type.eq.${investorType},location.ilike.%${locationPrefix}%`)
        .limit(3);

      if (error) throw error;
      return data;
    },
    enabled: !!currentId && !!investorType,
    staleTime: 15 * 60 * 1000
  });
};
