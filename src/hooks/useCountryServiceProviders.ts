
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCountryBySlug } from "@/hooks/useCountries";

export const useCountryServiceProviders = (countrySlug: string) => {
  const { data: countryConfig } = useCountryBySlug(countrySlug);
  
  return useQuery({
    queryKey: ['country-service-providers', countrySlug],
    queryFn: async () => {
      if (!countryConfig) return [];
      
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .order('name');

      if (error) throw error;

      // Filter based on country keywords
      return data.filter(provider => {
        const searchText = `${provider.name} ${provider.description} ${provider.services?.join(' ')} ${provider.location}`.toLowerCase();
        return countryConfig.service_keywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
      });
    },
    enabled: !!countryConfig
  });
};
