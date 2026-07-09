/**
 * "Your First Customers" target-account briefs (v1 — rendered inside action_plan).
 *
 * Pure module — NO Deno globals, NO I/O — importable by the edge function AND
 * unit-tested under Node (`node --test`), like competitorCards.ts / matchScoring.ts.
 *
 * Why: the intake's end-buyer chips reached only two thin action_plan bullets and
 * the ICP one-liner ("head of marketing at recruitment agency") reached NO prompt
 * at all. v1 turns the existing per-buyer scrape + one batched Perplexity pass into
 * per-account briefs with grounded signals and approach-title guidance. Named
 * individuals are deliberately excluded (PII / accuracy / public share links) —
 * contact fulfilment stays on the custom lead-list request flow.
 */

export interface BuyerLike {
  name?: unknown;
  url?: unknown;
  description?: unknown;
  key_info?: unknown;
  tech_signals?: unknown;
  hiring_signals?: unknown;
  unverified?: unknown;
}

export interface ParsedIcp {
  /** e.g. ["Head of Marketing"] — the buying-committee titles the user asked for */
  titles: string[];
  /** e.g. "recruitment agency" — the org descriptor half of the one-liner */
  org_type: string;
}

/**
 * Parse the free-text ICP one-liner ("head of marketing at recruitment agency",
 * "CTO or Head of Data in mid-size banks") into titles + org type. Heuristic on
 * purpose: split on the LAST " at " / " in " / " within " connector; the left side
 * is one or more titles (split on ","/" or "/" and "), Title Cased. No connector →
 * the whole line is an org descriptor (no title claim is safer than a wrong one).
 */
