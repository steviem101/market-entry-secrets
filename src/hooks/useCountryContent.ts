
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCountryContent = (countrySlug: string, keywords: string[] | undefined) => {
  return useQuery({
    queryKey: ['country-content', countrySlug, keywords],
    queryFn: async () => {
      if (!keywords?.length) return [];

      // Build ilike filters for keyword matching in title/subtitle
      const filters = keywords.flatMap(kw => [
        `title.ilike.%${kw}%`,
        `subtitle.ilike.%${kw}%`,
      ]);

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
        .or(filters.join(','))
        .order('publish_date', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching content:', error);
        throw error;
      }

      return data;
    },
    enabled: !!keywords?.length
  });
};
