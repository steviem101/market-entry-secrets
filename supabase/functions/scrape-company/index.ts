import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/http.ts";
import { isPrivateOrReservedUrl } from "../_shared/url.ts";
import { sanitizeScrapedContent } from "../_shared/sanitize.ts";
import { checkRateLimit } from "../_shared/rateLimit.ts";
import { buildScrapeCache, normaliseScrapeKey, type ScrapeCache } from "../_shared/scrapeCache.ts";

/**
 * scrape-company — Step 1 website prefill (P1.2).
 *
 * Given { website_url }, uses Firecrawl (map → scrape) + a Lovable AI
 * extraction to suggest { company_name, industry_sector[], country_of_origin,
 * company_stage, employee_count }. NON-BLOCKING on the client (the wizard never
 * gates Next on it) and fail-soft: any error returns an empty suggestion.
 *
 * Anonymous (verify_jwt = false in config.toml) because Step 1 precedes auth —
 * guarded by an SSRF check (isPrivateOrReservedUrl) and per-caller rate limiting
 * (keyed by authed user when present, else a UUID derived from the caller IP).
 * Output is a SUGGESTION, not truth — non-English sites degrade detection.
 */

const STAGE_OPTIONS = ["Startup/Seed", "Series A-B", "Growth/Scale-up", "Enterprise/Corporate"];
const EMPLOYEE_OPTIONS = ["1-10", "11-50", "51-200", "201-500", "500+"];

interface Prefill {
  company_name?: string;
  industry_sector?: string[];
  country_of_origin?: string;
  company_stage?: string;
  employee_count?: string;
}

/** Deterministic UUID (v5-ish) from a string, so anonymous IPs are valid rate-limit keys. */
async function stringToUuid(input: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input)));
  const b = Array.from(bytes.slice(0, 16));
  b[6] = (b[6] & 0x0f) | 0x40; // version 4
  b[8] = (b[8] & 0x3f) | 0x80; // variant
  const hex = b.map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

async function firecrawlMap(apiKey: string, url: string, timeoutMs = 5000): Promise<string[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch("https://api.firecrawl.dev/v1/map", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url, limit: 30, includeSubdomains: false }),
      signal: controller.signal,
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.links || [];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

async function firecrawlScrape(apiKey: string, url: string, timeoutMs = 10000, cache?: ScrapeCache): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    // Shared cross-function scrape cache (P1): the same homepage/about URL is
    // later re-scraped by generate-report's enrichCompanyDeep, so warming it here
    // saves that report a Firecrawl call. A hit avoids the API entirely.
    const cacheKey = cache ? normaliseScrapeKey(url) : "";
    if (cache) {
      const hit = await cache.get(cacheKey);
      if (hit) return hit.content;
    }
    const resp = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
      signal: controller.signal,
    });
    if (!resp.ok) {
      if (cache) await cache.set(cacheKey, { content: null, ok: false, status: resp.status });
      return null;
    }
    const data = await resp.json();
    const md = data.data?.markdown || data.markdown || null;
    const content = md ? sanitizeScrapedContent(md, 6000) : null;
    if (cache) await cache.set(cacheKey, { content, ok: !!content, status: resp.status });
    return content;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function extractProfile(apiKey: string, url: string, content: string): Promise<Prefill> {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "system",
          content:
            "You extract a structured company profile from website text. Respond with ONLY a JSON object, no prose, no code fences. " +
            `Keys: company_name (string), industry_sector (array of 1-3 STANDARD, widely-recognised industry categories — ` +
            `e.g. "Financial Services", "Software Development", "Cybersecurity", "Healthcare", "Retail" — NOT niche product ` +
            `descriptions or coined marketing terms; pick the closest recognised category so it maps to a known sector), ` +
            `country_of_origin (string, the HQ country), ` +
            `company_stage (one of ${JSON.stringify(STAGE_OPTIONS)}), employee_count (one of ${JSON.stringify(EMPLOYEE_OPTIONS)}). ` +
            "Omit any key you cannot determine. Use Australian English.",
        },
        { role: "user", content: `URL: ${url}\n\nWebsite content:\n${content}` },
      ],
    }),
  });
  if (!resp.ok) return {};
  const data = await resp.json();
  const raw = (data.choices?.[0]?.message?.content || "").trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    const parsed = JSON.parse(raw) as Prefill;
    const out: Prefill = {};
    if (typeof parsed.company_name === "string") out.company_name = parsed.company_name.slice(0, 200);
    if (Array.isArray(parsed.industry_sector)) out.industry_sector = parsed.industry_sector.filter((s) => typeof s === "string").slice(0, 3);
    if (typeof parsed.country_of_origin === "string") out.country_of_origin = parsed.country_of_origin.slice(0, 100);
    if (typeof parsed.company_stage === "string" && STAGE_OPTIONS.includes(parsed.company_stage)) out.company_stage = parsed.company_stage;
    if (typeof parsed.employee_count === "string" && EMPLOYEE_OPTIONS.includes(parsed.employee_count)) out.employee_count = parsed.employee_count;
    return out;
  } catch {
    return {};
  }
}

