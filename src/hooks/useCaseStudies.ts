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

      // Fetch sections first, then bodies matching content_id OR section_id
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

      // case_study_sources and case_study_quotes are not in the auto-generated
      // Supabase types yet (added in migration 20260504120100). Cast as any per
      // the project pattern documented in CLAUDE.md §2.
      const [{ data: sources }, { data: quotes }] = await Promise.all([
        (supabase as any)
          .from('case_study_sources')
          .select('*')
          .eq('case_study_id', contentItem.id)
          .order('citation_number', { ascending: true, nullsFirst: false }),
        (supabase as any)
          .from('case_study_quotes')
          .select('*')
          .eq('case_study_id', contentItem.id)
          .order('display_order', { ascending: true }),
      ]);

      return {
        ...contentItem,
        content_sections: sections || [],
        content_bodies: bodies || [],
        case_study_sources: sources || [],
        case_study_quotes: quotes || []
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
        const profile = item.content_company_profiles?.[0];
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
