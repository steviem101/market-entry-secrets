
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLocationBySlug } from "@/hooks/useLocations";

export const useLocationServiceProviders = (locationSlug: string) => {
  const { data: locationConfig } = useLocationBySlug(locationSlug);
  
  return useQuery({
    queryKey: ['location-service-providers', locationSlug],
    queryFn: async () => {
      if (!locationConfig) return [];
      
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .order('name');

      if (error) throw error;

      // Filter based on location keywords
      return data.filter(provider => {
        const searchText = `${provider.name} ${provider.description} ${provider.services?.join(' ')} ${provider.location}`.toLowerCase();
        return locationConfig.service_keywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
      });
    },
    enabled: !!locationConfig
  });
};
