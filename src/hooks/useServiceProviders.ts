import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Company } from "@/components/CompanyCard";

// Normalize raw DB row into Company interface with safe defaults
function normalizeProvider(raw: any, category_name?: string | null): Company {
  return {
    id: raw.id,
    name: raw.name || "",
    description: raw.description || "",
    location: raw.location || "",
    founded: raw.founded || "",
    employees: raw.employees || "",
    services: raw.services || [],
    website: raw.website || undefined,
    contact: raw.contact || undefined,
    logo: raw.logo || undefined,
    basic_info: raw.basic_info || undefined,
    why_work_with_us: raw.why_work_with_us || undefined,
    experience_tiles: raw.experience_tiles || [],
    contact_persons: raw.contact_persons || [],
    serves_personas: raw.serves_personas || [],
    slug: raw.slug || undefined,
    tagline: raw.tagline || undefined,
    logo_url: raw.logo_url || undefined,
    cover_image_url: raw.cover_image_url || undefined,
    website_url: raw.website_url || undefined,
    founded_year: raw.founded_year || undefined,
    team_size_range: raw.team_size_range || undefined,
    is_verified: raw.is_verified || false,
    is_featured: raw.is_featured || false,
    is_active: raw.is_active !== false,
    markets_served: raw.markets_served || [],
    support_types: raw.support_types || [],
    sectors: raw.sectors || [],
    engagement_model: raw.engagement_model || [],
    company_size_focus: raw.company_size_focus || [],
    price_range: raw.price_range || undefined,
    contact_email: raw.contact_email || undefined,
    contact_phone: raw.contact_phone || undefined,
    linkedin_url: raw.linkedin_url || undefined,
    location_city: raw.location_city || undefined,
    location_state: raw.location_state || undefined,
    location_country: raw.location_country || undefined,
    category_slug: raw.category_slug || undefined,
    category_name: category_name || undefined,
    meta_title: raw.meta_title || undefined,
    meta_description: raw.meta_description || undefined,
    view_count: raw.view_count || 0,
  };
}

export const useServiceProviderBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["service-provider", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_providers")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;

      // Fetch category name separately since category_slug is a plain text column
      let category_name: string | null = null;
      if (data.category_slug) {
        const { data: catData } = await (supabase as any)
          .from("service_provider_categories")
          .select("name")
          .eq("slug", data.category_slug)
          .single();
        category_name = catData?.name || null;
      }

      return normalizeProvider(data, category_name);
    },
    enabled: !!slug,
  });
};

export const useRelatedServiceProviders = (
  currentId: string,
  categorySlug: string | null | undefined,
  location: string
) => {
  return useQuery({
    queryKey: ["related-service-providers", currentId, categorySlug],
    queryFn: async () => {
      const locationPrefix = location.split(",")[0].trim();
      let query = supabase
        .from("service_providers")
        .select("*")
        .neq("id", currentId)
        .limit(3);

      if (categorySlug) {
        query = query.or(
          `category_slug.eq.${categorySlug},location.ilike.%${locationPrefix}%`
        );
      } else {
        query = query.ilike("location", `%${locationPrefix}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((row: any) => normalizeProvider(row));
    },
    enabled: !!currentId,
  });
};

export const useServiceProviderCategories = () => {
  return useQuery({
    queryKey: ["service-provider-categories"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("service_provider_categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      return (data || []) as Array<{
        id: string;
        slug: string;
        name: string;
        description: string | null;
        icon: string | null;
        display_order: number;
        is_active: boolean;
      }>;
    },
  });
};

export const useServiceProviderReviews = (providerId: string) => {
  return useQuery({
    queryKey: ["service-provider-reviews", providerId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("service_provider_reviews")
        .select("*")
        .eq("provider_id", providerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Array<{
        id: string;
        provider_id: string;
        reviewer_name: string;
        reviewer_company: string | null;
        reviewer_country: string | null;
        rating: number;
        title: string | null;
        review_text: string | null;
        is_verified: boolean;
        created_at: string;
      }>;
    },
    enabled: !!providerId,
  });
};

export const useServiceProviderContacts = (providerId: string) => {
  return useQuery({
    queryKey: ["service-provider-contacts", providerId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("service_provider_contacts")
        .select("*")
        .eq("provider_id", providerId)
        .order("sort_order");

      if (error) throw error;
      return (data || []) as Array<{
        id: string;
        provider_id: string;
        full_name: string;
        role: string | null;
        email: string | null;
        phone: string | null;
        linkedin_url: string | null;
        avatar_url: string | null;
        is_primary: boolean;
        sort_order: number;
      }>;
    },
    enabled: !!providerId,
  });
};
