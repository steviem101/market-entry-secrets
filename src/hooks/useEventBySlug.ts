import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EventDetail {
  id: string;
  title: string;
  slug: string;
  date: string;
  time: string;
  location: string;
  type: string;
  category: string;
  attendees: number;
  description: string;
  organizer: string;
  event_logo_url?: string | null;
  sector?: string | null;
  website_url?: string | null;
  registration_url?: string | null;
  organizer_email?: string | null;
  organizer_website?: string | null;
  price?: string | null;
  is_featured: boolean;
  tags?: string[] | null;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
}

export const useEventBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["event", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data as EventDetail;
    },
    enabled: !!slug,
  });
};

export const useRelatedEvents = (
  eventId: string,
  category: string,
  sector?: string | null
) => {
  return useQuery({
    queryKey: ["related-events", eventId, category, sector],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select("*")
        .neq("id", eventId)
        .order("date", { ascending: true })
        .limit(3);

      if (sector) {
        query = query.or(`category.eq.${category},sector.eq.${sector}`);
      } else {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as EventDetail[];
    },
    enabled: !!eventId && !!category,
  });
};
