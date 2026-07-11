import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/http.ts";
import { log } from "../_shared/log.ts";
import { isPrivateOrReservedUrl } from "../_shared/url.ts";
import { checkRateLimit } from "../_shared/rateLimit.ts";
import { sanitizeScrapedContent } from "../_shared/sanitize.ts";
import { buildScrapeCache, normaliseScrapeKey, type ScrapeCache } from "../_shared/scrapeCache.ts";
import { selectKeyPages } from "./keyPageSelect.ts";
import { buildCompetitorQueries, dedupeCompetitorResults, domainOf, dropNonCompetitors } from "./competitorQueries.ts";
import { expandGoalsToServiceTags, goalsToPrioritisedSections, countGoalTagHits, goalSelectsGrants } from "./goalServiceTags.ts";
import { industryGroupsToSectorSlugs } from "./sectorTaxonomy.ts";
import { normalizeCountry, isInternationalOrigin } from "./countryNormalize.ts";
import { SEMANTIC_CFG, buildMatchQueryText, groupRankedBySource } from "./semanticMatch.ts";
import { metaLine, recordCountLabel, resolveWebsite } from "./cardFields.ts";
import { buildCompetitorCards } from "./competitorCards.ts";
import { renumberCitations, stripContextLabelCitations } from "./citationRenumber.ts";
import { expandTargetRegions } from "./targetRegion.ts";
import { buildGeoMatcher, geoOriginTerms, isGeoRelevant, isAgencyInCorridor, chamberOriginMismatch, stateAgencyRegionMismatch } from "./geoRelevance.ts";
import { buildRerankItems, buildRerankPrompt, parseRerankVerdicts, applyRerankVerdicts } from "./matchRerank.ts";
import { buildPickCandidates, buildPicksPrompt, parsePicks, buildPickCards, type PickCard } from "./keyQuestionPicks.ts";
import { humanizeMetricLabel, isEstimatedMetric } from "./metricLabel.ts";
import { buildMentionPrompt, parseMentions, BACKFILL_TARGET } from "./competitorBackfill.ts";
import { parseIcpDescription, nameMatchesDomain, buildBuyerCards, buildBuyerBriefsNote } from "./buyerBriefs.ts";
import { scoreAndSort, selectTopN, withMatchMeta, mergeAndRerank, normalizePersonName, dedupeByKey, pruneAcrossGroups, preferRelevant, hasSectorRelevance, isImmigrationFocused, leadIcpTokens, leadMatchesIcp, type MatchContext, type ScoreOpts, type SelectOpts } from "./matchScoring.ts";
import { renderTemplate } from "./promptTemplate.ts";

// ── Firecrawl helpers ──────────────────────────────────────────────────

// Per-report Firecrawl plumbing health + op accounting (Stage 1 audit P1/P2).
// Mirrors the perplexity_health pattern: a total outage (expired/over-quota key
// → every call 401/429) is otherwise indistinguishable from "no data found".
// `ops` doubles as the per-report Firecrawl call count for cost visibility.
// A fresh object is created per report and threaded explicitly through the
// wrappers — NO module-level mutable state, so concurrent background tasks in
// the same isolate can't corrupt each other's counts. SSRF-blocked URLs make no
// API call and are deliberately NOT counted as ops.
interface FirecrawlStats {
  ops: number;
  succeeded: number;
  scrape: { attempted: number; ok: number };
  map: { attempted: number; ok: number };
  search: { attempted: number; ok: number };
  statuses: number[];
  // Scrape-cache accounting (P1). cache_hits avoid an API call (so they do NOT
  // count toward ops); cache_misses are the scrapes that fell through to a live
  // fetch. hits / (hits + misses) is the per-report cache hit rate / savings.
  cache_hits: number;
  cache_misses: number;
}

function createFirecrawlStats(): FirecrawlStats {
  return {
    ops: 0, succeeded: 0,
    scrape: { attempted: 0, ok: 0 },
    map: { attempted: 0, ok: 0 },
    search: { attempted: 0, ok: 0 },
    statuses: [],
    cache_hits: 0,
    cache_misses: 0,
  };
}

/** Record one Firecrawl API call outcome. status 0 = network error/timeout.
 *  `ok` is HTTP-200-level success (content emptiness is tracked separately). */
function recordFirecrawl(
  stats: FirecrawlStats | undefined,
  kind: "scrape" | "map" | "search",
  status: number,
  ok: boolean,
): void {
  if (!stats) return;
  stats.ops++;
  stats[kind].attempted++;
  stats.statuses.push(status);
  if (ok) { stats.succeeded++; stats[kind].ok++; }
}

/** Scrape a single URL with a timeout. Returns markdown or null. */
async function firecrawlScrape(
  apiKey: string,
  url: string,
  timeoutMs = 10000,
  stats?: FirecrawlStats,
  cache?: ScrapeCache,
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    if (isPrivateOrReservedUrl(formattedUrl)) return null;

    // Cache read (P1) — checked AFTER the SSRF guard so a private URL is never
    // served or stored. A hit (positive or negative, within TTL) avoids the API
    // call entirely, so it does NOT go through recordFirecrawl/ops.
    const cacheKey = cache ? normaliseScrapeKey(formattedUrl) : "";
    if (cache) {
      const hit = await cache.get(cacheKey);
      if (hit) {
        if (stats) stats.cache_hits++;
        return hit.content;
      }
    }

    const resp = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url: formattedUrl, formats: ["markdown"], onlyMainContent: true }),
      signal: controller.signal,
    });

    recordFirecrawl(stats, "scrape", resp.status, resp.ok);
    if (!resp.ok) {
      if (cache) { if (stats) stats.cache_misses++; await cache.set(cacheKey, { content: null, ok: false, status: resp.status }); }
      return null;
    }

    const data = await resp.json();
    const md = data.data?.markdown || data.markdown || null;
    const content = md ? sanitizeScrapedContent(md) : null;
    if (cache) {
      if (stats) stats.cache_misses++;
      await cache.set(cacheKey, { content, ok: !!content, status: resp.status });
    }
    return content;
  } catch {
    recordFirecrawl(stats, "scrape", 0, false);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Use Firecrawl Map to discover URLs on a website. Returns array of URLs. */
async function firecrawlMap(
  apiKey: string,
  url: string,
  timeoutMs = 5000,
  stats?: FirecrawlStats,
): Promise<string[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    if (isPrivateOrReservedUrl(formattedUrl)) return [];

    const resp = await fetch("https://api.firecrawl.dev/v1/map", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url: formattedUrl, limit: 100, includeSubdomains: false }),
      signal: controller.signal,
    });

    recordFirecrawl(stats, "map", resp.status, resp.ok);
    if (!resp.ok) return [];

    const data = await resp.json();
    return data.links || [];
  } catch {
    recordFirecrawl(stats, "map", 0, false);
    return [];
  } finally {
    clearTimeout(timer);
  }
}

/** Use Firecrawl Search to find web results. Returns array of {url, title, description, markdown}. */
async function firecrawlSearch(
  apiKey: string,
  query: string,
  limit = 5,
  timeoutMs = 15000,
  stats?: FirecrawlStats,
): Promise<Array<{ url: string; title: string; description: string; markdown: string }>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resp = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        limit,
        lang: "en",
        country: "au",
        scrapeOptions: { formats: ["markdown"] },
      }),
      signal: controller.signal,
    });

    recordFirecrawl(stats, "search", resp.status, resp.ok);
    if (!resp.ok) return [];

    const data = await resp.json();
    return (data.data || []).map((r: any) => ({
      url: r.url || "",
      title: r.title || "",
      description: r.description || "",
      markdown: sanitizeScrapedContent((r.markdown || ""), 1500),
    }));
  } catch {
    recordFirecrawl(stats, "search", 0, false);
    return [];
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Resolve a likely homepage domain from a company name via web search (P1.5).
 * Used when a competitor / end buyer was added by name without a website (the
 * v2 CompanyPicker leaves website blank for the backend to resolve). Fail-soft.
 */
async function resolveDomainFromName(apiKey: string, name: string, stats?: FirecrawlStats): Promise<string> {
  if (!apiKey || !name.trim()) return "";
  try {
    const results = await firecrawlSearch(apiKey, `${name} official website`, 1, 8000, stats);
    const url = results[0]?.url || "";
    if (!url) return "";
    const host = new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
    // Defence-in-depth (P3): the URL came from an attacker-influenceable search
    // result, so never return a private/reserved host. firecrawlScrape also
    // guards before fetching, but dropping it here avoids a doomed scrape and
    // keeps a bogus internal host (e.g. 169.254.169.254) out of the report's
    // competitor/buyer url field.
    if (!host || isPrivateOrReservedUrl(`https://${host}`)) return "";
    // Return a full https:// URL, not a bare host. Consumers scrape it (firecrawl
    // handles either) but ALSO store it as the competitor/buyer `url`, and the
    // card builder's httpUrl() only renders links that start with http(s) — a
    // bare "sourcewhale.com" produced a competitor card with no "Visit site"
    // link (Floats report). domainOf() still normalises it for dedupe.
    return `https://${host}`;
  } catch {
    return "";
  }
}

// ── Enhancement 3: Deep company scrape (map + multi-page) ─────────────
// Key-page selection lives in keyPageSelect.ts (pure + unit-tested): it ranks
// mapped URLs so customer/case-study/pricing pages win over generic ones.

interface EnrichedCompanyProfile {
  summary: string;
  industry: string;
  maturity: string;
  products: string[];
  key_clients: string[];
  team_size_indicators: string;
  unique_selling_points: string[];
}

// Plumbing visibility for the deep company scrape. The metadata flag was
// previously `firecrawl_deep_scrape: !!companyProfile`, but companyProfile is
// the (truthy) fallback object even when the scrape returned nothing — so a
// site that yielded 50 chars and fell back still read as a successful scrape.
// These diagnostics make the metadata reflect what actually happened: whether
// the scrape produced usable content (scrape_ok), how many URLs map found, how
// many key pages were scraped, the content size, and whether we fell back.
interface CompanyScrapeDiagnostics {
  attempted: boolean;
  scrape_ok: boolean;
  homepage_ok: boolean;
  map_urls: number;
  key_pages_scraped: number;
  content_chars: number;
  used_fallback: boolean;
}

async function enrichCompanyDeep(
  firecrawlKey: string,
  lovableKey: string,
  websiteUrl: string,
  companyName: string,
  fallbackSummary: string,
  stats?: FirecrawlStats,
  cache?: ScrapeCache,
): Promise<{ profile: EnrichedCompanyProfile; enrichedSummary: string; diagnostics: CompanyScrapeDiagnostics }> {
  const defaultProfile: EnrichedCompanyProfile = {
    summary: fallbackSummary,
    industry: "",
    maturity: "",
    products: [],
    key_clients: [],
    team_size_indicators: "",
    unique_selling_points: [],
  };
  const diagnostics: CompanyScrapeDiagnostics = {
    attempted: true,
    scrape_ok: false,
    homepage_ok: false,
    map_urls: 0,
    key_pages_scraped: 0,
    content_chars: 0,
    used_fallback: true,
  };

  try {
    const [allUrls, homepageFirstTry] = await Promise.all([
      firecrawlMap(firecrawlKey, websiteUrl, 5000, stats),
      firecrawlScrape(firecrawlKey, websiteUrl, 10000, stats, cache),
    ]);

    // Retry the homepage once on failure — it grounds the entire profile, and
    // telemetry showed ~13% of Firecrawl ops time out (status 0). A timeout is
    // NOT cached, so this is a genuine second attempt (with a longer budget); a
    // 200-with-no-content IS cached, so the retry is just a cache hit (no extra
    // API call). Only the homepage retries — key pages stay best-effort.
    let homepageMarkdown = homepageFirstTry;
    if (!homepageMarkdown) {
      homepageMarkdown = await firecrawlScrape(firecrawlKey, websiteUrl, 15000, stats, cache);
    }

    diagnostics.map_urls = allUrls.length;
    diagnostics.homepage_ok = !!homepageMarkdown;
    console.log(`Map found ${allUrls.length} URLs on ${websiteUrl}`);

    // Prioritised selection (keyPageSelect.ts): customer/case-study/pricing pages
    // first, then products/about. Up to 3 (was a flat "first 2 that matched").
    const keyPages = selectKeyPages(allUrls, 3);
    console.log(`Scraping ${keyPages.length} key pages:`, keyPages);

    const additionalScrapes = await Promise.allSettled(
      keyPages.map((url) => firecrawlScrape(firecrawlKey, url, 10000, stats, cache))
    );

    const allContent: string[] = [];
    if (homepageMarkdown) allContent.push(homepageMarkdown);
    for (const result of additionalScrapes) {
      if (result.status === "fulfilled" && result.value) {
        allContent.push(result.value);
        diagnostics.key_pages_scraped++;
      }
    }

    // Budget raised 2000 → 4000: feed the extractor more of the (now better-
    // chosen) pages so named clients / positioning aren't truncated away. Each
    // page is still individually capped upstream by sanitizeScrapedContent.
    const combinedContent = allContent.join("\n\n---\n\n").slice(0, 4000);
    diagnostics.content_chars = combinedContent.length;

    if (combinedContent.length < 100) {
      console.log("Insufficient website content for deep analysis");
      return { profile: defaultProfile, enrichedSummary: fallbackSummary, diagnostics };
    }
    // Usable content was extracted; the profile below is real, not a fallback.
    diagnostics.scrape_ok = true;
    diagnostics.used_fallback = false;

    const enrichResp = await callAI(lovableKey, [
      { role: "system", content: "You are an analyst extracting verifiable facts from a company's own website. Return only valid JSON, no markdown fences. Be conservative — when in doubt, omit." },
      {
        role: "user",
        content: `Based on this website content for ${companyName}, provide a JSON object with:
{
  "summary": "3-4 sentence company summary covering what they do, their market position, and key strengths. Stick to what the website itself claims.",
  "industry": "standardized industry classification",
  "maturity": "Seed|Growth|Enterprise",
  "products": ["list of main products or services offered as advertised on the site"],
  "key_clients": ["EXPLICITLY confirmed customers ONLY"],
  "team_size_indicators": "any indicators of team size, leadership, or organizational scale that the site states directly",
  "unique_selling_points": ["2-4 key differentiators or competitive advantages CLAIMED ON THE SITE"]
}

STRICT RULES for key_clients (most important):
- Only include a name if the site EXPLICITLY identifies the entity as a paying customer, deployment site, or case-study client of ${companyName} (e.g. phrases like "our customer X", "Y uses ${companyName}", "case study: Z"). Direct logos under "Trusted by" / "Our customers" qualify.
- Do NOT include partners, integrations, distributors, press mentions, awards juries, investors, parent companies, advisors, board members, or competitors. If the relationship is partner/integration/award/press, OMIT the name.
- Do NOT infer clients from team members' past employers or from "X uses similar tools" comparisons.
- When in doubt, leave key_clients as an empty array []. A clean omission is much better than a false attribution.

STRICT RULES for products & unique_selling_points:
- Use only language the website itself uses. Do NOT extrapolate features that aren't stated.

If any field is genuinely unknown, return an empty string or empty array. Never make up content.

Content from ${allContent.length} pages:
${combinedContent}`,
      },
    ]);

    const cleaned = enrichResp.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const profile = JSON.parse(cleaned) as EnrichedCompanyProfile;

    return {
      profile,
      enrichedSummary: profile.summary || fallbackSummary,
      diagnostics,
    };
  } catch (e) {
    console.error("Deep company enrichment failed (continuing):", e);
    // Scrape may have succeeded but AI extraction/parse failed — we still return
    // the fallback profile, so flag it as a fallback regardless of scrape_ok.
    diagnostics.used_fallback = true;
    return { profile: defaultProfile, enrichedSummary: fallbackSummary, diagnostics };
  }
}

// ── Enhancement 1: Enrich matched service providers ───────────────────

async function enrichMatchedProviders(
  firecrawlKey: string,
  providers: any[],
  stats?: FirecrawlStats,
  cache?: ScrapeCache,
): Promise<any[]> {
  if (!firecrawlKey || providers.length === 0) return providers;

  console.log(`Enriching ${providers.length} service providers via Firecrawl...`);
  const startTime = Date.now();

  const enrichmentPromises = providers.map(async (provider) => {
    const providerUrl = provider.website_url || provider.website;
    if (!providerUrl) return provider;

    try {
      const markdown = await firecrawlScrape(firecrawlKey, providerUrl, 10000, stats, cache);
      if (markdown && markdown.length > 50) {
        return {
          ...provider,
          enriched_description: markdown.slice(0, 1500),
        };
      }
    } catch {
      // Best effort — return original provider
    }
    return provider;
  });

  const results = await Promise.allSettled(enrichmentPromises);
  const enriched = results.map((r, idx) =>
    r.status === "fulfilled" ? r.value : providers[idx]
  );

  const enrichedCount = enriched.filter((p) => p.enriched_description).length;
  console.log(`Provider enrichment: ${enrichedCount}/${providers.length} enriched in ${Date.now() - startTime}ms`);

  return enriched;
}

// ── Enhancement 2: Competitor landscape via Firecrawl Search ──────────

interface CompetitorData {
  name: string;
  url: string;
  description: string;
  key_info: string;
  // Populated only under FIRECRAWL_COMPETITOR_DEPTH: the competitor's Australian
  // footprint (local office / AU case studies / .com.au / "no AU presence found"),
  // the single most decision-useful fact for a market-entry competitive read.
  au_presence?: string;
}

async function scrapeKnownCompetitors(
  firecrawlKey: string,
  lovableKey: string,
  knownCompetitors: Array<{ name: string; website: string }>,
  companyName: string,
  stats?: FirecrawlStats,
  cache?: ScrapeCache,
  deep = false,
): Promise<CompetitorData[]> {
  if (!firecrawlKey || knownCompetitors.length === 0) return [];

  // Cap at 5 to bound Firecrawl cost: each known competitor triggers 1 scrape
  // (+1 search to resolve a domain when no website was given). Without this the
  // loop is unbounded — a user pasting 30 competitors would fire ~60 Firecrawl
  // ops on a single report. Mirrors the end-buyer cap (3). Log what we drop so
  // the truncation isn't silent.
  const MAX_KNOWN_COMPETITORS = 5;
  const cappedCompetitors = knownCompetitors.slice(0, MAX_KNOWN_COMPETITORS);
  if (knownCompetitors.length > MAX_KNOWN_COMPETITORS) {
    console.log(`Capping known competitors: scraping ${MAX_KNOWN_COMPETITORS} of ${knownCompetitors.length} provided`);
  }

  console.log(`Scraping ${cappedCompetitors.length} user-provided competitors...`);
  const startTime = Date.now();

  const results = await Promise.allSettled(
    cappedCompetitors.map(async (comp) => {
      // Resolve a domain from the name when none was provided (P1.5).
      const website = (comp.website && comp.website.trim())
        ? comp.website
        : await resolveDomainFromName(firecrawlKey, comp.name, stats);
      const markdown = website ? await firecrawlScrape(firecrawlKey, website, 10000, stats, cache) : null;
      if (!markdown || markdown.length < 50) {
        return { name: comp.name, url: website, description: "Website could not be analysed.", key_info: "" };
      }

      try {
        const aiResp = await callAI(lovableKey, [
          { role: "system", content: "You are a competitive intelligence analyst. Return only valid JSON, no markdown fences." },
          {
            role: "user",
            content: `Analyze this website content for "${comp.name}" (${website}), a competitor of "${companyName}".
Return a JSON object: {"name": "<the company's OFFICIAL name as written on their site, correctly capitalised — e.g. 'SourceWhale' not 'source whale'; fall back to '${comp.name}' only if the site doesn't state it>", "url": "${website}", "description": "what they do in 1-2 sentences", "key_info": "key differentiators, pricing model, market position, target audience, and notable facts"${deep ? `, "au_presence": "their Australian footprint from the site ONLY — local office/address, AU case studies or customers, .com.au domain, AU pricing. If none is evident, say 'No Australian presence evident on their site'. Do NOT guess."` : ""}}

Website content:
${markdown.slice(0, 2000)}`,
          },
        ]);
        const cleaned = aiResp.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleaned) as CompetitorData;
      } catch {
        return { name: comp.name, url: website, description: "Could not extract competitor intelligence.", key_info: "" };
      }
    })
  );

  const competitors = results
    .filter((r): r is PromiseFulfilledResult<CompetitorData> => r.status === "fulfilled")
    .map((r) => r.value);

  console.log(`Scraped ${competitors.length} known competitors in ${Date.now() - startTime}ms`);
  return competitors;
}

