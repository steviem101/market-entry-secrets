
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SectorData {
  id: string;
  name: string;
  slug: string;
  description: string;
  hero_title: string;
  hero_description: string;
  keywords: string[];
  service_keywords: string[];
  event_keywords: string[];
  lead_keywords: string[];
  content_keywords: string[];
  industries: string[];
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const useSectors = () => {
  return useQuery({
    queryKey: ['sectors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('industry_sectors')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as SectorData[];
    }
  });
};

export const useFeaturedSectors = () => {
  return useQuery({
    queryKey: ['featured-sectors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('industry_sectors')
        .select('*')
        .eq('featured', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as SectorData[];
    }
  });
};

export const useSectorBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['sector', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('industry_sectors')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data as SectorData;
    },
    enabled: !!slug
  });
};
