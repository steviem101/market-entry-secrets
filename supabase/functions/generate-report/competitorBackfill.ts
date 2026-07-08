/**
 * Competitor recall backfill from already-fetched market research.
 *
 * Pure module — NO Deno globals, NO I/O — importable by the edge function AND
 * unit-tested under Node. The LLM call + the scrape stay in index.ts; this owns
 * prompt construction and response parsing.
 *
 * Why it exists (Floats report feedback, 8 Jul 2026): competitor DISCOVERY is
 * web-search-driven and came up with a single competitor for Floats, yet the
 * market-research prose the report ALSO fetched openly named real rivals (Human
 * IQ, JobAdder, Vincere) — the two pipelines never talk. When discovery is thin,
 * mine the research text already in hand for named competitors and feed them
 * back through the known-competitor scrape (which resolves a domain + verifies
 * against the live site), so a named rival only lands if it's real and scrapeable.
 * No extra Perplexity spend — it reuses text already fetched.
 */

const clip = (s: unknown, n: number): string =>
  String(s ?? "").replace(/\s+/g, " ").trim().slice(0, n);

/** Below this many discovered/known competitors, try to backfill from research. */
export const BACKFILL_TARGET = 3;
/** Never add more than this many mined names (bounds Firecrawl scrape cost). */
export const BACKFILL_MAX = 4;

/**
 * Prompt to extract named competitor COMPANIES from research prose. `excludeNames`
 * are competitors already in the slate (+ the company itself) so we don't re-add.
 */
export function buildMentionPrompt(
  companyName: string,
  sectorText: string,
  researchText: string,
  excludeNames: string[],
): string {
  const excl = excludeNames.filter(Boolean).map((n) => clip(n, 60)).join(", ") || "(none)";
  return `From the market-research notes below, list the real, named COMPANIES that are direct product/service competitors of "${companyName}" (a ${sectorText || "company"}) in its market — the rival vendors a buyer would evaluate as alternatives.

STRICT RULES:
- Only names that appear VERBATIM in the notes. Do NOT invent, guess, or add well-known names from your own knowledge.
- Companies only — never people, regulators, government bodies, industry associations, events, publications, or "${companyName}" itself.
- Only genuine competitors (comparable product/service) — not partners, customers, or generic market references.
- Exclude these, already covered: ${excl}.

Market-research notes:
${researchText}

Respond with ONLY a JSON object, no markdown fences:
{"competitors": ["Company One", "Company Two"]}
If none appear: {"competitors": []}`;
}

/**
 * Parse mined names: trims, drops blanks/exclusions (case-insensitive), dedupes,
 * caps at BACKFILL_MAX. Fail-open to [] on any parse error. Returns plain names
 * (the caller resolves a domain + scrapes each to verify before adding).
 */
export function parseMentions(aiText: string, excludeNames: string[], cap = BACKFILL_MAX): string[] {
  try {
    const cleaned = (aiText || "").replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start < 0 || end <= start) return [];
    const obj = JSON.parse(cleaned.slice(start, end + 1));
    if (!Array.isArray(obj?.competitors)) return [];
    const excl = new Set(excludeNames.filter(Boolean).map((n) => n.toLowerCase().trim()));
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of obj.competitors) {
      const name = clip(raw, 80);
      const key = name.toLowerCase();
      if (!name || excl.has(key) || seen.has(key)) continue;
      seen.add(key);
      out.push(name);
      if (out.length >= cap) break;
    }
    return out;
  } catch {
    return [];
  }
}
