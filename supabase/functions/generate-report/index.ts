import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
      `${intake.industry_sector} market size, trends, key players, and growth opportunities in Australia ${targetRegionsText}. Include specific data points, statistics, and market valuations where available.`
    ),
    callPerplexity(perplexityKey,
      `Requirements, regulations, compliance, and licensing for a ${intake.country_of_origin} ${intake.industry_sector} company entering the Australian market. Include visa requirements, tax obligations, legal entity setup, and any industry-specific regulations.`
    ),
    callPerplexity(perplexityKey,
      `Recent news and developments in ${intake.industry_sector} in Australia in the last 6 months. Focus on market trends, regulatory changes, major deals, and new entrants.`,
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
async function callAI(apiKey: string, messages: Array<{ role: string; content: string }>): Promise<string> {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error("AI error:", resp.status, text);
    throw new Error(`AI call failed: ${resp.status}`);
  }

  const data = await resp.json();
  return data.choices?.[0]?.message?.content || "";
}

// ── Database matching ──────────────────────────────────────────────────
async function searchMatches(supabase: any, intake: any) {
  const matches: Record<string, any[]> = {};
  const regions = intake.target_regions || [];
  const industry = intake.industry_sector || "";
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
    if (industry) ldQuery = ldQuery.ilike("industry", `%${industry}%`);
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

  return matches;
}

function getMatchesForSection(sectionName: string, matches: Record<string, any[]>): any[] {
  switch (sectionName) {
    case "service_providers": return matches.service_providers || [];
    case "mentor_recommendations": return matches.community_members || [];
    case "events_resources": return [...(matches.events || []), ...(matches.content_items || [])];
    case "lead_list": return matches.leads || [];
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
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");

    const supabase = createClient(supabaseUrl, serviceKey);

    // 1. Fetch intake form
    const { data: intake, error: intakeErr } = await supabase
      .from("user_intake_forms")
      .select("*")
      .eq("id", intake_form_id)
      .single();

    if (intakeErr || !intake) throw new Error("Intake form not found");

    await supabase.from("user_intake_forms").update({ status: "processing" }).eq("id", intake_form_id);

    // 2. Enrich via Firecrawl (best effort)
    let enrichedSummary = `${intake.company_name} is a ${intake.company_stage} ${intake.industry_sector} company from ${intake.country_of_origin} with ${intake.employee_count} employees.`;

    if (firecrawlKey && intake.website_url) {
      try {
        const scrapeResp = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ url: intake.website_url, formats: ["markdown"], onlyMainContent: true }),
        });
        if (scrapeResp.ok) {
          const scrapeData = await scrapeResp.json();
          const markdown = (scrapeData.data?.markdown || scrapeData.markdown || "").slice(0, 2000);

          if (markdown.length > 100) {
            const enrichResp = await callAI(lovableKey, [
              { role: "system", content: "You are an analyst. Return only JSON." },
              { role: "user", content: `Based on this website content for ${intake.company_name}, provide a JSON object with: {"summary": "2-3 sentence company summary", "industry": "standardized industry classification", "maturity": "Seed|Growth|Enterprise"}\n\nContent:\n${markdown}` },
            ]);
            try {
              const cleaned = enrichResp.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
              const enriched = JSON.parse(cleaned);
              enrichedSummary = enriched.summary || enrichedSummary;
              await supabase.from("user_intake_forms").update({ enriched_input: enriched }).eq("id", intake_form_id);
            } catch { /* use default summary */ }
          }
        }
      } catch (e) {
        console.error("Firecrawl enrichment failed (continuing):", e);
      }
    }

    // 3. Perplexity market research (best effort, parallel with DB matches)
    const [marketResearch, matches] = await Promise.all([
      runMarketResearch(intake),
      searchMatches(supabase, intake),
    ]);

    // 4. Get user subscription tier
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

    // 5. Fetch report templates
    const { data: templates } = await supabase
      .from("report_templates")
      .select("*")
      .eq("is_active", true)
      .order("section_name");

    // 6. Build template variables (including market research)
    const tierHierarchy = ["free", "growth", "scale", "enterprise"];
    const userTierIndex = tierHierarchy.indexOf(userTier);

    const variables: Record<string, string> = {
      company_name: intake.company_name,
      company_stage: intake.company_stage,
      industry_sector: intake.industry_sector,
      country_of_origin: intake.country_of_origin,
      target_regions: (intake.target_regions || []).join(", "),
      services_needed: (intake.services_needed || []).join(", "),
      timeline: intake.timeline,
      budget_level: intake.budget_level,
      primary_goals: intake.primary_goals || "Not specified",
      key_challenges: intake.key_challenges || "Not specified",
      enriched_summary: enrichedSummary,
      matched_providers_json: JSON.stringify(matches.service_providers || []),
      matched_mentors_json: JSON.stringify(matches.community_members || []),
      matched_events_json: JSON.stringify(matches.events || []),
      matched_content_json: JSON.stringify(matches.content_items || []),
      matched_leads_json: JSON.stringify(matches.leads || []),
      matched_providers_summary: (matches.service_providers || []).map((p: any) => p.name).join(", ") || "None found",
      // Perplexity market research variables
      market_research_landscape: marketResearch.landscape || "No market research data available.",
      market_research_regulatory: marketResearch.regulatory || "No regulatory research data available.",
      market_research_news: marketResearch.news || "No recent news data available.",
      market_research_citations: marketResearch.citations.length > 0
        ? marketResearch.citations.map((url, i) => `[${i + 1}] ${url}`).join("\n")
        : "",
    };

    // 7. Generate sections
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
                { role: "system", content: "You are Market Entry Secrets AI, an expert consultant on international companies entering the Australian market. Write professional, actionable content grounded in real data when available." },
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

    // 8. Assemble and store report (with citations in metadata)
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
