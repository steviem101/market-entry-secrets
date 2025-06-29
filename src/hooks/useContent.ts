
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useContentItems = (featured?: boolean) => {
  return useQuery({
    queryKey: ['content-items', featured],
    queryFn: async () => {
      let query = supabase
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

      if (featured) {
        query = query.eq('featured', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    }
  });
};

export const useContentItem = (slug: string) => {
  return useQuery({
    queryKey: ['content-item', slug],
    queryFn: async () => {
      // First get the content item
      const { data: contentItem, error: contentError } = await supabase
        .from('content_items')
        .select(`
          *,
          content_categories (
            name,
            icon,
            color
          ),
          content_company_profiles (*),
          content_founders (*)
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (contentError) throw contentError;

      // Get sections for this content item
      const { data: sections, error: sectionsError } = await supabase
        .from('content_sections')
        .select('*')
        .eq('content_id', contentItem.id)
        .eq('is_active', true)
        .order('sort_order');

      if (sectionsError) throw sectionsError;

      // Get all content bodies for this content item (both sectioned and non-sectioned)
      const { data: bodies, error: bodiesError } = await supabase
        .from('content_bodies')
        .select('*')
        .or(`content_id.eq.${contentItem.id},section_id.in.(${sections?.map(s => s.id).join(',') || 'null'})`)
        .order('sort_order');

      if (bodiesError) throw bodiesError;

      // Combine the data
      const result = {
        ...contentItem,
        content_sections: sections || [],
        content_bodies: bodies || []
      };

      console.log('Fetched content item:', result);
      console.log('Sections:', sections);
      console.log('Bodies:', bodies);

      return result;
    },
    enabled: !!slug
  });
};

export const useContentCategories = () => {
  return useQuery({
    queryKey: ['content-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_categories')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      return data;
    }
  });
};

export const useIncrementViewCount = () => {
  return async (contentId: string) => {
    try {
      // Use type assertion to work around TypeScript type issues
      const { error } = await (supabase as any).rpc('increment_view_count', {
        content_id: contentId
      });
      
      if (error) {
        console.error('Error incrementing view count:', error);
      }
    } catch (err) {
      console.error('Failed to increment view count:', err);
    }
  };
};
