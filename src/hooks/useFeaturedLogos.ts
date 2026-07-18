import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  selectFeaturedLogos,
  type FeaturedLogo,
  type FeaturedLogoRecord,
} from "@/lib/featuredLogos";

/**
 * Real featured-organisation logos for the homepage LogoCloud and the
 * value-journey lead panel (MES-162). Reads only records an admin has flagged
 * `is_featured` (set once logo usage rights are confirmed) across the three
 * public org directories. Public name/logo/website fields only — no PII.
 *
 * Each source query is independent and failure-tolerant: if one table's
 * is_featured column isn't live yet (or a query errors), the others still
 * render. selectFeaturedLogos returns [] below its minimum, so an uncurated
 * database yields an empty strip, not a broken one.
 */

type SourceRow = {
  id: string;
  name: string;
  logo: string | null;
  website: string | null;
  domain?: string | null;
};

const asRecords = (
  rows: SourceRow[] | null | undefined,
  source: FeaturedLogoRecord["source"],
): FeaturedLogoRecord[] =>
  (rows ?? []).map((row) => ({ ...row, source }));

export const useFeaturedLogos = () =>
  useQuery({
    queryKey: ["featured-logos"],
    queryFn: async (): Promise<FeaturedLogo[]> => {
      // service_providers / innovation_ecosystem `is_featured` columns are not
      // in the generated types until the next regeneration — cast per the
      // established reportApi convention.
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const [providers, agencies, ecosystem] = await Promise.all([
        (supabase as any)
          .from("service_providers")
          .select("id, name, logo, website")
          .eq("is_featured", true)
          .limit(24),
        (supabase as any)
          .from("trade_investment_agencies")
          .select("id, name, logo, website, domain")
          .eq("is_featured", true)
          .eq("is_active", true)
          .limit(24),
        (supabase as any)
          .from("innovation_ecosystem")
          .select("id, name, logo, website, domain")
          .eq("is_featured", true)
          .limit(24),
      ]);
      /* eslint-enable @typescript-eslint/no-explicit-any */

      const records: FeaturedLogoRecord[] = [
        ...asRecords(providers.error ? null : providers.data, "service_provider"),
        ...asRecords(agencies.error ? null : agencies.data, "trade_agency"),
        ...asRecords(ecosystem.error ? null : ecosystem.data, "innovation_ecosystem"),
      ];

      return selectFeaturedLogos(records);
    },
    staleTime: 30 * 60 * 1000, // curation changes rarely
    gcTime: 60 * 60 * 1000,
  });
