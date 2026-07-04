import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

function sb() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export default defineTool({
  name: "search_mentors",
  title: "Search mentors",
  description:
    "Search Market Entry Secrets' mentor directory (experienced operators helping companies enter the ANZ market). Filter by specialty, location, or origin country.",
  inputSchema: {
    query: z.string().optional().describe("Free-text search across name, title, and company."),
    specialty: z.string().optional().describe("Specialty keyword, e.g. 'fintech', 'sales'."),
    location: z.string().optional(),
    origin_country: z.string().optional().describe("Mentor's country of origin, e.g. 'Ireland'."),
    limit: z.number().int().min(1).max(50).default(10),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, specialty, location, origin_country, limit }) => {
    let q = sb()
      .from("community_members_public")
      .select("name, title, company, specialties, location, origin_country, associated_countries")
      .limit(limit);
    if (query) q = q.or(`name.ilike.%${query}%,title.ilike.%${query}%,company.ilike.%${query}%`);
    if (specialty) q = q.contains("specialties", [specialty]);
    if (location) q = q.ilike("location", `%${location}%`);
    if (origin_country) q = q.ilike("origin_country", `%${origin_country}%`);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { results: data ?? [] },
    };
  },
});