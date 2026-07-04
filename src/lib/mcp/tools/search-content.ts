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
  name: "search_content",
  title: "Search guides and case studies",
  description:
    "Search Market Entry Secrets articles, guides, and case studies about entering the Australian/ANZ market. Returns titles and slugs — build URLs as https://marketentrysecrets.com/content/<slug> or /case-studies/<slug>.",
  inputSchema: {
    query: z.string().describe("Free-text search across title and excerpt."),
    content_type: z.enum(["article", "guide", "case_study"]).optional(),
    limit: z.number().int().min(1).max(50).default(10),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, content_type, limit }) => {
    let q = sb()
      .from("content_items")
      .select("title, slug, content_type, category_id, sector_tags, status")
      .eq("status", "published")
      .ilike("title", `%${query}%`)
      .limit(limit);
    if (content_type) q = q.eq("content_type", content_type);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { results: data ?? [] },
    };
  },
});