async function searchCompetitors(
  firecrawlKey: string,
  lovableKey: string,
  intake: any,
  stats?: FirecrawlStats,
  cache?: ScrapeCache,
): Promise<{ competitors: CompetitorData[]; raw_results: any[]; competitor_depth: boolean }> {
  // FIRECRAWL_COMPETITOR_DEPTH (default off): OFF runs the single legacy query
  // and keeps the top 3 (unchanged behaviour); ON runs 2-3 angled queries
  // (buildCompetitorQueries), keeps the top 5 deduped by domain, and the
  // extraction adds an Australian-presence signal per competitor. Hoisted out of
  // the try so it's returned on every path — buildReportJson persists it to
  // report_json.metadata.competitor_depth so the flag state is verifiable from
  // telemetry (au_presence itself isn't persisted / logs carry no console output).
  const deep = !!Deno.env.get("FIRECRAWL_COMPETITOR_DEPTH");
  const empty = { competitors: [], raw_results: [], competitor_depth: deep };
  if (!firecrawlKey) return empty;

  try {
    const knownCompetitors = intake.known_competitors || [];
    const targetRegions = (intake.target_regions || []).join(", ") || "Australia";
    const industrySectorText = (intake.industry_sector || []).join(", ");

    const queries = deep
      ? buildCompetitorQueries(intake)
      : [`${industrySectorText} companies in Australia ${targetRegions} competitors`];
    const discoveredCap = deep ? 5 : 3;

    console.log(`Searching competitors (deep=${deep}, ${queries.length} query/ies): ${JSON.stringify(queries)}`);

    // Known-competitor scrape + all discovery searches, in parallel.
    const [knownResults, ...searchSets] = await Promise.all([
      scrapeKnownCompetitors(firecrawlKey, lovableKey, knownCompetitors, intake.company_name, stats, cache, deep),
      ...queries.map((q) => firecrawlSearch(firecrawlKey, q, 5, 15000, stats)),
    ]);

    let userDomain = "";
    try {
      userDomain = new URL(intake.website_url.startsWith("http") ? intake.website_url : `https://${intake.website_url}`)
        .hostname.replace(/^www\./, "").toLowerCase();
    } catch { /* leave blank */ }
    const knownDomains = (knownCompetitors as Array<{ website: string }>).map((c) => domainOf(c.website || ""));

    // Combine all queries' results, exclude the user's own + known-competitor
    // domains, dedupe by domain, and cap. (domainOf/dedupe are pure + unit-tested.)
    const filtered = dedupeCompetitorResults(searchSets.flat(), [userDomain, ...knownDomains], discoveredCap);

    // Relevance anchor for the extraction LLM: prefer the user's declared
    // competitors (they define the true product niche by example — "compete with
    // Equifax, Experian" → credit bureaus, not the FinTech ecosystem at large);
    // fall back to the broad sector text only when none were provided.
    const knownNamesForAnchor = (knownCompetitors as Array<{ name?: string }>)
      .map((c) => (c?.name || "").trim())
      .filter(Boolean)
      .slice(0, 3);
    const nicheAnchor = knownNamesForAnchor.length
      ? `companies that directly compete with ${knownNamesForAnchor.join(", ")}`
      : `${industrySectorText} product/service vendors`;

    let searchCompetitorsList: CompetitorData[] = [];
    if (filtered.length > 0) {
      const competitorSummaries = await callAI(lovableKey, [
        { role: "system", content: "You are a competitive intelligence analyst. Return only valid JSON, no markdown fences." },
        {
          role: "user",
          content: `Analyze these search results to find DIRECT competitors of ${intake.company_name} — ${nicheAnchor} in Australia. A direct competitor offers a comparable product or service that a buyer would weigh as an alternative to ${intake.company_name} — NOT merely another company in the same broad sector.

Return a JSON array of objects: [{"name": "Company Name", "url": "website url", "description": "what they do in 1-2 sentences", "key_info": "key differentiators, market position, or notable facts"${deep ? `, "au_presence": "their Australian footprint if evident in the result (local office, AU customers/case studies, .com.au). If not evident, 'No Australian presence evident'. Do NOT guess."` : ""}}]${deep ? `\nStrict inclusion: ONLY direct product/service competitors. EXCLUDE service agencies, software-development shops, recruiters, employer-branding/talent platforms, ecosystem/community organisations, regulators, directories, news sites, and ${intake.company_name} itself. If a result is not a direct competitor, omit it — do not include it and then note that it is not a competitor.` : ""}

Search results:
${filtered.map((r, i) => `--- Result ${i + 1} ---\nURL: ${r.url}\nTitle: ${r.title}\nContent: ${r.markdown}`).join("\n\n")}`,
        },
      ]);

      const cleanedResp = competitorSummaries.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      searchCompetitorsList = JSON.parse(cleanedResp) as CompetitorData[];
    }

    // Suppress discovered rows whose own extracted text self-disqualifies as a
    // competitor (dev shops, recruiters, employer-branding — the extraction LLM
    // sometimes surfaces then labels these "not a competitor"). Known competitors
    // are user-declared and trusted, so they are never filtered.
    const discovered = dropNonCompetitors(searchCompetitorsList);
    const suppressed = searchCompetitorsList.length - discovered.length;
    const allCompetitors = [...knownResults, ...discovered];

    console.log(`Total competitors: ${allCompetitors.length} (${knownResults.length} known + ${discovered.length} discovered${suppressed ? `, ${suppressed} non-competitor(s) suppressed` : ""}; deep=${deep})`);
    return { competitors: allCompetitors, raw_results: filtered, competitor_depth: deep };
  } catch (e) {
    console.error("Competitor search failed (continuing):", e);
    return empty;
  }
}

// ── End Buyer Deep Research ────────────────────────────────────────────

interface EndBuyerIntelligence {
  name: string;
  url: string;
  description: string;
  key_info: string;
  /** Software/tools evident in the site content ("" when not evident — never guessed). */
  tech_signals?: string;
  /** Roles they appear to be hiring for right now ("" when not evident). */
  hiring_signals?: string;
  /** Name-only chip whose resolved domain failed the wrong-company gate. */
  unverified?: boolean;
}

async function scrapeEndBuyers(
  firecrawlKey: string,
  lovableKey: string,
  endBuyers: Array<{ name: string; website: string }>,
  companyName: string,
  stats?: FirecrawlStats,
  cache?: ScrapeCache,
): Promise<EndBuyerIntelligence[]> {
  if (!firecrawlKey || endBuyers.length === 0) return [];

  // Cap at 3 end buyers to avoid resource contention in the parallel block
  const cappedBuyers = endBuyers.slice(0, 3);

  console.log(`Scraping ${cappedBuyers.length} end buyer companies (capped from ${endBuyers.length})...`);
  const startTime = Date.now();

  const results = await Promise.allSettled(
    cappedBuyers.map(async (buyer) => {
      // Resolve a domain from the name when none was provided (P1.5).
      const hadWebsite = !!(buyer.website && buyer.website.trim());
      const website = hadWebsite
        ? buyer.website
        : await resolveDomainFromName(firecrawlKey, buyer.name, stats);
      // Wrong-company gate (buyer-briefs v1): a name-only chip ("walter page") can
      // resolve to an unrelated business — a confidently wrong brief is worse than
      // none. User-supplied websites are trusted; resolved ones must share a
      // distinctive name token with the host.
      if (!hadWebsite && !nameMatchesDomain(buyer.name, website)) {
        console.log(`end buyer "${buyer.name}": resolved domain failed name match — marked unverified`);
        return { name: buyer.name, url: "", description: "", key_info: "", unverified: true };
      }
      const markdown = website ? await firecrawlScrape(firecrawlKey, website, 8000, stats, cache) : null;
      if (!markdown || markdown.length < 50) {
        return { name: buyer.name, url: website, description: "Website could not be analysed.", key_info: "" };
      }

      try {
        const aiResp = await callAI(lovableKey, [
          { role: "system", content: "You are a B2B procurement and buyer intelligence analyst. Return only valid JSON, no markdown fences." },
          {
            role: "user",
            content: `Analyse this company "${buyer.name}" (${website}) as a POTENTIAL CUSTOMER for "${companyName}".
Return a JSON object: {"name": "${buyer.name}", "url": "${website}", "description": "what this company does and their market position in 1-2 sentences", "key_info": "what they buy/procure, how they select suppliers, partnership programs, supplier requirements, procurement processes, and any opportunities for ${companyName} to sell to them", "tech_signals": "software/platforms/tools explicitly evident in the content (ATS, CRM, marketing stack); empty string if none evident — do NOT guess", "hiring_signals": "roles they appear to be actively hiring for per the content; empty string if none evident"}

Website content:
${markdown.slice(0, 2000)}`,
          },
        ]);
        const cleaned = aiResp.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleaned) as EndBuyerIntelligence;
      } catch {
        return { name: buyer.name, url: website, description: "Could not extract buyer intelligence.", key_info: "" };
      }
    })
  );

  const buyers = results
    .filter((r): r is PromiseFulfilledResult<EndBuyerIntelligence> => r.status === "fulfilled")
    .map((r) => r.value);

  console.log(`Scraped ${buyers.length} end buyers in ${Date.now() - startTime}ms`);
  return buyers;
}

// ── Perplexity helpers ─────────────────────────────────────────────────

async function callPerplexity(
  apiKey: string,
  query: string,
  options?: { recency?: string; domains?: string[]; model?: string }
): Promise<{ content: string; citations: string[]; ok: boolean; status: number }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    let resp: Response;
    try {
      resp = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: options?.model || "sonar",
          messages: [
            { role: "system", content: "Be precise and concise. Focus on factual, data-driven insights with specific numbers and statistics where available." },
            { role: "user", content: query },
          ],
          search_recency_filter: options?.recency || "year",
          ...(options?.domains ? { search_domain_filter: options.domains } : {}),
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!resp.ok) {
      const text = await resp.text();
      // Do NOT log the response body — it can echo the request/key context. Status only.
      console.error("Perplexity error: status", resp.status, "len", text.length);
      return { content: "", citations: [], ok: false, status: resp.status };
    }

    const data = await resp.json();
    return {
      content: data.choices?.[0]?.message?.content || "",
      citations: data.citations || [],
      ok: true,
      status: resp.status,
    };
  } catch (e) {
    console.error("Perplexity call failed:", e instanceof Error ? e.message : "unknown");
    return { content: "", citations: [], ok: false, status: 0 };
  }
}

// ── Market research step (expanded) ────────────────────────────────────
interface MarketResearch {
  landscape: string;
  regulatory: string;
  news: string;
  bilateral_trade: string;
  cost_of_business: string;
  grants: string;
  citations: string[];
  used: boolean;
  // Plumbing visibility: how many of the parallel Perplexity queries actually
  // succeeded (HTTP 200) and the status codes seen. Surfaced into report metadata
  // so a silent total outage (e.g. expired/over-quota key -> every call 401/429)
  // is diagnosable instead of looking like "ran". succeeded:0 with a non-empty
  // statuses array = the API is rejecting us, not "no data".
  health: { attempted: number; succeeded: number; statuses: number[] };
}

async function runMarketResearch(intake: any, persona: string): Promise<MarketResearch> {
  const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");
  const empty: MarketResearch = {
    landscape: "", regulatory: "", news: "",
    bilateral_trade: "", cost_of_business: "", grants: "",
    citations: [], used: false,
    health: { attempted: 0, succeeded: 0, statuses: [] },
  };

  if (!perplexityKey) {
    console.log("PERPLEXITY_API_KEY not set — skipping market research");
    return empty;
  }

  const targetRegionsText = (intake.target_regions || []).join(", ") || "Australia";
  const industrySectorText = (intake.industry_sector || []).join(", ");
  const countryOfOrigin = intake.country_of_origin || "international";
  const isStartup = persona === "startup";

  console.log(`Running Perplexity market research (persona: ${persona}, 6 parallel queries)...`);
  const startTime = Date.now();

  // Landscape query is the same for both personas. NICHE-TARGETED (Issue #1): without
  // this steer, Perplexity returns the broad "IT Services / Software" umbrella market
  // (observed: a restaurant-AI company got "IT Services Market USD 38.34B" headline
  // metrics). Anchor it to the specific vertical using what they sell + to whom.
  const endBuyerText = (intake.end_buyer_industries || []).join(", ");
  const targetCustomerDesc = (intake.raw_input as any)?.target_customer_description || "";
  const nicheContext = [
    endBuyerText ? `sold to ${endBuyerText}` : "",
    targetCustomerDesc && targetCustomerDesc !== "Not specified" ? targetCustomerDesc : "",
  ].filter(Boolean).join("; ");

  const landscapeQuery = `Size the Australian market for the SPECIFIC product category / vertical that "${industrySectorText}"${nicheContext ? ` (${nicheContext})` : ""} companies sell into — the narrow niche, NOT the broad "IT services" or "software" umbrella market. Region focus: ${targetRegionsText}. Cover market size, growth/CAGR, key players and growth opportunities for THIS niche. If precise niche figures aren't published, use the closest specific vertical and label it as such — never substitute the whole IT/software sector.

IMPORTANT: At the end of your response, include a section titled "KEY METRICS" with 4-6 quantitative metrics that are SPECIFIC TO THIS NICHE/VERTICAL (not the broad IT or software market), in this exact format:
- METRIC: [Label] | [Value] | [Context]
For example:
- METRIC: Market Size | $8.48B | 2024 estimate
- METRIC: CAGR | 5.1% | 2024-2030 projected
- METRIC: Active Players | 2,400+ | Registered companies
Label each metric with the specific niche it refers to (e.g. "Restaurant-management-software market"), never a generic "IT Services" label.`;

  // Persona-forked queries
  const regulatoryQuery = isStartup
    ? `Regulations and compliance for ${industrySectorText} startups in Australia: licensing requirements, data protection, consumer protection laws, industry-specific regulations, and key regulatory bodies in ${targetRegionsText}.`
    : `Requirements, regulations, compliance, and licensing for a ${countryOfOrigin} ${industrySectorText} company entering the Australian market. Include visa requirements, tax obligations, legal entity setup, and any industry-specific regulations.`;

  const bilateralQuery = isStartup
    ? `Australian ${industrySectorText} startup funding landscape in ${targetRegionsText}: recent VC activity, angel investment trends, notable deals in the last 12 months, most active investors, average deal sizes by stage (seed, Series A, Series B), and comparisons to global benchmarks.`
    : `Trade relationship between ${countryOfOrigin} and Australia in ${industrySectorText}: bilateral agreements, free trade agreements, export statistics, success stories of ${countryOfOrigin} companies entering Australia, trade volumes, and key trade facilitation organisations.`;

  const costQuery = isStartup
    ? `Startup operating costs in Australia ${targetRegionsText} for ${industrySectorText}: co-working space pricing, average developer salaries, typical monthly burn rates for early-stage and growth-stage startups, cost of hiring first 5-10 employees, and common expense breakdowns.`
    : `Cost of doing business in Australia ${targetRegionsText} for ${industrySectorText}: average office rent per sqm, local salaries for key roles, corporate tax rate, GST obligations, employer superannuation rate, typical setup costs for a foreign company, and any cost comparison with ${countryOfOrigin}.`;

  const grantsQuery = isStartup
    ? `Australian government grants, R&D tax incentive (43.5% refundable offset), state-specific startup grants, accelerator programs, and funding opportunities for ${industrySectorText} startups in ${targetRegionsText}. Include Export Market Development Grants (EMDG), Commercialisation Fund, and eligibility requirements.`
    : `Australian government grants, incentives, R&D tax incentives, landing pad programs, and funding opportunities for international ${industrySectorText} companies from ${countryOfOrigin} setting up in ${targetRegionsText}. Include state-specific programs and eligibility requirements.`;

  const [landscape, regulatory, news, bilateralTrade, costOfBusiness, grants] = await Promise.allSettled([
    callPerplexity(perplexityKey, landscapeQuery, { model: "sonar-pro" }),
    callPerplexity(perplexityKey, regulatoryQuery),
    callPerplexity(perplexityKey,
      `Recent news and developments in ${industrySectorText} in Australia in the last 6 months. Focus on market trends, regulatory changes, major deals, and new entrants.`,
      { recency: "month" }
    ),
    callPerplexity(perplexityKey, bilateralQuery),
    callPerplexity(perplexityKey, costQuery),
    callPerplexity(perplexityKey, grantsQuery),
  ]);

  const result: MarketResearch = {
    landscape: "", regulatory: "", news: "",
    bilateral_trade: "", cost_of_business: "", grants: "",
    citations: [], used: true,
    health: { attempted: 0, succeeded: 0, statuses: [] },
  };

  if (landscape.status === "fulfilled") {
    result.landscape = landscape.value.content;
    result.citations.push(...landscape.value.citations);
  }
  if (regulatory.status === "fulfilled") {
    result.regulatory = regulatory.value.content;
    result.citations.push(...regulatory.value.citations);
  }
  if (news.status === "fulfilled") {
    result.news = news.value.content;
    result.citations.push(...news.value.citations);
  }
  if (bilateralTrade.status === "fulfilled") {
    result.bilateral_trade = bilateralTrade.value.content;
    result.citations.push(...bilateralTrade.value.citations);
  }
  if (costOfBusiness.status === "fulfilled") {
    result.cost_of_business = costOfBusiness.value.content;
    result.citations.push(...costOfBusiness.value.citations);
  }
  if (grants.status === "fulfilled") {
    result.grants = grants.value.content;
    result.citations.push(...grants.value.citations);
  }

  result.citations = [...new Set(result.citations)];

  // Tally Perplexity plumbing health from the settled results. callPerplexity
  // catches its own errors, so each settled promise is "fulfilled" carrying
  // { ok, status }; succeeded counts HTTP 200s. A run with succeeded:0 and a
  // non-empty statuses array means the API is rejecting every call (key/quota),
  // not that there was nothing to find.
  const ppxStreams = [landscape, regulatory, news, bilateralTrade, costOfBusiness, grants];
  for (const s of ppxStreams) {
    if (s.status === "fulfilled") {
      result.health.statuses.push(s.value.status);
      if (s.value.ok) result.health.succeeded++;
    } else {
      result.health.statuses.push(-1);
    }
  }
  result.health.attempted = ppxStreams.length;
  console.log(`Perplexity health: ${result.health.succeeded}/${result.health.attempted} OK; statuses [${result.health.statuses.join(",")}]`);

  console.log(`Perplexity research completed in ${Date.now() - startTime}ms — ${result.citations.length} citations`);
  return result;
}

