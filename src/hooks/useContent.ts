
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
      const { data, error } = await supabase
        .from('content_items')
        .select(`
          *,
          content_categories (
            name,
            icon,
            color
          ),
          content_company_profiles (*),
          content_founders (*),
          content_sections (
            id,
            title,
            slug,
            sort_order,
            is_active
          ),
          content_bodies (
            id,
            section_id,
            question,
            body_text,
            sort_order,
            content_type
          )
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;

      // Sort sections and bodies by sort_order
      if (data.content_sections) {
        data.content_sections.sort((a: any, b: any) => a.sort_order - b.sort_order);
      }
      if (data.content_bodies) {
        data.content_bodies.sort((a: any, b: any) => a.sort_order - b.sort_order);
      }

      return data;
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
