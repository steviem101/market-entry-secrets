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
  timeoutMs = 8000
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
    // Step 1: Map the website to discover pages + scrape homepage in parallel
    const [allUrls, homepageMarkdown] = await Promise.all([
      firecrawlMap(firecrawlKey, websiteUrl),
      firecrawlScrape(firecrawlKey, websiteUrl),
    ]);

    console.log(`Map found ${allUrls.length} URLs on ${websiteUrl}`);

    // Step 2: Find key pages and scrape up to 3 additional ones
    const keyPages = allUrls.filter(isKeyPage).slice(0, 3);
    console.log(`Scraping ${keyPages.length} key pages:`, keyPages);

    const additionalScrapes = await Promise.allSettled(
      keyPages.map((url) => firecrawlScrape(firecrawlKey, url))
    );

    // Step 3: Concatenate all content (capped at 4000 chars)
    const allContent: string[] = [];
    if (homepageMarkdown) allContent.push(homepageMarkdown);
    for (const result of additionalScrapes) {
      if (result.status === "fulfilled" && result.value) {
        allContent.push(result.value);
      }
    }

    const combinedContent = allContent.join("\n\n---\n\n").slice(0, 4000);

    if (combinedContent.length < 100) {
      console.log("Insufficient website content for deep analysis");
      return { profile: defaultProfile, enrichedSummary: fallbackSummary };
    }

    // Step 4: AI extraction of structured company profile
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
    if (!provider.website) return provider;

    try {
      const markdown = await firecrawlScrape(firecrawlKey, provider.website, 10000);
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
      const markdown = await firecrawlScrape(firecrawlKey, comp.website, 15000);
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
${markdown.slice(0, 3000)}`,
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
    // Step 1: Scrape user-provided known competitors
    const knownCompetitors = intake.known_competitors || [];
    const knownResults = await scrapeKnownCompetitors(
      firecrawlKey, lovableKey, knownCompetitors, intake.company_name
    );

    // Step 2: Also search for additional competitors via Firecrawl Search
    const targetRegions = (intake.target_regions || []).join(", ") || "Australia";
    const industrySectorText = (intake.industry_sector || []).join(", ");
    const query = `${industrySectorText} companies in Australia ${targetRegions} competitors`;

    console.log(`Searching competitors: "${query}"`);
    const results = await firecrawlSearch(firecrawlKey, query, 5);

    // Filter out the user's own website and already-known competitor domains
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
      // Use AI to extract structured competitor data from search results
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

    // Merge: known competitors first, then search-discovered ones
    const allCompetitors = [...knownResults, ...searchCompetitorsList];

    console.log(`Total competitors: ${allCompetitors.length} (${knownResults.length} known + ${searchCompetitorsList.length} discovered)`);
    return { competitors: allCompetitors, raw_results: filtered };
  } catch (e) {
    console.error("Competitor search failed (continuing):", e);
    return empty;
  }
}

// ── Perplexity helper ──────────────────────────────────────────────────
async function callPerplexity(
  apiKey: string,
  query: string,
  options?: { recency?: string; domains?: string[] }
): Promise<{ content: string; citations: string[] }> {
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

// ── Market research step ───────────────────────────────────────────────
interface MarketResearch {
  landscape: string;
  regulatory: string;
  news: string;
  citations: string[];
  used: boolean;
}

async function runMarketResearch(intake: any): Promise<MarketResearch> {
  const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");
  const empty: MarketResearch = { landscape: "", regulatory: "", news: "", citations: [], used: false };

  if (!perplexityKey) {
    console.log("PERPLEXITY_API_KEY not set — skipping market research");
    return empty;
  }

  const targetRegionsText = (intake.target_regions || []).join(", ") || "Australia";

  console.log("Running Perplexity market research...");
  const startTime = Date.now();

  const [landscape, regulatory, news] = await Promise.allSettled([
    callPerplexity(perplexityKey,
      `${(intake.industry_sector || []).join(", ")} market size, trends, key players, and growth opportunities in Australia ${targetRegionsText}. Include specific data points, statistics, and market valuations where available.`
    ),
    callPerplexity(perplexityKey,
      `Requirements, regulations, compliance, and licensing for a ${intake.country_of_origin} ${(intake.industry_sector || []).join(", ")} company entering the Australian market. Include visa requirements, tax obligations, legal entity setup, and any industry-specific regulations.`
    ),
    callPerplexity(perplexityKey,
      `Recent news and developments in ${(intake.industry_sector || []).join(", ")} in Australia in the last 6 months. Focus on market trends, regulatory changes, major deals, and new entrants.`,
      { recency: "month" }
    ),
  ]);

  const result: MarketResearch = { landscape: "", regulatory: "", news: "", citations: [], used: true };

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

  // Deduplicate citations
  result.citations = [...new Set(result.citations)];

  console.log(`Perplexity research completed in ${Date.now() - startTime}ms — ${result.citations.length} citations`);
  return result;
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
  // Collect visible sections that have content
  const visibleSections = sectionOrder.filter(
    (name) => sections[name]?.visible && sections[name]?.content?.trim()
  );

  if (visibleSections.length === 0) {
    console.log("Polish: no visible sections to polish");
    return sections;
  }

  // Concatenate all visible section content with delimiters
  const concatenated = visibleSections
    .map((name) => `${SECTION_DELIMITER_PREFIX}${name}${SECTION_DELIMITER_SUFFIX}\n${sections[name].content}`)
    .join("\n\n");

  console.log(`Polish: sending ${visibleSections.length} sections (${concatenated.length} chars) to gemini-2.5-pro...`);
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
10. Do NOT add a title or introduction before the first section delimiter.`,
      },
      {
        role: "user",
        content: concatenated,
      },
    ],
    "google/gemini-2.5-pro"
  );

  console.log(`Polish: AI call completed in ${Date.now() - polishStart}ms`);

  // Parse polished output back into sections
  const polishedSections = { ...sections };
  const parts = polished.split(new RegExp(`${SECTION_DELIMITER_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(.+?)${SECTION_DELIMITER_SUFFIX.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));

  // parts array: [preamble, sectionName1, content1, sectionName2, content2, ...]
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

  // Service providers — filter by location AND services overlap
  try {
    let spQuery = supabase.from("service_providers").select("id, name, location, services, description, website").limit(10);
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
      ...p, link: "/service-providers", linkLabel: "View Profile",
      subtitle: p.location, tags: (p.services || []).slice(0, 3),
    }));
  } catch (e) { console.error("SP search error:", e); }

  // Community members — match specialties to services needed
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
      ...m, link: "/community", linkLabel: "Connect",
      subtitle: `${m.title}${m.company ? ` at ${m.company}` : ""}`,
      tags: (m.specialties || []).slice(0, 3),
    }));
  } catch (e) { console.error("CM search error:", e); }

  // Events — include past events, sort by date desc, match category/location
  try {
    let evQuery = supabase
      .from("events")
      .select("id, title, date, location, category, type")
      .order("date", { ascending: false })
      .limit(5);
    if (locationPatterns.length > 0) {
      evQuery = evQuery.or(locationPatterns.map((l: string) => `location.ilike.%${l}%`).join(","));
    }
    const { data: ev } = await evQuery;
    matches.events = (ev || []).map((e: any) => ({
      ...e, name: e.title, link: "/events", linkLabel: "View Event",
      subtitle: `${e.date} · ${e.location}`, tags: [e.category],
    }));
  } catch (e) { console.error("Events search error:", e); }

  // Content items
  try {
    const { data: ci } = await supabase
      .from("content_items")
      .select("id, title, content_type, slug, sector_tags")
      .in("content_type", ["case_study", "guide", "article"])
      .eq("status", "published")
      .limit(5);
    matches.content_items = (ci || []).map((c: any) => ({
      ...c, name: c.title, link: `/content/${c.slug}`, linkLabel: "Read More",
      subtitle: c.content_type, tags: (c.sector_tags || []).slice(0, 3),
    }));
  } catch (e) { console.error("Content search error:", e); }

  // Leads — match by industry
  try {
    let ldQuery = supabase.from("leads").select("id, name, industry, location, category, type").limit(5);
    if (industry) {
      const industries = intake.industry_sector || [];
      if (industries.length > 0) {
        ldQuery = ldQuery.or(industries.map((ind: string) => `industry.ilike.%${ind}%`).join(","));
      }
    }
    const { data: ld } = await ldQuery;
    matches.leads = (ld || []).map((l: any) => ({
      ...l, link: "/leads", linkLabel: "View Lead",
      subtitle: `${l.industry} · ${l.location}`, tags: [l.category],
    }));
  } catch (e) { console.error("Leads search error:", e); }

  // Innovation ecosystem
  try {
    let ieQuery = supabase.from("innovation_ecosystem").select("id, name, location, services, description, website").limit(3);
    if (locationPatterns.length > 0) {
      ieQuery = ieQuery.or(locationPatterns.map((l: string) => `location.ilike.%${l}%`).join(","));
    }
    const { data: ie } = await ieQuery;
    matches.innovation_ecosystem = (ie || []).map((i: any) => ({
      ...i, link: "/innovation-ecosystem", linkLabel: "View",
      subtitle: i.location, tags: (i.services || []).slice(0, 3),
    }));
  } catch (e) { console.error("IE search error:", e); }

  // Trade investment agencies
  try {
    const { data: ta } = await supabase
      .from("trade_investment_agencies")
      .select("id, name, location, services, description, website")
      .limit(3);
    matches.trade_investment_agencies = (ta || []).map((t: any) => ({
      ...t, link: "/trade-investment-agencies", linkLabel: "View",
      subtitle: t.location, tags: (t.services || []).slice(0, 3),
    }));
  } catch (e) { console.error("TA search error:", e); }

  // Lemlist contacts — match by industry or location for potential leads/connections
  try {
    let lcQuery = supabase
      .from("lemlist_contacts")
      .select("id, full_name, email, job_title, linkedin_url, industry, company_id, lemlist_companies(name, domain, location)")
      .limit(10);

    const lcFilters: string[] = [];
    const industries = intake.industry_sector || [];
    if (industries.length > 0) {
      lcFilters.push(...industries.map((ind: string) => `industry.ilike.%${ind}%`));
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
      subtitle: [c.job_title, c.lemlist_companies?.name].filter(Boolean).join(" at "),
      tags: [c.industry, c.lemlist_companies?.location].filter(Boolean).slice(0, 2),
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
    case "competitor_landscape": return []; // competitors are embedded in the prompt, not as match cards
    default: return [];
  }
}

// ── Main handler ───────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startTime = Date.now();

  try {
    const { intake_form_id } = await req.json();
    if (!intake_form_id) throw new Error("intake_form_id is required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY") || "";

    const supabase = createClient(supabaseUrl, serviceKey);

    // 1. Fetch intake form
    const { data: intake, error: intakeErr } = await supabase
      .from("user_intake_forms")
      .select("*")
      .eq("id", intake_form_id)
      .single();

    if (intakeErr || !intake) throw new Error("Intake form not found");

    await supabase.from("user_intake_forms").update({ status: "processing" }).eq("id", intake_form_id);

    // 2. Run enrichment + research + matching ALL in parallel
    const fallbackSummary = `${intake.company_name} is a ${intake.company_stage} ${(intake.industry_sector || []).join(", ")} company from ${intake.country_of_origin} with ${intake.employee_count} employees.`;

    console.log("Starting parallel pipeline: deep scrape + Perplexity + DB matching + competitor search...");

    const [companyEnrichResult, marketResearch, matches, competitorResult] = await Promise.all([
      // Enhancement 3: Deep company scrape (map + multi-page)
      firecrawlKey && intake.website_url
        ? enrichCompanyDeep(firecrawlKey, lovableKey, intake.website_url, intake.company_name, fallbackSummary)
        : Promise.resolve({ profile: null, enrichedSummary: fallbackSummary }),
      // Perplexity market research
      runMarketResearch(intake),
      // Database directory matching
      searchMatches(supabase, intake),
      // Enhancement 2: Competitor landscape
      firecrawlKey
        ? searchCompetitors(firecrawlKey, lovableKey, intake)
        : Promise.resolve({ competitors: [], raw_results: [] }),
    ]);

    const enrichedSummary = companyEnrichResult.enrichedSummary;
    const companyProfile = companyEnrichResult.profile;

    // Store enriched profile in DB
    if (companyProfile) {
      await supabase.from("user_intake_forms")
        .update({ enriched_input: companyProfile })
        .eq("id", intake_form_id);
    }

    // Enhancement 1: Enrich matched service providers with Firecrawl scrapes
    const enrichedProviders = await enrichMatchedProviders(
      firecrawlKey,
      matches.service_providers || []
    );
    matches.service_providers = enrichedProviders;

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

    // 5. Build template variables (including market research + enriched data)
    const tierHierarchy = ["free", "growth", "scale", "enterprise"];
    const userTierIndex = tierHierarchy.indexOf(userTier);

    const variables: Record<string, string> = {
      company_name: intake.company_name,
      company_stage: intake.company_stage,
      industry_sector: (intake.industry_sector || []).join(", "),
      country_of_origin: intake.country_of_origin,
      target_regions: (intake.target_regions || []).join(", "),
      services_needed: (intake.services_needed || []).join(", "),
      timeline: intake.timeline,
      budget_level: intake.budget_level,
      primary_goals: intake.primary_goals || "Not specified",
      key_challenges: intake.key_challenges || "Not specified",
      enriched_summary: enrichedSummary,
      // Enhancement 3: Full enriched company profile for all sections
      enriched_company_profile: companyProfile ? JSON.stringify(companyProfile) : "No enriched data available.",
      // Enhancement 1: Enriched providers (with enriched_description field)
      matched_providers_json: JSON.stringify(matches.service_providers || []),
      matched_mentors_json: JSON.stringify(matches.community_members || []),
      matched_events_json: JSON.stringify(matches.events || []),
      matched_content_json: JSON.stringify(matches.content_items || []),
      matched_leads_json: JSON.stringify(matches.leads || []),
      matched_providers_summary: (matches.service_providers || []).map((p: any) => p.name).join(", ") || "None found",
      // Lemlist contacts for lead list section
      matched_lemlist_contacts_json: JSON.stringify(matches.lemlist_contacts || []),
      // Enhancement 2: Competitor analysis
      competitor_analysis_json: JSON.stringify(competitorResult.competitors),
      known_competitors_json: JSON.stringify(intake.known_competitors || []),
      // Perplexity market research variables
      market_research_landscape: marketResearch.landscape || "No market research data available.",
      market_research_regulatory: marketResearch.regulatory || "No regulatory research data available.",
      market_research_news: marketResearch.news || "No recent news data available.",
      market_research_citations: marketResearch.citations.length > 0
        ? marketResearch.citations.map((url: string, i: number) => `[${i + 1}] ${url}`).join("\n")
        : "",
    };

    // 6. Generate sections
    const sections: Record<string, any> = {};
    const sectionsGenerated: string[] = [];

    if (templates && templates.length > 0) {
      const batches: any[][] = [];
      for (let i = 0; i < templates.length; i += 3) {
        batches.push(templates.slice(i, i + 3));
      }

      for (const batch of batches) {
        const results = await Promise.allSettled(
          batch.map(async (tmpl: any) => {
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
              const content = await callAI(lovableKey, [
                { role: "system", content: "You are Market Entry Secrets AI, an expert consultant on international companies entering the Australian market. Write professional, actionable content grounded in real data when available. Use Markdown formatting: use ### for subsections, **bold** for emphasis, bullet points for lists, and numbered lists for steps." },
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
      }
    }

    // 6b. Polish pass — improve readability, consistency, and Australian English
    const sectionOrder = templates ? templates.map((t: any) => t.section_name) : Object.keys(sections);
    try {
      const polishedSections = await polishReport(lovableKey, sections, sectionOrder);
      // Replace section data in-place, preserving matches
      for (const [name, data] of Object.entries(polishedSections)) {
        sections[name] = data;
      }
      console.log("Polish pass completed successfully");
    } catch (e) {
      console.warn("Polish pass failed (using original content):", e);
    }

    // 7. Assemble and store report (with citations + enrichment metadata)
    const reportJson = {
      company_name: intake.company_name,
      sections,
      matches,
      metadata: {
        tables_searched: Object.keys(matches),
        total_matches: Object.values(matches).reduce((sum: number, arr: any) => sum + (Array.isArray(arr) ? arr.length : 0), 0),
        generation_time_ms: Date.now() - startTime,
        perplexity_used: marketResearch.used,
        perplexity_citations: marketResearch.citations,
        firecrawl_deep_scrape: !!companyProfile,
        firecrawl_providers_enriched: enrichedProviders.filter((p: any) => p.enriched_description).length,
        firecrawl_competitors_found: competitorResult.competitors.length,
        polish_applied: true,
      },
    };

    const { data: report, error: reportErr } = await supabase
      .from("user_reports")
      .insert({
        user_id: intake.user_id,
        intake_form_id,
        tier_at_generation: userTier,
        report_json: reportJson,
        sections_generated: sectionsGenerated,
        status: "completed",
      })
      .select("id")
      .single();

    if (reportErr) throw reportErr;

    await supabase.from("user_intake_forms").update({ status: "completed" }).eq("id", intake_form_id);

    console.log(`Report generated in ${Date.now() - startTime}ms`);

    return new Response(
      JSON.stringify({ report_id: report.id, generation_time_ms: Date.now() - startTime }),
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