// ── External Event Discovery via Firecrawl Search ─────────────────────

interface DiscoveredEvent {
  name: string;
  date: string;
  location: string;
  url: string;
  relevance: string;
  source: string;
}

async function discoverExternalEvents(
  firecrawlKey: string,
  lovableKey: string,
  intake: any,
  stats?: FirecrawlStats,
): Promise<DiscoveredEvent[]> {
  if (!firecrawlKey) return [];

  const industrySectorText = (intake.industry_sector || []).join(", ");
  const targetRegionsText = (intake.target_regions || []).join(", ") || "Australia";
  // Derive the search years from the report's timezone (Australia/Sydney) rather
  // than hardcoding "2025 2026", which silently rots — by 2027 it would steer the
  // search at stale years. Current + next year keeps upcoming events in scope.
  const currentYear = Number(todayIsoForReportTimezone().slice(0, 4));
  const query = `${industrySectorText} conference trade show expo Australia ${targetRegionsText} ${currentYear} ${currentYear + 1}`;

  console.log(`Discovering external events: "${query}"`);
  const startTime = Date.now();

  try {
    const results = await firecrawlSearch(firecrawlKey, query, 5, 15000, stats);
    if (results.length === 0) return [];

    const aiResp = await callAI(lovableKey, [
      { role: "system", content: "You are an events researcher. Return only valid JSON, no markdown fences." },
      {
        role: "user",
        content: `From these search results, extract industry events relevant to ${industrySectorText} in Australia. Return a JSON array of events:
[{"name": "Event Name", "date": "Date or date range (e.g. 'March 2025', '15-17 Oct 2025')", "location": "City, Australia", "url": "event website URL", "relevance": "Why this event is relevant in 1 sentence"}]

Only include actual events (conferences, trade shows, expos, summits). Skip articles, blog posts, or general pages. Return up to 5 events. If no events found, return [].

Search results:
${results.map((r, i) => `--- Result ${i + 1} ---\nURL: ${r.url}\nTitle: ${r.title}\nDescription: ${r.description}\nContent: ${r.markdown}`).join("\n\n")}`,
      },
    ]);

    const cleaned = aiResp.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const events = JSON.parse(cleaned) as DiscoveredEvent[];

    const taggedEvents = events.map((e) => ({ ...e, source: "web" }));

    console.log(`Discovered ${taggedEvents.length} external events in ${Date.now() - startTime}ms`);
    return taggedEvents;
  } catch (e) {
    console.error("External event discovery failed (continuing):", e);
    return [];
  }
}

// ── End Buyer Perplexity Research ──────────────────────────────────────

async function researchEndBuyerProcurement(intake: any): Promise<string> {
  const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");
  if (!perplexityKey) return "";

  const endBuyerIndustries = (intake.end_buyer_industries || []).join(", ");
  const targetCustomerDesc = (intake.raw_input as any)?.target_customer_description || "";
  if (!endBuyerIndustries && !targetCustomerDesc) return "";

  const industrySectorText = (intake.industry_sector || []).join(", ");
  const targetContext = targetCustomerDesc
    ? ` The company's target customers are: ${targetCustomerDesc}.`
    : "";
  const industryContext = endBuyerIndustries
    ? `${endBuyerIndustries} companies`
    : "companies";

  console.log(`Researching end buyer procurement for: ${endBuyerIndustries || targetCustomerDesc}`);

  try {
    const result = await callPerplexity(perplexityKey,
      `How do ${industryContext} in Australia procure ${industrySectorText} services?${targetContext} Key procurement channels, typical buying cycles, RFP processes, partnership models, preferred supplier criteria, and how international companies can become approved suppliers.`
    );
    // This research's citations are NOT pooled into the report citation list, so
    // Perplexity's own [N] markers would renumber against the wrong sources if the
    // model copied them into prose — strip them (same guard as the account research).
    return (result.content || "").replace(/\[\d+\]/g, "");
  } catch (e) {
    console.error("End buyer procurement research failed:", e);
    return "";
  }
}

// ── AI helper ──────────────────────────────────────────────────────────
// `opts` lets callers control sampling. Synthesis and polish pass a modest
// temperature for consistent, instruction-following prose (lower = better at
// honouring the length/hyperlink/format rules and less rambling). Extraction
// callers may pass a low temperature for more deterministic JSON. We deliberately
// do NOT set a restrictive max_tokens on synthesis/polish — a hard cap would
// truncate mid-sentence (worse for presentation than an overlong section); section
// length is controlled via prompt budgets instead.
async function callAI(
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
  model = "google/gemini-3-flash-preview",
  opts: { temperature?: number; max_tokens?: number } = {}
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);
  let resp: Response;
  try {
    resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
        ...(opts.max_tokens !== undefined ? { max_tokens: opts.max_tokens } : {}),
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!resp.ok) {
    const text = await resp.text();
    console.error("AI error:", resp.status, text);
    throw new Error(`AI call failed: ${resp.status}`);
  }

  const data = await resp.json();
  return data.choices?.[0]?.message?.content || "";
}

// ── Report polish pass ─────────────────────────────────────────────────

const SECTION_DELIMITER_PREFIX = "===SECTION: ";
const SECTION_DELIMITER_SUFFIX = "===";

