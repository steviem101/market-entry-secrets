import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { genericSearchError, sanitizeFilterValue } from "./_shared";

function sb() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export default defineTool({
  name: "search_lead_databases",
  title: "Search B2B lead databases",
  description:
    "Search Market Entry Secrets' catalog of B2B lead databases for Australian market entry (targeting industries, roles, and regions).",
  inputSchema: {
    query: z.string().optional().describe("Free-text search across name and description."),
    industry: z.string().optional(),
    location: z.string().optional(),
    limit: z.number().int().min(1).max(50).default(10),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, industry, location, limit }) => {
    let q = sb()
      .from("leads")
      .select("name, industry, location, category, price, record_count, provider_name")
      .limit(limit);
    if (query) q = q.ilike("name", `%${sanitizeFilterValue(query)}%`);
    if (industry) q = q.ilike("industry", `%${sanitizeFilterValue(industry)}%`);
    if (location) q = q.ilike("location", `%${sanitizeFilterValue(location)}%`);
    const { data, error } = await q;
    if (error) {
      console.error("search_lead_databases query failed", error);
      return genericSearchError;
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { results: data ?? [] },
    };
  },
});