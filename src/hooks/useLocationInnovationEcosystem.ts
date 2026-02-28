
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLocationBySlug } from "@/hooks/useLocations";

export const useLocationInnovationEcosystem = (locationSlug: string) => {
  const { data: locationConfig } = useLocationBySlug(locationSlug);

  return useQuery({
    queryKey: ['location-innovation-ecosystem', locationSlug],
    queryFn: async () => {
      if (!locationConfig) return [];

      const { data, error } = await supabase
        .from('innovation_ecosystem')
        .select('*')
        .order('name');

      if (error) throw error;

      return data.filter(org => {
        const searchText = `${org.name} ${org.description} ${org.services?.join(' ')} ${org.location}`.toLowerCase();
        return locationConfig.service_keywords.some(keyword =>
          searchText.includes(keyword.toLowerCase())
        );
      });
    },
    enabled: !!locationConfig
  });
};