async function polishReport(
  apiKey: string,
  sections: Record<string, any>,
  sectionOrder: string[]
): Promise<Record<string, any>> {
  // Polish every section that has content, even if it's currently gated
  // (visible=false). Gated content is stored hidden under P0-3 so that an
  // upgrade unlocks it inline — those sections deserve the same editorial
  // pass as the visible ones, otherwise the upgrade reveals unpolished prose.
  const sectionsWithContent = sectionOrder.filter(
    (name) => sections[name]?.content?.trim()
  );

  if (sectionsWithContent.length === 0) {
    console.log("Polish: no sections with content to polish");
    return sections;
  }

  const concatenated = sectionsWithContent
    .map((name) => `${SECTION_DELIMITER_PREFIX}${name}${SECTION_DELIMITER_SUFFIX}\n${sections[name].content}`)
    .join("\n\n");

  console.log(`Polish: sending ${sectionsWithContent.length} sections (${concatenated.length} chars) to gemini-3-flash-preview...`);
  const polishStart = Date.now();

  const polished = await callAI(
    apiKey,
    [
      {
        role: "system",
        content: `You are a professional editor improving a market entry report for an international company expanding into Australia. Your task is to EDIT the following report for readability and consistency — you are NOT rewriting it.

Rules:
1. Use Australian English spelling throughout (e.g. "organisation", "labour", "recognise", "analyse", "licence" (noun), "program" for government programs is acceptable).
2. Improve sentence structure and flow. Break up overly long sentences (aim for under ~25 words each). Break up any paragraph longer than roughly 120 words into two or more shorter paragraphs or a bullet list — no walls of text.
3. Add smooth 1-2 sentence transitions between sections where the topic shifts.
4. Remove duplication ACROSS sections: if the same fact, statistic, recommendation, or near-identical sentence appears in more than one section, keep it in the single most relevant section and cut it from the others. Within a section, remove repeated phrasing.
5. Maintain a professional, advisory tone — like a senior consultant briefing a CEO.
6. PRESERVE all factual data, statistics, numbers, company names, URLs, and citations EXACTLY as they appear. Do NOT invent or alter any data.
7. PRESERVE all Markdown formatting: headings (###), **bold**, bullet points, numbered lists, links.
8. PRESERVE the section delimiters EXACTLY as they appear (lines starting with "${SECTION_DELIMITER_PREFIX}" and ending with "${SECTION_DELIMITER_SUFFIX}"). Every section delimiter from the input MUST appear in your output.
9. Do NOT add new sections, remove sections, or change section names.
10. Do NOT add a title or introduction before the first section delimiter.
11. PRESERVE all inline citation markers [N] (e.g. [1], [2], [14]) exactly as they appear. These are source references — do NOT remove, renumber, or alter them.`,
      },
      {
        role: "user",
        content: concatenated,
      },
    ],
    "google/gemini-3-flash-preview",
    { temperature: 0.3 }
  );

  console.log(`Polish: AI call completed in ${Date.now() - polishStart}ms`);

  const polishedSections = { ...sections };
  const parts = polished.split(new RegExp(`${SECTION_DELIMITER_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(.+?)${SECTION_DELIMITER_SUFFIX.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));

  let parsedCount = 0;
  for (let i = 1; i < parts.length - 1; i += 2) {
    const sectionName = parts[i].trim();
    const sectionContent = (parts[i + 1] || "").trim();

    // Polish any section the model returned with a non-trivial body —
    // including currently-hidden ones (gated content stored for later
    // upgrade-unlock under P0-3).
    if (polishedSections[sectionName] && sectionContent.length > 50) {
      polishedSections[sectionName] = {
        ...polishedSections[sectionName],
        content: sectionContent,
      };
      parsedCount++;
    }
  }

  if (parsedCount === 0) {
    console.warn("Polish: could not parse any sections from polished output — using original content");
    return sections;
  }

  console.log(`Polish: successfully polished ${parsedCount}/${sectionsWithContent.length} sections`);
  return polishedSections;
}

// Sanitize values for use in PostgREST .or() filter strings.
// Strip all PostgREST operator characters to prevent filter injection:
// commas (condition delimiters), parentheses (nested groups),
// periods (operator separators like .eq. .ilike.), curly braces (array literals).
// Only allow alphanumeric, spaces, hyphens, apostrophes, ampersands, and slashes.
const sanitizeFilterValue = (v: string): string =>
  v.replace(/[^a-zA-Z0-9 \-'&/]/g, "").trim().substring(0, 100);

// ── Shared helpers for events region+dedupe ──────────────────────────────
// Used by BOTH the array-overlap path and the semantic path, so the
// preferred semantic path can't reintroduce the wrong-city + 4×
// near-duplicate Melbourne pitch nights that this PR fixed in the overlap
// path. Pure functions, no I/O.

// Expand target_regions into complete, includes()-safe location tokens (B13):
// "Sydney/NSW" → ["sydney","new south wales","nsw"] (state half no longer dropped),
// nation-wide words ("National"/"Australia") → no token (no specific city to prefer).
const deriveLocationPatterns = (intake: any): string[] =>
  expandTargetRegions((intake?.target_regions as string[] | undefined) || [])
    .map((r: string) => sanitizeFilterValue(r))
    .filter(Boolean);

const normalizeEventKeyPart = (s: string): string =>
  (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).slice(0, 6).join(" ");

/** Today's date as ISO YYYY-MM-DD in the report's target timezone
 *  (Australia/Sydney). Using UTC midnight produced an up-to-14h staleness
 *  window each day where an event whose Sydney-local date had already
 *  passed would still satisfy `date >= todayIso`. */
const todayIsoForReportTimezone = (): string => {
  // en-CA short date is YYYY-MM-DD regardless of locale defaults.
  try {
    return new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Sydney" });
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
};

/** Region hard-filter (when target_regions supplied) + title|date|venue dedupe.
 *  Mirrors the overlap path so the semantic path can't surface wrong-city or
 *  duplicate events. Returns at most `cap` rows. */
const regionFilterAndDedupeEvents = <T extends { title?: string; date?: string; location?: string }>(
  events: T[],
  locationPatterns: string[],
  cap: number,
): T[] => {
  let filtered = events || [];
  if (locationPatterns.length > 0) {
    filtered = filtered.filter((row) => {
      const loc = (row.location || "").toLowerCase();
      return locationPatterns.some((l) => loc.includes(l.toLowerCase()));
    });
  }
  const seen = new Set<string>();
  const deduped: T[] = [];
  for (const e of filtered) {
    const key = `${normalizeEventKeyPart(e.title || "")}|${e.date || ""}|${normalizeEventKeyPart(e.location || "")}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(e);
    if (deduped.length >= cap) break;
  }
  return deduped;
};

// ── Goal-to-service-tag mapping ───────────────────────────────────────
// Keyed by stable goal_id (with a legacy long-label fallback). Lives in a
// shared, dependency-free module so it can be unit-tested under Node.
// See goalServiceTags.ts and ENGINEERING_TODO P0.1.

// ── Database matching (array-overlap path) ─────────────────────────────
// The legacy, deterministic matcher: Postgres array-overlap on sector_tags /
// services + location ilike, with the weighted scoreRow ranking. This is the
// per-section backfill AND total fallback for the semantic path below.
async function searchMatchesOverlap(supabase: any, intake: any) {
  const matches: Record<string, any[]> = {};
  const regions = intake.target_regions || [];
  // Expand selected goals into short service tags for better .cs.{} matching.
  // Prefer the stable goal_ids column; fall back to legacy services_needed labels.
  const serviceTags = expandGoalsToServiceTags({
    goal_ids: intake.goal_ids,
    services_needed: intake.services_needed,
  });
  // Grants goal → structured boost on the agency surface (grants_available column;
  // no grant tag vocabulary exists in any directory table).
  const wantsGrantsGoal = goalSelectsGrants(intake);

  const locationPatterns = regions.map((r: string) => sanitizeFilterValue(r.split("/")[0])).filter(Boolean);

  // ── Sector-relevance signals (Phase D) ──────────────────────────────────
  // The form collects LinkedIn industry GROUPS; directory rows carry 20-sector
  // slugs. Roll the user's own industry + their sells-to industries up to slugs.
  const userSectors = industryGroupsToSectorSlugs(intake.industry_sector);
  const sellsToSectors = industryGroupsToSectorSlugs(intake.end_buyer_industries); // v2 shim: target_customers.industries
  const allSectors = [...new Set([...userSectors, ...sellsToSectors])];
  const countryTerm = (intake.country_of_origin || "").trim().toLowerCase();
  // ── Country corridor (Phase E) ──────────────────────────────────────────
  // Structured origin match beats the old description-substring heuristic: an
  // Irish founder is boosted toward Irish-origin mentors (origin_country) and
  // toward agencies whose trade direction (target_company_origin) fits.
  const userCountry = normalizeCountry(intake.country_of_origin);
  const userIsIntl = isInternationalOrigin(intake.country_of_origin);
  const CAND = 40; // candidate pool fetched before in-memory ranking

  // OR filter that returns any candidate matching ANY signal. Single-element
  // sector_tags.ov.{slug} conditions avoid commas that would break .or() parsing.
  const buildOr = (opts: { service?: string; location?: boolean } = {}): string => {
    const parts: string[] = [];
    for (const slug of allSectors) parts.push(`sector_tags.ov.{${slug}}`);
    parts.push("sector_agnostic.eq.true");
    if (opts.service && serviceTags.length > 0) {
      parts.push(...serviceTags.map((s: string) => `${opts.service}.cs.{${sanitizeFilterValue(s)}}`));
    }
    if (opts.location !== false && locationPatterns.length > 0) {
      parts.push(...locationPatterns.map((l: string) => `location.ilike.%${l}%`));
    }
    return parts.join(",");
  };

  // Weighted relevance + explainability + the rebalance (specialist bonus, sells-to
  // gating, breadth diminishing-returns, diversity, specialist guarantee) live in the
  // pure, unit-tested matchScoring module. Build the shared context once.
  const ctx: MatchContext = {
    userSectors, sellsToSectors, serviceTags, locationPatterns,
    userCountry, userIsIntl, countryTerm,
  };

  // rank(): score -> sort -> optional diversity + specialist guarantee -> attach
  // match_score/match_reasons, which flow into report_json via the existing decorate
  // spreads (each card now carries WHY it was matched). `applySellsTo` defaults OFF —
  // only buyer-facing surfaces (leads/events/content) score on the buyers' industries.
  const rank = (
    rows: any[],
    opts: { service?: string; countryCol?: string; persona?: boolean; applySellsTo?: boolean } = {},
    limit: number,
    select: { dedupeKeys?: Array<{ keyOf: (r: any) => string; max: number }>; minSpecialists?: number } = {},
  ): any[] =>
    selectTopN(scoreAndSort(rows, opts, ctx), limit, select).map(withMatchMeta);

  // Service providers — service-type + location + sector (mostly horizontal/agnostic)
  try {
    // SELECT only columns that actually exist on service_providers — historically
    // this list included `website_url, is_verified, tagline, logo_url, category_slug`,
    // none of which exist on the table. PostgREST returned 400 → the catch below
    // swallowed it → matches.service_providers was never set → every report
    // surfaced "We did not find matching service providers."
    let spQuery = supabase.from("service_providers")
      .select("id, name, slug, location, services, description, website, sector_tags, sector_agnostic")
      .limit(CAND);
    spQuery = spQuery.or(buildOr({ service: "services" }));
    const { data: sp, error: spErr } = await spQuery;
    if (spErr) console.error("SP query error (matches will be empty):", spErr);
    matches.service_providers = rank(sp, { service: "services" }, 10).map((p: any) => ({
      ...p,
      link: p.slug ? `/service-providers/${p.slug}` : "/service-providers",
      linkLabel: "View Profile",
      subtitle: p.location, tags: (p.services || []).slice(0, 3),
    }));
  } catch (e) { console.error("SP search error:", e); }

  // Community members (mentors) — sector + skill + country corridor + location
  try {
    let cmQuery = supabase.from("community_members")
      .select("id, name, title, slug, location, specialties, company, website, description, origin_country, sector_tags, sector_agnostic, is_anonymous, is_active")
      .eq("is_active", true)
      .eq("is_anonymous", false)
      .limit(CAND);
    cmQuery = cmQuery.or(buildOr({ service: "specialties" }));
    const { data: cm, error: cmErr } = await cmQuery;
    if (cmErr) console.error("CM query error:", cmErr);

    // Defensive seed-name strip in addition to the is_anonymous filter, in
    // case any demo rows lack the flag. The directory historically contained
    // near-duplicate seed profiles ("Sarah Chen" / "Dr. Sarah Chen") that
    // ranked into nearly every report; the person-dedupe below collapses
    // those even when both are technically not flagged anonymous.
    const isSeedMentor = (m: any): boolean => {
      const n = (m.name || "").toLowerCase();
      if (n.startsWith("anonymous")) return true;
      if (/(^|\s)test(\s|$)/.test(n)) return true;
      if (n === "sample mentor" || n === "demo mentor") return true;
      return false;
    };
    const cleaned = (cm || []).filter((m: any) => !isSeedMentor(m));

    // Produce a candidate pool (top ~10). The final person-dedupe + organisation
    // diversity + specialist guarantee are applied ONCE, in searchMatches, over the
    // UNION of this pool and the semantic pool (see RERANK in searchMatches) — so
    // semantic recall can't override the rebalance. sells-to is intentionally NOT
    // scored for mentors (you want experts in YOUR field, not your buyers').
    const deduped = rank(cleaned, { service: "specialties", countryCol: "origin_country" }, 10);

    matches.community_members = deduped.map((m: any) => ({
      ...m,
      // Build a real per-mentor profile URL from the slug rather than the
      // legacy /community catch-all (which redirects). The mentor profile
      // route is /mentors/:categorySlug/:mentorSlug — the category segment
      // is informational (used for breadcrumb) and useMentorBySlug resolves
      // by slug alone, so a sane default category works for every mentor.
      link: m.slug ? `/mentors/experts/${m.slug}` : "/mentors",
      linkLabel: "View Profile",
      subtitle: [m.title, m.company].filter(Boolean).join(", "),
      tags: (m.specialties || []).slice(0, 3),
    }));
  } catch (e) { console.error("CM search error:", e); }

  // Events — sector + location, with a HARD date>=now filter, hard region
  // filter when target_regions are supplied, and title+date+venue dedupe so
  // four "Startups Demos & Networking Melbourne" rows for the same night
  // don't all surface.
  try {
    const todayIso = todayIsoForReportTimezone();
    let evQuery = supabase.from("events")
      .select("id, title, slug, date, location, category, type, organizer, sector, sector_tags, sector_agnostic")
      .gte("date", todayIso)
      .limit(CAND);
    evQuery = evQuery.or(buildOr());
    const { data: ev, error: evErr } = await evQuery;
    if (evErr) console.error("Events query error:", evErr);

    // Rank first (overfetch so the shared region+dedupe helper still leaves ~5),
    // then apply the same region hard-filter + title|date|venue dedupe as the
    // semantic path so the two paths agree on event surfacing. applySellsTo:true —
    // events are a buyer-facing surface, so the buyer-industry signal counts here.
    const ranked = rank(ev || [], { applySellsTo: true }, 12);
    // Relevance gate (report-quality loop ref d6a6ce3d): prefer events with a genuine
    // industry / sells-to sector match over sector-agnostic ones (e.g. a fitness or
    // accounting expo surfacing for a cyber company), but never empty the section —
    // keep at least 6 candidates so the region filter + dedupe below still have a pool.
    const gatedEvents = preferRelevant(ranked, hasSectorRelevance, 6);
    let eventResults = regionFilterAndDedupeEvents(gatedEvents, locationPatterns, 5);

    // Fallback when the strict filter returned nothing: take the soonest
    // future events in the target region (still date-bounded — no more
    // 2024 events appearing in 2026 reports).
    if (eventResults.length === 0) {
      let fbQuery = supabase.from("events")
        .select("id, title, slug, date, location, category, type, organizer, sector")
        .gte("date", todayIso)
        .order("date", { ascending: true })
        .limit(5);
      if (locationPatterns.length > 0) {
        const orParts = locationPatterns.map((l: string) => `location.ilike.%${l}%`);
        fbQuery = fbQuery.or(orParts.join(","));
      }
      const { data: fb } = await fbQuery;
      eventResults = fb || [];
    }

    matches.events = eventResults.map((e: any) => ({
      ...e, name: e.title, link: e.slug ? `/events/${e.slug}` : "/events", linkLabel: "View Event",
      subtitle: metaLine([e.date, e.location]), tags: [e.category, e.type].filter(Boolean),
    }));
  } catch (e) { console.error("Events search error:", e); }

  // Content items — sector (+ agnostic); no location dimension
  try {
    let ciQuery = supabase.from("content_items").select("id, title, slug, content_type, sector_tags, meta_description, sector_agnostic").eq("status", "published").limit(CAND);
    ciQuery = ciQuery.or(buildOr({ location: false }));
    const { data: ci, error: ciErr } = await ciQuery;
    if (ciErr) console.error("Content query error:", ciErr);
    matches.content_items = rank(ci, { applySellsTo: true }, 5).map((c: any) => ({
      ...c, name: c.title, link: `/content/${c.slug}`, linkLabel: "Read More",
      // Pass the raw content_type but the frontend humaniser in
      // ReportMatchCard maps case_study -> "Case Study", guide -> "Guide", etc.
      subtitle: c.content_type, tags: (c.sector_tags || []).slice(0, 2),
    }));
  } catch (e) { console.error("Content search error:", e); }

  // Lead databases — the real 65-row purchasable-dataset catalog that replaces the
  // thin 7-row legacy `leads` table. Written under matches.lead_databases (remapped
  // onto the `leads` template variable after the merge in searchMatches). NOTE: this
  // table has a DIFFERENT schema — title/sector/list_type/price_aud/tags and NO
  // sector_tags/sector_agnostic — so the shared buildOr() (which references both
  // absent columns) can't be reused. Filter on real columns only: status + optional
  // location ilike. The KB semantic path (100% embedded) is primary; this is overlap
  // backfill, and the table is tiny, so fetch the full active set and let rank() order
  // it. No location hard-filter: the table's location is country-level ("Australia"),
  // so a city-level target ("Sydney") would exclude everything; instead rank() gives a
  // +1 location bonus so region-matched datasets float up without dropping the rest
  // (scoring is otherwise location-only, since the sector_tags the scorer keys on are
  // absent here). This keeps the leads section populated even if semantic returns <5.
  try {
    const ldQuery = supabase.from("lead_databases")
      .select("id, slug, title, description, short_description, list_type, record_count, sector, location, price_aud, provider_name, tags, status")
      .eq("status", "active")
      .limit(100);
    const { data: ld, error: ldErr } = await ldQuery;
    if (ldErr) console.error("Lead databases query error:", ldErr);
    // ICP gate (RQ ref b29b88c1; tightened per Floats feedback, RQ "lead-list
    // matching must filter by end-buyer industry / ICP"): lead_databases carry a
    // `sector` string + `tags[]` (NOT sector_tags), so the sector scorer is blind
    // to them. A purchasable list should match who the company SELLS TO — gate on
    // the declared end-buyer ICP first, own sector only as a fallback proxy
    // (leadIcpTokens). CRITICAL CHANGE: this is now a STRICT filter, not a
    // preferRelevant floor — an unmatched list is DROPPED, never padded in to hit
    // a count. The old floor backfilled "Recently Funded Australian Startups" into
    // Floats' report purely as filler. If nothing matches, the section is
    // intentionally empty (the custom-list request box is the escape hatch).
    const icpTokens = leadIcpTokens(intake.end_buyer_industries || [], intake.industry_sector || []);
    const rankedLeads = rank(ld, { applySellsTo: true }, 12);
    const gatedLeads = rankedLeads.filter((l: any) => leadMatchesIcp(l, icpTokens)).slice(0, 5);
    matches.lead_databases = gatedLeads.map((l: any) => ({
      ...l, name: l.title, price: l.price_aud,
      link: l.slug ? `/leads/${l.slug}` : "/leads", linkLabel: "View Dataset",
      subtitle: metaLine([l.location, recordCountLabel(l.record_count)]),
      tags: (l.tags || []).slice(0, 3),
    }));
  } catch (e) { console.error("Lead databases search error:", e); }

  // Innovation ecosystem — sector + service + location (+ agnostic)
  try {
    let ieQuery = supabase.from("innovation_ecosystem").select("id, slug, name, location, services, description, website, sector_tags, sector_agnostic").limit(CAND);
    ieQuery = ieQuery.or(buildOr({ service: "services" }));
    const { data: ie, error: ieErr } = await ieQuery;
    if (ieErr) console.error("IE query error:", ieErr);
    matches.innovation_ecosystem = rank(ie, { service: "services" }, 5).map((o: any) => ({
      ...o, link: o.slug ? `/innovation-ecosystem/${o.slug}` : "/innovation-ecosystem", linkLabel: "View Hub",
      subtitle: o.location, tags: (o.services || []).slice(0, 3),
    }));
  } catch (e) { console.error("IE search error:", e); }

  // Trade & investment agencies — sector + country corridor + location (+ agnostic).
  // Corridor-gate the CANDIDATES before the rank cap (gate-before-cap). The Daon
  // report (Irish founder, 7 Jul 2026) stored trade_investment_agencies: 0 even
  // though 22 of the 134 rows pass the corridor gate for Ireland (Enterprise
  // Ireland, Irish Australian Chamber, Austrade, Investment NSW): the fetch took
  // an ARBITRARY 40 rows (no .order()), rank capped to 5, and the union-level gate
  // then dropped all 5 — an empty "Government & Trade" surface despite a healthy
  // directory. Fetch the whole small table (134 rows) so ordering can't starve the
  // pool, filter to in-corridor rows, THEN rank into the 5 slots. The union-level
  // gate stays as the safety net for the semantic path.
  try {
    let taQuery = supabase.from("trade_investment_agencies").select("id, name, slug, location, services, description, website, website_url, domain, tagline, target_company_origin, organisation_type, government_level, location_state, location_country, country_iso2, jurisdiction, sector_tags, sector_agnostic, grants_available").limit(300);
    taQuery = taQuery.or(buildOr({ service: "services" }));
    const { data: ta, error: taErr } = await taQuery;
    if (taErr) console.error("TIA query error:", taErr);
    const taOriginTerms = geoOriginTerms(intake.country_of_origin);
    const taInCorridor = (ta || []).filter((r: any) => isAgencyInCorridor(r, taOriginTerms));
    console.log(`TIA corridor pre-filter: ${(ta || []).length} candidates → ${taInCorridor.length} in corridor`);
    // countryCol gives the founder's ORIGIN trade body (Enterprise Ireland for an
    // Irish founder — location_country "ireland") the scorer's structured +2 corridor
    // boost; agencies never passed it, so origin bodies lost the 5 slots to generic
    // AU industry groups despite being the most corridor-valuable row in the pool.
    //
    // Grants goal (taxonomy ticket): there is NO grant service-tag vocabulary anywhere,
    // so the "grants" goal was a dead lever on this surface. grants_available is the
    // structured signal — when the user selected the grants goal, rank a wider slate
    // and stable-partition grants-capable bodies first before taking the 5 slots
    // (score order preserved within each half, never empties: non-grants bodies
    // backfill the remaining slots).
    let taRanked = rank(taInCorridor, { service: "services", persona: true, countryCol: "location_country" }, wantsGrantsGoal ? 10 : 5);
    if (wantsGrantsGoal) {
      const g = taRanked.filter((a: any) => a.grants_available === true);
      const rest = taRanked.filter((a: any) => a.grants_available !== true);
      if (g.length > 0) console.log(`grants goal: prioritising ${g.length} grants_available agencies`);
      taRanked = [...g, ...rest].slice(0, 5);
    }
    matches.trade_investment_agencies = taRanked.map((a: any) => ({
      ...a, link: a.slug ? `/government-support/${a.slug}` : "/government-support", linkLabel: "View Organisation",
      subtitle: a.location, tags: (a.services || []).slice(0, 3),
      // URL lives in website_url/domain for many agencies; `website` is often NULL
      // (Floats: AiGroup, Global Victoria rendered unlinked). Resolve the fallback.
      website: resolveWebsite(a),
    }));
  } catch (e) { console.error("TIA search error:", e); }

  // Investors — sector + location + country corridor (Phase E).
  // 447-row table, so fetch a larger candidate pool before ranking. Stage/check
  // size are surfaced for the reader but intentionally not used for weighting.
  try {
    let invQuery = supabase.from("investors").select("id, slug, name, investor_type, location, country, sector_focus, stage_focus, check_size_min, check_size_max, website, description, sector_tags, sector_agnostic").limit(120);
    invQuery = invQuery.or(buildOr());
    const { data: inv, error: invErr } = await invQuery;
    if (invErr) console.error("Investors query error:", invErr);
    matches.investors = rank(inv, { countryCol: "country" }, 8).map((i: any) => ({
      ...i, link: i.slug ? `/investors/${i.slug}` : "/investors", linkLabel: "View Investor",
      subtitle: metaLine([i.investor_type, i.location]),
      tags: (i.stage_focus || []).slice(0, 3),
    }));
  } catch (e) { console.error("Investors search error:", e); }

  // Lemlist contacts
  try {
    let lcQuery = supabase.from("lemlist_contacts")
      .select("id, full_name, email, job_title, company_name, linkedin_url, linkedin_job_industry, industry, contact_location, lemlist_companies(name, location, industry)")
      .limit(10);
    const lcFilters: string[] = [];
    if (intake.industry_sector?.length > 0) {
      lcFilters.push(...intake.industry_sector.map((s: string) => `industry.ilike.%${sanitizeFilterValue(s)}%`));
      lcFilters.push(...intake.industry_sector.map((s: string) => `linkedin_job_industry.ilike.%${sanitizeFilterValue(s)}%`));
    }
    if (locationPatterns.length > 0) {
      lcFilters.push(...locationPatterns.map((l: string) => `contact_location.ilike.%${l}%`));
    }
    if (lcFilters.length > 0) {
      lcQuery = lcQuery.or(lcFilters.join(","));
    }

    const { data: lc, error: lcErr } = await lcQuery;
    if (lcErr) console.error("Lemlist contacts query error:", lcErr);
    // D1: do not embed raw PII (email, linkedin_url, full_name) in report JSON.
    // The previous version exposed `id: c.id` with a "Frontend can resolve
    // full contact details via an authenticated, entitled path later" plan —
    // but that entitled path is not yet implemented, so embedding the id
    // leaked a PII handle to any tier that received report JSON. Strip the
    // id entirely until the gated lookup endpoint exists.
    const obfuscateName = (full?: string | null): string => {
      if (!full) return "Industry Contact";
      const parts = full.trim().split(/\s+/).filter(Boolean);
      if (parts.length === 0) return "Industry Contact";
      const first = parts[0];
      const lastInitial = parts.length > 1 ? `${parts[parts.length - 1][0]}.` : "";
      return [first, lastInitial].filter(Boolean).join(" ");
    };
    matches.lemlist_contacts = (lc || []).map((c: any) => ({
      name: obfuscateName(c.full_name),
      link: "#",
      linkLabel: "Locked",
      subtitle: [c.job_title, c.company_name || c.lemlist_companies?.name].filter(Boolean).join(" at "),
      tags: [c.linkedin_job_industry || c.industry, c.contact_location || c.lemlist_companies?.location].filter(Boolean).slice(0, 2),
    }));
    console.log(`Lemlist contacts matched: ${(lc || []).length} (PII + id stripped before embed)`);
  } catch (e) { console.error("Lemlist contacts search error:", e); }

  return { matches, ctx };
}

// ── Semantic directory matching (mes_knowledge_base) ─────────────────────
// Recall upgrade over the .cs.{} array-overlap path: embed the intake, ask the
// unified KB (match_knowledge) for the most relevant entities across types, then
// hydrate full source rows so the render/enrich contract above is unchanged.

/** Embed text with OpenAI text-embedding-3-small. Resolves the key env-first with a
 *  Vault fallback (mirrors knowledge-search / embed-knowledge). 10s timeout. Returns
 *  null on any failure (missing key, timeout, API error) so the caller falls back to
 *  the array-overlap path. */
async function embedText(text: string, supabase: any): Promise<number[] | null> {
  if (!text.trim()) return null;
  let key = Deno.env.get("OPENAI_API_KEY") ?? "";
  if (!key) {
    // Vault fallback so this keeps working if the key is ever moved out of env.
    try {
      const { data: vk } = await supabase.rpc("kb_get_openai_key");
      key = typeof vk === "string" ? vk : "";
    } catch (e) { console.error("embedText kb_get_openai_key failed", e); }
  }
  if (!key) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const resp = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: "text-embedding-3-small", input: text }),
      signal: controller.signal,
    });
    if (!resp.ok) { console.error("embedText OpenAI error", resp.status); return null; }
    const j = await resp.json();
    return j.data?.[0]?.embedding ?? null;
  } catch (e) { console.error("embedText threw", e); return null; }
  finally { clearTimeout(timer); }
}