export function parseIcpDescription(desc: string | null | undefined): ParsedIcp {
  const s = (desc ?? "").replace(/\s+/g, " ").trim();
  if (!s) return { titles: [], org_type: "" };
  const m = s.match(/^(.*?)\s+(?:at|in|within)\s+(.+)$/i);
  if (!m) return { titles: [], org_type: s };
  const titleCase = (t: string) =>
    t.trim().replace(/\b([a-z])/g, (c) => c.toUpperCase()).replace(/\bOf\b/g, "of").replace(/\bAnd\b/g, "and");
  const titles = m[1]
    .split(/,|\bor\b|\band\b|\//i)
    .map((t) => titleCase(t))
    .filter((t) => t.length >= 3);
  return { titles, org_type: m[2].trim() };
}

// Generic tokens that can't distinguish one company from another in a domain.
const GENERIC_NAME_TOKENS = new Set([
  "recruitment", "recruiting", "group", "australia", "australian", "services",
  "solutions", "company", "agency", "consulting", "partners", "global", "the",
  "and", "legal", "lawyers", "labs", "tech", "digital", "media", "holdings",
]);

/**
 * Wrong-company gate for NAME-ONLY chips: resolveDomainFromName takes a top search
 * result, and an ambiguous name ("walter page") can resolve to an unrelated
 * business — a confidently wrong brief is worse than none. True only when EVERY
 * distinctive name token appears in the resolved host ("walter page" vs
 * michaelpage.com.au shares "page" but not "walter" → rejected). Deliberately
 * conservative: an abbreviated-domain false negative degrades to an honest
 * identification note, while a false positive ships a wrong-company brief.
 * All-generic names return false (unverifiable). User-supplied websites skip
 * this gate entirely.
 */
export function nameMatchesDomain(name: string | null | undefined, url: string | null | undefined): boolean {
  const host = String(url ?? "").toLowerCase().replace(/^https?:\/\//, "").split("/")[0].replace(/[^a-z0-9]/g, "");
  if (!host) return false;
  const tokens = String(name ?? "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 4 && !GENERIC_NAME_TOKENS.has(t));
  if (tokens.length === 0) return false;
  return tokens.every((t) => host.includes(t));
}

export interface BuyerCard {
  name: string;
  subtitle?: string;
  website?: string;
  link?: string;
  linkLabel: string;
  source: "web";
  tags: string[];
}

const clip = (s: unknown, n: number): string => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, n);
const FAILURE_RE = /could not be analysed|could not extract/i;

/** Cards for the verified briefed accounts (mirrors competitor cards). */
export function buildBuyerCards(buyers: BuyerLike[] | null | undefined, cap = 5): BuyerCard[] {
  const out: BuyerCard[] = [];
  for (const b of buyers || []) {
    const name = clip(b?.name, 80);
    if (!name || b?.unverified === true) continue;
    const url = clip(b?.url, 500);
    const website = /^https?:\/\/\S+$/i.test(url) ? url : undefined;
    const desc = clip(b?.description, 140);
    const tags: string[] = [];
    if (clip(b?.hiring_signals, 60)) tags.push("Hiring now");
    if (clip(b?.tech_signals, 60)) tags.push("Tech identified");
    out.push({
      name,
      subtitle: desc && !FAILURE_RE.test(desc) ? desc : undefined,
      website,
      link: website,
      linkLabel: website ? "Visit site" : "",
      source: "web",
      tags,
    });
    if (out.length >= cap) break;
  }
  return out;
}

/**
 * System-prompt note for the action_plan section instructing the "Your First
 * Customers" subsection. Embeds the per-buyer data + batched account research and
 * the grounding rules; empty string when there are no chips (note pattern —
 * no report_templates migration needed for v1).
 */
export function buildBuyerBriefsNote(
  buyers: BuyerLike[] | null | undefined,
  icp: ParsedIcp,
  companyName: string,
  accountResearch?: string,
): string {
  const all = (buyers || []).filter((b) => clip(b?.name, 80));
  if (all.length === 0) return "";
  const verified = all.filter((b) => b?.unverified !== true);
  const unverified = all.filter((b) => b?.unverified === true);
  const data = verified.map((b) => ({
    name: clip(b.name, 80), url: clip(b.url, 200), description: clip(b.description, 400),
    key_info: clip(b.key_info, 500), tech_signals: clip(b.tech_signals, 300), hiring_signals: clip(b.hiring_signals, 300),
  }));
  const titles = icp.titles.length ? icp.titles.join(", ") : "";
  // The account research arrives with Perplexity's OWN [N] markers, whose sources
  // are NOT in the report's citation list (research citations are deliberately not
  // pooled — matching researchEndBuyerProcurement). If the model copied them into
  // prose they'd renumber against the WRONG sources (the [Cost Data] failure class),
  // so strip them before embedding.
  const research = accountResearch ? clip(accountResearch, 3000).replace(/\[\d+\]/g, "") : "";
  return `\n\nYOUR FIRST CUSTOMERS (this section): The user named ${all.length} specific target account(s) in their intake. Open the section with a "### Your First Customers" subsection covering EACH verified account below before the phased plan. Per account include: 1) who they are (from the data), 2) signals — recent news and any roles they are hiring for right now, 3) tech & tools context ONLY if evident in the data, otherwise write "No tech signals evident", 4) why they fit ${companyName}, 5) WHO TO APPROACH — recommend job titles${titles ? `, anchored on the user's stated target: ${titles}${icp.org_type ? ` at ${icp.org_type}` : ""}` : ""} (titles only — NEVER name or invent specific individuals), 6) a concrete opening angle grounded in the signals. Use ONLY the account data and research provided — never invent facts, tech stacks, or figures.${unverified.length ? ` The following account name(s) could not be confidently identified (no website given): ${unverified.map((b) => clip(b.name, 60)).join(", ")} — add one line advising the user to attach a website in their intake for a full brief; do NOT guess who they are.` : ""}${research ? `\n\nACCOUNT RESEARCH (background context — do NOT attach [N] citation markers to facts drawn from it):\n${research}` : ""}\n\nACCOUNT DATA:\n${JSON.stringify(data)}`;
}
