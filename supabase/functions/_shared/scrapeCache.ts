/**
 * Cross-report / cross-function Firecrawl scrape cache (Stage 1 audit P1).
 *
 * Backed by the `firecrawl_scrape_cache` table (service-role only; see migration
 * 20260628130000). Shared between generate-report and scrape-company so a single
 * normalised URL is scraped at most once per TTL window across BOTH functions —
 * the intake prefill (scrape-company) warms the cache that report generation
 * then reuses. Keeping the key normalisation in ONE place is the whole point:
 * if the two functions normalised differently they'd never share entries.
 *
 * Entirely inert unless FIRECRAWL_CACHE_ENABLED is set — buildScrapeCache then
 * returns undefined and callers behave exactly as before.
 *
 * Truncation note: callers run sanitizeScrapedContent with different maxLength
 * (generate-report 12000, scrape-company 6000) before storing, and every
 * consumer slices the content further downstream (2000 / 8000 respectively), so
 * reading an entry written by the other function is always safe — at worst a
 * consumer sees content capped at the other's (still generous) limit.
 */
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// Read-time TTL: 14d for usable content, 1d for negatives (so a transiently-down
// site retries soon rather than being pinned bad for two weeks).
export const SCRAPE_CACHE_TTL_OK_MS = 14 * 24 * 60 * 60 * 1000;
export const SCRAPE_CACHE_TTL_NEG_MS = 24 * 60 * 60 * 1000;

export interface ScrapeCacheEntry { content: string | null; ok: boolean; status: number }
export interface ScrapeCache {
  get(key: string): Promise<{ content: string | null } | null>;
  set(key: string, entry: ScrapeCacheEntry): Promise<void>;
}

/** Normalise a URL to a stable cache key: lowercase, strip scheme/www/trailing
 *  slash, KEEP the path (homepage vs /about are distinct scrape targets). */
export function normaliseScrapeKey(u: string): string {
  return u.trim().toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
}

/** Build a scrape cache backed by Supabase, or undefined when disabled. Best-effort:
 *  any DB error degrades to a live scrape (returns null from get / swallows set). */
export function buildScrapeCache(supabase: SupabaseClient): ScrapeCache | undefined {
  if (!Deno.env.get("FIRECRAWL_CACHE_ENABLED")) return undefined;
  return {
    async get(key) {
      try {
        const { data } = await supabase
          .from("firecrawl_scrape_cache")
          .select("content, ok, fetched_at")
          .eq("url_key", key)
          .maybeSingle();
        if (!data) return null;
        const ageMs = Date.now() - new Date(data.fetched_at).getTime();
        const ttl = data.ok ? SCRAPE_CACHE_TTL_OK_MS : SCRAPE_CACHE_TTL_NEG_MS;
        if (ageMs > ttl) return null;
        return { content: data.content ?? null };
      } catch (e) {
        console.error("scrape cache get failed (live scrape):", e instanceof Error ? e.message : "unknown");
        return null;
      }
    },
    async set(key, entry) {
      try {
        await supabase.from("firecrawl_scrape_cache").upsert({
          url_key: key,
          content: entry.content,
          ok: entry.ok,
          status: entry.status,
          byte_len: entry.content ? entry.content.length : 0,
          fetched_at: new Date().toISOString(),
        }, { onConflict: "url_key" });
      } catch (e) {
        console.error("scrape cache set failed (continuing):", e instanceof Error ? e.message : "unknown");
      }
    },
  };
}
