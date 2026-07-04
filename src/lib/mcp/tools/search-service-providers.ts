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
  name: "search_service_providers",
  title: "Search service providers",
  description:
    "Search Market Entry Secrets' directory of vetted service providers helping companies enter the Australian/ANZ market. Filter by free-text query, location, or service.",
  inputSchema: {
    query: z.string().optional().describe("Free-text search across name and description."),
    location: z.string().optional().describe("Australian city or region, e.g. 'Sydney'."),
    service: z.string().optional().describe("Service keyword, e.g. 'legal', 'marketing'."),
    limit: z.number().int().min(1).max(50).default(10),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, location, service, limit }) => {
    let q = sb()
      .from("service_providers")
      .select("name, location, services, description, website")
      .limit(limit);
    if (query) q = q.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    if (location) q = q.ilike("location", `%${location}%`);
    if (service) q = q.contains("services", [service]);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { results: data ?? [] },
    };
  },
});