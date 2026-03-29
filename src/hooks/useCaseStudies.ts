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

      // Fetch sections first (needed for section IDs in bodies query)
      const { data: sections, error: sectionsError } = await supabase
        .from('content_sections')
        .select('*')
        .eq('content_id', contentItem.id)
        .eq('is_active', true)
        .order('sort_order');

      if (sectionsError) throw sectionsError;

      // Fetch bodies — some are linked via content_id, others via section_id
      const sectionIds = sections?.map(s => s.id).join(',') || 'null';
      const { data: bodies, error: bodiesError } = await supabase
        .from('content_bodies')
        .select('*')
        .or(`content_id.eq.${contentItem.id},section_id.in.(${sectionIds})`)
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

export const useRelatedCaseStudies = (currentId: string | undefined, industry: string | undefined, originCountry: string | undefined) => {
  return useQuery({
    queryKey: ['related-case-studies', currentId, industry, originCountry],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items')
        .select(`
          id, slug, title, subtitle, read_time, publish_date, view_count,
          content_company_profiles (company_name, company_logo, origin_country, industry, outcome, entry_date),
          content_founders (name, image, is_primary)
        `)
        .eq('status', 'published')
        .eq('content_type', 'case_study')
        .neq('id', currentId!)
        .order('publish_date', { ascending: false })
        .limit(6);

      if (error) throw error;

      // Score and sort by relevance (same industry first, then same country)
      const scored = (data || []).map(item => {
        const profile = item.content_company_profiles?.[0] as any;
        let score = 0;
        if (industry && profile?.industry === industry) score += 2;
        if (originCountry && profile?.origin_country === originCountry) score += 1;
        return { ...item, _score: score };
      });
      scored.sort((a, b) => b._score - a._score);
      return scored.slice(0, 3);
    },
    enabled: !!currentId
  });
};
