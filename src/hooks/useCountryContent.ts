
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCountryBySlug } from "@/hooks/useCountries";

export const useCountryContent = (countrySlug: string) => {
  const { data: countryConfig } = useCountryBySlug(countrySlug);
  
  return useQuery({
    queryKey: ['country-content', countrySlug],
    queryFn: async () => {
      if (!countryConfig) {
        console.log('No country config found for:', countrySlug);
        return [];
      }
      
      console.log('Fetching content for country:', countryConfig.name);
      console.log('Content keywords:', countryConfig.content_keywords);
      
      const { data, error } = await supabase
        .from('content_items')
        .select(`
          *,
          content_categories (
            name,
            icon,
            color
          )
        `)
        .eq('status', 'published')
        .order('publish_date', { ascending: false });

      if (error) {
        console.error('Error fetching content:', error);
        throw error;
      }

      // Filter based on keyword matching in title and subtitle
      const filteredContent = data.filter(content => {
        const searchText = `${content.title} ${content.subtitle || ''}`.toLowerCase();
        const hasMatch = countryConfig.content_keywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
        if (hasMatch) {
          console.log('Content match found:', content.title);
        }
        return hasMatch;
      });

      console.log('Filtered content count:', filteredContent.length);
      return filteredContent;
    },
    enabled: !!countryConfig
  });
};
