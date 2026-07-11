import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CountryData } from "@/hooks/useCountries";
import type {
  CountryPageContent,
  CountryTradeMetric,
  CountryCaseStudy,
  CountryPlaybookStage,
  CountryFundingInstrument,
  CountryFaq,
} from "@/lib/countryPageContent";

export interface CountryLinkedMentor {
  id: string;
  name: string;
  title: string | null;
  company: string | null;
  specialties: string[] | null;
  location: string | null;
  archetype: string | null;
  photo: string | null;
  blurb: string | null;
  is_featured: boolean;
}

export interface CountryLinkedAgency {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  location: string | null;
  services: string[] | null;
  logo: string | null;
  role: string | null;
  blurb: string | null;
  is_featured: boolean;
}

export interface CountryLinkedProvider {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  location: string | null;
  services: string[] | null;
  logo: string | null;
  website: string | null;
  blurb: string | null;
  is_featured: boolean;
}

export interface CountryLinkedInvestor {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  location: string | null;
  investor_type: string | null;
  sector_focus: string[] | null;
  stage_focus: string[] | null;
  check_size_min: number | null;
  check_size_max: number | null;
  blurb: string | null;
  is_featured: boolean;
}

export interface CountryLinkedEvent {
  id: string;
  title: string | null;
  slug: string | null;
  date: string | null;
  location: string | null;
  description: string | null;
  category: string | null;
  blurb: string | null;
}

export interface CountryCity {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  key_industries?: string[] | null;
  [key: string]: unknown;
}

export interface CountryLinkTotals {
  mentor?: number;
  agency?: number;
  service_provider?: number;
  investor?: number;
  event?: number;
}

export interface CountryPageBundle {
  country: CountryData;
  page_content: CountryPageContent | null;
  trade_metrics: CountryTradeMetric[];
  case_studies: CountryCaseStudy[];
  playbook: CountryPlaybookStage[];
  funding: CountryFundingInstrument[];
  faqs: CountryFaq[];
  mentors: CountryLinkedMentor[];
  agencies: CountryLinkedAgency[];
  service_providers: CountryLinkedProvider[];
  investors: CountryLinkedInvestor[];
  events: CountryLinkedEvent[];
  cities: CountryCity[];
  link_totals: CountryLinkTotals;
}

// The RPC is not in the generated Supabase types yet, so cast the client
// through `unknown` to a minimal typed surface (avoids `any`), matching the
// intake funnel pattern.
interface MinimalRpcClient {
  rpc: (fn: string, args: Record<string, unknown>) => PromiseLike<{ data: unknown; error: unknown }>;
}

// Single round trip for the whole country page. The get_country_page RPC
// returns NULL for unknown slugs, ranked ecosystem links (approved only,
// top 6 per type), and all editorial blocks.
export const useCountryPage = (slug: string) => {
  return useQuery({
    queryKey: ["country-page", slug],
    queryFn: async (): Promise<CountryPageBundle | null> => {
      const client = supabase as unknown as MinimalRpcClient;
      const { data, error } = await client.rpc("get_country_page", { page_slug: slug });

      if (error) throw error;
      return (data as CountryPageBundle) ?? null;
    },
    enabled: !!slug,
    staleTime: 30 * 60 * 1000,
  });
};
