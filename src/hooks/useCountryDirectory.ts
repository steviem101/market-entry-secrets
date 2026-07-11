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

// The RPC is not in the generated Supabase types yet; cast through `unknown`
// to a minimal typed surface (avoids `any`), matching the intake funnel pattern.
interface MinimalRpcClient {
  rpc: (fn: string) => PromiseLike<{ data: unknown; error: unknown }>;
}

// One call for the /countries listing: every country plus true data-density
// signals (curated links + editorial coverage) so tiles can be honest about
// what each corridor page actually holds.
export const useCountryDirectory = () => {
  return useQuery({
    queryKey: ["country-directory"],
    queryFn: async (): Promise<CountryDirectoryEntry[]> => {
      const client = supabase as unknown as MinimalRpcClient;
      const { data, error } = await client.rpc("get_country_directory");
      if (error) throw error;
      return (data as CountryDirectoryEntry[]) ?? [];
    },
    staleTime: 30 * 60 * 1000,
  });
};
