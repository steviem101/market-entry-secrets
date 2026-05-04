import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { LinkerEntry } from "@/lib/case-study/types";

/**
 * Build the autolinker corpus from the database.
 *
 * Sources:
 *  - service_providers: company name → /service-providers/<slug>
 *  - content_items (case_study): subject company name → /case-studies/<slug>
 *
 * Skipped (no detail route exists):
 *  - community_members
 *  - content_founders
 *
 * Names not in this corpus fall through to the Google fallback in the
 * autolinker (when enabled).
 */
export const useAutolinkCorpus = () => {
  return useQuery({
    queryKey: ["autolink-corpus"],
    staleTime: 60 * 60 * 1000,
    queryFn: async (): Promise<LinkerEntry[]> => {
      const [providers, caseStudies] = await Promise.all([
        supabase
          .from("service_providers")
          .select("name, slug")
          .order("name"),
        supabase
          .from("content_items")
          .select("slug, content_company_profiles(company_name)")
          .eq("content_type", "case_study")
          .eq("status", "published"),
      ]);

      const entries: LinkerEntry[] = [];

      (providers.data ?? []).forEach((p) => {
        if (p?.name && p.slug) {
          entries.push({
            name: p.name,
            href: `/service-providers/${p.slug}`,
            type: "company",
          });
        }
      });

      (caseStudies.data ?? []).forEach((row: any) => {
        const companyName = row?.content_company_profiles?.[0]?.company_name;
        if (companyName && row.slug) {
          entries.push({
            name: companyName,
            href: `/case-studies/${row.slug}`,
            type: "company",
          });
        }
      });

      // Dedupe by lowercased name (last write wins; service_providers preferred
      // since they're inserted first).
      const seen = new Set<string>();
      return entries.filter((e) => {
        const key = e.name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    },
  });
};
