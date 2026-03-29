
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSectorContent = (sectorSlug: string, keywords: string[] | undefined) => {
  return useQuery({
    queryKey: ['sector-content', sectorSlug, keywords],
    queryFn: async () => {
      if (!keywords?.length) return [];

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

      // Filter based on sector tags or keywords in title/subtitle
      return data.filter(content => {
        // Check sector_tags array first
        if (content.sector_tags?.includes(sectorSlug)) {
          return true;
        }

        // Fallback to keyword matching in title and subtitle
        const searchText = `${content.title} ${content.subtitle || ''}`.toLowerCase();
        return keywords.some(keyword =>
          searchText.includes(keyword.toLowerCase())
        );
      });
    },
    enabled: !!keywords?.length
  });
};