/** Semantic matches for KB-covered entity types. Returns {} on any failure so the
 *  caller falls back to the array-overlap path. The report build runs server-side,
 *  so all visibilities are requested — per-section tier gating happens at render.
 *
 *  The hydrate step mirrors the array-overlap path's correctness guards (P1-7/P1-9)
 *  so the semantic path — which is PREFERRED when it returns rows — can't
 *  reintroduce the bugs fixed there: it drops inactive/anonymous/seed mentors and
 *  dedupes them by person, and drops past-dated events. */
async function semanticMatches(supabase: any, intake: any): Promise<Record<string, any[]>> {
  const out: Record<string, any[]> = {};
  const queryText = buildMatchQueryText(intake);
  const embedding = await embedText(queryText, supabase);
  if (!embedding) return out;

  const { data, error } = await supabase.rpc("match_knowledge", {
    query_embedding: `[${embedding.join(",")}]`,
    query_text: queryText,
    match_count: 120,
    match_threshold: 0.15,
    filter: {},
    allowed_visibility: ["public", "member", "paid"],
  });
  if (error) { console.error("match_knowledge error", error.message); return out; }

  const todayIso = todayIsoForReportTimezone();
  const locationPatterns = deriveLocationPatterns(intake);
  const ranked = groupRankedBySource(data || []);
  await Promise.all(Object.entries(ranked).map(async ([tbl, items]) => {
    const cfg = SEMANTIC_CFG[tbl];
    // Overfetch (2× cap) so post-hydrate filtering still leaves a full slate.
    const ids = (items as Array<{ id: string }>).slice(0, cfg.cap * 2).map((x) => x.id);
    if (ids.length === 0) return;
    try {
      const { data: rows } = await supabase.from(cfg.table).select(cfg.select).in("id", ids);
      const order = new Map(ids.map((id, i) => [id, i] as const));
      let ordered = (rows || []).sort(
        (a: any, b: any) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999),
      );

      if (tbl === "community_members") {
        const seenNames = new Set<string>();
        ordered = ordered.filter((m: any) => {
          // Truthy checks match the overlap path's .eq("is_active", true)
          // .eq("is_anonymous", false) semantics — a null/undefined flag is
          // treated as "not active" / "anonymous unknown" and excluded by both
          // paths, so the two paths agree on which rows pass.
          if (!m.is_active || m.is_anonymous) return false;
          const n = (m.name || "").toLowerCase();
          if (n.startsWith("anonymous")) return false;
          const key = n.replace(/^(dr|prof|mr|mrs|ms|miss)\.?\s+/i, "").replace(/[^a-z\s]/g, "").trim();
          if (!key || seenNames.has(key)) return false;
          seenNames.add(key);
          return true;
        });
      } else if (tbl === "events") {
        // Apply the same date guard + region hard-filter + title|date|venue
        // dedupe as the overlap path. Without this the preferred semantic
        // path could resurface near-duplicate / wrong-city events that the
        // overlap path now blocks.
        const dateFiltered = ordered.filter((e: any) => !e.date || e.date >= todayIso);
        ordered = regionFilterAndDedupeEvents(dateFiltered, locationPatterns, cfg.cap);
      }

      out[tbl] = ordered.slice(0, cfg.cap).map(cfg.decorate);
    } catch (e) { console.error(`semantic hydrate ${tbl} failed`, e); }
  }));
  return out;
}

/** Phase 5: practitioner SIGNAL from the LinkedIn corpus synced out of Content
 *  Creator (source_table='linkedin_post', visibility='internal'). Returned as
 *  abstracted, unattributed snippets for SYNTHESIS ONLY — never quoted, cited, or
 *  attributed. Kept entirely separate from semanticMatches() (which uses
 *  allowed_visibility public/member/paid) so these internal rows never enter
 *  directory hydration; here we deliberately request only ['internal'] + the
 *  content_creator metadata filter, so ONLY LinkedIn rows can come back. */
async function fetchLinkedInSignal(supabase: any, intake: any): Promise<string> {
  try {
    const queryText = buildMatchQueryText(intake);
    const embedding = await embedText(queryText, supabase);
    if (!embedding) return "";
    const { data, error } = await supabase.rpc("match_knowledge", {
      query_embedding: `[${embedding.join(",")}]`,
      query_text: queryText,
      match_count: 10,
      match_threshold: 0.15,
      filter: { source_project: "content_creator" },
      allowed_visibility: ["internal"],
    });
    if (error) { console.error("linkedin signal match_knowledge error", error.message); return ""; }
    return (data || [])
      .filter((r: any) => r.source_table === "linkedin_post" && r.content)
      .slice(0, 8)
      .map((r: any) => `- ${String(r.content).replace(/\s+/g, " ").trim().slice(0, 300)}`)
      .join("\n");
  } catch (e) {
    console.error("fetchLinkedInSignal failed", e);
    return "";
  }
}

/** Directory matching: semantic-first (mes_knowledge_base) with the array-overlap
 *  path as per-section backfill AND total fallback. `leads` + `lemlist_contacts`
 *  are not in the KB, so they always come from the overlap path. If OPENAI_API_KEY
 *  is unset or the KB call fails, semantic returns {} and the (now bug-fixed)
 *  overlap path carries the whole report. */
async function searchMatches(supabase: any, intake: any): Promise<Record<string, any[]>> {
  const { matches: overlap, ctx } = await searchMatchesOverlap(supabase, intake);
  let semantic: Record<string, any[]> = {};
  try {
    semantic = await semanticMatches(supabase, intake);
  } catch (e) {
    console.error("semantic matches failed; using array-overlap only", e);
  }

  // Re-rank the UNION of overlap + semantic candidates through the rebalanced scorer,
  // so semantic search boosts RECALL while the explainable rebalance (specialist bonus,
  // org-diversity, sells-to gating) governs the final ORDER. Previously this was
  // semantic-first, which silently overrode the deterministic ranking (the semantic
  // query — full of "Trade Advisory/Investment" — is exactly what surfaced trade
  // generalists). Per-type opts mirror the overlap call sites. Events keep their
  // bespoke semantic-first merge (preserves the date/venue dedupe + soonest-event fallback).
  const RERANK: Record<string, { opts: ScoreOpts; select: SelectOpts }> = {
    service_providers: { opts: { service: "services" }, select: {} },
    community_members: {
      opts: { service: "specialties", countryCol: "origin_country" },
      select: {
        dedupeKeys: [
          { keyOf: (m: any) => normalizePersonName(m.name), max: 1 },
          { keyOf: (m: any) => (m.company || "").toLowerCase().trim(), max: 2 },
        ],
        minSpecialists: 2,
      },
    },
    content_items: { opts: { applySellsTo: true }, select: {} },
    innovation_ecosystem: { opts: { service: "services" }, select: {} },
    trade_investment_agencies: { opts: { service: "services", persona: true }, select: {} },
    investors: { opts: { countryCol: "country" }, select: {} },
  };

  const merged: Record<string, any[]> = { ...overlap };
  for (const [tbl, cfg] of Object.entries(SEMANTIC_CFG)) {
    const sem = semantic[tbl] || [];
    const ov = overlap[tbl] || [];
    const rc = RERANK[tbl];
    if (rc) {
      if (sem.length === 0 && ov.length === 0) continue;
      merged[tbl] = mergeAndRerank(ov, sem, rc.opts, ctx, cfg.cap, rc.select);
    } else {
      // events: keep semantic-first + overlap backfill
      if (sem.length === 0) continue;
      const seen = new Set(sem.map((x: any) => x.id));
      const backfill = ov.filter((x: any) => !seen.has(x.id));
      merged[tbl] = [...sem, ...backfill].slice(0, cfg.cap);
    }
  }
  // ── Lead-list ICP gate at the UNION (P1-C follow-up) ────────────────────
  // The overlap path gates its own leads, but lead_databases is ALSO embedded in
  // the KB and is merged semantic-first — so an off-ICP list surfaced by the
  // preferred semantic path would otherwise reach the report un-gated (the
  // overlap gate only ever touched the backfill slot). Re-apply the SAME strict
  // ICP filter here, at the union, so BOTH paths are covered. Strict (no floor):
  // an off-ICP list is dropped, not padded — the custom-list request box is the
  // escape hatch. Empty ICP tokens → leadMatchesIcp returns true → no-op.
  if (merged.lead_databases?.length) {
    const leadIcp = leadIcpTokens(intake.end_buyer_industries || [], intake.industry_sector || []);
    const before = merged.lead_databases.length;
    merged.lead_databases = merged.lead_databases.filter((l: any) => leadMatchesIcp(l, leadIcp));
    if (merged.lead_databases.length !== before) {
      console.log(`lead ICP union gate: ${before} → ${merged.lead_databases.length}`);
    }
  }

  // ── Geography / origin gate (Stage 7 bugs B3 & B4) ──────────────────────
  // The scorer only ADDS a +1 location nudge; it never excludes, so a wrong-market
  // row (a New-York firm on an AU report; a UK/Canadian agency for an Irish founder)
  // could still win a slot as backfill. Drop out-of-scope rows here — at the union,
  // so it covers BOTH the overlap and semantic paths — while never emptying a section
  // (preferRelevant backfills weak rows only when too few in-scope rows exist).
  // Providers + innovation hubs: geography is free-text `location`. Gate via the
  // ANZ/target matcher, backfilling (preferRelevant) so a thin directory never
  // empties the section — a clearly-foreign location (a New-York firm) drops.
  const geoTargetRegions = deriveLocationPatterns(intake);
  const geoMatcher = buildGeoMatcher({ targetRegions: geoTargetRegions });
  const GEO_MIN_KEEP = 3;
  for (const tbl of ["service_providers", "innovation_ecosystem"]) {
    if (merged[tbl]?.length) {
      const before = merged[tbl].length;
      merged[tbl] = preferRelevant(merged[tbl], (r) => isGeoRelevant(r, geoMatcher), GEO_MIN_KEEP);
      if (merged[tbl].length !== before) console.log(`geo gate ${tbl}: ${before} → ${merged[tbl].length}`);
    }
  }
  // Trade/government agencies: nearly all are foreign missions PHYSICALLY in Australia,
  // so a text match is useless — use the structured corridor gate (organisation_type +
  // represented country). HARD filter (no backfill): re-adding foreign missions to hit a
  // minimum would just reintroduce B4, and the providers section stays populated from
  // service_providers + innovation regardless.
  const agencyOriginTerms = geoOriginTerms(intake.country_of_origin);
  if (merged.trade_investment_agencies?.length) {
    const before = merged.trade_investment_agencies.length;
    merged.trade_investment_agencies = merged.trade_investment_agencies.filter(
      (r) => isAgencyInCorridor(r, agencyOriginTerms),
    );
    if (merged.trade_investment_agencies.length !== before) {
      console.log(`geo gate trade_investment_agencies: ${before} → ${merged.trade_investment_agencies.length}`);
    }
  }
  // State-body region gate (Floats feedback, P2-F): a STATE government body (Global
  // Victoria, Invest Victoria) is only useful to a founder targeting THAT state, but the
  // corridor gate keeps every domestic ANZ body for everyone. Drop a state body whose
  // state ≠ any state named by the report's target regions. Silent for national targets
  // (no specific state) and non-state bodies (federal/industry/bilateral stay). Hard
  // filter: only wrong-state state bodies are removed, so the section stays populated.
  if (merged.trade_investment_agencies?.length) {
    const before = merged.trade_investment_agencies.length;
    merged.trade_investment_agencies = merged.trade_investment_agencies.filter(
      (r) => !stateAgencyRegionMismatch(r, geoTargetRegions),
    );
    if (merged.trade_investment_agencies.length !== before) {
      console.log(`state gate trade_investment_agencies: ${before} → ${merged.trade_investment_agencies.length}`);
    }
  }
  // Grants goal (taxonomy ticket): order grants-capable bodies first at the union so
  // the semantic path benefits too (the overlap path already widened its slate). Pure
  // reorder — membership unchanged, section never empties. NB: recomputed here — the
  // overlap path's wantsGrantsGoal is scoped to searchMatchesOverlap, not this function.
  if (goalSelectsGrants(intake) && merged.trade_investment_agencies?.length) {
    merged.trade_investment_agencies = [
      ...merged.trade_investment_agencies.filter((r: any) => r.grants_available === true),
      ...merged.trade_investment_agencies.filter((r: any) => r.grants_available !== true),
    ];
  }
  // National chambers of commerce that are filed in the PROVIDER pools (no
  // jurisdiction column, so the agency gate above can't see them) are gated by
  // the foreign demonym in their NAME — keep the corridor chamber (Australian
  // British Chamber for a UK founder), drop the wrong one (AmCham/US). Hard filter:
  // a wrong-corridor chamber is pure noise and the section stays full from the many
  // non-chamber providers. (Stage 7 bug B8.)
  for (const tbl of ["service_providers", "innovation_ecosystem"]) {
    if (merged[tbl]?.length) {
      const before = merged[tbl].length;
      merged[tbl] = merged[tbl].filter((r) => !chamberOriginMismatch(r, agencyOriginTerms));
      if (merged[tbl].length !== before) console.log(`chamber gate ${tbl}: ${before} → ${merged[tbl].length}`);
    }
  }

  // ── Cross-section dedupe (Stage 7 bug B10) ──────────────────────────────
  // An entity in the providers section (service_providers + agencies + innovation)
  // or the mentors section must not ALSO surface as a card in a later section — e.g.
  // "Stone & Chalk" (innovation hub AND investor) or "Aaron Birkby" (mentor AND
  // investor). getMatchesForSection still dedupes WITHIN the providers section
  // (dedupeByKey); this prunes the later sections' source arrays by section priority:
  // providers > mentors > investors. First section to claim an entity keeps it.
  const entityKey = (r: { name?: unknown; title?: unknown; company_name?: unknown }) =>
    String(r?.name || r?.title || r?.company_name || "").toLowerCase().trim();
  const providerPool = [
    ...(merged.service_providers || []),
    ...(merged.trade_investment_agencies || []),
    ...(merged.innovation_ecosystem || []),
  ];
  const [, dedupMentors, dedupInvestors] = pruneAcrossGroups(
    [providerPool, merged.community_members || [], merged.investors || []],
    entityKey,
  );
  if ((merged.community_members || []).length !== dedupMentors.length) {
    console.log(`cross-section dedupe mentors: ${(merged.community_members || []).length} → ${dedupMentors.length}`);
  }
  if ((merged.investors || []).length !== dedupInvestors.length) {
    console.log(`cross-section dedupe investors: ${(merged.investors || []).length} → ${dedupInvestors.length}`);
  }
  merged.community_members = dedupMentors;
  merged.investors = dedupInvestors;

  // Persona/origin-aware immigration filter (Floats feedback): a DOMESTIC-origin
  // company (Australian startup) needs neither immigration/visa MENTORS nor
  // immigration SERVICE PROVIDERS, but the scorer surfaced both "Head of Community,
  // Techvisa" (mentor) and the "TechVisa" business-immigration provider anyway.
  // Demote visa/immigration-dominant rows on both surfaces (floor-guarded via
  // preferRelevant, so a thin pool still renders) — UNLESS the company is
  // international, or explicitly asked for immigration / relocation /
  // international-hiring help.
  if (!isInternationalOrigin(intake.country_of_origin)) {
    const wantsImmigration = /\b(visa|immigration|relocation|mobility|international (hire|hiring|talent)|sponsor)\b/i.test(
      `${(intake.services_needed || []).join(" ")} ${intake.report_focus || ""} ${intake.key_challenges || ""}`,
    );
    if (!wantsImmigration) {
      for (const [tbl, floor] of [["community_members", 3], ["service_providers", 4]] as const) {
        if (!(merged[tbl] || []).length) continue;
        const before = merged[tbl].length;
        merged[tbl] = preferRelevant(merged[tbl], (r: any) => !isImmigrationFocused(r), floor);
        const dropped = before - merged[tbl].length;
        if (dropped > 0) console.log(`immigration filter (domestic) ${tbl}: demoted ${dropped} row(s)`);
      }
    }
  }

  // lead_databases is the real catalog; expose it under the report's existing
  // `leads` variable so report_templates needs no change.
  if (merged.lead_databases) { merged.leads = merged.lead_databases; delete merged.lead_databases; }
  const semKeys = Object.keys(semantic).filter((k) => (semantic[k] || []).length > 0);
  console.log(`searchMatches: semantic types=[${semKeys.join(", ")}], reranked union=[${Object.keys(RERANK).join(", ")}]`);
  return merged;
}

function getMatchesForSection(sectionName: string, matches: Record<string, any[]>): any[] {
  switch (sectionName) {
    // Service Providers is the free/always-visible "who can help you" section. Trade &
    // investment agencies (government support) and innovation hubs/accelerators are the
    // same class of entry support, so we surface them here too. Previously they were
    // queried + stored in the raw matches blob but attached to NO section, so the
    // utilization metric always counted them as "dropped". Attaching them here renders
    // them as cards and flips them to "used".
    // De-dupe by organisation name across the three pools: a body listed both as a
    // service provider and a trade/government agency must not render as two cards (and
    // must not be double-counted by the utilization metric). First occurrence wins, so
    // the service_providers pool (the primary) keeps the entry. Per-pool caps upstream
    // (10 / 5 / 5) already bound the total.
    // `card_group` tags each card with its entity kind so the frontend renders
    // one sub-headed grid per type instead of a single mixed grid (Stage 5 B9).
    case "service_providers": return dedupeByKey([
      ...(matches.service_providers || []).map((r: any) => ({ ...r, card_group: "providers" })),
      ...(matches.trade_investment_agencies || []).map((r: any) => ({ ...r, card_group: "agencies" })),
      ...(matches.innovation_ecosystem || []).map((r: any) => ({ ...r, card_group: "innovation" })),
    ], (r: any) => (r?.name || r?.title || r?.company_name || "").toString().toLowerCase().trim());
    case "mentor_recommendations": return matches.community_members || [];
    case "events_resources": return [
      ...(matches.events || []).map((r: any) => ({ ...r, card_group: "events" })),
      ...(matches.content_items || []).map((r: any) => ({ ...r, card_group: "resources" })),
    ];
    case "lead_list": return [
      ...(matches.leads || []).map((r: any) => ({ ...r, card_group: "leads" })),
      ...(matches.lemlist_contacts || []).map((r: any) => ({ ...r, card_group: "contacts" })),
    ];
    case "investor_recommendations": return matches.investors || [];
    case "competitor_landscape": return [];
    default: return [];
  }
}

