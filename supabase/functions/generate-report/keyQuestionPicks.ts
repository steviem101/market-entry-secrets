/**
 * "Who can help you with this" picks for the Key Question answer.
 *
 * Pure module — NO Deno globals, NO I/O — importable by the edge function AND
 * unit-tested under Node (`node --test`), like matchRerank.ts / matchScoring.ts.
 * The LLM call stays in index.ts (callAI); this owns candidate assembly, prompt
 * construction, response parsing, and card building.
 *
 * Why it exists (Floats report feedback, 8 Jul 2026): the report already answers
 * the user's stated key question ("find head of sales") in prose, but surfaces
 * nobody the user could actually contact to solve it. The matched directory
 * ALREADY contained the ideal helper (Daniel Grindrod — LaunchPad, APAC GTM &
 * tech-sales community) with no signposting. This picks up to 2 entities FROM
 * THE ALREADY-MATCHED SLATE most able to help with the key question and renders
 * them as cards directly under the answer.
 *
 * Grounding + safety:
 *  - Picks are restricted to the matched rows the report already surfaces — the
 *    LLM chooses by reference number, it cannot add or invent an entity.
 *  - Fail-open: no focus, no candidates, or an unparseable reply → zero picks
 *    (the section renders exactly as before).
 *  - Only "who you can contact" pools are offered (mentors, providers,
 *    investors, hubs, agencies) — never events/leads/guides.
 */

interface Row {
  name?: unknown;
  title?: unknown;
  subtitle?: unknown;
  location?: unknown;
  description?: unknown;
  match_reasons?: unknown;
  [k: string]: unknown;
}

/** Pools that represent a person or organisation the user could approach for help.
 *  Ordered by how directly "a contact who can help" they usually are. */
export const HELP_TABLES = [
  "community_members",
  "service_providers",
  "innovation_ecosystem",
  "investors",
  "trade_investment_agencies",
] as const;

const HELP_HEADINGS: Record<string, string> = {
  community_members: "Mentors",
  service_providers: "Service providers",
  innovation_ecosystem: "Innovation hubs / accelerators / associations",
  investors: "Investors",
  trade_investment_agencies: "Trade & government bodies",
};

/** Cap offered candidates so the prompt stays cheap; matched pools are already small. */
const MAX_CANDIDATES = 24;
/** Never surface more than this many picks — two is the ask; keeps the block tight. */
export const MAX_PICKS = 2;

export interface PickCandidate {
  ref: number;
  tbl: string;
  idx: number;
  label: string;
}

const clip = (s: unknown, n: number): string =>
  String(s ?? "").replace(/\s+/g, " ").trim().slice(0, n);

/** Flatten the matched helper pools into numbered candidates (capped). */
export function buildPickCandidates(matches: Record<string, Row[]>): PickCandidate[] {
  const items: PickCandidate[] = [];
  let ref = 1;
  for (const tbl of HELP_TABLES) {
    for (let idx = 0; idx < (matches[tbl] || []).length; idx++) {
      if (items.length >= MAX_CANDIDATES) return items;
      const m = matches[tbl][idx];
      const name = clip(m?.name || m?.title, 80);
      if (!name) continue;
      const bits = [
        clip(m?.subtitle || m?.location, 70),
        clip(m?.description, 120),
        Array.isArray(m?.match_reasons) ? clip(m.match_reasons.join("; "), 80) : "",
      ].filter(Boolean);
      items.push({ ref: ref++, tbl, idx, label: `${name}${bits.length ? ` — ${bits.join(" | ")}` : ""}` });
    }
  }
  return items;
}

/** Build the pick prompt. `reportFocus` is the user's verbatim key question. */
export function buildPicksPrompt(reportFocus: string, companyContext: string, candidates: PickCandidate[]): string {
  const grouped: string[] = [];
  for (const tbl of HELP_TABLES) {
    const rows = candidates.filter((c) => c.tbl === tbl);
    if (rows.length === 0) continue;
    grouped.push(`### ${HELP_HEADINGS[tbl] || tbl}\n${rows.map((c) => `${c.ref}. ${c.label}`).join("\n")}`);
  }
  return `A client asked for ONE thing above all from their Australian market-entry report:
"${reportFocus}"

The client: ${companyContext}

Below are the people and organisations already matched into their report, numbered. Choose the ${MAX_PICKS} (or fewer) that are MOST able to directly help the client achieve that one thing — the contacts a sharp advisor would tell them to reach out to first. Only choose numbers from the list. If none are a genuinely strong fit, return an empty list rather than a weak pick.

${grouped.join("\n\n")}

Respond with ONLY a JSON object, no markdown fences:
{"picks": [{"ref": <number>, "why": "<max 18 words: why THIS contact helps with the client's stated goal>"}]}
Return at most ${MAX_PICKS}. If none is a strong fit: {"picks": []}`;
}

export interface Pick {
  tbl: string;
  idx: number;
  why: string;
}

/** Tolerant parse: unknown/duplicate refs dropped, capped at MAX_PICKS, fail-open to []. */
export function parsePicks(aiText: string, candidates: PickCandidate[]): Pick[] {
  try {
    const cleaned = (aiText || "").replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start < 0 || end <= start) return [];
    const obj = JSON.parse(cleaned.slice(start, end + 1));
    if (!Array.isArray(obj?.picks)) return [];
    const byRef = new Map(candidates.map((c) => [c.ref, c]));
    const out: Pick[] = [];
    const seen = new Set<number>();
    for (const p of obj.picks) {
      const ref = Number(p?.ref);
      if (!Number.isInteger(ref) || seen.has(ref)) continue;
      const cand = byRef.get(ref);
      if (!cand) continue;
      seen.add(ref);
      out.push({ tbl: cand.tbl, idx: cand.idx, why: clip(p?.why, 140) });
      if (out.length >= MAX_PICKS) break;
    }
    return out;
  } catch {
    return [];
  }
}

export interface PickCard {
  name: string;
  subtitle?: string;
  tags: string[];
  link?: string;
  linkLabel?: string;
  website?: string;
  source?: string;
  /** Marks the card as a curated key-question pick (frontend may badge it). */
  key_question_pick: true;
}

/**
 * Resolve picks against the live matched rows into render-ready cards. The pick's
 * "why" becomes the card subtitle (the reason it helps is more useful here than
 * the row's generic role/location line); name/link/website are preserved so the
 * card is clickable. Rows that vanished between pick and render are skipped.
 */
export function buildPickCards(matches: Record<string, Row[]>, picks: Pick[]): PickCard[] {
  const cards: PickCard[] = [];
  for (const p of picks) {
    const row = (matches[p.tbl] || [])[p.idx];
    if (!row) continue;
    const name = clip(row.name || row.title, 80);
    if (!name) continue;
    cards.push({
      name,
      subtitle: p.why || clip(row.subtitle || row.location, 120) || undefined,
      tags: [],
      link: typeof row.link === "string" ? row.link : undefined,
      linkLabel: typeof row.linkLabel === "string" ? row.linkLabel : undefined,
      website: typeof row.website === "string" ? row.website : undefined,
      source: typeof row.source === "string" ? row.source : undefined,
      key_question_pick: true,
    });
  }
  return cards;
}
