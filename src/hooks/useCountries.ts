
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CountryData {
  id: string;
  name: string;
  slug: string;
  description: string;
  hero_title: string;
  hero_description: string;
  location_type: string;
  trade_relationship_strength: string | null;
  economic_indicators: any;
  key_industries: string[];
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

export const useCountries = () => {
  return useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as CountryData[];
    },
    staleTime: 30 * 60 * 1000
  });
};

export const useFeaturedCountries = () => {
  return useQuery({
    queryKey: ['featured-countries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .eq('featured', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as CountryData[];
    },
    staleTime: 30 * 60 * 1000
  });
};

export const useCountryBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['country', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data as CountryData;
    },
    enabled: !!slug,
    staleTime: 30 * 60 * 1000
  });
};
