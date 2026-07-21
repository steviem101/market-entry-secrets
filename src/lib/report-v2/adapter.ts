import type {
  AccountBrief,
  Chip,
  CompetitorRow,
  EntityKind,
  EntityRef,
  MatchCard,
  Paragraph,
  PersonCard,
  RankedItem,
  Report,
  StatTile,
} from "@/types/report";
import { extractDomain, getLogoUrl } from "../logoUtils.ts";
import { isPlatformPath } from "./format.ts";

/**
 * Phase-A adapter: maps the CURRENT generate-report pipeline output
 * (report_json = { company_name, sections.{name}.{content,visible,matches},
 * matches, metadata.{perplexity_citations,key_metrics} }) into the report_v2
 * Report contract. Contract fields the pipeline cannot supply yet degrade to
 * empty structures and are LOGGED as mismatches — never thrown (ticket 4).
 * Phase B (tickets 17–20) closes the gaps pipeline-side; mapping fixes land
 * here, never in the renderer.
 */

export interface AdapterMismatch {
  path: string;
  issue: string;
}

interface PipelineSection {
  content?: string;
  visible?: boolean;
  matches?: PipelineMatch[];
}

interface PipelineMatch {
  name?: string;
  title?: string;
  link?: string;
  linkLabel?: string;
  subtitle?: string;
  description?: string;
  enriched_description?: string;
  strengths?: string[];
  differs?: string;
  match_reasons?: string[];
  tags?: string[];
  logo_url?: string;
  avatar_url?: string;
  website?: string;
  url?: string;
  date?: string;
  location?: string;
  record_count?: number;
  [key: string]: unknown;
}

interface KeyMetric {
  label?: string;
  value?: string;
  context?: string;
  estimated?: boolean;
}

