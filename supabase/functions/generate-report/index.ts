import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    // Update status to processing
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

    // 3. Search matches across database
    const matches = await searchMatches(supabase, intake);

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

    // Map tiers
    const tierMap: Record<string, string> = { premium: "growth", concierge: "enterprise" };
    userTier = tierMap[userTier] || userTier;

    // 5. Fetch report templates
    const { data: templates } = await supabase
      .from("report_templates")
      .select("*")
      .eq("is_active", true)
      .order("section_name");

    // 6. Generate sections
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
    };

    const sections: Record<string, any> = {};
    const sectionsGenerated: string[] = [];

    if (templates && templates.length > 0) {
      // Process in batches of 3
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
              return {
                name: tmpl.section_name,
                data: { content: "", visible: false },
              };
            }

            // Substitute variables in prompt
            let prompt = tmpl.prompt_body;
            for (const [key, value] of Object.entries(variables)) {
              prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
            }

            try {
              const content = await callAI(lovableKey, [
                { role: "system", content: "You are Market Entry Secrets AI, an expert consultant on international companies entering the Australian market. Write professional, actionable content." },
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

    // 7. Assemble and store report
    const reportJson = {
      company_name: intake.company_name,
      sections,
      matches,
      metadata: {
        tables_searched: Object.keys(matches),
        total_matches: Object.values(matches).reduce((sum: number, arr: any) => sum + (Array.isArray(arr) ? arr.length : 0), 0),
        generation_time_ms: Date.now() - startTime,
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

    // Update intake status
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

async function searchMatches(supabase: any, intake: any) {
  const matches: Record<string, any[]> = {};
  const regions = intake.target_regions || [];
  const industry = intake.industry_sector || "";
  const services = intake.services_needed || [];

  // Build location filter pattern
  const locationPatterns = regions.map((r: string) => r.split("/")[0]).filter(Boolean);

  try {
    // Service providers
    let spQuery = supabase.from("service_providers").select("id, name, location, services, description, website").limit(10);
    if (locationPatterns.length > 0) {
      spQuery = spQuery.or(locationPatterns.map((l: string) => `location.ilike.%${l}%`).join(","));
    }
    const { data: sp } = await spQuery;
    matches.service_providers = (sp || []).map((p: any) => ({
      ...p, link: "/service-providers", linkLabel: "View Profile",
      subtitle: p.location, tags: (p.services || []).slice(0, 3),
    }));
  } catch (e) { console.error("SP search error:", e); }

  try {
    // Community members / mentors
    let cmQuery = supabase.from("community_members").select("id, name, title, location, specialties, company").limit(5);
    if (locationPatterns.length > 0) {
      cmQuery = cmQuery.or(locationPatterns.map((l: string) => `location.ilike.%${l}%`).join(","));
    }
    const { data: cm } = await cmQuery;
    matches.community_members = (cm || []).map((m: any) => ({
      ...m, link: "/community", linkLabel: "Connect",
      subtitle: `${m.title}${m.company ? ` at ${m.company}` : ""}`,
      tags: (m.specialties || []).slice(0, 3),
    }));
  } catch (e) { console.error("CM search error:", e); }

  try {
    // Events
    const { data: ev } = await supabase
      .from("events")
      .select("id, title, date, location, category, type")
      .gte("date", new Date().toISOString().split("T")[0])
      .limit(5);
    matches.events = (ev || []).map((e: any) => ({
      ...e, name: e.title, link: "/events", linkLabel: "View Event",
      subtitle: `${e.date} · ${e.location}`, tags: [e.category],
    }));
  } catch (e) { console.error("Events search error:", e); }

  try {
    // Content items
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

  try {
    // Leads
    let ldQuery = supabase.from("leads").select("id, name, industry, location, category, type").limit(5);
    if (industry) ldQuery = ldQuery.ilike("industry", `%${industry}%`);
    const { data: ld } = await ldQuery;
    matches.leads = (ld || []).map((l: any) => ({
      ...l, link: "/leads", linkLabel: "View Lead",
      subtitle: `${l.industry} · ${l.location}`, tags: [l.category],
    }));
  } catch (e) { console.error("Leads search error:", e); }

  try {
    // Innovation ecosystem
    let ieQuery = supabase.from("innovation_ecosystem").select("id, name, location, services, description").limit(3);
    if (locationPatterns.length > 0) {
      ieQuery = ieQuery.or(locationPatterns.map((l: string) => `location.ilike.%${l}%`).join(","));
    }
    const { data: ie } = await ieQuery;
    matches.innovation_ecosystem = (ie || []).map((i: any) => ({
      ...i, link: "/innovation-ecosystem", linkLabel: "View",
      subtitle: i.location, tags: (i.services || []).slice(0, 3),
    }));
  } catch (e) { console.error("IE search error:", e); }

  try {
    // Trade agencies
    const { data: ta } = await supabase
      .from("trade_investment_agencies")
      .select("id, name, location, services, description")
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
