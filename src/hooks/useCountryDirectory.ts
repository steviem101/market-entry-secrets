import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CountryDirectoryEntry {
  id: string;
  name: string;
  slug: string;
  description: string;
  featured: boolean;
  sort_order: number | null;
  key_industries: string[];
  trade_relationship_strength: string | null;
  economic_indicators: Record<string, unknown> | null;
  has_page_content: boolean;
  case_study_count: number;
  mentor_count: number;
  agency_count: number;
  investor_count: number;
  provider_count: number;
}

// One call for the /countries listing: every country plus true data-density
// signals (curated links + editorial coverage) so tiles can be honest about
// what each corridor page actually holds. The RPC returns Json in the
// generated types; the entry shape is asserted here.
export const useCountryDirectory = () => {
  return useQuery({
    queryKey: ["country-directory"],
    queryFn: async (): Promise<CountryDirectoryEntry[]> => {
      const { data, error } = await supabase.rpc("get_country_directory");
      if (error) throw error;
      return (data as unknown as CountryDirectoryEntry[]) ?? [];
    },
    staleTime: 30 * 60 * 1000,
  });
};
