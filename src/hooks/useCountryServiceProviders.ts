
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCountryBySlug } from "@/hooks/useCountries";

export const useCountryServiceProviders = (countrySlug: string) => {
  const { data: countryConfig } = useCountryBySlug(countrySlug);
  
  return useQuery({
    queryKey: ['country-service-providers', countrySlug],
    queryFn: async () => {
      if (!countryConfig) {
        console.log('No country config found for service providers:', countrySlug);
        return [];
      }

      console.log('Fetching service providers for country:', countryConfig.name);
      console.log('Service keywords:', countryConfig.service_keywords);
      
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching service providers:', error);
        throw error;
      }

      // Filter based on country keywords
      const filteredProviders = data.filter(provider => {
        const searchText = `${provider.name} ${provider.description} ${provider.services?.join(' ')} ${provider.location}`.toLowerCase();
        const hasMatch = countryConfig.service_keywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
        if (hasMatch) {
          console.log('Service provider match found:', provider.name);
        }
        return hasMatch;
      });

      console.log('Filtered service providers count:', filteredProviders.length);
      return filteredProviders;
    },
    enabled: !!countryConfig
  });
};