// ── Background report generation logic ─────────────────────────────────

async function generateReportInBackground(
  intakeFormId: string,
  reportId: string
): Promise<void> {
  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY") || "";

    const supabase = createClient(supabaseUrl, serviceKey);

    // 1. Fetch intake form
    const { data: intake, error: intakeErr } = await supabase
      .from("user_intake_forms")
      .select("*")
      .eq("id", intakeFormId)
      .single();

    if (intakeErr || !intake) throw new Error("Intake form not found");

    await supabase.from("user_intake_forms").update({ status: "processing" }).eq("id", intakeFormId);

    // Extract persona early so it can be used in Perplexity query construction
    const rawInput = intake.raw_input || {};
    const persona = (rawInput as any).persona === "startup" ? "startup" : "international";
    console.log(`Report persona: ${persona}`);

    // 2. Run ALL enrichment + research + matching in parallel
    const fallbackSummary = `${intake.company_name} is a ${intake.company_stage} ${(intake.industry_sector || []).join(", ")} company from ${intake.country_of_origin}${intake.employee_count ? ` with ${intake.employee_count} employees` : ""}. Their target end buyers are in: ${(intake.end_buyer_industries || []).join(", ") || "not specified"}.`;

    console.log("Starting optimised parallel pipeline: deep scrape + Perplexity (6 queries) + DB matching + providers enrichment + competitors + end buyers...");

    // One stats collector per report, threaded through every Firecrawl wrapper
    // so the metadata can report plumbing health + total op count (P1/P2).
    const firecrawlStats = createFirecrawlStats();
    // Cross-report scrape cache (P1) — undefined unless FIRECRAWL_CACHE_ENABLED is
    // set, in which case repeated scrapes (esp. matched providers) hit the cache
    // instead of re-burning Firecrawl credits every report.
    const firecrawlCache = buildScrapeCache(supabase);

    // Wrap DB matching + provider enrichment into a single parallel task
    const matchesAndEnrichTask = async () => {
      const rawMatches = await searchMatches(supabase, intake);
      // Enrich providers in parallel (was previously sequential after the main block)
      rawMatches.service_providers = await enrichMatchedProviders(
        firecrawlKey,
        rawMatches.service_providers || [],
        firecrawlStats,
        firecrawlCache,
      );
      return rawMatches;
    };

    const [
      companyEnrichResult,
      marketResearch,
      matches,
      competitorResult,
      endBuyerScrapeResult,
      endBuyerProcurementResearch,
      endBuyerAccountResearch,
    ] = await Promise.all([
      firecrawlKey && intake.website_url
        ? enrichCompanyDeep(firecrawlKey, lovableKey, intake.website_url, intake.company_name, fallbackSummary, firecrawlStats, firecrawlCache)
        : Promise.resolve({ profile: null, enrichedSummary: fallbackSummary, diagnostics: null }),
      runMarketResearch(intake, persona),
      matchesAndEnrichTask(),
      firecrawlKey
        ? searchCompetitors(firecrawlKey, lovableKey, intake, firecrawlStats, firecrawlCache)
        : Promise.resolve({ competitors: [], raw_results: [], competitor_depth: !!Deno.env.get("FIRECRAWL_COMPETITOR_DEPTH") }),
      firecrawlKey && (intake.end_buyers || []).length > 0
        ? scrapeEndBuyers(firecrawlKey, lovableKey, intake.end_buyers, intake.company_name, firecrawlStats, firecrawlCache)
        : Promise.resolve([]),
      researchEndBuyerProcurement(intake),
      // Buyer-briefs v1: ONE batched Perplexity pass across all named accounts —
      // recent news + live hiring + known tech, cited. Single call regardless of
      // chip count (cost cap); "" on failure/no chips (fail-open).
      (async () => {
        const chips = (intake.end_buyers || []).slice(0, 3);
        const pk = Deno.env.get("PERPLEXITY_API_KEY");
        if (!pk || chips.length === 0) return "";
        const list = chips.map((b: any) => `${b.name}${b.website ? ` (${b.website})` : ""}`).join("; ");
        const r = await callPerplexity(pk, `For EACH of these Australian-market companies: ${list} — give 1) notable news from the last 12 months, 2) whether they appear to be actively hiring and for what roles, 3) any known software/technology they use (ATS, CRM, marketing or delivery stack). Say "unknown" where you cannot find evidence — do not guess.`, { recency: "year" });
        return r.ok ? r.content : "";
      })(),
    ]);

    // Extract key metrics from the landscape response instead of a separate Perplexity call
    const keyMetrics: Array<{ label: string; value: string; context: string; estimated?: boolean }> = [];
    if (marketResearch.landscape) {
      const metricLines = marketResearch.landscape.match(/- METRIC: (.+?) \| (.+?) \| (.+)/g);
      if (metricLines) {
        for (const line of metricLines) {
          const m = line.match(/- METRIC: (.+?) \| (.+?) \| (.+)/);
          // Strip markdown — the model sometimes wraps the label/value in **bold**,
          // which renders as literal asterisks in the metric cards (the frontend shows
          // these as plain text). Leave [N] citation markers intact.
          if (m) {
            const clean = (s: string) => s.replace(/\*/g, "").trim();
            const value = clean(m[2]);
            const context = clean(m[3]);
            keyMetrics.push({
              label: humanizeMetricLabel(clean(m[1])),
              value,
              context,
              // Flag model-derived estimates so the panel marks them "Est." (P2-H).
              estimated: isEstimatedMetric(value, context),
            });
          }
        }
        // Remove the KEY METRICS section from landscape text to keep it clean
        marketResearch.landscape = marketResearch.landscape.replace(/\n*(?:KEY METRICS|## KEY METRICS|### KEY METRICS)[\s\S]*$/i, "").trim();
      }
      console.log(`Extracted ${keyMetrics.length} key metrics from landscape query`);
    }

    const enrichedSummary = companyEnrichResult.enrichedSummary;
    const companyProfile = companyEnrichResult.profile;
    const companyScrapeDiag = companyEnrichResult.diagnostics;

    // Competitor recall backfill (Floats feedback): discovery can come up thin
    // (Floats got 1 competitor) while the market-research prose already fetched
    // openly names real rivals. When we're below target, mine that prose for
    // named competitors and verify each through the known-competitor scrape
    // (resolve domain + read the live site) — only companies that actually
    // resolve and yield content are added, so nothing unverified enters the
    // report. Reuses fetched research → no extra Perplexity spend. Best-effort.
    try {
      if (firecrawlKey && (competitorResult.competitors?.length || 0) < BACKFILL_TARGET) {
        const researchText = `${marketResearch.landscape || ""}\n\n${marketResearch.news || ""}`.trim().slice(0, 6000);
        if (researchText.length > 100) {
          const existingNames = [
            ...competitorResult.competitors.map((c: any) => c?.name),
            intake.company_name,
          ].filter(Boolean) as string[];
          const mentionText = await callAI(lovableKey, [
            { role: "system", content: "You extract competitor company names from analyst notes. Return only valid JSON, no markdown fences." },
            { role: "user", content: buildMentionPrompt(intake.company_name, (intake.industry_sector || []).join(" / "), researchText, existingNames) },
          ], "google/gemini-3-flash-preview", { temperature: 0.1 });
          const names = parseMentions(mentionText, existingNames);
          if (names.length > 0) {
            const scraped = await scrapeKnownCompetitors(
              firecrawlKey, lovableKey,
              names.map((n) => ({ name: n, website: "" })),
              intake.company_name, firecrawlStats, firecrawlCache, !!Deno.env.get("FIRECRAWL_COMPETITOR_DEPTH"),
            );
            const existingDomains = new Set(
              competitorResult.competitors.map((c: any) => domainOf(c?.url || "")).filter(Boolean),
            );
            const existingNameSet = new Set(existingNames.map((n) => n.toLowerCase()));
            const isVerified = (c: any) =>
              c?.url && !/could not be analysed|could not extract/i.test(String(c?.description || ""));
            let added = 0;
            for (const c of scraped) {
              if (!isVerified(c)) continue; // unresolved / unscrapeable mined name → drop, never surface unverified
              const dom = domainOf(c.url || "");
              if (dom && existingDomains.has(dom)) continue;
              if (existingNameSet.has(String(c.name || "").toLowerCase())) continue;
              competitorResult.competitors.push(c);
              if (dom) existingDomains.add(dom);
              existingNameSet.add(String(c.name || "").toLowerCase());
              added++;
            }
            console.log(`competitor backfill: mined ${names.length} name(s) from research, added ${added} verified`);
          }
        }
      }
    } catch (e) { console.error("competitor backfill failed (continuing):", e); }

    if (companyProfile) {
      await supabase.from("user_intake_forms")
        .update({ enriched_input: companyProfile })
        .eq("id", intakeFormId);
    }

    // Conditional external event discovery: only if DB returned < 3 events
    let discoveredEvents: DiscoveredEvent[] = [];
    const internalEventCount = (matches.events || []).length;
    if (firecrawlKey && internalEventCount < 3) {
      console.log(`Only ${internalEventCount} internal events found — discovering external events...`);
      discoveredEvents = await discoverExternalEvents(firecrawlKey, lovableKey, intake, firecrawlStats);
    } else {
      console.log(`${internalEventCount} internal events found — skipping external event discovery`);
    }

    // Merge discovered events
    if (discoveredEvents.length > 0) {
      const discoveredEventMatches = discoveredEvents.map((e) => ({
        name: e.name,
        subtitle: metaLine([e.date, e.location]),
        tags: ["Web Discovery"],
        link: e.url,
        linkLabel: "View Event",
        website: e.url,
        source: "web",
      }));
      matches.events = [...(matches.events || []), ...discoveredEventMatches];
    }

    // ── LLM relevance curation (MATCH_RERANK_ENABLED, default off) ───────────
    // Selection so far is embeddings-recall + a deterministic scorer + rule gates —
    // no model ever asks "is this entity actually useful for THIS company?". The
    // 20-sector taxonomy is coarse, so plausible-but-wrong picks pass (an insurtech
    // association / Asia-gateway hub for an Irish credit-decisioning fintech; a
    // "Legal Technology Buyers" lead list). Hand the whole selected slate + the
    // enriched company profile to ONE cheap Gemini call and drop what an analyst would
    // cut. Drop-only, floor-guarded, and fail-open (see matchRerank.ts) so it can
    // never empty a section or add/reorder — worst case it's a no-op.
    let matchRerankInfo: { applied: boolean; dropped: Record<string, number>; dropped_count: number } | null = null;
    if (Deno.env.get("MATCH_RERANK_ENABLED")) {
      try {
        const rerankItems = buildRerankItems(matches);
        if (rerankItems.length > 0) {
          const rerankContext = [
            `${intake.company_name || "The company"} — ${(intake.industry_sector || []).join(" / ") || "sector not specified"}`,
            `from ${intake.country_of_origin || "unknown origin"}`,
            `entering ${(intake.target_regions || []).join(", ") || "Australia"}`,
            (intake.end_buyer_industries || []).length ? `sells to: ${(intake.end_buyer_industries || []).join(", ")}` : "",
            enrichedSummary ? `Profile: ${String(enrichedSummary).slice(0, 600)}` : "",
          ].filter(Boolean).join(". ");
          const aiText = await callAI(lovableKey, [
            { role: "system", content: "You are a meticulous market-entry analyst. Return only valid JSON, no markdown fences." },
            { role: "user", content: buildRerankPrompt(rerankContext, rerankItems) },
          ], "google/gemini-3-flash-preview", { temperature: 0.1 });
          const verdicts = parseRerankVerdicts(aiText, rerankItems.length);
          const result = applyRerankVerdicts(matches, rerankItems, verdicts);
          for (const [tbl, arr] of Object.entries(result.matches)) matches[tbl] = arr;
          matchRerankInfo = { applied: verdicts.parsed, dropped: result.droppedByTable, dropped_count: result.droppedNames.length };
          if (result.droppedNames.length > 0) {
            console.log(`match rerank dropped ${result.droppedNames.length}: ${JSON.stringify(result.droppedByTable)}`);
          }
        }
      } catch (e) { console.error("match rerank failed (continuing):", e); }
    }

    // All Firecrawl work for this report is done — log plumbing health + op count.
    console.log(`Firecrawl health: ${firecrawlStats.succeeded}/${firecrawlStats.ops} OK (scrape ${firecrawlStats.scrape.ok}/${firecrawlStats.scrape.attempted}, map ${firecrawlStats.map.ok}/${firecrawlStats.map.attempted}, search ${firecrawlStats.search.ok}/${firecrawlStats.search.attempted}); cache ${firecrawlStats.cache_hits} hit / ${firecrawlStats.cache_misses} miss; statuses [${firecrawlStats.statuses.join(",")}]`);

    // 3. Get user subscription tier
    let userTier = "free";
    if (intake.user_id) {
      const { data: sub } = await supabase
        .from("user_subscriptions")
        .select("tier")
        .eq("user_id", intake.user_id)
        .single();
      if (sub?.tier) userTier = sub.tier;
    }

    const tierMap: Record<string, string> = { premium: "growth", concierge: "enterprise" };
    userTier = tierMap[userTier] || userTier;

    // 4. Fetch report templates
    const { data: templates } = await supabase
      .from("report_templates")
      .select("*")
      .eq("is_active", true)
      .order("section_name");

    // 5. Build template variables
    const tierHierarchy = ["free", "growth", "scale", "enterprise"];
    const userTierIndex = Math.max(0, tierHierarchy.indexOf(userTier)); // Default to free (0) if unknown

    const targetCustomerDescription = (rawInput as any).target_customer_description || "";

    // Extract additional_notes: stored separately from primary_goals (no longer concatenated)
    const additionalNotes = (rawInput as any).additional_notes || "";
    const revenueStage = (rawInput as any).revenue_stage || "";
    // The user's stated priority — "what matters most" (Step 2 report_focus). Persisted to
    // the report_focus column AND mirrored into raw_input, but previously read by NOTHING,
    // so the single most intent-revealing answer had zero effect on the report. Surface it
    // to every section prompt below (and expose {{report_focus}} for templates).
    // ONLY the explicit "what matters most" field — do NOT fall back to additional_notes.
    // reportFocus drives a "single most important outcome, lead with it" directive in every
    // section (focusNote); seeding it from unrelated free-text notes (e.g. "email me a PDF")
    // would distort the whole report. additional_notes is surfaced separately as its own var.
    const reportFocus = (intake.report_focus || (rawInput as any).report_focus || "").toString().trim();

    // Country-corridor content for the setup_compliance section. country_faqs are keyed by
    // country_id and only cover a handful of source countries (IE/SG/UK/US/CA), so this is a
    // STRUCTURED fetch — match the user's country_of_origin to a countries row via the same
    // normalizeCountry() key the corridor signal uses, then pull ALL its FAQs (short Q&As) +
    // profile. Grounding beats semantic here: country-keyed legal/tax facts must not bleed
    // another country's rules into the report. Empty (uncovered country) → "" / "[]", which
    // the template's conditional blocks drop, falling back to a generic orientation.
    let countryProfile: any = null;
    let countryFaqs: any[] = [];
    try {
      const originKey = normalizeCountry(intake.country_of_origin);
      if (originKey) {
        const { data: countryRows } = await supabase
          .from("countries")
          .select("id, name, slug, description, trade_relationship_strength, economic_indicators, key_industries");
        const match = (countryRows || []).find(
          (c: any) => normalizeCountry(c.name) === originKey || c.slug === originKey,
        );
        if (match) {
          countryProfile = match;
          const { data: faqs } = await supabase
            .from("country_faqs")
            .select("question, answer, sort_order")
            .eq("country_id", match.id)
            .order("sort_order");
          countryFaqs = faqs || [];
          console.log(`Country corridor: matched ${match.name} with ${countryFaqs.length} FAQs`);
        } else {
          console.log(`Country corridor: no countries row for origin "${intake.country_of_origin}" (${originKey})`);
        }
      }
    } catch (e) { console.error("Country corridor fetch error:", e); }

    // Phase C (RQ refs 3f27c7ed / 340c7245): the providers section already renders trade/
    // government agencies + innovation hubs as cards (getMatchesForSection union), but the
    // PROSE variable only saw matches.service_providers, so those entries read as "surfaced
    // but unused". Feed the same deduped union into the providers prompt so they're actually
    // written about. Built once and reused for the summary.
    const providerUnion = getMatchesForSection("service_providers", matches);
    const hasAgencyOrInnovation =
      (matches.trade_investment_agencies || []).length > 0 || (matches.innovation_ecosystem || []).length > 0;

    const variables: Record<string, string> = {
      persona,
      company_name: intake.company_name,
      company_stage: intake.company_stage,
      industry_sector: (intake.industry_sector || []).join(", "),
      country_of_origin: intake.country_of_origin,
      target_regions: (intake.target_regions || []).join(", "),
      services_needed: (intake.services_needed || []).join(", "),
      timeline: intake.timeline || "Not specified",
      budget_level: intake.budget_level || "Not specified",
      primary_goals: intake.primary_goals || "Not specified",
      additional_notes: additionalNotes,
      report_focus: reportFocus || "Not specified",
      key_challenges: intake.key_challenges || "Not specified",
      target_customer_description: targetCustomerDescription || "Not specified",
      revenue_stage: revenueStage,
      employee_count: intake.employee_count || "Not specified",
      enriched_summary: enrichedSummary,
      enriched_company_profile: companyProfile ? JSON.stringify(companyProfile) : "No enriched data available.",
      matched_providers_json: JSON.stringify(providerUnion),
      matched_mentors_json: JSON.stringify(matches.community_members || []),
      matched_events_json: JSON.stringify(matches.events || []),
      matched_content_json: JSON.stringify(matches.content_items || []),
      matched_leads_json: JSON.stringify(matches.leads || []),
      country_profile_json: countryProfile ? JSON.stringify(countryProfile) : "",
      matched_country_faqs_json: JSON.stringify(countryFaqs),
      key_metrics_json: JSON.stringify(keyMetrics),
      matched_providers_summary: providerUnion.map((p: any) => p.name).join(", ") || "None found",
      matched_lemlist_contacts_json: JSON.stringify(matches.lemlist_contacts || []),
      matched_investors_json: JSON.stringify(matches.investors || []),
      matched_trade_investment_agencies_json: JSON.stringify(matches.trade_investment_agencies || []),
      matched_innovation_ecosystem_json: JSON.stringify(matches.innovation_ecosystem || []),
      competitor_analysis_json: JSON.stringify(competitorResult.competitors),
      known_competitors_json: JSON.stringify(intake.known_competitors || []),
      end_buyer_industries: (intake.end_buyer_industries || []).join(", ") || "Not specified",
      end_buyers_json: JSON.stringify(intake.end_buyers || []),
      // Scraped per-buyer intelligence — now consumed by the action_plan template
      // (migration 20260628210000). Previously this was also duplicated into
      // end_buyers_analysis_json, which no template read; that dead duplicate is removed.
      end_buyers_scraped_json: JSON.stringify(endBuyerScrapeResult || []),
      end_buyer_research: endBuyerProcurementResearch || "No end buyer procurement data available.",
      market_research_landscape: marketResearch.landscape || "No market research data available.",
      market_research_regulatory: marketResearch.regulatory || "No regulatory research data available.",
      market_research_news: marketResearch.news || "No recent news data available.",
      market_research_bilateral_trade: marketResearch.bilateral_trade || "No bilateral trade data available.",
      market_research_cost_of_business: marketResearch.cost_of_business || "No cost of business data available.",
      market_research_grants: marketResearch.grants || "No grants and incentives data available.",
      discovered_events_json: JSON.stringify(discoveredEvents || []),
      market_research_citations: marketResearch.citations.length > 0
        ? marketResearch.citations.map((url: string, i: number) => `[${i + 1}] ${url}`).join("\n")
        : "",
    };

    // 6. Generate sections
    const sections: Record<string, any> = {};
    const sectionsGenerated: string[] = [];

    // ── Citation availability (P0-4) ─────────────────────────────────────
    // When Perplexity returned no citations, instructing the model that it
    // "MUST include [N] citation markers" produces hallucinated numbers
    // that point at nothing (we observed sections shipping with [1], [3],
    // [5]…[9] markers while perplexity_citations was []). Swap in a strict
    // "do NOT include citation markers" instruction in that case.
    const numCitations = marketResearch.citations.length;
    const citationInstruction = numCitations > 0
      ? `IMPORTANT — Inline citations: When you reference data, statistics, market figures, regulatory requirements, or factual claims that come from the provided market research, you SHOULD include an inline citation marker using the format [N] where N is an integer from 1 to ${numCitations} (inclusive). These are the ONLY valid source numbers — do NOT invent or use any other number. Citations are NUMERIC ONLY: never write a bracketed text label such as [Cost of Business Data], [Cost Data], or [Company Profile] — facts drawn from unnumbered background context carry no bracket at all. Place the citation immediately after the relevant claim. For example: "The Australian AI market is projected to reach USD 8.48 billion by 2030 [3]."`
      : `IMPORTANT — Inline citations: Do NOT include any citation markers anywhere in your response — neither numbered ones (e.g. [1], [2], [3]) nor bracketed text labels (e.g. [Cost of Business Data]). There is no source list to cite for this report.`;

    // ── Research availability disclosure (P1-11) ─────────────────────────
    // Tell the model exactly which research streams produced data, so it
    // doesn't invent specific grant programs / FTA names / cost figures when
    // the underlying Perplexity query failed and the variable fell back to
    // "No X available". This is a soft guard — combined with the per-template
    // "do not invent" rules it materially reduces fabrication.
    const availabilityLines: string[] = [];
    availabilityLines.push(`- Market landscape research: ${marketResearch.landscape ? "available" : "UNAVAILABLE"}`);
    availabilityLines.push(`- Regulatory & compliance research: ${marketResearch.regulatory ? "available" : "UNAVAILABLE"}`);
    availabilityLines.push(`- Recent news (last 6 months): ${marketResearch.news ? "available" : "UNAVAILABLE"}`);
    availabilityLines.push(`- Bilateral trade / fundraising landscape research: ${marketResearch.bilateral_trade ? "available" : "UNAVAILABLE"}`);
    availabilityLines.push(`- Cost of doing business research: ${marketResearch.cost_of_business ? "available" : "UNAVAILABLE"}`);
    availabilityLines.push(`- Grants & incentives research: ${marketResearch.grants ? "available" : "UNAVAILABLE"}`);
    availabilityLines.push(`- End-buyer procurement research: ${endBuyerProcurementResearch ? "available" : "UNAVAILABLE"}`);
    availabilityLines.push(`- Company-website scrape (enriched profile): ${companyProfile ? "available" : "UNAVAILABLE"}`);
    const availabilityNote = `\n\nDATA AVAILABILITY for this report:\n${availabilityLines.join("\n")}\n\nFor any topic marked UNAVAILABLE: do NOT invent specific figures, program names, percentages, eligibility criteria, named clients, or named partners. Use general guidance (e.g. "review the relevant federal grant programs") rather than naming specifics you cannot verify from the provided data. NEVER invent client relationships, partnerships, or past customers that are not explicitly listed in the enriched company profile.`;

    // ── User priority directive (report_focus) ───────────────────────────
    // The user's "what matters most" answer. The original "lead with it"
    // directive made EVERY section open with the same key-question framing —
    // a CreditLogic report had five sections opening with the identical
    // "To succeed in the Australian market, X must navigate…" sentence. The
    // executive summary now answers the question head-on in a dedicated
    // closing subsection (template change); other sections address it in
    // the body with section-specific openings.
    const focusNote = reportFocus
      ? `\n\nUSER'S STATED PRIORITY (what they most want from this report): "${reportFocus}". Treat this as the single most important outcome for the reader. Where this section can materially advance that priority, address it concretely and specifically for ${intake.company_name} within the body of the section. Do NOT open the section by restating this priority or the overall market opportunity — the Executive Summary already answers it in a dedicated subsection; give this section its own opening that gets straight to its specific job. Do not force the priority where genuinely irrelevant.`
      : "";

    // ── Under-used inputs surfaced to EVERY section (challenges, revenue, headcount) ──
    // Previously key_challenges reached only the executive summary, and revenue_stage /
    // employee_count reached nothing. Give every section the full company picture.
    const contextBits = [
      `${intake.company_name} — ${intake.company_stage || "stage not specified"}`,
      revenueStage ? `${revenueStage} revenue` : "",
      intake.employee_count ? `${intake.employee_count} employees` : "",
      `from ${intake.country_of_origin}`,
    ].filter(Boolean).join(", ");
    const challengesText = (intake.key_challenges || "").trim();
    const companyContextNote = `\n\nCOMPANY CONTEXT (weave in where relevant to this section): ${contextBits}.${challengesText ? ` Stated challenges to address: ${challengesText}.` : ""}`;

    // Phase C (RQ ref fb82483e): one canonical set of market metrics for the whole report,
    // so sections can't cite contradicting market-size / value figures. Pulled from the single
    // landscape extraction (keyMetrics) and injected into every section's system prompt.
    const metricsNote = keyMetrics.length
      ? `\n\nCANONICAL MARKET FIGURES (single source of truth for the whole report): ${keyMetrics.map((m) => `${m.label}: ${m.value}${m.context ? ` (${m.context})` : ""}`).join("; ")}. When you reference market size, value, growth rate, or similar metrics, use ONLY these exact figures — do NOT invent different numbers or let sections contradict one another. If a needed figure is not listed here, give qualitative guidance rather than a fabricated number.`
      : "";
    // Anti-repetition (CreditLogic review): the canonical figures rule stopped
    // sections CONTRADICTING each other but left them all RESTATING the same
    // market-size number — "US$11.51B" appeared 7 times across one report. The
    // reader sees these figures in the Key Metrics panel and the Executive
    // Summary; every other section should reach for them only when the point
    // being made needs the number. Appended to every section except the
    // executive summary (which legitimately states the opportunity size).
    const metricsRepeatNote = keyMetrics.length
      ? `\n\nThese canonical figures are already displayed to the reader in the Key Metrics panel and the Executive Summary. Do NOT re-quote market-size / market-value / CAGR figures in this section unless the specific point being made requires the number, and never open the section with them.`
      : "";

    // Phase C (RQ ref 7a000874): when the user's stated priority is an explicit home-vs-
    // Australia comparison, instruct sections (esp. SWOT + action plan) to contrast the two
    // markets using the provided research rather than describing Australia in isolation.
    const wantsComparison = /\b(compare|comparison|versus|vs\.?|benchmark|home market|against)\b/i.test(reportFocus);
    const comparisonNote = wantsComparison
      ? `\n\nHOME-MARKET COMPARISON: The user explicitly wants a comparison between their home market (${intake.country_of_origin}) and Australia. Where relevant — especially in the SWOT analysis and action plan — explicitly contrast home-market vs Australian conditions (regulatory, cost of doing business, procurement / go-to-market, and competitive intensity), grounded in the provided market research and bilateral-trade data. Do not invent home-market figures you cannot support.`
      : "";

    // Competitor-depth surfacing (only when FIRECRAWL_COMPETITOR_DEPTH ran, so the
    // au_presence signal actually exists in the data). Deep mode discovers up to 5
    // competitors and extracts a per-competitor Australian-footprint signal, but the
    // section prompt didn't require surfacing all of them or the AU signal — so the
    // polish pass was trimming to ~3 and burying au_presence in prose (Floats report:
    // 5 found, 3 shown, no explicit AU line). Force full coverage + a labelled AU line
    // per competitor, grounded strictly in the provided data (no guessing). Applied
    // only to competitor_landscape via the section guard on systemContent below.
    const competitorDepthNote = (competitorResult.competitor_depth && competitorResult.competitors.length > 0)
      ? `\n\nCOMPETITOR COVERAGE (this section): The competitor data provided lists ${competitorResult.competitors.length} competitors. Cover EVERY one of them — do not trim, merge, or silently drop any to shorten the section. For EACH competitor, include a distinct labelled line "**Australian presence:**" describing their AU footprint using ONLY the provided data (local office/address, AU customers or case studies, a .com.au domain, AU pricing). If the provided data indicates none is evident, write "No Australian presence evident". Never guess, infer, or invent an Australian presence that is not in the data.`
      : "";
    // Competitor prose links (Floats2 review item 1): the competitor JSON carries a
    // "url" per competitor but the prompt never asked the model to link the names, so
    // the reader got named rivals with no way to visit them (links lived only on the
    // cards). Instruct hyperlinking the FIRST mention using ONLY the provided url —
    // renders as a new-tab external link via CitationRenderer.
    const competitorLinkNote = competitorResult.competitors.length > 0
      ? `\n\nCOMPETITOR LINKS (this section): The competitor data includes a "url" field for many competitors. The FIRST time you name each competitor in the prose, hyperlink it in Markdown as [Competitor Name](url) using ONLY the exact url provided for that competitor in the data. If a competitor has no url in the data, leave its name as plain text — never invent, guess, or reuse another competitor's URL.`
      : "";

    // Phase C (RQ refs 3f27c7ed / 340c7245): the providers list may include trade/government
    // agencies and innovation hubs/accelerators alongside private firms — make sure they're
    // covered in prose, not just listed as cards. Applied only to the providers section.
    const supportMixNote = hasAgencyOrInnovation
      ? `\n\nSUPPORT MIX: The matched providers for this report include government/trade agencies and/or innovation hubs & accelerators as well as private service providers. Group them by type (e.g. "Government & trade support", "Innovation & accelerators", "Private providers") and explain each one's specific role for ${intake.company_name} — do not omit the agencies or hubs.`
      : "";

    // Lead-list empty state (Floats2 review N3): when the ICP gate leaves NO matched
    // lead datasets, the model previously free-ranged into naming specific investors /
    // VCs / angel funds not in the directory and quoted uncited ecosystem figures —
    // breaking grounding and duplicating the Investor section. Force a short, honest
    // section: no invented recommendations, no uncited numbers, point at the request
    // box (rendered directly below the section).
    // Buyer briefs v1 ("Your First Customers" — inside action_plan, no gating change):
    // per-account briefs from the buyer scrape + batched account research, with the
    // parsed ICP one-liner finally driving "who to approach" titles. Empty note when
    // no chips were given.
    const parsedIcp = parseIcpDescription(targetCustomerDescription);
    const buyerBriefsNote = buildBuyerBriefsNote(
      endBuyerScrapeResult || [], parsedIcp, intake.company_name, endBuyerAccountResearch,
      (intake.end_buyers || []).length,
    );
    const buyerCards = buildBuyerCards(endBuyerScrapeResult || []);

    const leadEmptyNote = (matches.leads || []).length === 0
      ? `\n\nNO MATCHED LEAD DATASETS (this section): The directory returned NO lead datasets matching this company's buyer profile. Keep this section SHORT and honest (2–4 sentences): state that no pre-built list matched their specific buyer profile and that they can request a custom list built for them (a request form appears directly below this section). Do NOT name or recommend specific investors, VCs, angel groups, accelerators, funds, or companies here — those are covered in other sections and naming un-provided ones is not grounded. Do NOT cite market-size, ecosystem-value, or funding figures that are not in the canonical figures list.`
      : "";

    // Lead-list SCOPE guard (Daon review): the lead_list section must be ONLY
    // about the purchasable lead datasets in {{matched_leads_json}} + the custom-
    // list request box. When few datasets match, the model padded the section
    // with industry communities, events, accelerators, service providers and
    // mentors — all of which have their OWN sections — producing a duplicated
    // "networking strategy" under the Lead List heading (Daon: 1 lead card, prose
    // covering Cyber West / AISA / FinTechWA / Austrade / West Tech Fest). This is
    // amplified when report_focus pulls toward communities ("find relevant
    // industry communities"), because focusNote is injected into every section.
    // Applied on EVERY lead_list run (not just the empty case) to hold the line.
    const leadScopeNote = `\n\nSTRICT SCOPE (this section only): Write ONLY about the pre-built lead datasets provided in the matched leads data above, and the option to request a custom-built list (a request form renders directly below this section). Do NOT discuss, list, or recommend industry communities, associations, networks, events, conferences, accelerators, incubators, co-working spaces, service providers, government/trade agencies, mentors, or investors — every one of those has its OWN dedicated section elsewhere in this report, and repeating them here duplicates the report. If the user's stated priority points toward communities or networking, do NOT satisfy it here — the relevant sections already do. If no dataset matches a given need, say so briefly and point to the custom-list request rather than substituting other entity types.`;

    // D2: emphasise (never hide) the sections the user's selected goals map to.
    const prioritisedSections = new Set(goalsToPrioritisedSections({ goal_ids: (intake as any).goal_ids }));

    // Key-question "who can help" picks (Floats feedback): pick up to 2 entities
    // FROM THE ALREADY-MATCHED SLATE most able to help with the user's stated
    // priority, rendered as cards under the exec-summary answer. Grounded (picks
    // are matched rows only) and fail-open (no focus / no picks → renders as
    // before). Computed once here; the exec-summary section attaches the cards.
    let keyQuestionPicks: PickCard[] = [];
    if (reportFocus) {
      try {
        const candidates = buildPickCandidates(matches);
        if (candidates.length > 0) {
          const pickContext = [
            `${intake.company_name || "The company"} — ${(intake.industry_sector || []).join(" / ") || "sector not specified"}`,
            `${intake.company_stage || "stage n/a"}, from ${intake.country_of_origin || "unknown"}, entering ${(intake.target_regions || []).join(", ") || "Australia"}`,
            enrichedSummary ? `Profile: ${String(enrichedSummary).slice(0, 400)}` : "",
          ].filter(Boolean).join(". ");
          const aiText = await callAI(lovableKey, [
            { role: "system", content: "You are a sharp market-entry advisor. Return only valid JSON, no markdown fences." },
            { role: "user", content: buildPicksPrompt(reportFocus, pickContext, candidates) },
          ], "google/gemini-3-flash-preview", { temperature: 0.2 });
          keyQuestionPicks = buildPickCards(matches, parsePicks(aiText, candidates));
          if (keyQuestionPicks.length > 0) {
            console.log(`key-question picks: ${keyQuestionPicks.length} (${keyQuestionPicks.map((p) => p.name).join(", ")})`);
          }
        }
      } catch (e) { console.error("key-question picks failed (continuing):", e); }
    }

    // Phase 5: practitioner signal from the synced LinkedIn corpus (synthesis-only).
    // Computed once and injected into every section's system prompt under a strict
    // provenance guardrail. Best-effort: failure leaves reports exactly as before.
    let synthesisSignalNote = "";
    try {
      const linkedInSignal = await fetchLinkedInSignal(supabase, intake);
      if (linkedInSignal) {
        synthesisSignalNote = `\n\nPRACTITIONER SIGNAL (BACKGROUND ONLY — STRICT RULES): Below are anonymised excerpts from recent public posts by Australian market-entry practitioners and founders, provided purely as situational awareness. Use them ONLY to inform themes, framing, and what currently matters in-market. You MUST: (a) abstract and combine ideas in your own words; (b) NEVER reproduce any excerpt verbatim or near-verbatim; (c) NEVER quote them or wrap their wording in quotation marks; (d) NEVER attribute any statement to a named person, company, or post; (e) NEVER cite or list them as a source. Treat them as uncited background, not evidence.\n${linkedInSignal}`;
      }
    } catch (e) {
      console.error("linkedin synthesis signal failed", e);
    }

    if (templates && templates.length > 0) {
      // Generate ALL sections in a single parallel batch (was batches of 3).
      // (P0-3) Sections gated above the user's tier are STILL generated and
      // stored with `visible: false`. The frontend reads `visible` to gate
      // display, so an upgrade unlocks the content inline — the user never
      // needs to regenerate. Previously gated sections were stored with
      // empty content, which forced a full regeneration after every upgrade.
      console.log(`Generating ${templates.length} sections in single parallel batch (P0-3: gated content stored hidden)...`);
      const sectionStartTime = Date.now();

      const results = await Promise.allSettled(
        templates.map(async (tmpl: any) => {
          const requiredTierIndex = tierHierarchy.indexOf(tmpl.visibility_tier);
          const willBeVisible = requiredTierIndex === -1 || userTierIndex >= requiredTierIndex;
          // D2: the user explicitly selected a goal that this section addresses.
          const emphasisNote = prioritisedSections.has(tmpl.section_name)
            ? `\n\nPRIORITISED SECTION: the user explicitly selected a goal that this section addresses, so it is one of the outcomes they most want. Make it especially specific, concrete and actionable — lead with the highest-value, most directly useful recommendations (stay within the length budget above).`
            : "";

          // Drop empty {{#var}}...{{/var}} blocks (incl. stringified-empty JSON "[]"/"{}"),
          // then substitute {{key}} values. See promptTemplate.ts.
          const prompt = renderTemplate(tmpl.prompt_body, variables);

          try {
            const personaContext = persona === "startup"
              ? "\n\nPERSONA CONTEXT: This report is for an Australian startup seeking to grow and scale domestically. Focus on: fundraising landscape, investor matching, accelerator/incubator programs, government grants and R&D tax incentives, growth-stage hiring, market sizing/TAM data, founder networks, and scaling strategy within the existing Australian market. The company is already based in Australia — do NOT focus on market entry logistics like visas or entity setup."
              : "\n\nPERSONA CONTEXT: This report is for an international company entering the ANZ market from overseas. Focus on: regulatory compliance, entity setup, visa requirements, cultural and business practice differences, bilateral trade advantages, service provider matching for market entry support, trade agencies, and go-to-market strategy for a company with no existing Australian presence.";

            const systemContent = `You are Market Entry Secrets AI, an expert consultant helping companies succeed in the Australian market. Write professional, actionable content grounded in real data when available. Use Australian English spelling (organisation, labour, recognise, analyse). Use Markdown formatting: use ### for subsections, **bold** for emphasis, bullet points for lists, and numbered lists for steps.${focusNote}${companyContextNote}

PRESENTATION & FORMATTING (applies to every section):
- HYPERLINKS: When you name a specific matched entity (service provider, mentor, trade/government agency, accelerator or innovation hub, investor, or event) that includes a "website" value in the data provided to you, format its name as a Markdown link to that exact URL — wrap the name in square brackets followed by the real URL in parentheses. Do the same for any grant program, regulator, or source in the provided research that carries a real URL. Use ONLY real URLs copied verbatim from the provided data — never invent, guess, shorten, or use a placeholder/example domain. If no URL is provided for something, leave its name as plain text.
- LENGTH: Aim for roughly 250-550 words for this section; never exceed ~800 words. Be concise and high-signal.
- READABILITY: Keep every paragraph under ~120 words — split longer thoughts into multiple short paragraphs or a bullet list. Keep sentences under ~25 words on average. No walls of text.
- NO PLACEHOLDERS: Never output placeholder text such as "TBD", "TODO", "[insert ...]", lorem ipsum, or bracketed instructions. If a fact is unavailable, omit it or give general guidance instead.

${citationInstruction}${personaContext}${availabilityNote}${emphasisNote}${synthesisSignalNote}${metricsNote}${tmpl.section_name === "executive_summary" ? "" : metricsRepeatNote}${comparisonNote}${tmpl.section_name === "service_providers" ? supportMixNote : ""}${tmpl.section_name === "competitor_landscape" ? competitorDepthNote + competitorLinkNote : ""}${tmpl.section_name === "lead_list" ? leadScopeNote + leadEmptyNote : ""}${tmpl.section_name === "first_customers" ? buyerBriefsNote : ""}`;

            const content = await callAI(lovableKey, [
              { role: "system", content: systemContent },
              { role: "user", content: prompt },
            ], "google/gemini-3-flash-preview", { temperature: 0.4 });

            // competitor_landscape has no directory pool — its prose names the
            // scraped competitors, so render THOSE as cards (B7) instead of the
            // empty getMatchesForSection default, keeping prose and cards aligned.
            // executive_summary likewise has no pool, but when the user gave a key
            // question we attach up to 2 grounded "who can help" picks under the
            // answer (Floats feedback) with a short lead-in line above them.
            let sectionMatches: any[];
            let sectionContent = content;
            if (tmpl.section_name === "competitor_landscape") {
              sectionMatches = buildCompetitorCards(competitorResult.competitors);
            } else if (tmpl.section_name === "first_customers") {
              // v2: the named target accounts render as cards under the dedicated
              // Your First Customers section (empty when no chips were given).
              sectionMatches = buyerCards;
            } else if (tmpl.section_name === "executive_summary" && keyQuestionPicks.length > 0) {
              sectionMatches = keyQuestionPicks;
              sectionContent = `${content}\n\n**Who from your matches can help with this:**`;
            } else {
              sectionMatches = getMatchesForSection(tmpl.section_name, matches);
            }

            return {
              name: tmpl.section_name,
              data: {
                content: sectionContent,
                visible: willBeVisible,
                matches: sectionMatches,
              },
            };
          } catch (e) {
            console.error(`Failed to generate ${tmpl.section_name}:`, e);
            return {
              name: tmpl.section_name,
              data: { content: "", visible: false },
            };
          }
        })
      );

      for (const result of results) {
        if (result.status === "fulfilled" && result.value) {
          sections[result.value.name] = result.value.data;
          // Track every section that produced content, regardless of gating.
          // `sections_generated` now means "sections the user can unlock by
          // upgrading" rather than "sections currently visible".
          if (result.value.data.content && result.value.data.content.trim().length > 0) {
            sectionsGenerated.push(result.value.name);
          }
        }
      }

      console.log(`Section generation: ${sectionsGenerated.length} sections in ${Date.now() - sectionStartTime}ms (single batch)`);
    }

    // 7. Assemble and store report BEFORE polish pass (critical: ensures report is saved even if worker dies)
    const sectionOrder = templates ? templates.map((t: any) => t.section_name) : Object.keys(sections);

    const buildReportJson = (currentSections: Record<string, any>, polishApplied: boolean) => {
      // Citation integrity (B11/B15): renumber inline [N] markers to a contiguous
      // 1..M and store only the actually-cited sources, so inline indices and the
      // Sources footer are 1:1 (no more "[1][2][3][6][9]" against "Sources (19)").
      // Pure + no-op when nothing is cited; runs on both the unpolished and
      // polished builds so each stored snapshot is internally consistent.
      // stripContextLabelCitations first: removes "[Cost of Business Data]"-style
      // pseudo-citations of named context variables before the numeric remap.
      // keyMetrics passed too: metric cards carry [N] markers from the same
      // original source list and render ABOVE the sections — without renumbering
      // them alongside, a metric's [4] points at the wrong row of the new
      // Sources list (Infact report: metrics [4] vs prose [9] for one fact).
      const cited = renumberCitations(
        stripContextLabelCitations(currentSections),
        sectionOrder,
        marketResearch.citations,
        keyMetrics,
      );
      return {
      company_name: intake.company_name,
      sections: cited.sections,
      matches,
      metadata: {
        tables_searched: Object.keys(matches),
        total_matches: Object.values(matches).reduce((sum: number, arr: any) => sum + (Array.isArray(arr) ? arr.length : 0), 0),
        generation_time_ms: Date.now() - startTime,
        perplexity_used: marketResearch.used,
        perplexity_health: marketResearch.health,
        perplexity_citations: cited.citations,
        // Accurate now: true only when the scrape produced usable content, not
        // merely when Firecrawl was attempted (the fallback profile is truthy).
        // Distinguishes a real scrape from a key/quota failure or a no-content site.
        firecrawl_deep_scrape: companyScrapeDiag?.scrape_ok ?? false,
        // Granular breakdown for diagnosing scrape quality (map URLs, key pages,
        // content size, fallback). null when Firecrawl wasn't attempted.
        firecrawl_deep_scrape_detail: companyScrapeDiag,
        // Plumbing health + per-report op/credit accounting across ALL Firecrawl
        // calls (company scrape, provider enrichment, competitors, end buyers,
        // events). Mirrors perplexity_health: succeeded:0 with a non-empty
        // statuses array = the API is rejecting us (key/quota), not "no data".
        // `ops` is the total Firecrawl call count for cost visibility.
        firecrawl_health: firecrawlStats,
        firecrawl_providers_enriched: (matches.service_providers || []).filter((p: any) => p.enriched_description).length,
        firecrawl_competitors_found: competitorResult.competitors.length,
        // Whether the FIRECRAWL_COMPETITOR_DEPTH flag was ON for this report
        // (multi-angle discovery + au_presence signal). Persisted so the flag
        // state is verifiable from telemetry — the count above alone can't
        // distinguish a deep run from a lucky legacy run.
        competitor_depth: competitorResult.competitor_depth ?? false,
        // LLM relevance curation (MATCH_RERANK_ENABLED): null when the flag is off,
        // else { applied, dropped: {table: n}, dropped_count } so the effect is
        // verifiable per report. `applied:false` = the LLM reply failed to parse
        // (fail-open, zero drops).
        match_rerank: matchRerankInfo,
        // Taxonomy telemetry: per selected goal, how many matched rows carry one of
        // the goal's service tags. A goal that logs 0 across reports has dead tags
        // (vocabulary drift) — observable here because a unit test cannot assert
        // live-DB vocabulary.
        goal_tag_hits: countGoalTagHits((intake as any).goal_ids, matches),
        // Buyer-briefs v1 observability: chips given vs briefed vs unverified, and
        // whether the batched account research came back. A consistently-zero
        // signals count = the tech/hiring extraction isn't finding evidence.
        buyer_briefs: {
          chips: (intake.end_buyers || []).length,
          briefed: (endBuyerScrapeResult || []).filter((b: any) => !b.unverified).length,
          unverified: (endBuyerScrapeResult || []).filter((b: any) => b.unverified).length,
          with_tech: (endBuyerScrapeResult || []).filter((b: any) => (b.tech_signals || "").trim()).length,
          with_hiring: (endBuyerScrapeResult || []).filter((b: any) => (b.hiring_signals || "").trim()).length,
          account_research: !!endBuyerAccountResearch,
          icp_titles: parsedIcp.titles,
        },
        polish_applied: polishApplied,
        // Renumbered alongside the sections so metric-card [N]s and the stored
        // Sources list stay 1:1 (falls back to the originals when no citations).
        key_metrics: cited.keyMetrics ?? keyMetrics,
        discovered_events_count: discoveredEvents.length,
        end_buyer_research_available: !!endBuyerProcurementResearch,
        bilateral_trade_available: !!marketResearch.bilateral_trade,
        cost_of_business_available: !!marketResearch.cost_of_business,
        grants_available: !!marketResearch.grants,
      },
      };
    };

    // Save immediately with unpolished content — report is now viewable.
    // This protects against worker death between generation and polish: the
    // report is durably stored even if the polish step crashes.
    const reportJson = buildReportJson(sections, false);

    const { error: reportErr } = await supabase
      .from("user_reports")
      .update({
        tier_at_generation: userTier,
        report_json: reportJson,
        sections_generated: sectionsGenerated,
        status: "completed",
      })
      .eq("id", reportId);

    if (reportErr) throw reportErr;

    // Best-effort: mirror key metadata into queryable columns (migration
    // 20260628210003). Deliberately a SEPARATE update from the critical save
    // above so a missing column (deploy lag) or write error can never fail report
    // generation — the report is already durably stored at this point.
    try {
      await supabase.from("user_reports").update({
        generation_time_ms: Date.now() - startTime,
        total_matches: Object.values(matches).reduce((sum: number, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0),
        firecrawl_ops: firecrawlStats.ops,
        firecrawl_scrape_ok: companyScrapeDiag?.scrape_ok ?? false,
        perplexity_ok: marketResearch.health.succeeded > 0,
        polish_applied: false,
      }).eq("id", reportId);
    } catch (e) {
      console.warn("user_reports metadata columns update skipped:", e instanceof Error ? e.message : e);
    }

    await supabase.from("user_intake_forms").update({ status: "completed" }).eq("id", intakeFormId);

    console.log(`Report ${reportId} saved (unpolished) in ${Date.now() - startTime}ms`);

    // 7b. Polish pass — best-effort improvement, given a more generous timeout
    // (45s, up from 30s) and a single retry. Email is sent AFTER polish so
    // users don't open the link to an unpolished draft. If polish fails the
    // unpolished report is still emailed — better than not emailing at all.
    let polishApplied = false;
    const POLISH_TIMEOUT_MS = 45000;
    const runPolishOnce = async (): Promise<Record<string, any>> => {
      let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
      try {
        return await Promise.race([
          polishReport(lovableKey, sections, sectionOrder),
          new Promise<never>((_, reject) => {
            timeoutHandle = setTimeout(
              () => reject(new Error(`Polish timeout (${POLISH_TIMEOUT_MS / 1000}s)`)),
              POLISH_TIMEOUT_MS,
            );
          }),
        ]);
      } finally {
        // Clear the timer whether polish resolved or rejected — otherwise
        // a fast polish keeps an idle timer alive for the rest of the
        // background task budget.
        if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
      }
    };

    try {
      let polishedSections: Record<string, any>;
      try {
        polishedSections = await runPolishOnce();
      } catch (firstErr) {
        console.warn("Polish pass first attempt failed — retrying once:", firstErr instanceof Error ? firstErr.message : firstErr);
        polishedSections = await runPolishOnce();
      }

      // Polish succeeded — update report with polished content
      for (const [name, data] of Object.entries(polishedSections)) {
        sections[name] = data;
      }

      const polishedReportJson = buildReportJson(sections, true);

      await supabase
        .from("user_reports")
        .update({ report_json: polishedReportJson })
        .eq("id", reportId);

      // Best-effort: keep the queryable polish_applied column in sync (separate
      // from the report_json write above so a missing column never loses polish).
      try {
        await supabase.from("user_reports").update({ polish_applied: true }).eq("id", reportId);
      } catch (e) {
        console.warn("user_reports polish_applied column update skipped:", e instanceof Error ? e.message : e);
      }

      polishApplied = true;
      console.log(`Report ${reportId} polished and updated in ${Date.now() - startTime}ms`);
    } catch (e) {
      console.warn("Polish pass skipped after retry (report stays unpolished):", e instanceof Error ? e.message : e);
    }

    // 7c. Send report completion email — AFTER polish so the user's first
    // view shows the polished prose. If polish failed, we still send the
    // email (the unpolished report is genuinely usable; silence would be
    // worse than a slightly rough draft).
    try {
      if (intake.user_id) {
        const { data: userData } = await supabase.auth.admin.getUserById(intake.user_id);
        if (userData?.user?.email) {
          const frontendUrl = Deno.env.get("FRONTEND_URL") || "https://marketentrysecrets.com";
          await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-internal-secret": Deno.env.get("EMAIL_INTERNAL_SECRET")!,
            },
            body: JSON.stringify({
              email_type: "report_completed",
              recipient_email: userData.user.email,
              user_id: intake.user_id,
              data: {
                first_name: userData.user.user_metadata?.first_name || "there",
                company_name: intake.company_name,
                report_id: reportId,
                report_url: `${frontendUrl}/report/${reportId}`,
              },
            }),
          });
        }
      }
    } catch (emailErr) {
      console.warn("Failed to send report completion email (non-blocking):", emailErr);
    }

    console.log(`Report ${reportId} fully done (polish_applied=${polishApplied}) in ${Date.now() - startTime}ms`);
  } catch (e) {
    console.error("Background report generation failed:", e);

    // Update report status to failed
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, serviceKey);

      await supabase
        .from("user_reports")
        .update({
          status: "failed",
          report_json: { error: e instanceof Error ? e.message : "Report generation failed" },
        })
        .eq("id", reportId);

      await supabase
        .from("user_intake_forms")
        .update({ status: "failed" })
        .eq("id", intakeFormId);
    } catch (updateErr) {
      console.error("Failed to update report status:", updateErr);
    }
  }
}

