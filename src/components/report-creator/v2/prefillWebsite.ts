/**
 * Website-scrape prefill seam for Step 1 (P1.2).
 *
 * Invokes the `scrape-company` edge function and returns a SUGGESTION. The
 * caller (Step 1) never gates Next on this and treats null as the graceful
 * "couldn't auto-read" fallback. Results are cached per normalised URL so a URL
 * is scraped at most once per session; a short timeout keeps it non-blocking.
 *
 * Note: the edge function deploys via the normal pipeline. Until it is live,
 * invoke() rejects and we fail soft (null), which is the intended behaviour.
 */
import { supabase } from '@/integrations/supabase/client';

export interface WebsitePrefill {
  company_name?: string;
  industry_sector?: string[];
  country_of_origin?: string;
  company_stage?: string;
  employee_count?: string;
}

const cache = new Map<string, WebsitePrefill | null>();
// 25s window — the backend pipeline (Firecrawl map + scrape + AI extract) can
// take 10–20s on heavier sites (B2B, anti-bot). 12s was too eager and gave up
// before non-trivial sites finished, even though the function would have
// returned valid data.
const TIMEOUT_MS = 25000;

function normaliseUrl(raw: string): string {
  const t = raw.trim().toLowerCase();
  return t.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '');
}

function hasAnyField(p: WebsitePrefill | null | undefined): p is WebsitePrefill {
  return !!p && Object.values(p).some((v) => (Array.isArray(v) ? v.length > 0 : !!v));
}

export async function prefillFromWebsite(url: string): Promise<WebsitePrefill | null> {
  const key = normaliseUrl(url);
  if (!key) return null;
  if (cache.has(key)) return cache.get(key) ?? null;

  try {
    const result = await Promise.race([
      supabase.functions.invoke('scrape-company', { body: { website_url: url } }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)),
    ]);

    const { data, error } = result as { data: (WebsitePrefill & { _reason?: string }) | null; error: unknown };
    if (error) return null; // don't cache transport/HTTP failures — allow retry on next attempt
    // Backend tags empty responses with a `_reason` (missing-keys|no-content|ai-empty|exception)
    // — surface it in the console so we can diagnose without re-deploying.
    if (data?._reason) {
      console.warn('[prefillWebsite] empty result', { url: key, reason: data._reason });
    }
    // Don't pass internal diagnostic fields through to the form.
    const cleaned: WebsitePrefill | null = data
      ? {
          company_name: data.company_name,
          industry_sector: data.industry_sector,
          country_of_origin: data.country_of_origin,
          company_stage: data.company_stage,
          employee_count: data.employee_count,
        }
      : null;
    const prefill = hasAnyField(cleaned) ? cleaned : null;
    cache.set(key, prefill);
    return prefill;
  } catch {
    // Don't cache transient failures — allow a retry on the next attempt.
    return null;
  }
}
