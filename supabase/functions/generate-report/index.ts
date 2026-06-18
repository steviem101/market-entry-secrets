import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/http.ts";
import { log } from "../_shared/log.ts";
import { isPrivateOrReservedUrl } from "../_shared/url.ts";
import { checkRateLimit } from "../_shared/rateLimit.ts";
import { sanitizeScrapedContent } from "../_shared/sanitize.ts";
import { expandGoalsToServiceTags, goalsToPrioritisedSections } from "./goalServiceTags.ts";
import { industryGroupsToSectorSlugs } from "./sectorTaxonomy.ts";
import { normalizeCountry, isInternationalOrigin } from "./countryNormalize.ts";
import { SEMANTIC_CFG, buildMatchQueryText, groupRankedBySource } from "./semanticMatch.ts";
import { scoreAndSort, selectTopN, withMatchMeta, mergeAndRerank, normalizePersonName, type MatchContext, type ScoreOpts, type SelectOpts } from "./matchScoring.ts";

// ── Firecrawl helpers ──────────────────────────────────────────────────

/** Scrape a single URL with a timeout. Returns markdown or null. */
async function firecrawlScrape(
  apiKey: string,
  url: string,
  timeoutMs = 10000
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    if (isPrivateOrReservedUrl(formattedUrl)) return null;

    const resp = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url: formattedUrl, formats: ["markdown"], onlyMainContent: true }),
      signal: controller.signal,
    });

    if (!resp.ok) return null;

    const data = await resp.json();
    const md = data.data?.markdown || data.markdown || null;
    return md ? sanitizeScrapedContent(md) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Use Firecrawl Map to discover URLs on a website. Returns array of URLs. */