// ── Main handler ───────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const origin = req.headers.get("origin") ?? "(no origin)";
  const corsHeaders = buildCorsHeaders(req);

  if (req.method === "OPTIONS") {
    console.log(`[CORS] OPTIONS preflight from origin: ${origin} → Allow-Origin: ${corsHeaders["Access-Control-Allow-Origin"]}`);
    return new Response(null, { headers: corsHeaders });
  }

  console.log(`[generate-report] ${req.method} request from origin: ${origin}`);

  try {
    const { intake_form_id } = await req.json();
    if (!intake_form_id) throw new Error("intake_form_id is required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // ── Authentication & ownership check ──────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch intake form to get user_id
    const { data: intake, error: intakeErr } = await supabase
      .from("user_intake_forms")
      .select("user_id")
      .eq("id", intake_form_id)
      .single();

    if (intakeErr || !intake) throw new Error("Intake form not found");

    // Verify the authenticated user owns this intake form
    if (intake.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Rate limiting: max 5 reports per 60 minutes per user ─────────
    const rateLimitError = await checkRateLimit(user.id, "generate-report", 5, 60);
    if (rateLimitError) {
      return new Response(
        JSON.stringify({ error: rateLimitError }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Pre-create the report row with "processing" status.
    // Check for an existing processing report to prevent duplicates from rapid clicks.
    const { data: existingReport } = await supabase
      .from("user_reports")
      .select("id")
      .eq("user_id", intake.user_id)
      .eq("intake_form_id", intake_form_id)
      .eq("status", "processing")
      .maybeSingle();

    if (existingReport) {
      log("generate-report", "Report already processing for this intake form", {
        reportId: existingReport.id,
        intakeFormId: intake_form_id,
      });
      return new Response(
        JSON.stringify({ report_id: existingReport.id, status: "processing" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: report, error: reportErr } = await supabase
      .from("user_reports")
      .insert({
        user_id: intake.user_id,
        intake_form_id,
        tier_at_generation: "free",
        report_json: {},
        sections_generated: [],
        status: "processing",
      })
      .select("id")
      .single();

    if (reportErr) throw reportErr;

    const reportId = report.id;

    // Kick off background processing — does NOT block the response
    // @ts-ignore: EdgeRuntime.waitUntil is available in Supabase Edge Functions
    EdgeRuntime.waitUntil(
      generateReportInBackground(intake_form_id, reportId).catch((err) => {
        console.error("Unhandled error in background report generation:", err);
      })
    );

    console.log(`Report ${reportId} queued for background generation`);

    // Return immediately with the report ID
    return new Response(
      JSON.stringify({ report_id: reportId, status: "processing" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-report error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Report generation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