Deno.serve(async (req: Request) => {
  const cors = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  try {
    const { website_url } = await req.json().catch(() => ({}));
    if (!website_url || typeof website_url !== "string") return json({ error: "website_url required" }, 400);

    let url = website_url.trim();
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    if (isPrivateOrReservedUrl(url)) return json({}, 200); // fail soft on SSRF-ish input

    // Rate limit: authed user when present, else a UUID derived from the caller IP.
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    let rateKey: string | null = null;
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (token) {
      try {
        const sb = createClient(supabaseUrl, serviceKey);
        const { data } = await sb.auth.getUser(token);
        if (data.user) rateKey = data.user.id;
      } catch { /* ignore */ }
    }
    if (!rateKey) {
      const ip = (req.headers.get("x-forwarded-for") || "0.0.0.0").split(",")[0].trim();
      rateKey = await stringToUuid(`scrape:${ip}`);
    }
    const limited = await checkRateLimit(rateKey, "scrape-company", 20, 10);
    if (limited) return json({ error: limited }, 429);

    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY") || "";
    const lovableKey = Deno.env.get("LOVABLE_API_KEY") || "";
    if (!firecrawlKey || !lovableKey) {
      console.warn("scrape-company: missing API keys", { hasFirecrawl: !!firecrawlKey, hasLovable: !!lovableKey });
      return json({ _reason: "missing-keys" }, 200);
    }

    // Shared scrape cache (P1) — undefined unless FIRECRAWL_CACHE_ENABLED is set.
    // Warms (and reuses) the same firecrawl_scrape_cache that generate-report reads.
    const scrapeCache = buildScrapeCache(createClient(supabaseUrl, serviceKey));

    // Run map + homepage scrape in PARALLEL (was sequential, costing ~5s).
    // Map finds an About/Company link; homepage always gets scraped.
    const t0 = Date.now();
    const [links, homepageMd] = await Promise.all([
      firecrawlMap(firecrawlKey, url, 4000),
      firecrawlScrape(firecrawlKey, url, 8000, scrapeCache),
    ]);
    console.log(`scrape-company: map+homepage in ${Date.now() - t0}ms (links=${links.length}, homepage=${homepageMd?.length || 0}b)`);

    // If we found a likely About page, scrape it too for richer extraction.
    const keyPage = links.find((l) => /about|company|who-we-are/i.test(l));
    const keyMd = keyPage ? await firecrawlScrape(firecrawlKey, keyPage, 6000, scrapeCache) : null;
    if (keyMd) console.log(`scrape-company: keyPage ${keyPage} → ${keyMd.length}b`);

    const content = [homepageMd, keyMd].filter(Boolean).join("\n\n").slice(0, 8000);
    if (!content) {
      console.warn("scrape-company: empty content after Firecrawl", { url, hadLinks: links.length > 0 });
      return json({ _reason: "no-content" }, 200);
    }

    const tAi = Date.now();
    const profile = await extractProfile(lovableKey, url, content);
    console.log(`scrape-company: AI extract in ${Date.now() - tAi}ms, fields=${Object.keys(profile).length}, total=${Date.now() - t0}ms`);

    if (Object.keys(profile).length === 0) {
      return json({ _reason: "ai-empty" }, 200);
    }
    return json(profile, 200);
  } catch (e) {
    console.error("scrape-company error:", e instanceof Error ? e.message : "unknown");
    return json({ _reason: "exception" }, 200); // never hard-fail the client
  }
});
