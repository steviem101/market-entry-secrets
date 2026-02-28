import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const resp = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url: formattedUrl, formats: ["markdown"], onlyMainContent: true }),
      signal: controller.signal,
    });

    if (!resp.ok) return null;

    const data = await resp.json();
    return data.data?.markdown || data.markdown || null;
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
      markdown: (r.markdown || "").slice(0, 1500),
    }));
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
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
      { role: "system", content: "You are an analyst. Return only valid JSON, no markdown fences." },
      {
        role: "user",
        content: `Based on this website content for ${companyName}, provide a JSON object with:
{
  "summary": "3-4 sentence company summary covering what they do, their market position, and key strengths",
  "industry": "standardized industry classification",
  "maturity": "Seed|Growth|Enterprise",
  "products": ["list of main products or services offered"],
  "key_clients": ["notable clients or customer segments mentioned"],
  "team_size_indicators": "any indicators of team size, leadership, or organizational scale",
  "unique_selling_points": ["2-4 key differentiators or competitive advantages"]
}

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
  const enriched = results.map((r) =>
    r.status === "fulfilled" ? r.value : providers[0]
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
      const markdown = await firecrawlScrape(firecrawlKey, comp.website, 10000);
      if (!markdown || markdown.length < 50) {
        return { name: comp.name, url: comp.website, description: "Website could not be analysed.", key_info: "" };
      }

      try {
        const aiResp = await callAI(lovableKey, [
          { role: "system", content: "You are a competitive intelligence analyst. Return only valid JSON, no markdown fences." },
          {
            role: "user",
            content: `Analyze this website content for "${comp.name}" (${comp.website}), a competitor of "${companyName}".
Return a JSON object: {"name": "${comp.name}", "url": "${comp.website}", "description": "what they do in 1-2 sentences", "key_info": "key differentiators, pricing model, market position, target audience, and notable facts"}

Website content:
${markdown.slice(0, 2000)}`,
          },
        ]);
        const cleaned = aiResp.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleaned) as CompetitorData;
      } catch {
        return { name: comp.name, url: comp.website, description: "Could not extract competitor intelligence.", key_info: "" };
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
      const markdown = await firecrawlScrape(firecrawlKey, buyer.website, 8000);
      if (!markdown || markdown.length < 50) {
        return { name: buyer.name, url: buyer.website, description: "Website could not be analysed.", key_info: "" };
      }

      try {
        const aiResp = await callAI(lovableKey, [
          { role: "system", content: "You are a B2B procurement and buyer intelligence analyst. Return only valid JSON, no markdown fences." },
          {
            role: "user",
            content: `Analyse this company "${buyer.name}" (${buyer.website}) as a POTENTIAL CUSTOMER for "${companyName}".
Return a JSON object: {"name": "${buyer.name}", "url": "${buyer.website}", "description": "what this company does and their market position in 1-2 sentences", "key_info": "what they buy/procure, how they select suppliers, partnership programs, supplier requirements, procurement processes, and any opportunities for ${companyName} to sell to them"}

Website content:
${markdown.slice(0, 2000)}`,
          },
        ]);
        const cleaned = aiResp.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleaned) as EndBuyerIntelligence;
      } catch {
        return { name: buyer.name, url: buyer.website, description: "Could not extract buyer intelligence.", key_info: "" };
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
): Promise<{ content: string; citations: string[] }> {
  try {
    const resp = await fetch("https://api.perplexity.ai/chat/completions", {
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
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Perplexity error:", resp.status, text);
      return { content: "", citations: [] };
    }

    const data = await resp.json();
    return {
      content: data.choices?.[0]?.message?.content || "",
      citations: data.citations || [],
    };
  } catch (e) {
    console.error("Perplexity call failed:", e);
    return { content: "", citations: [] };
  }
}

/** Perplexity structured output for extracting key metrics as JSON */
async function callPerplexityStructured(
  apiKey: string,
  query: string,
  schema: Record<string, any>
): Promise<{ content: any; citations: string[] }> {
  try {
    const resp = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "system", content: "Provide precise, data-driven answers with specific numbers and statistics." },
          { role: "user", content: query },
        ],
        search_recency_filter: "year",
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "key_metrics",
            schema,
          },
        },
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Perplexity structured error:", resp.status, text);
      return { content: null, citations: [] };
    }

    const data = await resp.json();
    const raw = data.choices?.[0]?.message?.content || "";
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error("Failed to parse Perplexity structured output:", raw.slice(0, 200));
    }
    return {
      content: parsed,
      citations: data.citations || [],
    };
  } catch (e) {
    console.error("Perplexity structured call failed:", e);
    return { content: null, citations: [] };
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
}

async function runMarketResearch(intake: any): Promise<MarketResearch> {
  const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");
  const empty: MarketResearch = {
    landscape: "", regulatory: "", news: "",
    bilateral_trade: "", cost_of_business: "", grants: "",
    citations: [], used: false,
  };

  if (!perplexityKey) {
    console.log("PERPLEXITY_API_KEY not set — skipping market research");
    return empty;
  }

  const targetRegionsText = (intake.target_regions || []).join(", ") || "Australia";
  const industrySectorText = (intake.industry_sector || []).join(", ");
  const countryOfOrigin = intake.country_of_origin || "international";

  console.log("Running expanded Perplexity market research (6 parallel queries, landscape includes key metrics)...");
  const startTime = Date.now();

  const [landscape, regulatory, news, bilateralTrade, costOfBusiness, grants] = await Promise.allSettled([
    callPerplexity(perplexityKey,
      `${industrySectorText} market size, trends, key players, and growth opportunities in Australia ${targetRegionsText}. Include specific data points, statistics, and market valuations where available.

IMPORTANT: At the end of your response, include a section titled "KEY METRICS" with 4-6 quantitative metrics in this exact format:
- METRIC: [Label] | [Value] | [Context]
For example:
- METRIC: Market Size | $8.48B | 2024 estimate
- METRIC: CAGR | 5.1% | 2024-2030 projected
- METRIC: Active Players | 2,400+ | Registered companies`,
      { model: "sonar-pro" }
    ),
    callPerplexity(perplexityKey,
      `Requirements, regulations, compliance, and licensing for a ${countryOfOrigin} ${industrySectorText} company entering the Australian market. Include visa requirements, tax obligations, legal entity setup, and any industry-specific regulations.`
    ),
    callPerplexity(perplexityKey,
      `Recent news and developments in ${industrySectorText} in Australia in the last 6 months. Focus on market trends, regulatory changes, major deals, and new entrants.`,
      { recency: "month" }
    ),
    callPerplexity(perplexityKey,
      `Trade relationship between ${countryOfOrigin} and Australia in ${industrySectorText}: bilateral agreements, free trade agreements, export statistics, success stories of ${countryOfOrigin} companies entering Australia, trade volumes, and key trade facilitation organisations.`
    ),
    callPerplexity(perplexityKey,
      `Cost of doing business in Australia ${targetRegionsText} for ${industrySectorText}: average office rent per sqm, local salaries for key roles, corporate tax rate, GST obligations, employer superannuation rate, typical setup costs for a foreign company, and any cost comparison with ${countryOfOrigin}.`
    ),
    callPerplexity(perplexityKey,
      `Australian government grants, incentives, R&D tax incentives, landing pad programs, and funding opportunities for international ${industrySectorText} companies from ${countryOfOrigin} setting up in ${targetRegionsText}. Include state-specific programs and eligibility requirements.`
    ),
  ]);

  const result: MarketResearch = {
    landscape: "", regulatory: "", news: "",
    bilateral_trade: "", cost_of_business: "", grants: "",
    citations: [], used: true,
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

  console.log(`Perplexity research completed in ${Date.now() - startTime}ms — ${result.citations.length} citations`);
  return result;
}

// ── Key Metrics extraction via Perplexity structured output ────────────

interface KeyMetric {
  label: string;
  value: string;
  context: string;
}

async function extractKeyMetrics(intake: any): Promise<{ metrics: KeyMetric[]; citations: string[] }> {
  const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");
  if (!perplexityKey) return { metrics: [], citations: [] };

  const industrySectorText = (intake.industry_sector || []).join(", ");
  const targetRegionsText = (intake.target_regions || []).join(", ") || "Australia";

  console.log("Extracting key market metrics via Perplexity structured output...");

  try {
    const result = await callPerplexityStructured(
      perplexityKey,
      `Provide key market metrics for the ${industrySectorText} industry in Australia ${targetRegionsText}. Include: total market size (in AUD or USD), projected CAGR or growth rate, number of active companies/players, key growth drivers, average industry revenue, and any other important quantitative data points. Provide 4-6 metrics with specific numbers.`,
      {
        type: "object",
        properties: {
          metrics: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string", description: "Short metric name, e.g. 'Market Size', 'CAGR', 'Active Players'" },
                value: { type: "string", description: "The metric value, e.g. '$8.48B', '5.1%', '2,400+'" },
                context: { type: "string", description: "Brief context, e.g. '2024 estimate', '2024-2030 projected'" },
              },
              required: ["label", "value", "context"],
            },
          },
        },
        required: ["metrics"],
      }
    );

    const metrics = result.content?.metrics || [];
    console.log(`Extracted ${metrics.length} key metrics`);
    return { metrics, citations: result.citations };
  } catch (e) {
    console.error("Key metrics extraction failed (continuing):", e);
    return { metrics: [], citations: [] };
  }
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
  if (!endBuyerIndustries) return "";

  const industrySectorText = (intake.industry_sector || []).join(", ");

  console.log(`Researching end buyer procurement for: ${endBuyerIndustries}`);

  try {
    const result = await callPerplexity(perplexityKey,
      `How do ${endBuyerIndustries} companies in Australia procure ${industrySectorText} services? Key procurement channels, typical buying cycles, RFP processes, partnership models, preferred supplier criteria, and how international companies can become approved suppliers.`
    );
    return result.content || "";
  } catch (e) {
    console.error("End buyer procurement research failed:", e);
    return "";
  }
}

// ── AI helper ──────────────────────────────────────────────────────────
async function callAI(
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
  model = "google/gemini-3-flash-preview"
): Promise<string> {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages }),
  });

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
  const visibleSections = sectionOrder.filter(
    (name) => sections[name]?.visible && sections[name]?.content?.trim()
  );

  if (visibleSections.length === 0) {
    console.log("Polish: no visible sections to polish");
    return sections;
  }

  const concatenated = visibleSections
    .map((name) => `${SECTION_DELIMITER_PREFIX}${name}${SECTION_DELIMITER_SUFFIX}\n${sections[name].content}`)
    .join("\n\n");

  console.log(`Polish: sending ${visibleSections.length} sections (${concatenated.length} chars) to gemini-3-flash-preview...`);
  const polishStart = Date.now();

  const polished = await callAI(
    apiKey,
    [
      {
        role: "system",
        content: `You are a professional editor improving a market entry report for an international company expanding into Australia. Your task is to EDIT the following report for readability and consistency — you are NOT rewriting it.

Rules:
1. Use Australian English spelling throughout (e.g. "organisation", "labour", "recognise", "analyse", "licence" (noun), "program" for government programs is acceptable).
2. Improve sentence structure and flow. Break up overly long sentences.
3. Add smooth 1-2 sentence transitions between sections where the topic shifts.
4. Remove redundant phrases or information that is repeated across sections.
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
    "google/gemini-3-flash-preview"
  );

  console.log(`Polish: AI call completed in ${Date.now() - polishStart}ms`);

  const polishedSections = { ...sections };
  const parts = polished.split(new RegExp(`${SECTION_DELIMITER_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(.+?)${SECTION_DELIMITER_SUFFIX.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));

  let parsedCount = 0;
  for (let i = 1; i < parts.length - 1; i += 2) {
    const sectionName = parts[i].trim();
    const sectionContent = (parts[i + 1] || "").trim();

    if (polishedSections[sectionName] && polishedSections[sectionName].visible && sectionContent.length > 50) {
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

  console.log(`Polish: successfully polished ${parsedCount}/${visibleSections.length} sections`);
  return polishedSections;
}

// ── Database matching ──────────────────────────────────────────────────
async function searchMatches(supabase: any, intake: any) {
  const matches: Record<string, any[]> = {};
  const regions = intake.target_regions || [];
  const industry = (intake.industry_sector || []).join(", ");
  const servicesNeeded = intake.services_needed || [];

  const locationPatterns = regions.map((r: string) => r.split("/")[0]).filter(Boolean);

  // Service providers
  try {
    let spQuery = supabase.from("service_providers").select("id, name, slug, location, services, description, website, website_url, is_verified, tagline, logo_url, category_slug").limit(10);
    const filters: string[] = [];
    if (locationPatterns.length > 0) {
      filters.push(...locationPatterns.map((l: string) => `location.ilike.%${l}%`));
    }
    if (servicesNeeded.length > 0) {
      filters.push(...servicesNeeded.map((s: string) => `services.cs.{${s}}`));
    }
    if (filters.length > 0) {
      spQuery = spQuery.or(filters.join(","));
    }
    const { data: sp } = await spQuery;
    matches.service_providers = (sp || []).map((p: any) => ({
      ...p,
      link: p.slug ? `/service-providers/${p.slug}` : "/service-providers",
      linkLabel: "View Profile",
      subtitle: p.location, tags: (p.services || []).slice(0, 3),
    }));
  } catch (e) { console.error("SP search error:", e); }

  // Community members
  try {
    let cmQuery = supabase.from("community_members").select("id, name, title, location, specialties, company, website").limit(5);
    const cmFilters: string[] = [];
    if (locationPatterns.length > 0) {
      cmFilters.push(...locationPatterns.map((l: string) => `location.ilike.%${l}%`));
    }
    if (servicesNeeded.length > 0) {
      cmFilters.push(...servicesNeeded.map((s: string) => `specialties.cs.{${s}}`));
    }
    if (cmFilters.length > 0) {
      cmQuery = cmQuery.or(cmFilters.join(","));
    }
    const { data: cm } = await cmQuery;
    matches.community_members = (cm || []).map((m: any) => ({
      ...m, link: "/community", linkLabel: "View Profile",
      subtitle: [m.title, m.company].filter(Boolean).join(", "),
      tags: (m.specialties || []).slice(0, 3),
    }));
  } catch (e) { console.error("CM search error:", e); }

  // Events
  try {
    let evQuery = supabase.from("events").select("id, title, date, location, category, type, organizer, sector").limit(5);
    const evFilters: string[] = [];
    if (locationPatterns.length > 0) {
      evFilters.push(...locationPatterns.map((l: string) => `location.ilike.%${l}%`));
    }
    if (intake.industry_sector?.length > 0) {
      evFilters.push(...intake.industry_sector.map((s: string) => `sector.ilike.%${s}%`));
    }
    if (evFilters.length > 0) {
      evQuery = evQuery.or(evFilters.join(","));
    }
    const { data: ev } = await evQuery;

    let eventResults = ev || [];
    if (eventResults.length === 0) {
      const { data: allEvents } = await supabase.from("events").select("id, title, date, location, category, type, organizer, sector").order("date", { ascending: true }).limit(5);
      eventResults = allEvents || [];
    }

    matches.events = eventResults.map((e: any) => ({
      ...e, name: e.title, link: "/events", linkLabel: "View Event",
      subtitle: `${e.date} · ${e.location}`, tags: [e.category, e.type].filter(Boolean),
    }));
  } catch (e) { console.error("Events search error:", e); }

  // Content items
  try {
    let ciQuery = supabase.from("content_items").select("id, title, slug, content_type, sector_tags, meta_description").eq("status", "published").limit(5);
    if (intake.industry_sector?.length > 0) {
      ciQuery = ciQuery.overlaps("sector_tags", intake.industry_sector);
    }
    const { data: ci } = await ciQuery;
    matches.content_items = (ci || []).map((c: any) => ({
      ...c, name: c.title, link: `/content/${c.slug}`, linkLabel: "Read More",
      subtitle: c.content_type, tags: (c.sector_tags || []).slice(0, 2),
    }));
  } catch (e) { console.error("Content search error:", e); }

  // Leads
  try {
    let ldQuery = supabase.from("leads").select("id, name, industry, location, category, type, price, record_count, provider_name").limit(5);
    const ldFilters: string[] = [];
    if (locationPatterns.length > 0) {
      ldFilters.push(...locationPatterns.map((l: string) => `location.ilike.%${l}%`));
    }
    if (intake.industry_sector?.length > 0) {
      ldFilters.push(...intake.industry_sector.map((s: string) => `industry.ilike.%${s}%`));
    }
    if (ldFilters.length > 0) {
      ldQuery = ldQuery.or(ldFilters.join(","));
    }
    const { data: ld } = await ldQuery;
    matches.leads = (ld || []).map((l: any) => ({
      ...l, link: "/leads", linkLabel: "View Dataset",
      subtitle: `${l.location} · ${l.record_count || "?"} records`,
      tags: [l.category, l.type].filter(Boolean),
    }));
  } catch (e) { console.error("Leads search error:", e); }

  // Innovation ecosystem
  try {
    let ieQuery = supabase.from("innovation_ecosystem").select("id, name, location, services, description, website").limit(5);
    const ieFilters: string[] = [];
    if (locationPatterns.length > 0) {
      ieFilters.push(...locationPatterns.map((l: string) => `location.ilike.%${l}%`));
    }
    if (ieFilters.length > 0) {
      ieQuery = ieQuery.or(ieFilters.join(","));
    }
    const { data: ie } = await ieQuery;
    matches.innovation_ecosystem = (ie || []).map((o: any) => ({
      ...o, link: "/innovation-ecosystem", linkLabel: "View Hub",
      subtitle: o.location, tags: (o.services || []).slice(0, 3),
    }));
  } catch (e) { console.error("IE search error:", e); }

  // Trade & investment agencies
  try {
    let taQuery = supabase.from("trade_investment_agencies").select("id, name, location, services, description, website").limit(5);
    const taFilters: string[] = [];
    if (locationPatterns.length > 0) {
      taFilters.push(...locationPatterns.map((l: string) => `location.ilike.%${l}%`));
    }
    if (taFilters.length > 0) {
      taQuery = taQuery.or(taFilters.join(","));
    }
    const { data: ta } = await taQuery;
    matches.trade_investment_agencies = (ta || []).map((a: any) => ({
      ...a, link: "/trade-investment-agencies", linkLabel: "View Agency",
      subtitle: a.location, tags: (a.services || []).slice(0, 3),
    }));
  } catch (e) { console.error("TIA search error:", e); }

  // Investors
  try {
    let invQuery = supabase.from("investors").select("id, name, investor_type, location, sector_focus, stage_focus, check_size_min, check_size_max, website, description").limit(8);
    const invFilters: string[] = [];
    if (locationPatterns.length > 0) {
      invFilters.push(...locationPatterns.map((l: string) => `location.ilike.%${l}%`));
    }
    if (intake.industry_sector?.length > 0) {
      invFilters.push(...intake.industry_sector.map((s: string) => `sector_focus.cs.{${s}}`));
    }
    if (invFilters.length > 0) {
      invQuery = invQuery.or(invFilters.join(","));
    }
    const { data: inv } = await invQuery;
    matches.investors = (inv || []).map((i: any) => ({
      ...i, link: `/investors/${i.id}`, linkLabel: "View Investor",
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
      lcFilters.push(...intake.industry_sector.map((s: string) => `industry.ilike.%${s}%`));
      lcFilters.push(...intake.industry_sector.map((s: string) => `linkedin_job_industry.ilike.%${s}%`));
    }
    if (locationPatterns.length > 0) {
      lcFilters.push(...locationPatterns.map((l: string) => `lemlist_companies.location.ilike.%${l}%`));
    }
    if (lcFilters.length > 0) {
      lcQuery = lcQuery.or(lcFilters.join(","));
    }

    const { data: lc } = await lcQuery;
    matches.lemlist_contacts = (lc || []).map((c: any) => ({
      ...c,
      name: c.full_name || c.email || "Unknown Contact",
      link: c.linkedin_url || "#",
      linkLabel: c.linkedin_url ? "LinkedIn" : "Contact",
      subtitle: [c.job_title, c.company_name || c.lemlist_companies?.name].filter(Boolean).join(" at "),
      tags: [c.linkedin_job_industry || c.industry, c.contact_location || c.lemlist_companies?.location].filter(Boolean).slice(0, 2),
    }));
    console.log(`Lemlist contacts matched: ${(lc || []).length}`);
  } catch (e) { console.error("Lemlist contacts search error:", e); }

  return matches;
}

function getMatchesForSection(sectionName: string, matches: Record<string, any[]>): any[] {
  switch (sectionName) {
    case "service_providers": return matches.service_providers || [];
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

    // 2. Run ALL enrichment + research + matching in parallel
    const fallbackSummary = `${intake.company_name} is a ${intake.company_stage} ${(intake.industry_sector || []).join(", ")} company from ${intake.country_of_origin} with ${intake.employee_count} employees. Their target end buyers are in: ${(intake.end_buyer_industries || []).join(", ") || "not specified"}.`;

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
      runMarketResearch(intake),
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
          if (m) keyMetrics.push({ label: m[1].trim(), value: m[2].trim(), context: m[3].trim() });
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
    const userTierIndex = tierHierarchy.indexOf(userTier);

    // Extract persona from raw_input (new flow) with fallback to "international"
    const rawInput = intake.raw_input || {};
    const persona = (rawInput as any).persona === "startup" ? "startup" : "international";
    console.log(`Report persona: ${persona}`);

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
      key_challenges: intake.key_challenges || "Not specified",
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

    if (templates && templates.length > 0) {
      // Generate ALL sections in a single parallel batch (was batches of 3)
      console.log(`Generating ${templates.length} sections in single parallel batch...`);
      const sectionStartTime = Date.now();

      const results = await Promise.allSettled(
        templates.map(async (tmpl: any) => {
          const requiredTierIndex = tierHierarchy.indexOf(tmpl.visibility_tier);
          const visible = userTierIndex >= requiredTierIndex;

          if (!visible) {
            return { name: tmpl.section_name, data: { content: "", visible: false } };
          }

          let prompt = tmpl.prompt_body;
          for (const [key, value] of Object.entries(variables)) {
            prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
          }

          try {
            const personaContext = persona === "startup"
              ? "\n\nPERSONA CONTEXT: This report is for an Australian startup seeking to grow and scale. Prioritise: investors, accelerators, grants, startup-focused mentors, innovation hubs, and founder networks."
              : "\n\nPERSONA CONTEXT: This report is for an international company entering the ANZ market. Prioritise: service providers, trade agencies, case studies, associations, compliance, events, and mentors with inbound market entry experience.";

            const content = await callAI(lovableKey, [
              { role: "system", content: "You are Market Entry Secrets AI, an expert consultant on international companies entering the Australian market. Write professional, actionable content grounded in real data when available. Use Markdown formatting: use ### for subsections, **bold** for emphasis, bullet points for lists, and numbered lists for steps.\n\nIMPORTANT — Inline citations: When you reference data, statistics, market figures, regulatory requirements, or factual claims that come from the provided market research, you MUST include inline citation markers using the format [N] where N is the source number from the provided citations list. Place the citation immediately after the relevant claim. For example: \"The Australian AI market is projected to reach USD 8.48 billion by 2030 [3].\" If multiple sources support a claim, list them: [1][4]. Only cite sources from the provided numbered citations list — do not invent citation numbers." + personaContext },
              { role: "user", content: prompt },
            ]);

            return {
              name: tmpl.section_name,
              data: {
                content,
                visible: true,
                matches: getMatchesForSection(tmpl.section_name, matches),
              },
            };
          } catch (e) {
            console.error(`Failed to generate ${tmpl.section_name}:`, e);
            return {
              name: tmpl.section_name,
              data: { content: "This section could not be generated. Please try again.", visible: true },
            };
          }
        })
      );

      for (const result of results) {
        if (result.status === "fulfilled" && result.value) {
          sections[result.value.name] = result.value.data;
          if (result.value.data.visible) sectionsGenerated.push(result.value.name);
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

    // Save immediately with unpolished content — report is now viewable
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

    // 7b. Polish pass — best-effort improvement with 30s timeout
    try {
      const polishedSections = await Promise.race([
        polishReport(lovableKey, sections, sectionOrder),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Polish timeout (30s)")), 30000)
        ),
      ]);

      // Polish succeeded — update report with polished content
      for (const [name, data] of Object.entries(polishedSections)) {
        sections[name] = data;
      }

      const polishedReportJson = buildReportJson(sections, true);

      await supabase
        .from("user_reports")
        .update({ report_json: polishedReportJson })
        .eq("id", reportId);

      console.log(`Report ${reportId} polished and updated in ${Date.now() - startTime}ms`);
    } catch (e) {
      console.warn("Polish pass skipped (report already saved):", e instanceof Error ? e.message : e);
    }
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
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

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

    // Pre-create the report row with "processing" status
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
