
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ContentItemsOptions {
  featured?: boolean;
  contentType?: string | string[];
}

export const useContentItems = (options?: ContentItemsOptions) => {
  return useQuery({
    queryKey: ['content-items', options],
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

      if (options?.featured) {
        query = query.eq('featured', true);
      }

      if (options?.contentType) {
        if (Array.isArray(options.contentType)) {
          query = query.in('content_type', options.contentType);
        } else {
          query = query.eq('content_type', options.contentType);
        }
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

      // Fetch sections first, then bodies in parallel where possible
      const { data: sections, error: sectionsError } = await supabase
        .from('content_sections')
        .select('*')
        .eq('content_id', contentItem.id)
        .eq('is_active', true)
        .order('sort_order');

      if (sectionsError) throw sectionsError;

      // Fetch bodies matching content_id OR belonging to any of this content's sections
      const sectionIds = sections?.map(s => s.id).join(',') || '';
      const orFilter = sectionIds
        ? `content_id.eq.${contentItem.id},section_id.in.(${sectionIds})`
        : `content_id.eq.${contentItem.id}`;

      const { data: bodies, error: bodiesError } = await supabase
        .from('content_bodies')
        .select('*')
        .or(orFilter)
        .order('sort_order');

      if (bodiesError) throw bodiesError;

      return {
        ...contentItem,
        content_sections: sections || [],
        content_bodies: bodies || []
      };
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
  return useCallback(async (contentId: string) => {
    try {
      const { error } = await (supabase as any).rpc('increment_view_count', {
        content_id: contentId
      });

      if (error) {
        // Silently ignore view count increment failures
      }
    } catch {
      // Silently ignore view count increment failures
    }
  }, []);
};
