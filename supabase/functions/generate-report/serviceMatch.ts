/**
 * Token-overlap service matching for the directory scorer (same-slate follow-up).
 *
 * Pure module — NO Deno globals, NO I/O — importable by the edge function AND
 * unit-tested under Node (`node --test`), like matchScoring.ts / cardFields.ts.
 *
 * Why it exists (duplication analysis, 7 Jul 2026): the scorer's service-fit
 * dimension compared the user's goal tags ("Advisory", "Accounting", "Legal")
 * against provider `services` labels with EXACT string equality — but those
 * labels are free text (619 distinct values across 95 providers): "Corporate
 * Advisory", "Audit & Assurance", "Deal Advisory & Infrastructure". Only rows
 * that happened to use the bare canonical word earned the +2/+4 service fit —
 * typically the big generalists — which is one of the reasons EY/KPMG/PwC/
 * MinterEllison topped 8-10 of the last 15 reports while niche firms scored 0
 * (report-generation-quality skill, pitfall 5: "matching that never matches").
 *
 * The fix compares MEANINGFUL WORDS instead of whole strings:
 *   tag "Advisory"  ~ label "Deal Advisory & Infrastructure"   (shares "advisory")
 *   tag "Events"    ~ label "Event Management"                 (de-pluralised)
 *   tag "Co-working"~ label "Coworking Spaces"                 (hyphen folded)
 * while stopwords keep it honest: label "Business Services" shares no meaningful
 * token with tag "Legal Services" ("business"/"services" are stopworded), so the
 * everything-matches-everything failure mode is fenced off. A label that is
 * exactly equal to a tag always still matches (token overlap is a superset of
 * the old exact-equality behaviour for every tag in the goal vocabulary).
 *
 * Scoring semantics are unchanged — scoreRow still counts MATCHING LABELS and
 * caps at 2 (min(k,2)*2); only the equality test loosens. Note the SQL candidate
 * fetch (`services.cs.{tag}`) still uses exact-contains — that's fine on today's
 * data because the affected pools are fetched via sector_agnostic/sector_tags
 * clauses anyway (e.g. all 95 providers are agnostic), so the scorer sees them.
 */

// Words that carry no service meaning on their own. CRITICAL property: none of
// these may be the sole meaningful token of a goal tag (see goalServiceTags.ts —
// "Advisory", "HR", "Tax"… all survive), or that tag would stop matching at all.
const STOPWORDS = new Set<string>([
  // glue
  "and", "the", "for", "with", "from", "into", "your", "our", "all", "other",
  "more", "of", "to", "in", "on", "at", "a", "an", "as", "by", "or", "via",
  "it", "its", "co",
  // generic service filler
  "services", "service", "solutions", "solution", "support", "supports",
  "group", "global", "general", "business", "professional", "specialist",
  "specialists", "provider", "providers",
  // geography filler common in labels
  "australia", "australian", "new", "zealand", "nsw", "sydney", "melbourne",
]);

// Meaningful tokens shorter than 3 chars (goal tag "HR").
const ALLOW_SHORT = new Set<string>(["hr"]);

/**
 * Tokenise a service label/tag into its meaningful words: lowercase, hyphens
 * folded ("Co-working" → "coworking"), split on non-alphanumerics, stopwords and
 * short junk dropped, naive de-pluralisation (len > 3: "events" → "event") so
 * singular/plural variants meet in the middle.
 */
export function serviceTokens(label: unknown): Set<string> {
  const out = new Set<string>();
  const text = String(label ?? "").toLowerCase().replace(/-/g, "");
  for (let w of text.split(/[^a-z0-9]+/)) {
    if (!w || STOPWORDS.has(w)) continue;
    if (w.length < 3 && !ALLOW_SHORT.has(w)) continue;
    if (w.length > 3 && w.endsWith("s")) w = w.slice(0, -1);
    out.add(w);
  }
  return out;
}

/**
 * How many of the row's service labels match at least one goal tag? A tag
 * matches a label iff ALL of the tag's meaningful tokens appear in the label
 * (tag ⊆ label). Drop-in replacement for the old exact-equality overlap count
 * in scoreRow's service dimension.
 *
 * The subset direction matters: any-shared-token was too loose — "Trade &
 * Government" matched the tag "Trade Advisory" on the word "trade" alone,
 * re-inflating exactly the trade-generalist profile the scorer rebalance
 * demoted, and "Working Capital Finance" matched "Venture Capital" on
 * "capital". Requiring every tag token keeps single-word tags ("Advisory",
 * "Tax") as permissive as intended while making multi-word tags ("Trade
 * Advisory", "Venture Capital", "Chamber of Commerce") mean their whole phrase.
 */
export function countServiceMatches(
  rowLabels: unknown[] | null | undefined,
  goalTags: string[] | null | undefined,
): number {
  const tagSets = (goalTags || []).map(serviceTokens).filter((s) => s.size > 0);
  if (tagSets.length === 0) return 0;
  let n = 0;
  for (const label of rowLabels || []) {
    const lt = serviceTokens(label);
    if (lt.size === 0) continue;
    const hit = tagSets.some((ts) => [...ts].every((tok) => lt.has(tok)));
    if (hit) n++;
  }
  return n;
}