export interface PipelineReportJson {
  company_name?: string;
  sections?: Record<string, PipelineSection>;
  matches?: Record<string, PipelineMatch[]>;
  metadata?: {
    perplexity_citations?: string[];
    key_metrics?: KeyMetric[];
    company_strengths?: string[];
    company_positioning?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/** Caller-supplied context from user_reports + the intake row. */
export interface AdaptContext {
  domain?: string;
  location?: string;
  /** ISO date — user_reports.created_at. */
  date?: string;
  /** user_reports.tier_at_generation. */
  tier?: string;
  keyQuestion?: string;
  descriptor?: string;
}

type Log = (path: string, issue: string) => void;

/**
 * Contract URLs are platform-relative paths ONLY. Anything else — absolute
 * URLs, protocol-relative, schemes — is rejected and logged, so no
 * pipeline-supplied string can become a javascript:/https: href downstream.
 */
export function sanitizeContractPath(url: unknown, path: string, log: Log): string {
  if (url === "") return ""; // intentionally link-less row — stay silent
  if (isPlatformPath(url)) return url;
  if (typeof url !== "string") {
    log(path, `missing link (got ${JSON.stringify(url)})`);
    return "";
  }
  log(path, `non-platform link rejected: ${url.slice(0, 80)}`);
  return "";
}

// Regulator/statute domains. Agency-name alternatives are anchored to a label
// boundary ((^|.) … (.|$)) so substrings inside ordinary vendor domains
// (mercato.com, cato.org, basic.com) are NOT misclassified as government.
const REGULATOR_RE =
  /(^|\.)(gov|legislation|austrade|asic|ato|accc|oaic|austrac|ipaustralia|fairwork)(\.|$)/i;
const ANALYST_HOSTS =
  /(ibisworld|statista|mordorintelligence|grandviewresearch|gartner|forrester|mckinsey|deloitte|pwc|kpmg|bcg\.|accenture|marketsandmarkets|frost\.com|euromonitor|oecd|worldbank|imf\.org)/i;

/** contracts.md: domain→tier lookup; unknown domains default to vendor. */
export function domainTier(url: string): "regulator" | "analyst" | "vendor" {
  const domain = extractDomain(url) ?? url;
  if (REGULATOR_RE.test(domain)) return "regulator";
  if (ANALYST_HOSTS.test(domain)) return "analyst";
  return "vendor";
}

const CITATION_MARKER_RE = /\s*\[\d+(?:\s*,\s*\d+)*\]/g;
const LIST_MARKER_RE = /^([-*•]|\d+[.)])\s+/;
const HEADING_RE = /^#{1,6}\s+(.*)$/;

/**
 * A [n] / [1, 2] citation marker becomes a {chip:sourced} ONLY when every
 * cited index is in range of the report's actual source list. Hallucinated or
 * out-of-range markers (and any marker when there are zero sources) are
 * dropped without minting a trust chip — the grounding invariant the chip
 * system exists to enforce.
 */
function citationToChip(marker: string, citationCount: number): string {
  const indices = marker.match(/\d+/g)?.map(Number) ?? [];
  const grounded =
    citationCount > 0 && indices.length > 0 && indices.every((n) => n >= 1 && n <= citationCount);
  return grounded ? " {chip:sourced}" : "";
}

/**
 * Pipeline prose → Paragraph[] under the three-construct grammar: validated
 * [n] citation markers become {chip:sourced}; markdown headings become their
 * OWN bold lead paragraph (never fused with the following line); list markers
 * (bulleted AND numbered) are stripped (grammar has no lists).
 */
export function toParagraphs(
  content: unknown,
  path: string,
  log: Log,
  citationCount = 0
): Paragraph[] {
  if (typeof content !== "string" || !content.trim()) {
    if (content) log(path, "non-string content");
    return [];
  }
  let hadHeadings = false;
  let hadLists = false;
  let hadRules = false;
  let hadQuotes = false;
  let droppedCitations = false;
  // Isolate heading lines into their own block so a heading followed by a
  // single newline does not fuse into the next sentence's paragraph.
  const isolated = content.replace(/^(#{1,6}\s+.*)$/gm, "\n\n$1\n\n");
  const paragraphs = isolated
    .split(/\n{2,}/)
    .map((block) =>
      block
        .split("\n")
        .map((line) => {
          let text = line.trim();
          // Drop horizontal rules and unwrap external markdown links to their
          // label (the contract link grammar is platform-relative only, so a
          // [label](https://…) can't be a chip-link — render the label).
          if (/^-{3,}$/.test(text)) {
            hadRules = true;
            return "";
          }
          text = text
            .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
            .replace(/\[([^\]]+)\]\((?:https?:|mailto:)[^)]*\)/gi, "$1");
          // A blockquote line (`> "quote"`) becomes plain text.
          if (/^>\s?/.test(text)) {
            hadQuotes = true;
            text = text.replace(/^>\s?/, "");
          }
          const heading = text.match(HEADING_RE);
          if (heading) {
            hadHeadings = true;
            // Strip ALL asterisks so a stray single '*' can't break bold tokenization.
            text = `**${heading[1].replace(/\*/g, "").trim()}**`;
          }
          if (LIST_MARKER_RE.test(text)) {
            hadLists = true;
            text = text.replace(LIST_MARKER_RE, "");
          }
          return text;
        })
        .filter(Boolean)
        .join(" ")
    )
    .map((p) => {
      const withChips = p.replace(CITATION_MARKER_RE, (marker) => {
        const chip = citationToChip(marker, citationCount);
        if (!chip) droppedCitations = true;
        return chip;
      });
      // A citation inside a **bold** span (e.g. "**$2.2B [3]**") lands the chip
      // token inside the bold construct, which the tokenizer would render as
      // literal text; move it just past the closing ** so it renders as a chip.
      return withChips
        .replace(/\s*(\{chip:(?:sourced|est|inferred)\})\s*\*\*/g, "** $1")
        .replace(/\s+/g, " ")
        .trim();
    })
    .filter(Boolean);
  if (hadHeadings) log(path, "markdown headings flattened to bold leads");
  if (hadLists) log(path, "list markers stripped (grammar has no lists)");
  if (hadRules) log(path, "horizontal rules removed");
  if (hadQuotes) log(path, "blockquote markers stripped to plain text");
  if (droppedCitations) log(path, "citation markers with no matching source dropped (no chip minted)");
  return paragraphs;
}

// Paid tiers that have no distinct contract plan value (contract plan is only
// "free" | "scale"). They collapse to the paid presentation so a paying
// customer never sees "FREE PLAN"; legacy premium→growth, concierge→enterprise
// per CLAUDE.md §8 are still paid.
const PAID_TIERS = new Set(["growth", "enterprise", "premium", "concierge"]);

export function mapPlan(tier: unknown, log: Log): Report["meta"]["plan"] {
  const t = typeof tier === "string" ? tier.trim().toLowerCase() : "";
  if (t === "free") return "free";
  if (t === "scale") return "scale";
  if (PAID_TIERS.has(t)) {
    log("meta.plan", `tier "${t}" mapped to scale (contract plan is free|scale only)`);
    return "scale";
  }
  // Unknown/empty → fail CLOSED to free, never over-grant paid presentation.
  log("meta.plan", t ? `unrecognised tier "${t}" — defaulted to free` : "tier_at_generation missing — defaulted to free");
  return "free";
}

const STATUS_CHIP_BY_TAG: Record<string, "hiring" | "tech"> = {
  "hiring now": "hiring",
  "tech identified": "tech",
  "tech id'd": "tech",
};

/** Map buyerBriefs' "Hiring now"/"Tech identified" tags to account status chips. */
function statusChipsFrom(tags: string[] | undefined): ("hiring" | "tech")[] {
  const chips = new Set<"hiring" | "tech">();
  for (const tag of tags ?? []) {
    const chip = STATUS_CHIP_BY_TAG[tag.trim().toLowerCase()];
    if (chip) chips.add(chip);
  }
  return [...chips];
}

const KIND_BY_PREFIX: [string, EntityKind][] = [
  ["/service-providers", "provider"],
  ["/mentors", "mentor"],
  ["/investors", "investor"],
  ["/events", "event"],
  ["/innovation-ecosystem", "hub"],
  ["/leads", "dataset"],
  ["/government-support", "org"],
];

const kindForPath = (path: string, fallback: EntityKind): EntityKind =>
  KIND_BY_PREFIX.find(([prefix]) => path.startsWith(prefix))?.[1] ?? fallback;

const matchName = (m: PipelineMatch): string => m.name || m.title || "";

/**
 * Strip the markdown/HTML artifacts a scraped or LLM string can carry down to
 * plain prose suitable for a card/caption. Images dropped, links unwrapped to
 * their label, headings/blockquote/list markers and `---` rules removed, bold
 * unwrapped, whitespace collapsed. (Paragraph fields that keep the {bold|link|
 * chip} grammar go through toParagraphs instead — this is for plain text.)
 */
const stripInlineMarkdown = (s: string): string =>
  s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s*#{1,6}\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*[-*•]\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(^|\n)\s*-{3,}\s*(?=\n|$)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

// A scrape that returned an error/interstitial page instead of real copy.
const ERROR_PAGE_RE =
  /\b40[34]\b|forbidden|page not found|access to this resource|access denied|is not available|enable javascript|are you a robot/i;

// Curation notation that must never reach customer copy (directory-internal).
const stripInternalNotes = (s: string): string =>
  s
    .replace(/\s*\(ID \d+\)\.?/g, "")
    .replace(/\bThis entry represents an? [^.]*\.\s*/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

/** Sentence/word-boundary cap that never slices mid-word or mid-character. */
const capText = (text: string, cap = 180): string => {
  if (text.length <= cap) return text;
  const cut = text.slice(0, cap);
  const sentenceEnd = cut.lastIndexOf(". ");
  const lastSpace = cut.lastIndexOf(" ");
  const boundary = sentenceEnd > cap * 0.4 ? sentenceEnd + 1 : lastSpace;
  return `${(boundary > 0 ? cut.slice(0, boundary) : cut).trimEnd()}…`;
};
// 260 matches matchDescription's own cap, so a card blurb is capped ONCE at the
// source rather than re-truncated to 180 here — the latter clipped complete
// provider copy for no layout reason (Solidroad smoke test: §05 "shortening
// service providers text for no reason").
const trimWhy = (text: string): string => capText(text, 260);

// Tidy only a trailing dangling connector/comma. We deliberately do NOT drop a
// final word: a period-less phrase is almost always a complete tagline, not a
// mid-word clip, and guessing "clipped" amputated real copy from competitor
// subtitles (e.g. "…software for Australian lenders" → "…software for Australian…").
// A genuine pipeline mid-word clip is rare and renders as-is — never corrupt
// valid text to maybe-clean a rare one (review finding).
const tidyClip = (s: string): string => s.trim().replace(/[\s,;:—-]+$/, "");

/**
 * Customer-facing card copy. NEVER uses `enriched_description` — that field is
 * the raw website scrape (nav menus, `## headings`, image markdown, and even
 * "403 Forbidden" pages) and was the source of the bulk of the real-data
 * defects. Uses the curated `description`/`subtitle`, strips markdown + curation
 * notes, drops obvious error-page scrapes, and caps to a card-sized blurb.
 */
const matchDescription = (m: PipelineMatch, cap = 260): string => {
  const raw = (m.description || m.subtitle || "").trim();
  if (!raw) return "";
  const plain = stripInternalNotes(stripInlineMarkdown(raw));
  if (!plain || (ERROR_PAGE_RE.test(plain) && plain.length < 160)) return "";
  return capText(plain, cap);
};

// A directory tag that is a placeholder, not a real label — never render it.
const cleanTag = (tag: string | undefined): string =>
  tag && !/^n\/?a\b/i.test(tag.trim()) ? tag : "";

// A company logo is only meaningful for a real company domain. Personal/social
// hosts (mentors' + many angels' `website` is a LinkedIn URL) would resolve to
// the PLATFORM's logo, not the entity's — worse than the monogram — so skip them.
const SOCIAL_DOMAIN_RE = /(?:^|\.)(?:linkedin|lnkd|twitter|x|t|facebook|fb|instagram|threads|bsky|medium|substack|github|youtube|youtu|crunchbase|angel|wellfound|gmail)\.[a-z.]+$/i;

/**
 * Best-effort company logo (logo.dev, DPR-2 for the 28px company slot) derived
 * from a card's own site — no pipeline field needed, so it lights up existing
 * reports. Returns undefined for social/personal domains and unparseable input;
 * `IdentitySlot` already falls back to a monogram on absent or failed loads.
 */
function companyLogoUrl(...sites: unknown[]): string | undefined {
  for (const site of sites) {
    if (typeof site !== "string" || !site.trim()) continue;
    const domain = extractDomain(site);
    if (!domain || SOCIAL_DOMAIN_RE.test(domain)) continue;
    const url = getLogoUrl(site, 56);
    if (url) return url;
  }
  return undefined;
}

function toMatchCard(m: PipelineMatch, kind: EntityKind, path: string, log: Log): MatchCard {
  const url = sanitizeContractPath(m.link, `${path}.link`, log);
  return {
    name: matchName(m),
    url,
    kind: url ? kindForPath(url, kind) : kind,
    tag: cleanTag(m.tags?.[0]),
    description: matchDescription(m),
    logoUrl: (typeof m.logo_url === "string" && m.logo_url ? m.logo_url : undefined)
      ?? companyLogoUrl(m.website, m.url),
  };
}

function toRanked(cards: MatchCard[], subtitleOf: (i: number) => string, path: string, log: Log): RankedItem[] {
  if (cards.length > 0) log(path, "ranked read synthesised from match order (R8 lands in Phase B)");
  return cards.slice(0, 3).map((card, i) => ({
    name: card.name,
    url: card.url,
    kind: card.kind,
    rank: (i + 1) as 1 | 2 | 3,
    meta: subtitleOf(i),
    why: trimWhy(card.description),
    roleTag: card.tag,
    logoUrl: card.logoUrl,
  }));
}

const firstSentence = (text: string): string => {
  const m = text.match(/^.*?[.!?](\s|$)/);
  return (m ? m[0] : text).trim();
};

// Intake-request prose (R5: never render "provide a list of target companies"
// apology/guidance as section copy).
const INTAKE_GUIDANCE_RE =
  /\b(provide a list|in your intake|please provide|specify your (?:target|criteria)|prevents the generation)\b/i;

/**
 * The lead strategic paragraph of a prose section: the first paragraph that is
 * neither a heading-only lead nor R5 intake-guidance. Used to give §04/§07/§13
 * a grounded intro line without dumping the whole multi-heading blob (or
 * duplicating the section's own cards).
 */
const leadParagraph = (content: unknown, citationCount: number): string => {
  for (const p of toParagraphs(content, "lead", () => {}, citationCount)) {
    const t = p.trim();
    if (/^\*\*[^*]+\*\*$/.test(t)) continue; // heading-only lead
    if (INTAKE_GUIDANCE_RE.test(p.replace(/\*\*/g, ""))) continue; // R5
    return p;
  }
  return "";
};

/**
 * R11 relevance gate (contracts.md), conservative Phase-A form: drop matches
 * whose description marks them as plainly non-commercial (the documented real
 * case: the singer "Clay Aiken" surfaced as a sales-tech competitor). Logged,
 * never rendered. The full sector-relevance linter lands in Phase B (t20).
 */
const R11_NON_COMMERCIAL_RE =
  /\b(singer|entertainer|musician|actor|actress|celebrity|athlete|footballer|politician)\b/i;

export function passesRelevanceGate(m: PipelineMatch, path: string, log: Log): boolean {
  const description = matchDescription(m);
  if (R11_NON_COMMERCIAL_RE.test(description)) {
    log(path, `R11 relevance gate dropped "${matchName(m)}" (non-commercial match)`);
    return false;
  }
  return true;
}

/**
 * Honest-degradation signal (t20). The matcher records WHY each row surfaced in
 * `match_reasons`; a genuine sector hit reads "industry match …" / "sells-to
 * sector …", whereas a goal/skill/region/agnostic fallback never does (mirrors
 * the pipeline's `hasSectorRelevance` in matchScoring.ts — kept in sync here
 * because the adapter can't import Deno modules). Used to caption a section
 * whose matches are ALL fallbacks, so a generic set never reads as sector-tailored.
 */
export function matchHasSectorRelevance(m: PipelineMatch): boolean {
  return (m.match_reasons ?? []).some(
    (r) => typeof r === "string" && (r.startsWith("industry match") || r.startsWith("sells-to sector")),
  );
}

/**
 * Returns an honest caption when a match set exists but NOTHING in it earned a
 * sector hit — stating the basis the matcher actually used. "" when the set is
 * empty (nothing to caption) or at least one match is sector-relevant (the
 * section is genuinely tailored). `basis` is the non-industry axis these matched on.
 */
function sectorCoverageNote(rawMatches: PipelineMatch[], basis: string): string {
  if (rawMatches.length === 0) return "";
  if (rawMatches.some(matchHasSectorRelevance)) return "";
  return `Matched on ${basis} rather than your specific industry.`;
}

// Turn a slug-style token run ("Australia-CRM-software") back into words.
// Un-joins slug hyphens INCLUDING the non-breaking hyphen (U+2011) the pipeline
// emits in metric labels ("Australia‑Fintech‑B2B" → "Australia Fintech B2B").
// Un-join a slug-style label ("Australia‑Fintech‑B2B" → "Australia Fintech B2B").
// The non-breaking hyphen (U+2011) only ever appears as a slug artifact, so
// always split it. The regular hyphen is ambiguous ("AI-driven", "e-commerce",
// "go-to-market" are real words), so only split it in a space-less slug label —
// a label that already reads as prose keeps its real hyphens (review finding).
const deSlug = (s: string): string => {
  const unNb = s.replace(/([A-Za-z0-9])‑([A-Za-z])/g, "$1 $2");
  return unNb.includes(" ") ? unNb : unNb.replace(/([A-Za-z0-9])-([A-Za-z])/g, "$1 $2");
};

const metricToTile = (m: KeyMetric): StatTile => {
  const clean = (s: string | undefined) =>
    stripInlineMarkdown((s ?? "").replace(CITATION_MARKER_RE, "")).trim();
  const context = clean(m.context);
  const label = deSlug(clean(m.label));
  // The `context` reads as a natural caption ("2024 estimate for national CRM
  // software market"); the `label` is an internal slug, used only as fallback.
  return {
    value: m.value ?? "",
    chip: (m.estimated ? "est" : "sourced") as Chip,
    caption: context || label,
  };
};

type SwotQuad = Report["swot"];

/**
 * Parse the pipeline's heading+bullet SWOT prose into the four quadrants.
 * Shape: `### **Strengths**` (or `## Strengths`) headings, each followed by
 * `*   **Lead:** body [n]` bullets → SwotItem{ lead, text(Paragraph, chips kept) }.
 * Returns empty quadrants when the prose isn't in parseable form (renderer then
 * shows nothing — never an empty quad).
 */
export function parseSwot(content: unknown, citationCount: number, log: Log): SwotQuad {
  const empty: SwotQuad = { strengths: [], weaknesses: [], opportunities: [], threats: [] };
  if (typeof content !== "string" || !content.trim()) {
    log("swot", "swot_analysis section missing/empty — quadrants empty");
    return empty;
  }
  const keyOf = (word: string): keyof SwotQuad | null => {
    const w = word.toLowerCase();
    if (w.startsWith("strength")) return "strengths";
    if (w.startsWith("weakness")) return "weaknesses";
    if (w.startsWith("opportunit")) return "opportunities";
    if (w.startsWith("threat")) return "threats";
    return null;
  };
  const out: SwotQuad = { strengths: [], weaknesses: [], opportunities: [], threats: [] };
  let current: keyof SwotQuad | null = null;
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const heading = line.match(/^#{1,6}\s+\**\s*([A-Za-z]+)/);
    if (heading) {
      current = keyOf(heading[1]);
      continue;
    }
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    if (bullet && current) {
      const body = bullet[1];
      const leadMatch = body.match(/^\*\*([^*]+?):?\*\*\s*:?\s*(.*)$/);
      const lead = leadMatch ? leadMatch[1].trim() : "";
      const rest = (leadMatch ? leadMatch[2] : body).trim();
      const text = toParagraphs(rest, `swot.${current}`, () => {}, citationCount)[0] ?? stripInlineMarkdown(rest);
      if (text) out[current].push({ lead, text });
    }
  }
  const total = out.strengths.length + out.weaknesses.length + out.opportunities.length + out.threats.length;
  if (total === 0) {
    log("swot", "SWOT prose not in parseable heading+bullet form — quadrants empty");
    return empty;
  }
  log("swot", `parsed ${total} SWOT items from prose (S${out.strengths.length}/W${out.weaknesses.length}/O${out.opportunities.length}/T${out.threats.length})`);
  return out;
}

type Phase = Report["actionPlan"]["phases"][number];

/**
 * Parse the pipeline's phased action-plan prose into structured phases with
 * grouped sub-blocks. Shape: `### Phase N — Title (Months X–Y): subtitle`
 * headings, each with `**Sub-block Title**` groups of `- bullet` lines.
 * Falls back to a single flat phase carrying the whole prose when the
 * heading/group structure isn't present.
 */
export function parseActionPlan(content: unknown, citationCount: number, log: Log): Phase[] {
  if (typeof content !== "string" || !content.trim()) return [];
  const blocks = content.split(/\n(?=#{1,6}\s+Phase\b)/i);
  const phases: Phase[] = [];
  for (const block of blocks) {
    const head = block.match(/^#{1,6}\s+(Phase\b[^\n]*)/i)?.[1];
    if (!head) continue;
    const period = (head.match(/\(([^)]*?months?[^)]*?)\)/i)?.[1] ?? "").trim();
    const title = (head.match(/Phase\s+\S+\s*[—–-]\s*([^(:]+)/i)?.[1] ?? head.replace(/\s*\(.*$/, "")).trim();
    // Reference-based grouping: each **Sub-block** heading opens a new group
    // object that bullets append to. (Title-matching the last group would wipe
    // an earlier same-titled group when a phase repeats a sub-block heading.)
    const raw: { title: string; bullets: string[] }[] = [];
    let cur: { title: string; bullets: string[] } | null = null;
    for (const line of block.split("\n").map((l) => l.trim())) {
      if (!line || /^#{1,6}\s+/.test(line)) continue;
      const boldOnly = line.match(/^\*\*([^*]+?):?\*\*:?\s*$/);
      if (boldOnly) {
        cur = { title: boldOnly[1].trim(), bullets: [] };
        raw.push(cur);
        continue;
      }
      const bullet = line.match(/^[-*•]\s+(.*)$/);
      if (bullet) {
        if (!cur) {
          cur = { title: "", bullets: [] };
          raw.push(cur);
        }
        cur.bullets.push(bullet[1]);
      }
    }
    const cleaned = raw
      .filter((g) => g.bullets.length > 0) // drop sub-block titles that had no bullets
      .map((g) => ({
        title: g.title,
        // Keep each bullet a discrete Paragraph so the renderer can lay them out
        // as a real list. The old ` · `-joined single string read as a text wall
        // (Solidroad smoke test: action plan "ridiculous amount of text").
        bullets: g.bullets
          .map((b) => toParagraphs(b, "actionPlan.group", () => {}, citationCount)[0] ?? "")
          .filter(Boolean),
      }));
    if (period || title || cleaned.length) phases.push({ period, title, groups: cleaned });
  }
  if (phases.length) {
    log("actionPlan.phases", `parsed ${phases.length} structured phases (${phases.reduce((n, p) => n + (p.groups?.length ?? 0), 0)} groups)`);
    return phases;
  }
  // No phase headings — one flat phase carrying the plan prose.
  const flat = toParagraphs(content, "actionPlan", log, citationCount);
  return flat.length ? [{ period: "", title: "", body: flat.join(" ") }] : [];
}

/**
 * Parse the pipeline's setup/compliance prose into a lead intro + a checklist
 * of `**Lead:** text` bullets. The structured exposure table/stats stay a
 * Phase-B pipeline output (renderer suppresses the empty blocks).
 */
export function parseComplianceChecklist(
  content: unknown,
  citationCount: number,
  log: Log
): { intro: string; checklist: { lead: string; text: string }[] } {
  const empty = { intro: "", checklist: [] as { lead: string; text: string }[] };
  if (typeof content !== "string" || !content.trim()) return empty;
  const checklist: { lead: string; text: string }[] = [];
  let intro = "";
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (!line || /^#{1,6}\s+/.test(line)) continue; // drop section headings
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    if (bullet) {
      const body = bullet[1];
      const leadMatch = body.match(/^\*\*([^*]+?):?\*\*\s*:?\s*(.*)$/);
      const lead = leadMatch ? leadMatch[1].trim() : "";
      const rest = (leadMatch ? leadMatch[2] : body).trim();
      const text = toParagraphs(rest, "compliance.checklist", () => {}, citationCount)[0] ?? "";
      if (lead || text) checklist.push({ lead, text });
    } else if (!intro) {
      const p = toParagraphs(line, "compliance.intro", () => {}, citationCount)[0];
      if (p && !/^\*\*/.test(p)) intro = p;
    }
  }
  if (checklist.length) log("compliance", `parsed ${checklist.length} checklist items from prose`);
  return { intro, checklist };
}

/**
 * §03's competitor TABLE comes from the matches; its lead-in and the two
 * synthesis boxes come from the `competitor_landscape` prose, which the pipeline
 * writes with a lead paragraph plus `### Market Gaps and Opportunities` and
 * `### Strategic Positioning …` headings. Pull those three so the boxes the
 * renderer already has stop rendering empty (they were dropped — generated then
 * discarded). Each degrades to "" when its heading is absent. The per-competitor
 * `### Top Competitors` blocks are deliberately ignored — that IS the structured
 * table, not prose to repeat.
 */
export function parseCompetitorProse(
  content: unknown,
  citationCount: number,
  log: Log
): { intro: string; gaps: string; positioningRead: string } {
  const empty = { intro: "", gaps: "", positioningRead: "" };
  if (typeof content !== "string" || !content.trim()) return empty;
  // Lead = text before the first heading; then each heading opens a section.
  const lead: string[] = [];
  const secs: { heading: string; body: string[] }[] = [];
  let cur: { heading: string; body: string[] } | null = null;
  for (const line of content.split("\n")) {
    const h = line.match(/^#{1,6}\s+(.*\S)\s*$/);
    if (h) {
      cur = { heading: h[1].trim(), body: [] };
      secs.push(cur);
    } else if (cur) {
      cur.body.push(line);
    } else {
      lead.push(line);
    }
  }
  const bodyOf = (re: RegExp): string => {
    const s = secs.find((x) => re.test(x.heading));
    return s ? toParagraphs(s.body.join("\n"), "competitors", () => {}, citationCount).join(" ") : "";
  };
  // Intro = the first lead paragraph only (never the whole pre-heading blob).
  const intro = toParagraphs(lead.join("\n"), "competitors.intro", () => {}, citationCount)[0] ?? "";
  // "Strategic Advantages" also contains "Strategic" — anchor positioning on the
  // word "positioning" (or GTM) so it can't grab the advantages block.
  const gaps = bodyOf(/\bgaps?\b|opportunit/i);
  const positioningRead = bodyOf(/positioning|go[-\s]?to[-\s]?market/i);
  if (intro) log("competitors.intro", "derived lead-in from competitor_landscape prose");
  if (gaps) log("competitors.gaps", "parsed market-gaps subsection from competitor prose");
  if (positioningRead) log("competitors.positioningRead", "parsed positioning recommendation from competitor prose");
  return { intro, gaps, positioningRead };
}

/**
 * §04's ICP card (the common "no named accounts" case, which is EVERY live
 * report) is populated from the stable labeled block the pipeline now appends to
 * the first_customers section (buildIcpGuidanceNote): `**Target Roles:** … /
 * **Sector Focus:** … / **Opening Angle:** …`. Roles are split and de-qualified
 * ("Growth Lead at SaaS orgs" → "Growth Lead"). Returns undefined when the block
 * is absent or incomplete (older/variable reports) so §04 falls back to its lead
 * paragraph — never a half-empty card.
 */
export function parseIcpGuidance(
  content: unknown,
  citationCount: number,
  log: Log
): { targetRoles: string[]; sectorFocus: string; angle: string } | undefined {
  if (typeof content !== "string" || !content.trim()) return undefined;
  const grab = (re: RegExp): string => (content.match(re)?.[1] ?? "").trim();
  const rolesRaw = grab(/\*\*\s*Target Roles:?\s*\*\*\s*(.+)/i);
  const sectorRaw = grab(/\*\*\s*Sector Focus:?\s*\*\*\s*(.+)/i);
  const angleRaw = grab(/\*\*\s*(?:The\s+)?(?:Opening\s+)?Angle:?\s*\*\*\s*(.+)/i);
  const targetRoles = rolesRaw
    .split(/,|\bor\b|\band\b|;|\//i)
    .map((r) =>
      r
        .replace(/\s+(?:at|in|within)\s+.*$/i, "") // drop the shared "at <org>" qualifier
        .replace(/\[\d+\]/g, "")
        .replace(/[*_.]/g, "")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter((r) => r.length >= 2 && r.length <= 48)
    .slice(0, 5);
  const sectorFocus = toParagraphs(sectorRaw, "accounts.icpGuidance.sectorFocus", () => {}, citationCount).join(" ");
  const angle = toParagraphs(angleRaw, "accounts.icpGuidance.angle", () => {}, citationCount).join(" ");
  // Complete-or-nothing: only surface the card when all three parts parsed, so a
  // malformed block never renders a lopsided ICP card.
  if (targetRoles.length === 0 || !sectorFocus || !angle) return undefined;
  log("accounts.icpGuidance", `parsed ICP card from first_customers block (${targetRoles.length} roles)`);
  return { targetRoles, sectorFocus, angle };
}

export interface ParsedAccountBrief {
  name: string;
  /** Validated http(s) url from the "### [Name](url)" heading link; "" otherwise. */
  url: string;
  who: string;
  signals: string;
  stack: string;
  fit: string;
  approach: string[];
  angle: string;
}

// Loose company-name equivalence for merging prose briefs onto buyer cards: the
// card says "Commbank" while the prose heading says "Commonwealth Bank
// (Commbank)" — normalise to alphanumerics and accept containment either way.
const briefNameKey = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, "");
export function accountNamesMatch(a: string, b: string): boolean {
  const ka = briefNameKey(a);
  const kb = briefNameKey(b);
  return ka.length >= 4 && kb.length >= 4 && (ka.includes(kb) || kb.includes(ka));
}

/**
 * §04 named-accounts case: the pipeline writes one "### [Account](url)" block
 * per verified target with bold-label lines that map 1:1 onto the account-card
 * contract (the labels are a parse contract with buildBuyerBriefsNote — change
 * together). Historically ALL of that was dropped and the cards rendered the
 * directory description twice (CreditLogic audit D1). Label variants from
 * before the contract tightening ("Why they fit CreditLogic:") still parse.
 * Blocks with a heading but no recognised labels are skipped, not guessed at.
 */
export function parseAccountBriefs(content: unknown, citationCount: number, log: Log): ParsedAccountBrief[] {
  if (typeof content !== "string" || !content.trim()) return [];
  const out: ParsedAccountBrief[] = [];
  // A field runs from its label to the next blank line, label line, or heading.
  const UPTO = String.raw`([\s\S]*?)(?=\n\s*\n|\n\*\*|\n#{1,6}\s|$)`;
  for (const block of content.split(/\n(?=#{2,4}\s+)/)) {
    const head = block.match(/^#{2,4}\s+(.+)$/m)?.[1]?.trim();
    if (!head) continue;
    const link = head.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    const name = (link ? link[1] : head).replace(/[*_]/g, "").trim();
    const url = link ? link[2] : "";
    const field = (labelRe: string): string => {
      const m = block.match(new RegExp(String.raw`\*\*\s*` + labelRe + String.raw`:?\s*\*\*:?\s*` + UPTO, "i"));
      return m ? toParagraphs(m[1], "accounts.brief", () => {}, citationCount).join(" ") : "";
    };
    const who = field("Who they are");
    const signals = field("Signals");
    const stack = field(String.raw`(?:Stack|Tech(?:nology)?[^:*]*)`);
    const fit = field(String.raw`Why they fit[^:*]*`);
    const approachRaw = field("Who to approach");
    const angle = field(String.raw`(?:The\s+)?Opening angle`);
    const approach = approachRaw
      .replace(/\.\s*$/, "")
      .split(/,|;|\bor\b|\band\b|\//i)
      .map((t) => t.replace(/\[\d+\]/g, "").replace(/[*_]/g, "").replace(/\s+/g, " ").trim())
      .filter((t) => t.length >= 3 && t.length <= 60)
      .slice(0, 4);
    if (!signals && !fit && approach.length === 0 && !angle) continue;
    out.push({ name, url, who, signals, stack, fit, approach, angle });
  }
  if (out.length) log("accounts.briefed", `parsed ${out.length} structured account brief(s) from first_customers prose`);
  return out;
}

/**
 * §07 writes a tailored, customer-specific rationale per mentor as
 * `* **[Name](url)**: why this mentor fits <customer>` bullets — richer than the
 * generic directory bio the cards fall back to (audit D3). Returns name-key →
 * rationale; empty map when the prose isn't in that shape (cards keep the bio).
 */
export function parseMentorWhys(content: unknown): Map<string, string> {
  const map = new Map<string, string>();
  if (typeof content !== "string") return map;
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*[-*]\s+\*\*\[?([^\]*]+?)\]?(?:\([^)]*\))?\*\*:\s*(.+)$/);
    if (!m) continue;
    const name = m[1].trim();
    const why = m[2].replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
    if (name && why) map.set(briefNameKey(name), why);
  }
  return map;
}

export function adaptPipelineReport(
  json: PipelineReportJson,
  context: AdaptContext = {}
): { report: Report; mismatches: AdapterMismatch[] } {
  const mismatches: AdapterMismatch[] = [];
  const log: Log = (path, issue) => mismatches.push({ path, issue });

  const sections = json.sections ?? {};
  const matches = json.matches ?? {};
  const citations = json.metadata?.perplexity_citations ?? [];
  const keyMetrics = json.metadata?.key_metrics ?? [];

  const customer = json.company_name || "";
  if (!customer) log("meta.customer", "company_name missing from report_json");

  // ---- exec / cover prose ------------------------------------------------
  const execRaw = (sections.executive_summary?.content ?? "").replace(
    /\n*\*\*Who from your matches can help with this:\*\*\s*$/,
    ""
  );
  if (execRaw !== (sections.executive_summary?.content ?? "")) {
    log("exec.narrative", "stripped pipeline lead-in trailer for key-question picks");
  }
  // Split the "Your Key Question — Answered" subsection into its own box so it
  // renders once (styled) instead of leaking a heading + blockquote into the
  // narrative prose.
  const kqParts = execRaw.split(/\n#{2,6}\s+Your Key Question[^\n]*\n/i);
  const execBody = kqParts[0];
  let keyQuestionAnswer = "";
  if (kqParts.length > 1) {
    // The block leads with the verbatim question as a blockquote — drop it (the
    // box shows the question already) and keep the answer prose.
    const answerRaw = kqParts.slice(1).join("\n").replace(/^\s*(?:>[^\n]*\n?)+/, "");
    keyQuestionAnswer = toParagraphs(answerRaw, "exec.keyQuestionAnswer", log, citations.length).join(" ");
    if (keyQuestionAnswer) log("exec.keyQuestionAnswer", "extracted from executive_summary key-question subsection");
  }

  const narrative = toParagraphs(execBody, "exec.narrative", log, citations.length);
  // Drop heading-only leads ("**Executive Summary**") — the §01 card is already
  // labelled, and the cover carries the thesis.
  const bodyParas = narrative.filter((p) => !/^\*\*[^*]+\*\*$/.test(p.trim()));
  // Cover = paragraph 1 (headline = its first sentence, plain; scope = the rest
  // of that paragraph). §01 narrative then starts at paragraph 2, so the opening
  // thesis is never repeated verbatim between the cover and the section.
  const firstPara = bodyParas[0] ?? "";
  const firstPlain = firstPara.replace(/\s*\{chip:[a-z]+\}/g, "").replace(/\*\*/g, "").trim();
  const headline = firstSentence(firstPlain);
  const execNarrative = bodyParas.slice(1);
  let scope = firstPara
    .split(/(?<=[.!?])\s+/)
    .slice(1)
    .join(" ")
    .trim();
  if (!scope) scope = execNarrative.shift() ?? ""; // single-sentence ¶1 → borrow ¶2
  if (!headline) log("cover.headline", "no executive summary to derive a headline from");
  log("cover", "cover derived from executive summary ¶1 (pipeline has no cover fields until Phase B)");

  const highlights: EntityRef[] = (sections.executive_summary?.matches ?? []).slice(0, 3).map((m, i) => {
    const url = sanitizeContractPath(m.link, `exec.highlights[${i}].link`, log);
    return { name: matchName(m), url, kind: url ? kindForPath(url, "org") : "org" };
  });

  // ---- section-level card sets -------------------------------------------
  const providerCards = (matches.service_providers ?? []).map((m, i) =>
    toMatchCard(m, "provider", `providers.all[${i}]`, log)
  );
  const investorCards = (matches.investors ?? []).map((m, i) =>
    toMatchCard(m, "investor", `investors.all[${i}]`, log)
  );
  const hubCards = (matches.innovation_ecosystem ?? []).map((m, i) =>
    toMatchCard(m, "hub", `govAndHubs.hubs[${i}]`, log)
  );
  const mentorWhys = parseMentorWhys(sections.mentor_recommendations?.content);
  let mentorWhyHits = 0;
  const mentorCards: PersonCard[] = (matches.community_members ?? []).map((m, i) => {
    const tailored = mentorWhys.get(briefNameKey(matchName(m)));
    if (tailored) mentorWhyHits++;
    return {
      name: matchName(m),
      url: sanitizeContractPath(m.link, `mentors[${i}].link`, log),
      kind: "mentor" as const,
      role: m.subtitle ?? "",
      // Strip markdown BEFORE capping (like the bio path) so a cut inside a
      // `[label](url)` or `**bold**` span can't leave an unbalanced marker on
      // the card (review finding); the card renders plain text either way.
      why: tailored ? capText(stripInlineMarkdown(tailored), 260) : trimWhy(matchDescription(m)),
      headshotUrl: typeof m.avatar_url === "string" && m.avatar_url ? m.avatar_url : undefined,
    };
  });
  if (mentorWhyHits > 0) log("mentors[].why", `used tailored per-mentor rationale from §07 prose for ${mentorWhyHits}/${mentorCards.length}`);
  if (mentorCards.length > 0 && mentorCards.every((m) => !m.headshotUrl)) {
    log("mentors[].headshotUrl", "no matched mentor carries an avatar_url/image — all headshots render monogram (data gap, not a pipeline gap)");
  }
  if (
    [...providerCards, ...investorCards, ...hubCards].length > 0 &&
    [...providerCards, ...investorCards, ...hubCards].every((c) => !c.logoUrl)
  ) {
    log("cards[].logoUrl", "pipeline omits logo_url — provider/investor/hub cards render monogram (Phase B)");
  }

  // Honest-degradation captions (t20): for a company outside the directory's
  // sector coverage, these sections surface real-but-generic matches (goal/
  // service/stage fallbacks, no industry hit). Caption them so a fallback set
  // never reads as sector-tailored. Empty for any company the directory covers.
  const mentorCoverageNote = sectorCoverageNote(matches.community_members ?? [], "your goals and stage");
  const providerCoverageNote = sectorCoverageNote(matches.service_providers ?? [], "the services you need");
  const investorCoverageNote = sectorCoverageNote(matches.investors ?? [], "your stage and funding need");
  for (const [note, path] of [
    [mentorCoverageNote, "mentors.coverageNote"],
    [providerCoverageNote, "providers.coverageNote"],
    [investorCoverageNote, "investors.coverageNote"],
  ] as const) {
    if (note) log(path, "no sector-relevant matches — honest coverage caption emitted");
  }

  const competitorRows: CompetitorRow[] = (sections.competitor_landscape?.matches ?? [])
    .filter((m, i) => passesRelevanceGate(m, `competitor_landscape.matches[${i}]`, log))
    .map((m, i) => ({
    name: matchName(m),
    url: sanitizeContractPath(m.link, `competitors.rows[${i}].link`, log),
    kind: "competitor" as const,
    positionTag: cleanTag(m.tags?.[0]),
    position: tidyClip(matchDescription(m)),
    // Grounded, site-derived strengths (Phase 3b) and comparative contrast (3c).
    // Both are per-column and degrade to "" independently.
    strengths: Array.isArray(m.strengths)
      ? m.strengths.map((s) => String(s).trim()).filter(Boolean).join(" · ")
      : "",
    differs: typeof m.differs === "string" ? m.differs.trim() : "",
    // Competitor links are off-platform (rejected from `url`); derive the logo
    // from the raw site instead so the player row carries its brand mark.
    logoUrl: companyLogoUrl(m.website, m.url, m.link),
  }));
  const anyCompetitorStrengths = competitorRows.some((r) => r.strengths);
  if (competitorRows.length > 0 && !anyCompetitorStrengths) {
    log("competitors.rows", "no site-derived strengths in this run — Strengths column omitted");
  }
  const anyCompetitorDiffers = competitorRows.some((r) => r.differs);
  if (competitorRows.length > 0 && !anyCompetitorDiffers) {
    log("competitors.rows", "no grounded contrast in this run — Where-differs column omitted");
  }
  // §03 "you" row (Phase 3b/3c): the customer's own grounded USPs + positioning.
  const youStrengths = Array.isArray(json.metadata?.company_strengths)
    ? json.metadata!.company_strengths!.map((s) => String(s).trim()).filter(Boolean).join(" · ")
    : "";
  // The customer's own site-stated positioning line fills the you-row's MARKET
  // POSITION cell (it was hardcoded blank — Solidroad smoke test: "doesn't have
  // a market position"). "Where <you> differ" is a per-competitor contrast, so
  // the baseline you-row leaves it empty rather than showing a shouty
  // positioning badge in that column.
  const youPosition = typeof json.metadata?.company_positioning === "string"
    ? json.metadata.company_positioning.trim()
    : "";
  // §03 lead-in + the two synthesis boxes, parsed from the competitor prose.
  const competitorProse = parseCompetitorProse(sections.competitor_landscape?.content, citations.length, log);

  // §04 intro: the first-customers strategy prose. Named target briefs
  // (briefed/icpGuidance) still await Phase B, but rendering this prose keeps
  // the section from showing an empty card.
  // §04 intro: the lead strategic paragraph (skips the intake-guidance opener
  // per R5 and the multi-heading blob). Named briefs are Phase-B.
  const accountsIntro = leadParagraph(sections.first_customers?.content, citations.length);
  if (accountsIntro) log("accounts.intro", "derived §04 lead paragraph from first_customers prose");
  // §04 ICP card (no-named-accounts case) — parsed from the stable labeled block.
  const icpGuidance = parseIcpGuidance(sections.first_customers?.content, citations.length, log);
  // §07 intro: strategic lead paragraph (the card list in the prose duplicates
  // the mentor cards, so only the lead paragraph is used).
  const mentorsIntro = leadParagraph(sections.mentor_recommendations?.content, citations.length);
  if (mentorsIntro) log("mentors.intro", "derived §07 lead paragraph from mentor_recommendations prose");
  // §13 gap copy: the grounded "why no dataset" explanation from the pipeline
  // instead of the generic fallback.
  const leadGapCopy = leadParagraph(sections.lead_list?.content, citations.length);

  // Structured per-account briefs parsed from the section prose (D1) — merged
  // onto the buyer cards by loose name equivalence.
  const proseBriefs = parseAccountBriefs(sections.first_customers?.content, citations.length, log);
  const briefed: AccountBrief[] = (sections.first_customers?.matches ?? [])
    .filter((m, i) => passesRelevanceGate(m, `first_customers.matches[${i}]`, log))
    .map((m, i) => {
      const cardName = matchName(m);
      const brief = proseBriefs.find((b) => accountNamesMatch(b.name, cardName));
      const desc = matchDescription(m);
      const signals = brief?.signals || desc;
      // Meta line: the brief's one-line "who they are" (short + grounded), else
      // the subtitle — boundary-capped, and NEVER a duplicate of the signals
      // text (the pre-D1 cards printed the same description twice).
      let meta = capText(stripInlineMarkdown(brief?.who || m.subtitle || ""), 90);
      if (meta && briefNameKey(signals).startsWith(briefNameKey(meta.replace(/…$/, "")))) meta = "";
      // Buyer cards carry no platform link; adopt the brief heading's validated
      // external site link so the account name is clickable (audit D4).
      let url = sanitizeContractPath(m.link, `accounts.briefed[${i}].link`, () => {});
      if (!url && brief?.url && /^https?:\/\/\S+$/i.test(brief.url)) {
        url = brief.url;
        log(`accounts.briefed[${i}].link`, "adopted account site link from the prose brief heading");
      }
      return {
        name: cardName,
        url,
        kind: "account" as const,
        meta: meta.toUpperCase(),
        statusChips: statusChipsFrom(m.tags),
        signals,
        stack: brief?.stack ?? "",
        fit: brief?.fit ?? "",
        approach: brief?.approach ?? [],
        angle: brief?.angle ?? "",
        logoUrl: companyLogoUrl(brief?.url, m.website, url),
      };
    });
  if (briefed.length > 0 && proseBriefs.length === 0) {
    log("accounts.briefed", "no structured briefs in prose — cards carry description-only signals (pre-D1 pipeline output)");
  } else if (briefed.length === 0) {
    log("accounts", "no briefed targets and no icpGuidance source — §04 renders empty until Phase B");
  }

  const guides = (matches.content_items ?? []).map((m, i) => ({
    title: matchName(m),
    url: sanitizeContractPath(m.link, `guides.cards[${i}].link`, log),
    summary: trimWhy(matchDescription(m)),
    relevantBecause: "",
  }));
  if (guides.length > 0) log("guides.cards", "relevantBecause footers unavailable until Phase B");

  // The pipeline renames matches.lead_databases → matches.leads before storing
  // report_json (generate-report/index.ts); accept the stored key first.
  const leadPool = matches.leads ?? matches.lead_databases ?? [];
  const leadDb = leadPool[0];
  const leadUrl = leadDb ? sanitizeContractPath(leadDb.link, "leads.dataset.link", log) : "";
  if (leadPool.length > 1 || (matches.lemlist_contacts ?? []).length > 0) {
    log("leads", "additional datasets/contacts beyond the first dataset dropped until Phase B");
  }

  // ---- prose-only sections (Phase-B structured parses) --------------------
  const swot = parseSwot(sections.swot_analysis?.content, citations.length, log);
  const phases = parseActionPlan(sections.action_plan?.content, citations.length, log);
  const compliance = parseComplianceChecklist(sections.setup_compliance?.content, citations.length, log);
  // §14 "worth arriving with a view on" — the action plan's decision areas
  // (distinct group titles) are the grounded source until Phase B supplies a
  // dedicated close block.
  const arriveWith = [
    ...new Set(phases.flatMap((p) => (p.groups ?? []).map((g) => g.title)).filter(Boolean)),
  ].slice(0, 6);
  if (arriveWith.length) log("close.arriveWith", `derived ${arriveWith.length} decision areas from the action plan`);

  // ---- sources -----------------------------------------------------------
  const tiers: Record<"regulator" | "analyst" | "vendor", string[]> = {
    regulator: [],
    analyst: [],
    vendor: [],
  };
  for (const url of citations) {
    const domain = extractDomain(url) ?? url;
    const tier = domainTier(url);
    if (!tiers[tier].includes(domain)) tiers[tier].push(domain);
  }

  for (const missing of ["exec.sequence", "exec.heroStat", "close.body"]) {
    log(missing, "no pipeline source until Phase B — rendered empty");
  }

  const report: Report = {
    meta: {
      customer,
      domain: context.domain,
      location: context.location ?? "",
      descriptor: context.descriptor ?? (context.location ?? "").toUpperCase(),
      date: context.date ?? "",
      plan: mapPlan(context.tier, log),
      archetype: "domestic_scaleup",
      keyQuestion: context.keyQuestion ?? "",
      sourceCount: citations.length,
    },
    cover: { kicker: "MARKET ENTRY REPORT", headline, scope },
    exec: {
      narrative: execNarrative,
      keyQuestionAnswer,
      highlights,
      // The pipeline has no distinct "most material number" source separate
      // from the metric tiles; reusing key_metrics[0] here duplicated tile 1,
      // so the hero card is omitted (empty) until Phase B supplies one.
      heroStat: { label: "", value: "", caption: "", chip: "inferred" },
      sequence: { label: "", rows: [], caveat: "" },
    },
    metrics: { tiles: keyMetrics.slice(0, 6).map(metricToTile) },
    swot,
    competitors: {
      intro: competitorProse.intro,
      you: { name: customer, url: "", kind: "competitor", positionTag: "", position: youPosition, strengths: youStrengths, differs: "" },
      rows: competitorRows,
      gaps: competitorProse.gaps,
      positioningRead: competitorProse.positioningRead,
      scanHookCopy: "Want this table deeper? Request a competitor scan.",
    },
    accounts: { intro: accountsIntro, briefed, worthKnowing: "", ...(icpGuidance ? { icpGuidance } : {}) },
    providers: {
      intro: "",
      ourRead: toRanked(providerCards, (i) => (matches.service_providers ?? [])[i]?.subtitle ?? "", "providers.ourRead", log),
      all: providerCards,
      ...(providerCoverageNote ? { coverageNote: providerCoverageNote } : {}),
    },
    govAndHubs: {
      gov: (matches.trade_investment_agencies ?? []).map((m, i) => ({
        name: matchName(m),
        url: sanitizeContractPath(m.link, `govAndHubs.gov[${i}].link`, log),
        why: trimWhy(matchDescription(m)),
      })),
      hubs: hubCards.map((card) => ({ ...card, focusTag: card.tag })),
    },
    mentors: {
      intro: mentorsIntro,
      primary: mentorCards.slice(0, 3),
      extra: mentorCards.slice(3),
      ...(mentorCoverageNote ? { coverageNote: mentorCoverageNote } : {}),
    },
    investors: {
      intro: "",
      approachOrder: [],
      all: investorCards.map((card) => ({ ...card, stageTag: cleanTag(card.tag) })),
      ...(investorCoverageNote ? { coverageNote: investorCoverageNote } : {}),
    },
    events: {
      // Chronological order — the pipeline returns events unsorted, so a
      // Jun-2027 event could lead a section headed "this quarter" (Solidroad
      // smoke test). ISO dates sort lexicographically; undated events sort last.
      cards: [...(matches.events ?? [])]
        .sort((a, b) => {
          const da = typeof a.date === "string" ? a.date : "";
          const db = typeof b.date === "string" ? b.date : "";
          if (!da) return db ? 1 : 0;
          if (!db) return -1;
          return da < db ? -1 : da > db ? 1 : 0;
        })
        .map((m, i) => {
          // Events carry an empty `description` and a `subtitle` that is just
          // "date · location", so matchDescription's subtitle fallback printed
          // the date a second time under the card (Solidroad smoke test). Use the
          // real description ONLY — no why-attend body until the pipeline supplies
          // a grounded one (Wave 4b).
          const desc = typeof m.description === "string" ? m.description.trim() : "";
          return {
            date: m.date ?? "",
            venue: m.location ?? "",
            name: matchName(m),
            url: sanitizeContractPath(m.link, `events.cards[${i}].link`, log),
            why: desc ? trimWhy(stripInternalNotes(stripInlineMarkdown(desc))) : "",
          };
        }),
    },
    actionPlan: { intro: "", phases },
    // Lead intro + parsed checklist; the exposure table/stats stay a Phase-B
    // pipeline output (renderer suppresses the empty blocks).
    compliance: { intro: compliance.intro, table: [], stats: [], checklist: compliance.checklist },
    guides: { intro: "", cards: guides },
    leads: leadDb
      ? {
          dataset: { name: matchName(leadDb), url: leadUrl, records: leadDb.record_count ?? 0, description: matchDescription(leadDb) },
          customBuildCopy: "Need a different list? Describe your ICP and we'll build it.",
        }
      : {
          gapCopy: leadGapCopy || "No matching lead dataset yet — request a custom build below.",
          customBuildCopy: "Need a different list? Describe your ICP and we'll build it.",
        },
    close: {
      headline: "This report is the map. The route gets chosen together.",
      body: "",
      arriveWith,
    },
    sources: tiers,
  };

  log("meta.archetype", "pipeline has no archetype field until Phase B — defaulted to domestic_scaleup");

  return { report, mismatches };
}
