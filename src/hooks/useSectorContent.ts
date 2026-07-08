
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSectorContent = (
  sectorSlug: string,
  keywords: string[] | undefined,
  canonicalSectorSlugs?: string[] | null,
) => {
  return useQuery({
    queryKey: ['sector-content', sectorSlug, keywords, canonicalSectorSlugs],
    queryFn: async () => {
      if (!keywords?.length) return [];

      // Build OR filter: canonical V2 sector_tags overlap (content_items are tagged with
      // the 20 canonical sector slugs — NOT the thematic page slug, so filtering on
      // `sectorSlug` here matched nothing; MES-110 step 6), plus keyword match in
      // title/subtitle. When no canonical slug is configured for the page (e.g. telecoms,
      // whose canonical sector is too broad), fall back to keyword-only matching.
      const filters = [
        ...(canonicalSectorSlugs ?? []).map(slug => `sector_tags.cs.{${slug}}`),
        ...keywords.flatMap(kw => [
          `title.ilike.%${kw}%`,
          `subtitle.ilike.%${kw}%`,
        ]),
      ];

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

      if (error) throw error;
      return data;
    },
    enabled: !!keywords?.length
  });
};
