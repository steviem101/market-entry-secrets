/**
 * Semantic resolvability reviewer for anonymous mentor copy (MES-208 follow-up).
 *
 * The token leak-lint (leakCheck.ts) catches a draft that echoes the mentor's
 * real name/company. It CANNOT catch a draft that paraphrases a unique employer
 * into a one-of-a-kind description — e.g. "CEO of Australia's largest US–Australia
 * business organisation" names no one but resolves to exactly one org, and from
 * there one person. This pass judges that: does the draft, combined with the
 * visible facts (sector, corridor, location), point to one findable person/org?
 *
 * Pure prompt/parse helpers here (unit-testable); the fetch lives in index.ts.
 */

export interface ReviewVerdict {
  identifies: boolean;
  phrases: string[];
  reason: string;
}

export const REVIEWER_SYSTEM_PROMPT = `You are a privacy auditor for an anonymous mentor directory. You are given a DRAFT public profile and the mentor's REAL identifying facts. Decide whether the draft would let a reader work out the specific real person or organisation.

Judge RESOLVABILITY, not vocabulary. A phrase leaks only if it, combined with the visible facts (sector, corridor, location) already shown on the profile, points to ONE real, findable organisation or person. Examples that LEAK: "the largest US–Australia business body", "the national X agency for Y", "the only accelerator that does Z", a named unique programme, a superlative that yields a single org. Examples that are SAFE (do not flag): "a national trade agency", "a Big 4 firm", "an ASX-listed fintech", "dozens of fintech startups", seniority, sector, corridor, city — these fit many people.

Do NOT flag rich-but-plural attributes; the profile is SUPPOSED to be specific about sector, corridor, seniority, services and location. Only flag genuinely resolving descriptions.

Return ONLY JSON: {"identifies": boolean, "phrases": [exact offending phrases copied from the draft], "reason": short string}. If nothing resolves, return {"identifies": false, "phrases": [], "reason": ""}.`;

export const buildReviewPrompt = (
  draft: { alias: string; headline: string; company_label: string | null; bio: string },
  facts: {
    real_name: string;
    real_company: string | null;
    tile_companies: string[];
    sector_tags: string[] | null;
    market_corridors: string[] | null;
    location: string | null;
  },
): string =>
  [
    "DRAFT public profile:",
    JSON.stringify(draft, null, 2),
    "",
    "REAL identifying facts (never to be inferable from the draft):",
    JSON.stringify(
      {
        name: facts.real_name,
        employer: facts.real_company,
        past_employers: facts.tile_companies,
      },
      null,
      2,
    ),
    "",
    "Facts ALREADY visible to the reader on the profile (safe — use them to judge resolvability):",
    JSON.stringify(
      {
        sector_tags: facts.sector_tags,
        market_corridors: facts.market_corridors,
        location: facts.location,
      },
      null,
      2,
    ),
    "",
    "Does the draft resolve to this specific person or organisation? Return the JSON verdict.",
  ].join("\n");

/** Parse the reviewer reply; fail SAFE (treat unparseable as "needs review"). */
export const parseReview = (text: string): ReviewVerdict => {
  const stripped = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start === -1 || end <= start) {
    return { identifies: true, phrases: [], reason: "reviewer output unparseable" };
  }
  try {
    const obj = JSON.parse(stripped.slice(start, end + 1));
    const phrases = Array.isArray(obj.phrases)
      ? obj.phrases.filter((p: unknown): p is string => typeof p === "string" && p.trim().length > 0).slice(0, 12)
      : [];
    return {
      identifies: obj.identifies === true || phrases.length > 0,
      phrases,
      reason: typeof obj.reason === "string" ? obj.reason : "",
    };
  } catch {
    return { identifies: true, phrases: [], reason: "reviewer output unparseable" };
  }
};
