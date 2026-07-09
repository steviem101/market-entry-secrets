/**
 * Build renderable cards from the scraped competitor set (Stage 5 render bug B7).
 *
 * The competitor_landscape section wrote prose ABOUT competitors but attached no
 * cards (getMatchesForSection returned []), so the reader got named competitors
 * with no way to visit them and a prose-without-cards inconsistency. This turns
 * the structured CompetitorData into external "Visit site" cards that line up
 * with the prose.
 *
 * Pure module — NO Deno globals, NO I/O — unit-tested under `node --test`.
 */

export interface CompetitorLike {
  name?: unknown;
  url?: unknown;
  description?: unknown;
  au_presence?: unknown;
}

export interface CompetitorCard {
  name: string;
  subtitle?: string;
  website?: string;
  link?: string;
  linkLabel: string;
  source: "web";
  tags: string[];
}

const clip = (s: unknown, n: number): string => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, n);

// De-dupe key: strip a trailing parenthetical ("Juicebox (formerly PeopleGPT)" →
// "juicebox") so the extraction LLM emitting BOTH the bare and the parenthetical
// form collapses to one card (Floats2 review N1). Whitespace/case-normalised.
export function competitorDedupeKey(name: string): string {
  return String(name ?? "")
    .toLowerCase()
    .replace(/\s*\([^)]*\)\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Scrape-failure fallback strings from the competitor pipeline ("Website could not
// be analysed." / "Could not extract competitor intelligence."). They're honest in
// the raw data but read as a broken card when rendered as the subtitle (Novade
// report: Hammertech). Suppress them — a name-only card beats an error message.
const FAILURE_DESCRIPTION_RE = /could not be analysed|could not extract/i;

/** Accept only http(s) URLs so a card never links to a junk/relative string. */
function httpUrl(u: unknown): string | undefined {
  const s = clip(u, 500);
  return /^https?:\/\/\S+$/i.test(s) ? s : undefined;
}

/**
 * Map competitors to cards, dropping unnamed rows and de-duping by name (first
 * wins). `au_presence` — the single most decision-useful competitive signal —
 * becomes a short tag when present. Returns at most `cap` cards.
 */
export function buildCompetitorCards(competitors: CompetitorLike[] | null | undefined, cap = 6): CompetitorCard[] {
  const out: CompetitorCard[] = [];
  const seen = new Set<string>();
  for (const c of competitors || []) {
    const name = clip(c?.name, 80);
    if (!name) continue;
    const key = competitorDedupeKey(name);
    if (seen.has(key)) continue;
    seen.add(key);

    const url = httpUrl(c?.url);
    // A trimmed au_presence with real content (not the "none evident" sentinel)
    // is the most useful at-a-glance signal; surface it as a tag.
    const au = clip(c?.au_presence, 60);
    const hasAu = au && !/no australian presence/i.test(au);

    const desc = clip(c?.description, 140);
    out.push({
      name,
      subtitle: desc && !FAILURE_DESCRIPTION_RE.test(desc) ? desc : undefined,
      website: url,
      link: url,
      linkLabel: url ? "Visit site" : "",
      source: "web",
      tags: hasAu ? ["AU presence"] : [],
    });
    if (out.length >= cap) break;
  }
  return out;
}