async function firecrawlMap(
  apiKey: string,
  url: string,
  timeoutMs = 5000
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

    if (!resp.ok) return [];

    const data = await resp.json();
    return data.links || [];
  } catch {
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
  timeoutMs = 15000
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

    if (!resp.ok) return [];

    const data = await resp.json();
    return (data.data || []).map((r: any) => ({
      url: r.url || "",
      title: r.title || "",
      description: r.description || "",
      markdown: sanitizeScrapedContent((r.markdown || ""), 1500),
    }));
  } catch {
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
async function resolveDomainFromName(apiKey: string, name: string): Promise<string> {
  if (!apiKey || !name.trim()) return "";
  try {
    const results = await firecrawlSearch(apiKey, `${name} official website`, 1, 8000);
    const url = results[0]?.url || "";
    if (!url) return "";
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// ── Enhancement 3: Deep company scrape (map + multi-page) ─────────────

const KEY_PAGE_PATTERNS = [
  /about/i, /product/i, /service/i, /solution/i,
  /team/i, /case.?stud/i, /client/i, /partner/i,
];

function isKeyPage(url: string): boolean {
  return KEY_PAGE_PATTERNS.some((p) => p.test(url));
}

interface EnrichedCompanyProfile {
  summary: string;
  industry: string;
  maturity: string;
  products: string[];
  key_clients: string[];
  team_size_indicators: string;
  unique_selling_points: string[];
}

async function enrichCompanyDeep(
  firecrawlKey: string,
  lovableKey: string,
  websiteUrl: string,
  companyName: string,
  fallbackSummary: string
): Promise<{ profile: EnrichedCompanyProfile; enrichedSummary: string }> {
  const defaultProfile: EnrichedCompanyProfile = {
    summary: fallbackSummary,
    industry: "",
    maturity: "",
    products: [],
    key_clients: [],
    team_size_indicators: "",
    unique_selling_points: [],
  };

  try {
    const [allUrls, homepageMarkdown] = await Promise.all([
      firecrawlMap(firecrawlKey, websiteUrl),
      firecrawlScrape(firecrawlKey, websiteUrl),
    ]);

    console.log(`Map found ${allUrls.length} URLs on ${websiteUrl}`);

    const keyPages = allUrls.filter(isKeyPage).slice(0, 2);
    console.log(`Scraping ${keyPages.length} key pages:`, keyPages);

    const additionalScrapes = await Promise.allSettled(
      keyPages.map((url) => firecrawlScrape(firecrawlKey, url))
    );

    const allContent: string[] = [];
    if (homepageMarkdown) allContent.push(homepageMarkdown);
    for (const result of additionalScrapes) {
      if (result.status === "fulfilled" && result.value) {
        allContent.push(result.value);
      }
    }

    const combinedContent = allContent.join("\n\n---\n\n").slice(0, 2000);

    if (combinedContent.length < 100) {
      console.log("Insufficient website content for deep analysis");
      return { profile: defaultProfile, enrichedSummary: fallbackSummary };
    }

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
    };
  } catch (e) {
    console.error("Deep company enrichment failed (continuing):", e);
    return { profile: defaultProfile, enrichedSummary: fallbackSummary };
  }
}

// ── Enhancement 1: Enrich matched service providers ───────────────────

async function enrichMatchedProviders(
  firecrawlKey: string,
  providers: any[]
): Promise<any[]> {
  if (!firecrawlKey || providers.length === 0) return providers;

  console.log(`Enriching ${providers.length} service providers via Firecrawl...`);
  const startTime = Date.now();

  const enrichmentPromises = providers.map(async (provider) => {
    const providerUrl = provider.website_url || provider.website;
    if (!providerUrl) return provider;

    try {
      const markdown = await firecrawlScrape(firecrawlKey, providerUrl, 10000);
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
}

async function scrapeKnownCompetitors(
  firecrawlKey: string,
  lovableKey: string,
  knownCompetitors: Array<{ name: string; website: string }>,
  companyName: string
): Promise<CompetitorData[]> {
  if (!firecrawlKey || knownCompetitors.length === 0) return [];

  console.log(`Scraping ${knownCompetitors.length} user-provided competitors...`);
  const startTime = Date.now();

  const results = await Promise.allSettled(
    knownCompetitors.map(async (comp) => {
      // Resolve a domain from the name when none was provided (P1.5).
      const website = (comp.website && comp.website.trim())
        ? comp.website
        : await resolveDomainFromName(firecrawlKey, comp.name);
      const markdown = website ? await firecrawlScrape(firecrawlKey, website, 10000) : null;
      if (!markdown || markdown.length < 50) {
        return { name: comp.name, url: website, description: "Website could not be analysed.", key_info: "" };
      }

      try {
        const aiResp = await callAI(lovableKey, [
          { role: "system", content: "You are a competitive intelligence analyst. Return only valid JSON, no markdown fences." },
          {
            role: "user",
            content: `Analyze this website content for "${comp.name}" (${website}), a competitor of "${companyName}".
Return a JSON object: {"name": "${comp.name}", "url": "${website}", "description": "what they do in 1-2 sentences", "key_info": "key differentiators, pricing model, market position, target audience, and notable facts"}

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
  intake: any
): Promise<{ competitors: CompetitorData[]; raw_results: any[] }> {
  const empty = { competitors: [], raw_results: [] };
  if (!firecrawlKey) return empty;

  try {
    const knownCompetitors = intake.known_competitors || [];
    const targetRegions = (intake.target_regions || []).join(", ") || "Australia";
    const industrySectorText = (intake.industry_sector || []).join(", ");
    const query = `${industrySectorText} companies in Australia ${targetRegions} competitors`;

    console.log(`Searching competitors: "${query}" (parallel with known competitor scraping)`);

    // Run known competitor scraping AND web search in parallel
    const [knownResults, results] = await Promise.all([
      scrapeKnownCompetitors(firecrawlKey, lovableKey, knownCompetitors, intake.company_name),
      firecrawlSearch(firecrawlKey, query, 5),
    ]);

    const userDomain = new URL(
      intake.website_url.startsWith("http") ? intake.website_url : `https://${intake.website_url}`
    ).hostname.replace("www.", "");

    const knownDomains = new Set(
      knownCompetitors.map((c: { website: string }) => {
        try { return new URL(c.website.startsWith("http") ? c.website : `https://${c.website}`).hostname.replace("www.", ""); }
        catch { return ""; }
      }).filter(Boolean)
    );

    const filtered = results.filter((r) => {
      try {
        const resultDomain = new URL(r.url).hostname.replace("www.", "");
        return resultDomain !== userDomain && !knownDomains.has(resultDomain);
      } catch {
        return true;
      }
    }).slice(0, 3);

    let searchCompetitorsList: CompetitorData[] = [];
    if (filtered.length > 0) {
      const competitorSummaries = await callAI(lovableKey, [
        { role: "system", content: "You are a competitive intelligence analyst. Return only valid JSON, no markdown fences." },
        {
          role: "user",
          content: `Analyze these search results about ${industrySectorText} companies in Australia. For each, extract competitor intelligence relevant to ${intake.company_name}.

Return a JSON array of objects: [{"name": "Company Name", "url": "website url", "description": "what they do in 1-2 sentences", "key_info": "key differentiators, market position, or notable facts"}]

Search results:
${filtered.map((r, i) => `--- Result ${i + 1} ---\nURL: ${r.url}\nTitle: ${r.title}\nContent: ${r.markdown}`).join("\n\n")}`,
        },
      ]);

      const cleanedResp = competitorSummaries.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      searchCompetitorsList = JSON.parse(cleanedResp) as CompetitorData[];
    }

    const allCompetitors = [...knownResults, ...searchCompetitorsList];

    console.log(`Total competitors: ${allCompetitors.length} (${knownResults.length} known + ${searchCompetitorsList.length} discovered)`);
    return { competitors: allCompetitors, raw_results: filtered };
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
}

async function scrapeEndBuyers(
  firecrawlKey: string,
  lovableKey: string,
  endBuyers: Array<{ name: string; website: string }>,
  companyName: string
): Promise<EndBuyerIntelligence[]> {
  if (!firecrawlKey || endBuyers.length === 0) return [];

  // Cap at 3 end buyers to avoid resource contention in the parallel block
  const cappedBuyers = endBuyers.slice(0, 3);

  console.log(`Scraping ${cappedBuyers.length} end buyer companies (capped from ${endBuyers.length})...`);
  const startTime = Date.now();

  const results = await Promise.allSettled(
    cappedBuyers.map(async (buyer) => {
      // Resolve a domain from the name when none was provided (P1.5).
      const website = (buyer.website && buyer.website.trim())
        ? buyer.website
        : await resolveDomainFromName(firecrawlKey, buyer.name);
      const markdown = website ? await firecrawlScrape(firecrawlKey, website, 8000) : null;
      if (!markdown || markdown.length < 50) {
        return { name: buyer.name, url: website, description: "Website could not be analysed.", key_info: "" };
      }

      try {
        const aiResp = await callAI(lovableKey, [
          { role: "system", content: "You are a B2B procurement and buyer intelligence analyst. Return only valid JSON, no markdown fences." },
          {
            role: "user",
            content: `Analyse this company "${buyer.name}" (${website}) as a POTENTIAL CUSTOMER for "${companyName}".
Return a JSON object: {"name": "${buyer.name}", "url": "${website}", "description": "what this company does and their market position in 1-2 sentences", "key_info": "what they buy/procure, how they select suppliers, partnership programs, supplier requirements, procurement processes, and any opportunities for ${companyName} to sell to them"}

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
  intake: any
): Promise<DiscoveredEvent[]> {
  if (!firecrawlKey) return [];

  const industrySectorText = (intake.industry_sector || []).join(", ");
  const targetRegionsText = (intake.target_regions || []).join(", ") || "Australia";
  const query = `${industrySectorText} conference trade show expo Australia ${targetRegionsText} 2025 2026`;

  console.log(`Discovering external events: "${query}"`);
  const startTime = Date.now();

  try {
    const results = await firecrawlSearch(firecrawlKey, query, 5);
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
    return result.content || "";
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
    const todayIso = new Date().toISOString().slice(0, 10);
    let evQuery = supabase.from("events")
      .select("id, title, slug, date, location, category, type, organizer, sector, sector_tags, sector_agnostic")
      .gte("date", todayIso)
      .limit(CAND);
    evQuery = evQuery.or(buildOr());
    const { data: ev, error: evErr } = await evQuery;
    if (evErr) console.error("Events query error:", evErr);

    // If the user supplied target_regions, hard-filter to events whose
    // location matches at least one region pattern. This stops Melbourne
    // events surfacing for a Sydney/NSW-only company, which the old
    // soft +1 score-bump did not prevent.
    let regionFiltered = ev || [];
    if (locationPatterns.length > 0) {
      regionFiltered = regionFiltered.filter((row: any) => {
        const loc = (row.location || "").toLowerCase();
        return locationPatterns.some((l: string) => loc.includes(l.toLowerCase()));
      });
    }

    let eventResults = rank(regionFiltered, { applySellsTo: true }, 12); // overfetch so dedupe still leaves ~5

    // Title+date+venue dedupe. Many ingested rows are near-duplicates of the
    // same event (4× "Startups & Investors Pitch Night Melbourne" on
    // 2026-06-19 at "The National Hotel, Richmond, Melbourne"). Collapse
    // to one card per (normalized title, date, normalized venue).
    const normalize = (s: string) =>
      (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).slice(0, 6).join(" ");
    const seen = new Set<string>();
    eventResults = eventResults.filter((e: any) => {
      const key = `${normalize(e.title)}|${e.date}|${normalize(e.location)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 5);

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
      subtitle: `${e.date} · ${e.location}`, tags: [e.category, e.type].filter(Boolean),
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

  // Leads — sector + location
  try {
    let ldQuery = supabase.from("leads").select("id, name, industry, location, category, type, price, record_count, provider_name, sector_tags, sector_agnostic").limit(CAND);
    ldQuery = ldQuery.or(buildOr());
    const { data: ld, error: ldErr } = await ldQuery;
    if (ldErr) console.error("Leads query error:", ldErr);
    matches.leads = rank(ld, { applySellsTo: true }, 5).map((l: any) => ({
      ...l, link: "/leads", linkLabel: "View Dataset",
      subtitle: `${l.location} · ${l.record_count || "?"} records`,
      tags: [l.category, l.type].filter(Boolean),
    }));
  } catch (e) { console.error("Leads search error:", e); }

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

  // Trade & investment agencies — sector + country corridor + location (+ agnostic)
  try {
    let taQuery = supabase.from("trade_investment_agencies").select("id, name, slug, location, services, description, website, tagline, target_company_origin, sector_tags, sector_agnostic").limit(CAND);
    taQuery = taQuery.or(buildOr({ service: "services" }));
    const { data: ta, error: taErr } = await taQuery;
    if (taErr) console.error("TIA query error:", taErr);
    matches.trade_investment_agencies = rank(ta, { service: "services", persona: true }, 5).map((a: any) => ({
      ...a, link: a.slug ? `/government-support/${a.slug}` : "/government-support", linkLabel: "View Organisation",
      subtitle: a.location, tags: (a.services || []).slice(0, 3),
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
      subtitle: `${i.investor_type} · ${i.location}`,
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

  const todayIso = new Date().toISOString().slice(0, 10);
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
          if (m.is_active === false || m.is_anonymous === true) return false;
          const n = (m.name || "").toLowerCase();
          if (n.startsWith("anonymous")) return false;
          const key = n.replace(/^(dr|prof|mr|mrs|ms|miss)\.?\s+/i, "").replace(/[^a-z\s]/g, "").trim();
          if (!key || seenNames.has(key)) return false;
          seenNames.add(key);
          return true;
        });
      } else if (tbl === "events") {
        ordered = ordered.filter((e: any) => !e.date || e.date >= todayIso);
      }

      out[tbl] = ordered.slice(0, cfg.cap).map(cfg.decorate);
    } catch (e) { console.error(`semantic hydrate ${tbl} failed`, e); }
  }));
  return out;
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
    case "service_providers": return [
      ...(matches.service_providers || []),
      ...(matches.trade_investment_agencies || []),
      ...(matches.innovation_ecosystem || []),
    ];
    case "mentor_recommendations": return matches.community_members || [];
    case "events_resources": return [...(matches.events || []), ...(matches.content_items || [])];
    case "lead_list": return [...(matches.leads || []), ...(matches.lemlist_contacts || [])];
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

    // Wrap DB matching + provider enrichment into a single parallel task
    const matchesAndEnrichTask = async () => {
      const rawMatches = await searchMatches(supabase, intake);
      // Enrich providers in parallel (was previously sequential after the main block)
      rawMatches.service_providers = await enrichMatchedProviders(
        firecrawlKey,
        rawMatches.service_providers || []
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
    ] = await Promise.all([
      firecrawlKey && intake.website_url
        ? enrichCompanyDeep(firecrawlKey, lovableKey, intake.website_url, intake.company_name, fallbackSummary)
        : Promise.resolve({ profile: null, enrichedSummary: fallbackSummary }),
      runMarketResearch(intake, persona),
      matchesAndEnrichTask(),
      firecrawlKey
        ? searchCompetitors(firecrawlKey, lovableKey, intake)
        : Promise.resolve({ competitors: [], raw_results: [] }),
      firecrawlKey && (intake.end_buyers || []).length > 0
        ? scrapeEndBuyers(firecrawlKey, lovableKey, intake.end_buyers, intake.company_name)
        : Promise.resolve([]),
      researchEndBuyerProcurement(intake),
    ]);

    // Extract key metrics from the landscape response instead of a separate Perplexity call
    const keyMetrics: Array<{ label: string; value: string; context: string }> = [];
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
            keyMetrics.push({ label: clean(m[1]), value: clean(m[2]), context: clean(m[3]) });
          }
        }
        // Remove the KEY METRICS section from landscape text to keep it clean
        marketResearch.landscape = marketResearch.landscape.replace(/\n*(?:KEY METRICS|## KEY METRICS|### KEY METRICS)[\s\S]*$/i, "").trim();
      }
      console.log(`Extracted ${keyMetrics.length} key metrics from landscape query`);
    }

    const enrichedSummary = companyEnrichResult.enrichedSummary;
    const companyProfile = companyEnrichResult.profile;

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
      discoveredEvents = await discoverExternalEvents(firecrawlKey, lovableKey, intake);
    } else {
      console.log(`${internalEventCount} internal events found — skipping external event discovery`);
    }

    // Merge discovered events
    if (discoveredEvents.length > 0) {
      const discoveredEventMatches = discoveredEvents.map((e) => ({
        name: e.name,
        subtitle: `${e.date} · ${e.location}`,
        tags: ["Web Discovery"],
        link: e.url,
        linkLabel: "View Event",
        website: e.url,
        source: "web",
      }));
      matches.events = [...(matches.events || []), ...discoveredEventMatches];
    }

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
    const reportFocus = (intake.report_focus || (rawInput as any).report_focus || (rawInput as any).additional_notes || "").toString().trim();

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
      matched_providers_json: JSON.stringify(matches.service_providers || []),
      matched_mentors_json: JSON.stringify(matches.community_members || []),
      matched_events_json: JSON.stringify(matches.events || []),
      matched_content_json: JSON.stringify(matches.content_items || []),
      matched_leads_json: JSON.stringify(matches.leads || []),
      matched_providers_summary: (matches.service_providers || []).map((p: any) => p.name).join(", ") || "None found",
      matched_lemlist_contacts_json: JSON.stringify(matches.lemlist_contacts || []),
      matched_investors_json: JSON.stringify(matches.investors || []),
      matched_trade_investment_agencies_json: JSON.stringify(matches.trade_investment_agencies || []),
      matched_innovation_ecosystem_json: JSON.stringify(matches.innovation_ecosystem || []),
      competitor_analysis_json: JSON.stringify(competitorResult.competitors),
      known_competitors_json: JSON.stringify(intake.known_competitors || []),
      end_buyer_industries: (intake.end_buyer_industries || []).join(", ") || "Not specified",
      end_buyers_json: JSON.stringify(intake.end_buyers || []),
      end_buyers_scraped_json: JSON.stringify(endBuyerScrapeResult || []),
      end_buyers_analysis_json: JSON.stringify(endBuyerScrapeResult || []),
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
      ? `IMPORTANT — Inline citations: When you reference data, statistics, market figures, regulatory requirements, or factual claims that come from the provided market research, you SHOULD include an inline citation marker using the format [N] where N is an integer from 1 to ${numCitations} (inclusive). These are the ONLY valid source numbers — do NOT invent or use any other number. Place the citation immediately after the relevant claim. For example: "The Australian AI market is projected to reach USD 8.48 billion by 2030 [3]."`
      : `IMPORTANT — Inline citations: Do NOT include any numbered citation markers (e.g. [1], [2], [3]) anywhere in your response. There is no source list to cite for this report.`;

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
    // The user's "what matters most" answer — previously captured and never used.
    // Make every section lead with it where relevant.
    const focusNote = reportFocus
      ? `\n\nUSER'S STATED PRIORITY (what they most want from this report): "${reportFocus}". Treat this as the single most important outcome for the reader. Where this section can advance that priority, lead with it and make those recommendations concrete and specific to ${intake.company_name}. Do not force it where genuinely irrelevant.`
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

    // D2: emphasise (never hide) the sections the user's selected goals map to.
    const prioritisedSections = new Set(goalsToPrioritisedSections({ goal_ids: (intake as any).goal_ids }));

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

          let prompt = tmpl.prompt_body;

          // Process conditional blocks: {{#var}}...{{/var}} — include block only if var is non-empty
          prompt = prompt.replace(
            /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g,
            (_match: string, varName: string, block: string) => {
              const val = variables[varName];
              return val && val.trim() && val !== "Not specified" ? block : "";
            }
          );

          // Simple variable substitution
          for (const [key, value] of Object.entries(variables)) {
            prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
          }

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

${citationInstruction}${personaContext}${availabilityNote}${emphasisNote}`;

            const content = await callAI(lovableKey, [
              { role: "system", content: systemContent },
              { role: "user", content: prompt },
            ], "google/gemini-3-flash-preview", { temperature: 0.4 });

            return {
              name: tmpl.section_name,
              data: {
                content,
                visible: willBeVisible,
                matches: getMatchesForSection(tmpl.section_name, matches),
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

    const buildReportJson = (currentSections: Record<string, any>, polishApplied: boolean) => ({
      company_name: intake.company_name,
      sections: currentSections,
      matches,
      metadata: {
        tables_searched: Object.keys(matches),
        total_matches: Object.values(matches).reduce((sum: number, arr: any) => sum + (Array.isArray(arr) ? arr.length : 0), 0),
        generation_time_ms: Date.now() - startTime,
        perplexity_used: marketResearch.used,
        perplexity_health: marketResearch.health,
        perplexity_citations: marketResearch.citations,
        firecrawl_deep_scrape: !!companyProfile,
        firecrawl_providers_enriched: (matches.service_providers || []).filter((p: any) => p.enriched_description).length,
        firecrawl_competitors_found: competitorResult.competitors.length,
        polish_applied: polishApplied,
        key_metrics: keyMetrics,
        discovered_events_count: discoveredEvents.length,
        end_buyer_research_available: !!endBuyerProcurementResearch,
        bilateral_trade_available: !!marketResearch.bilateral_trade,
        cost_of_business_available: !!marketResearch.cost_of_business,
        grants_available: !!marketResearch.grants,
      },
    });

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
