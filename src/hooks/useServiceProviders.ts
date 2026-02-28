import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

      return { ...data, category_name } as any;
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
      return (data || []) as any[];
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
