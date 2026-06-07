/**
 * Website-scrape prefill seam for Step 1.
 *
 * Phase 4 (P1.2) implements the real endpoint: a Supabase function using
 * firecrawlMap + firecrawlScrape + Lovable AI extraction, debounced + cached
 * per URL, non-blocking, fail-soft. Until then this resolves null so Step 1
 * shows the graceful "couldn't auto-read — just fill in below" fallback rather
 * than fabricating data.
 */
export interface WebsitePrefill {
  company_name?: string;
  country_of_origin?: string;
  industry_sector?: string[];
  company_stage?: string;
  employee_count?: string;
}

export async function prefillFromWebsite(_url: string): Promise<WebsitePrefill | null> {
  // Phase 4: invoke the scrape edge function here.
  return null;
}
