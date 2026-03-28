
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useLocationServiceProviders = (locationSlug: string, keywords: string[] | undefined) => {
  return useQuery({
    queryKey: ['location-service-providers', locationSlug],
    queryFn: async () => {
      if (!keywords?.length) return [];

      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .order('name');

      if (error) throw error;

      // Filter based on location keywords
      return data.filter(provider => {
        const searchText = `${provider.name} ${provider.description} ${provider.services?.join(' ')} ${provider.location}`.toLowerCase();
        return keywords.some(keyword =>
          searchText.includes(keyword.toLowerCase())
        );
      });
    },
    enabled: !!keywords?.length
  });
};
