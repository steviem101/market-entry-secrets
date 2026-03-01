import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/http.ts";
import { requireAdmin } from "../_shared/auth.ts";
import { log, logError } from "../_shared/log.ts";

const PREFIX = "classify-personas";

const SYSTEM_PROMPT = `You are a content classifier for Market Entry Secrets (MES), a platform serving two audiences in the Australian/NZ market:

1. INTERNATIONAL ENTRANTS - companies expanding into ANZ from overseas. They need: market entry guides, immigration/visa info, entity setup, cultural adaptation, trade agencies, soft-landing programs, market sizing, regulatory compliance, and case studies of international companies entering ANZ.

2. LOCAL STARTUPS - Australian/NZ-based founders building and scaling locally. They need: investors/VCs, accelerators, grants, go-to-market strategies, local hiring, customer acquisition, founder networking, and case studies of successful AU/NZ startups.

Some content serves BOTH audiences (e.g., general business services, accounting, legal basics, broad industry events).

For each record, respond with ONLY a JSON array of applicable persona tags. Valid values: ["international_entrant"], ["local_startup"], ["international_entrant", "local_startup"]. If you truly cannot determine relevance, return []. Do not explain. Just return the JSON array.`;

const TABLES_CONFIG = [
  { table: "service_providers", column: "serves_personas", fields: ["name", "description", "services"], type: "service provider" },
  { table: "events", column: "target_personas", fields: ["title", "description", "location"], type: "event" },
  { table: "community_members", column: "serves_personas", fields: ["name", "title", "company"], type: "mentor/community member" },
  { table: "user_reports", column: "target_personas", fields: ["status", "tier_at_generation"], type: "market report" },
  { table: "content_items", column: "target_personas", fields: ["title", "content_type"], type: "content item" },
  { table: "content_company_profiles", column: "target_personas", fields: ["company_name", "industry", "origin_country"], type: "company case study" },
  { table: "innovation_ecosystem", column: "serves_personas", fields: ["name", "description", "location"], type: "innovation hub" },
  { table: "trade_investment_agencies", column: "serves_personas", fields: ["name", "description", "services"], type: "trade agency" },
  { table: "content_bodies", column: "target_personas", fields: ["body_text", "content_type"], type: "content body" },
  { table: "testimonials", column: "target_personas", fields: ["testimonial", "name"], type: "testimonial" },
];

Deno.serve(async (req: Request) => {
  const cors = buildCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  try {
    // Require admin role — this function writes to multiple tables using service key
    const authResult = await requireAdmin(req);
    if ("error" in authResult) {
      return new Response(
        JSON.stringify({ error: authResult.error.message }),
        { status: authResult.error.status, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    const { table, batch_size = 20, dry_run = false } = await req.json();
    const safeBatchSize = Math.min(Math.max(batch_size || 20, 1), 100);

    const config = TABLES_CONFIG.find((c) => c.table === table);
    if (!config) {
      return new Response(
        JSON.stringify({ error: "Invalid table", valid: TABLES_CONFIG.map((c) => c.table) }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    log(PREFIX, `Fetching untagged records from ${config.table}`, { batch_size: safeBatchSize, dry_run });

    const { data: records, error: fetchError } = await supabase
      .from(config.table)
      .select("id, " + config.fields.join(", "))
      .or(`${config.column}.is.null,${config.column}.eq.{}`)
      .limit(safeBatchSize);

    if (fetchError) {
      logError(PREFIX, "Failed to fetch records", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch records", details: fetchError.message }),
        { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    if (!records?.length) {
      return new Response(
        JSON.stringify({ message: "No untagged records", table }),
        { headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    log(PREFIX, `Found ${records.length} untagged records in ${config.table}`);

    const results = [];
    for (const record of records) {
      const prompt =
        `Classify this ${config.type}:\n` +
        config.fields.map((f) => `${f}: ${(record as any)[f] || "N/A"}`).join("\n") +
        "\n\nReturn ONLY a JSON array of persona tags.";

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 100,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const aiResult = await res.json();
      let tags: string[] = [];

      try {
        tags = JSON.parse(aiResult.content[0].text.trim());
      } catch {
        logError(PREFIX, `Failed to parse AI response for record ${record.id}`, aiResult);
        tags = [];
      }

      if (!dry_run) {
        const { error: updateError } = await supabase
          .from(config.table)
          .update({ [config.column]: tags })
          .eq("id", record.id);

        if (updateError) {
          logError(PREFIX, `Failed to update record ${record.id}`, updateError);
        }
      }

      results.push({ id: record.id, tags });
    }

    log(PREFIX, `Processed ${results.length} records`, { dry_run });

    return new Response(
      JSON.stringify({ table, processed: results.length, dry_run, results }),
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
