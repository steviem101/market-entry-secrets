/**
 * "Your First Customers" target-account briefs (v2 — dedicated growth-tier section).
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

/**
 * When the user named NO specific target accounts (the common case), the
 * first_customers section has no per-account briefs to write, so historically it
 * free-formed ICP prose in an inconsistent shape the renderer could not use
 * (25 live reports: only 1 emitted a machine-readable structure). This note makes
 * the section END with a STABLE, parseable ICP block — three fixed bold labels —
 * so the adapter can populate the report_v2 §04 ICP card reliably. Grounded:
 * roles anchored on the user's own ICP one-liner when they gave one; titles only,
 * never invents individuals. Returns "" so the caller can `buyerBriefsNote || icpGuidanceNote`
 * — an empty string here means "accounts WERE named, briefs take over".
 */
export function buildIcpGuidanceNote(icp: ParsedIcp, companyName: string, sectorText: string): string {
  const anchor = icp.titles.length
    ? ` Anchor the roles on the user's stated target (${icp.titles.join(", ")}${icp.org_type ? ` at ${icp.org_type}` : ""}) and refine from there.`
    : "";
  const sectorClipped = String(sectorText ?? "").replace(/\s+/g, " ").trim().slice(0, 200);
  const sector = sectorClipped ? ` grounded in ${companyName}'s space (${sectorClipped})` : "";
  return `\n\nNO NAMED TARGET ACCOUNTS (this section): the user did not name specific companies, so DO NOT invent named accounts or write "### <Company>" briefs. Give concise strategic ICP guidance, then END the section with EXACTLY this block — three lines, each beginning with the bold label shown, and nothing after the third line:\n\n**Target Roles:** 3–5 specific job titles ${companyName} should approach first (titles ONLY — never name or invent individuals).${anchor}\n**Sector Focus:** the single most promising customer segment to prioritise${sector}.\n**Opening Angle:** one concrete, grounded opening angle for the first conversation.\n\nUse ONLY grounded facts — never invent figures, roles, or companies.`;
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
 * System-prompt note for the first_customers section: embeds the per-buyer data +
 * batched account research and the grounding rules. Empty string when there are no
 * chips (the section template then writes a short invite instead).
 */
export function buildBuyerBriefsNote(
  buyers: BuyerLike[] | null | undefined,
  icp: ParsedIcp,
  companyName: string,
  accountResearch?: string,
  totalChips?: number,
): string {
  const all = (buyers || []).filter((b) => clip(b?.name, 80));
  if (all.length === 0) return "";
  // The scrape caps at 3 accounts while the form accepts 5 — say so rather than
  // silently truncate (a reader who named 5 companies notices 2 missing).
  const capNote = (totalChips ?? all.length) > all.length
    ? ` The user named ${totalChips} accounts; the first ${all.length} are briefed here — add one line noting the remaining accounts are not covered in this report.`
    : "";
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
  // The bold labels below are a PARSE CONTRACT with the report_v2 adapter
  // (parseAccountBriefs): each maps 1:1 onto the §04 account-card fields
  // (Signals / Stack / Fit / APPROACH / ANGLE). Change them only in lockstep.
  return `\n\nYOUR FIRST CUSTOMERS (this section): The user named ${all.length} specific target account(s) in their intake.${capNote} This IS the "Your First Customers" section — cover EACH verified account below as its own "### [<Account Name>](<account website url>)" subsection (plain "### <Account Name>" if no url is in the data). Structure EVERY account subsection with EXACTLY these bold-label lines, in this order, nothing else:\n**Who they are:** who they are, from the data, in one sentence.\n**Signals:** recent news and any roles they are hiring for right now — name the SPECIFIC roles from the data (e.g. "hiring 3 recruiters and a Head of Delivery").\n**Stack:** the SPECIFIC platforms/tools evident in the data and how ${companyName} fits alongside them; write "No tech signals evident" if none.\n**Why they fit:** why this account fits ${companyName}.\n**Who to approach:** recommended job titles${titles ? `, anchored on the user's stated target: ${titles}${icp.org_type ? ` at ${icp.org_type}` : ""}` : ""} (titles only — NEVER name or invent specific individuals).\n**Opening angle:** one concrete opening line/angle grounded in the signals above.\nUse ONLY the account data and research provided — never invent facts, tech stacks, or figures.${unverified.length ? ` The following account name(s) could not be confidently identified (no website given): ${unverified.map((b) => clip(b.name, 60)).join(", ")} — add one line advising the user to attach a website in their intake for a full brief; do NOT guess who they are.` : ""}${research ? `\n\nACCOUNT RESEARCH (background context — do NOT attach [N] citation markers to facts drawn from it):\n${research}` : ""}\n\nACCOUNT DATA:\n${JSON.stringify(data)}`;
}
