
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Testimonial {
  id: string;
  name: string;
  title: string;
  company: string;
  country_flag: string;
  country_name: string;
  testimonial: string;
  outcome: string;
  avatar?: string;
  is_featured: boolean;
  sort_order: number;
}

export const useTestimonials = () => {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_featured', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching testimonials:', error);
        throw error;
      }

      return data as Testimonial[];
    },
  });
};
