import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TradeOrganizationData {
  id: string;
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
}

const COUNTRY_SLUG_TO_ISO2: Record<string, string> = {
  canada: "CA",
  ireland: "IE",
  singapore: "SG",
  "united-kingdom": "GB",
  "united-states": "US",
};

export const useCountryTradeOrganizations = (countrySlug: string) => {
  return useQuery({
    queryKey: ["country-trade-organizations", countrySlug],
    queryFn: async () => {
      const iso2 = COUNTRY_SLUG_TO_ISO2[countrySlug];
      if (!iso2) return [] as TradeOrganizationData[];

      // Pull from the canonical trade_investment_agencies view, filtering by
      // either the agency's country of origin (country_iso2) or any bilateral
      // jurisdiction it covers.
      const { data, error } = await (supabase as any)
        .from("agencies_report_view")
        .select("*")
        .or(`country_iso2.eq.${iso2},jurisdiction.cs.{${iso2}}`)
        .eq("is_active", true)
        .limit(20);

      if (error) {
        return [] as TradeOrganizationData[];
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        organization_type: row.organisation_type || row.category_slug || "",
        founded: row.founded,
        location: row.location,
        employees: row.employees,
        services: row.services || [],
        website: row.website_url || row.website,
        contact: row.email || row.contact,
        logo: row.logo,
        basic_info: row.basic_info,
        why_work_with_us: row.why_work_with_us,
        contact_persons: row.primary_contacts || [],
        experience_tiles: row.experience_tiles,
      })) as TradeOrganizationData[];
    },
    enabled: !!countrySlug,
  });
};
