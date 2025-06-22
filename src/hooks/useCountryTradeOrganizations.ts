
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TradeOrganizationData {
  id: string;
  country_id: string;
  name: string;
  description: string;
  organization_type: string;
  founded: string;
  location: string;
  employees: string;
  services: string[];
  website: string | null;
  contact: string | null;
  logo: string | null;
  basic_info: string | null;
  why_work_with_us: string | null;
  contact_persons: any;
  experience_tiles: any;
  created_at: string;
  updated_at: string;
}

export const useCountryTradeOrganizations = (countrySlug: string) => {
  return useQuery({
    queryKey: ['country-trade-organizations', countrySlug],
    queryFn: async () => {
      // First get the country ID from the slug
      const { data: country, error: countryError } = await supabase
        .from('countries')
        .select('id')
        .eq('slug', countrySlug)
        .single();

      if (countryError || !country) {
        console.error('Country not found:', countryError);
        return [];
      }

      // Then get trade organizations for that country
      const { data, error } = await supabase
        .from('country_trade_organizations')
        .select('*')
        .eq('country_id', country.id);

      if (error) {
        console.error('Error fetching trade organizations:', error);
        throw error;
      }
      
      return data as TradeOrganizationData[];
    },
    enabled: !!countrySlug
  });
};
