
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLocationBySlug } from "@/hooks/useLocations";

export const useLocationContent = (locationSlug: string) => {
  const { data: locationConfig } = useLocationBySlug(locationSlug);
  
  return useQuery({
    queryKey: ['location-content', locationSlug],
    queryFn: async () => {
      if (!locationConfig) return [];
      
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

      if (error) throw error;

      // Filter based on keyword matching in title and subtitle
      return data.filter(content => {
        const searchText = `${content.title} ${content.subtitle || ''}`.toLowerCase();
        return locationConfig.content_keywords.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
      });
    },
    enabled: !!locationConfig
  });
};
