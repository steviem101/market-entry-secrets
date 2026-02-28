import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTradeAgencies = () => {
  return useQuery({
    queryKey: ['trade-investment-agencies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trade_investment_agencies')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching agencies:', error);
        throw error;
      }

      return data;
    }
  });
};

export const useTradeAgencyBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['trade-agency', slug],
    queryFn: async () => {
      // Try the view first (includes category_name), fall back to table
      const { data: viewData, error: viewError } = await (supabase as any)
        .from('agencies_report_view')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!viewError && viewData) return viewData;

      // Fallback to direct table query
      const { data, error } = await (supabase as any)
        .from('trade_investment_agencies')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug
  });
};

export const useRelatedTradeAgencies = (currentId: string, categorySlug: string, location: string) => {
  return useQuery({
    queryKey: ['related-trade-agencies', currentId],
    queryFn: async () => {
      const locationPrefix = location?.split(',')[0]?.trim() || '';
      const { data, error } = await (supabase as any)
        .from('trade_investment_agencies')
        .select('*')
        .neq('id', currentId)
        .or(`category_slug.eq.${categorySlug},location.ilike.%${locationPrefix}%`)
        .eq('is_active', true)
        .limit(3);

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentId && !!categorySlug
  });
};

export const useOrganisationCategories = () => {
  return useQuery({
    queryKey: ['organisation-categories'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('organisation_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }

      return data || [];
    }
  });
};

export const useAgencyContacts = (agencyId: string) => {
  return useQuery({
    queryKey: ['agency-contacts', agencyId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('agency_contacts')
        .select('*')
        .eq('agency_id', agencyId)
        .order('display_order');

      if (error) {
        console.error('Error fetching agency contacts:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!agencyId
  });
};

export const useAgencyResources = (agencyId: string) => {
  return useQuery({
    queryKey: ['agency-resources', agencyId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('agency_resources')
        .select('*')
        .eq('agency_id', agencyId)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching agency resources:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!agencyId
  });
};
