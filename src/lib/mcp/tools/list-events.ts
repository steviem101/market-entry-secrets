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
  name: "list_events",
  title: "List events",
  description:
    "List upcoming Australian/ANZ market entry events (conferences, meetups, trade missions) from the Market Entry Secrets directory.",
  inputSchema: {
    query: z.string().optional().describe("Free-text search across title and organizer."),
    sector: z.string().optional(),
    location: z.string().optional(),
    upcoming_only: z.boolean().default(true),
    limit: z.number().int().min(1).max(50).default(10),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, sector, location, upcoming_only, limit }) => {
    let q = sb()
      .from("events")
      .select("title, slug, date, location, category, type, organizer, sector")
      .order("date", { ascending: true })
      .limit(limit);
    if (upcoming_only) q = q.gte("date", new Date().toISOString().slice(0, 10));
    if (query) {
      const s = sanitizeFilterValue(query);
      if (s) q = q.or(`title.ilike.%${s}%,organizer.ilike.%${s}%`);
    }
    if (sector) q = q.ilike("sector", `%${sanitizeFilterValue(sector)}%`);
    if (location) q = q.ilike("location", `%${sanitizeFilterValue(location)}%`);
    const { data, error } = await q;
    if (error) {
      console.error("list_events query failed", error);
      return genericSearchError;
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { results: data ?? [] },
    };
  },
});