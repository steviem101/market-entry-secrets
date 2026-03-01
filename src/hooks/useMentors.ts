import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MentorExperience {
  id: string;
  company_name: string;
  company_logo_url: string | null;
  company_website: string | null;
  relationship_type: string | null;
  display_order: number;
}

export interface MentorTestimonial {
  id: string;
  reviewer_name: string;
  reviewer_title: string | null;
  reviewer_company: string | null;
  reviewer_country: string | null;
  quote: string;
  rating: number | null;
  is_verified: boolean;
}

export interface Mentor {
  id: string;
  name: string;
  slug: string | null;
  title: string;
  company: string | null;
  description: string;
  bio_full: string | null;
  tagline: string | null;
  location: string;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  experience: string;
  years_experience: number | null;
  specialties: string[];
  sectors: string[] | null;
  markets_served: string[] | null;
  persona_fit: string[] | null;
  languages: string[] | null;
  engagement_model: string[] | null;
  session_rate_aud: number | null;
  availability: string | null;
  is_verified: boolean;
  is_featured: boolean;
  is_active: boolean;
  category_slug: string | null;
  image: string | null;
  avatar_url: string | null;
  cover_image_url: string | null;
  website: string | null;
  linkedin_url: string | null;
  contact: string | null;
  email: string | null;
  phone: string | null;
  view_count: number;
  contact_request_count: number;
  meta_title: string | null;
  meta_description: string | null;
  experience_tiles: any[] | null;
  origin_country: string | null;
  associated_countries: string[] | null;
  is_anonymous: boolean;
}

export interface MentorCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
}

const mapMentor = (m: any): Mentor => ({
  id: m.id,
  name: m.name,
  slug: m.slug || null,
  title: m.title,
  company: m.company || null,
  description: m.description,
  bio_full: m.bio_full || null,
  tagline: m.tagline || null,
  location: m.location,
  location_city: m.location_city || null,
  location_state: m.location_state || null,
  location_country: m.location_country || null,
  experience: m.experience,
  years_experience: m.years_experience ?? null,
  specialties: m.specialties || [],
  sectors: m.sectors || null,
  markets_served: m.markets_served || null,
  persona_fit: m.persona_fit || null,
  languages: m.languages || null,
  engagement_model: m.engagement_model || null,
  session_rate_aud: m.session_rate_aud ?? null,
  availability: m.availability || null,
  is_verified: m.is_verified ?? false,
  is_featured: m.is_featured ?? false,
  is_active: m.is_active ?? true,
  category_slug: m.category_slug || null,
  image: m.image || null,
  avatar_url: m.avatar_url || null,
  cover_image_url: m.cover_image_url || null,
  website: m.website || null,
  linkedin_url: m.linkedin_url || null,
  contact: m.contact || null,
  email: m.email || null,
  phone: m.phone || null,
  view_count: m.view_count ?? 0,
  contact_request_count: m.contact_request_count ?? 0,
  meta_title: m.meta_title || null,
  meta_description: m.meta_description || null,
  experience_tiles: m.experience_tiles || null,
  origin_country: m.origin_country || null,
  associated_countries: m.associated_countries || null,
  is_anonymous: m.is_anonymous ?? false,
});

export const useMentors = () => {
  return useQuery({
    queryKey: ["mentors"],
    queryFn: async (): Promise<Mentor[]> => {
      // Only use columns that exist in the original schema.
      // is_active and is_featured are added by migration and may not exist yet.
      const { data, error } = await (supabase as any)
        .from("community_members")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching mentors:", error);
        throw error;
      }

      const mentors = (data || [])
        .map(mapMentor)
        .filter((m: Mentor) => m.is_active);

      // Sort featured first in JS (column may not exist for DB ordering)
      mentors.sort((a: Mentor, b: Mentor) =>
        (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)
      );

      return mentors;
    },
  });
};

export const useMentorBySlug = (categorySlug: string | undefined, mentorSlug: string | undefined) => {
  return useQuery({
    queryKey: ["mentor", categorySlug, mentorSlug],
    queryFn: async (): Promise<Mentor | null> => {
      if (!mentorSlug) return null;

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(mentorSlug);

      if (isUuid) {
        // Direct ID lookup — always works regardless of migration state
        const { data, error } = await (supabase as any)
          .from("community_members")
          .select("*")
          .eq("id", mentorSlug)
          .maybeSingle();

        if (error) {
          console.error("Error fetching mentor by id:", error);
          throw error;
        }
        return data ? mapMentor(data) : null;
      }

      // Try slug lookup (post-migration column)
      const { data, error } = await (supabase as any)
        .from("community_members")
        .select("*")
        .eq("slug", mentorSlug)
        .maybeSingle();

      if (error) {
        // If slug column doesn't exist yet, fall back to name-based lookup
        if (error.message?.includes("column") || error.code === "42703") {
          const nameGuess = mentorSlug.replace(/-/g, " ");
          const { data: fallbackData, error: fallbackError } = await (supabase as any)
            .from("community_members")
            .select("*")
            .ilike("name", nameGuess)
            .maybeSingle();

          if (fallbackError) {
            console.error("Error fetching mentor by name:", fallbackError);
            throw fallbackError;
          }
          return fallbackData ? mapMentor(fallbackData) : null;
        }
        console.error("Error fetching mentor by slug:", error);
        throw error;
      }

      return data ? mapMentor(data) : null;
    },
    enabled: !!mentorSlug,
  });
};

export const useMentorCategories = () => {
  return useQuery({
    queryKey: ["mentor-categories"],
    queryFn: async (): Promise<MentorCategory[]> => {
      try {
        const { data, error } = await (supabase as any)
          .from("mentor_categories")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error) {
          // Table may not exist yet — return empty so filters still render
          console.warn("mentor_categories not available yet:", error.message);
          return [];
        }

        return data || [];
      } catch {
        return [];
      }
    },
  });
};

export const useMentorExperience = (mentorId: string | undefined) => {
  return useQuery({
    queryKey: ["mentor-experience", mentorId],
    queryFn: async (): Promise<MentorExperience[]> => {
      if (!mentorId) return [];

      try {
        const { data, error } = await (supabase as any)
          .from("mentor_experience_with")
          .select("*")
          .eq("mentor_id", mentorId)
          .order("display_order", { ascending: true });

        if (error) {
          // Table may not exist yet — profile page falls back to experience_tiles JSONB
          console.warn("mentor_experience_with not available yet:", error.message);
          return [];
        }

        return data || [];
      } catch {
        return [];
      }
    },
    enabled: !!mentorId,
  });
};

export const useMentorTestimonials = (mentorId: string | undefined) => {
  return useQuery({
    queryKey: ["mentor-testimonials", mentorId],
    queryFn: async (): Promise<MentorTestimonial[]> => {
      if (!mentorId) return [];

      try {
        const { data, error } = await (supabase as any)
          .from("mentor_testimonials")
          .select("*")
          .eq("mentor_id", mentorId)
          .order("created_at", { ascending: false });

        if (error) {
          console.warn("mentor_testimonials not available yet:", error.message);
          return [];
        }

        return data || [];
      } catch {
        return [];
      }
    },
    enabled: !!mentorId,
  });
};
