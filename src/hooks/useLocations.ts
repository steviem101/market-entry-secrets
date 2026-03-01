
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LocationData {
  id: string;
  name: string;
  slug: string;
  description: string;
  location_type: 'state' | 'city' | 'region';
  parent_location: string | null;
  parent_location_id: string | null;
  country: string;
  active: boolean;
  hero_title: string;
  hero_description: string;
  government_agency_name: string | null;
  government_agency_contact: string | null;
  government_agency_website: string | null;
  business_environment_score: number | null;
  startup_ecosystem_strength: 'Strong' | 'Growing' | 'Emerging' | null;
  key_industries: string[];
  population: number | null;
  economic_indicators: Record<string, any>;
  keywords: string[];
  content_keywords: string[];
  service_keywords: string[];
  event_keywords: string[];
  lead_keywords: string[];
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const useLocations = () => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      // Filter active client-side (column may not exist in older DB schemas)
      return (data as LocationData[]).filter(l => l.active !== false);
    }
  });
};

export const useFeaturedLocations = () => {
  return useQuery({
    queryKey: ['featured-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('featured', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return (data as LocationData[]).filter(l => l.active !== false);
    }
  });
};

export const useLocationBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['location', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data as LocationData;
    },
    enabled: !!slug
  });
};
