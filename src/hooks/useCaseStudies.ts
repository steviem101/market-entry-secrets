import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCaseStudies = () => {
  return useQuery({
    queryKey: ['case-studies'],
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
          content_founders (*)
        `)
        .eq('status', 'published')
        .eq('content_type', 'case_study')
        .order('publish_date', { ascending: false });

      if (error) throw error;
      return data;
    }
  });
};

export const useCaseStudy = (slug: string) => {
  return useQuery({
    queryKey: ['case-study', slug],
    queryFn: async () => {
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
        .eq('content_type', 'case_study')
        .single();

      if (contentError) throw contentError;

      // Get sections for this case study
      const { data: sections, error: sectionsError } = await supabase
        .from('content_sections')
        .select('*')
        .eq('content_id', contentItem.id)
        .eq('is_active', true)
        .order('sort_order');

      if (sectionsError) throw sectionsError;

      // Get all content bodies (both sectioned and non-sectioned)
      const { data: bodies, error: bodiesError } = await supabase
        .from('content_bodies')
        .select('*')
        .or(`content_id.eq.${contentItem.id},section_id.in.(${sections?.map(s => s.id).join(',') || 'null'})`)
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
