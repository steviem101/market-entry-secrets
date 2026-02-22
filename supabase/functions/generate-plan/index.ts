import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/http.ts";
import { log, logError } from "../_shared/log.ts";

const PREFIX = "generate-plan";

Deno.serve(async (req: Request) => {
  const cors = buildCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  try {
    const { persona, company_name, sector, stage, origin_country, goals } =
      await req.json();

    if (!persona || !company_name || !sector || !stage || !goals?.length) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: persona, company_name, sector, stage, goals" }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    log(PREFIX, "Generating plan", { persona, company_name, sector, stage });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Determine the persona column name for each table
    const personaFilter = (column: string) =>
      `${column}.cs.{${persona}},${column}.eq.{}`;

    // Fetch persona-relevant data in parallel
    const [providersRes, eventsRes, reportsRes, caseStudiesRes, mentorsRes] =
      await Promise.all([
        supabase
          .from("service_providers")
          .select("name, description, specialties")
          .or(personaFilter("serves_personas"))
          .limit(20),
        supabase
          .from("events")
          .select("title, event_date, location, description")
          .or(personaFilter("target_personas"))
          .gte("event_date", new Date().toISOString())
          .order("event_date", { ascending: true })
          .limit(10),
        supabase
          .from("user_reports")
          .select("title, description, sector")
          .or(personaFilter("target_personas"))
          .limit(10),
        supabase
          .from("content_company_profiles")
          .select("company_name, description")
          .or(personaFilter("target_personas"))
          .limit(5),
        supabase
          .from("community_members")
          .select("name, role, company")
          .or(personaFilter("serves_personas"))
          .limit(10),
      ]);

    const context = {
      persona,
      company: { name: company_name, sector, stage, origin_country },
      goals,
      available_providers: providersRes.data || [],
      upcoming_events: eventsRes.data || [],
      relevant_reports: reportsRes.data || [],
      case_studies: caseStudiesRes.data || [],
      mentors: mentorsRes.data || [],
    };

    log(PREFIX, "Context assembled", {
      providers: providersRes.data?.length || 0,
      events: eventsRes.data?.length || 0,
      reports: reportsRes.data?.length || 0,
      case_studies: caseStudiesRes.data?.length || 0,
      mentors: mentorsRes.data?.length || 0,
    });

    const systemPrompt =
      persona === "international_entrant"
        ? "You are a market entry strategist helping international companies enter the Australian/NZ market. Generate a structured, actionable market entry plan based on the company profile and goals provided. Reference specific providers, events, mentors, and reports from the available data. Be specific and practical, not generic. Use a professional but approachable tone."
        : "You are a startup growth strategist helping Australian/NZ founders scale their companies. Generate a structured, actionable growth plan based on the company profile and goals provided. Reference specific providers, events, mentors, and reports from the available data. Be specific and practical, not generic. Use a professional but approachable tone.";

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Generate a tailored plan for this company:\n\n${JSON.stringify(context, null, 2)}\n\nStructure the plan as:\n1. Executive Summary (2-3 sentences)\n2. Recommended Actions (numbered steps with timelines)\n3. Recommended Providers (from the available list, explain why each is relevant)\n4. Recommended Mentors (from the available list)\n5. Upcoming Events to Attend\n6. Reports to Review\n7. Next Steps\n\nBe specific. Reference real providers, mentors, and events from the data. Do not make up providers or events that are not in the data.`,
          },
        ],
      }),
    });

    const aiResult = await res.json();

    if (!aiResult.content?.[0]?.text) {
      logError(PREFIX, "AI response missing content", aiResult);
      return new Response(
        JSON.stringify({ error: "Failed to generate plan" }),
        { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    const plan = aiResult.content[0].text;

    log(PREFIX, "Plan generated successfully");

    return new Response(
      JSON.stringify({
        plan,
        metadata: {
          persona,
          sector,
          stage,
          goals,
          providers_matched: providersRes.data?.length || 0,
          events_matched: eventsRes.data?.length || 0,
          mentors_matched: mentorsRes.data?.length || 0,
        },
      }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );
  } catch (err) {
    logError(PREFIX, "Unexpected error", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
});
