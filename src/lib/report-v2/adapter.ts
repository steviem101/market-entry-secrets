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
import { extractDomain } from "../logoUtils.ts";
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
  tags?: string[];
  logo_url?: string;
  avatar_url?: string;
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
const trimWhy = (text: string): string => capText(text, 180);

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

function toMatchCard(m: PipelineMatch, kind: EntityKind, path: string, log: Log): MatchCard {
  const url = sanitizeContractPath(m.link, `${path}.link`, log);
  return {
    name: matchName(m),
    url,
    kind: url ? kindForPath(url, kind) : kind,
    tag: cleanTag(m.tags?.[0]),
    description: matchDescription(m),
    logoUrl: typeof m.logo_url === "string" && m.logo_url ? m.logo_url : undefined,
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

// Turn a slug-style token run ("Australia-CRM-software") back into words.
const deSlug = (s: string): string => s.replace(/([A-Za-z0-9])-([A-Za-z])/g, "$1 $2");

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
        body: g.bullets
          .map((b) => toParagraphs(b, "actionPlan.group", () => {}, citationCount)[0] ?? "")
          .filter(Boolean)
          .join(" · "),
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
  const mentorCards: PersonCard[] = (matches.community_members ?? []).map((m, i) => ({
    name: matchName(m),
    url: sanitizeContractPath(m.link, `mentors[${i}].link`, log),
    kind: "mentor" as const,
    role: m.subtitle ?? "",
    why: trimWhy(matchDescription(m)),
    headshotUrl: typeof m.avatar_url === "string" && m.avatar_url ? m.avatar_url : undefined,
  }));
  if (mentorCards.length > 0 && mentorCards.every((m) => !m.headshotUrl)) {
    log("mentors[].headshotUrl", "pipeline omits avatar_url — headshots render monogram (Phase B: add avatar_url to community_members select)");
  }
  if (
    [...providerCards, ...investorCards, ...hubCards].length > 0 &&
    [...providerCards, ...investorCards, ...hubCards].every((c) => !c.logoUrl)
  ) {
    log("cards[].logoUrl", "pipeline omits logo_url — provider/investor/hub cards render monogram (Phase B)");
  }

  const competitorRows: CompetitorRow[] = (sections.competitor_landscape?.matches ?? [])
    .filter((m, i) => passesRelevanceGate(m, `competitor_landscape.matches[${i}]`, log))
    .map((m, i) => ({
    name: matchName(m),
    url: sanitizeContractPath(m.link, `competitors.rows[${i}].link`, log),
    kind: "competitor" as const,
    positionTag: cleanTag(m.tags?.[0]),
    position: matchDescription(m),
    // Grounded, site-derived strengths (Phase 3b). "Where you differ" stays a
    // Phase-B comparative output.
    strengths: Array.isArray(m.strengths)
      ? m.strengths.map((s) => String(s).trim()).filter(Boolean).join(" · ")
      : "",
    differs: "",
  }));
  const anyCompetitorStrengths = competitorRows.some((r) => r.strengths);
  if (competitorRows.length > 0 && !anyCompetitorStrengths) {
    log("competitors.rows", "no site-derived strengths in this run — Strengths column omitted");
  }
  // §03 "you" row strengths: the customer's own grounded USPs (metadata).
  const youStrengths = Array.isArray(json.metadata?.company_strengths)
    ? json.metadata!.company_strengths!.map((s) => String(s).trim()).filter(Boolean).join(" · ")
    : "";

  // §04 intro: the first-customers strategy prose. Named target briefs
  // (briefed/icpGuidance) still await Phase B, but rendering this prose keeps
  // the section from showing an empty card.
  // §04 intro: the lead strategic paragraph (skips the intake-guidance opener
  // per R5 and the multi-heading blob). Named briefs are Phase-B.
  const accountsIntro = leadParagraph(sections.first_customers?.content, citations.length);
  if (accountsIntro) log("accounts.intro", "derived §04 lead paragraph from first_customers prose");
  // §07 intro: strategic lead paragraph (the card list in the prose duplicates
  // the mentor cards, so only the lead paragraph is used).
  const mentorsIntro = leadParagraph(sections.mentor_recommendations?.content, citations.length);
  if (mentorsIntro) log("mentors.intro", "derived §07 lead paragraph from mentor_recommendations prose");
  // §13 gap copy: the grounded "why no dataset" explanation from the pipeline
  // instead of the generic fallback.
  const leadGapCopy = leadParagraph(sections.lead_list?.content, citations.length);

  const briefed: AccountBrief[] = (sections.first_customers?.matches ?? [])
    .filter((m, i) => passesRelevanceGate(m, `first_customers.matches[${i}]`, log))
    .map((m, i) => ({
    name: matchName(m),
    url: sanitizeContractPath(m.link, `accounts.briefed[${i}].link`, log),
    kind: "account" as const,
    meta: (m.subtitle ?? "").toUpperCase(),
    statusChips: statusChipsFrom(m.tags),
    signals: matchDescription(m),
    stack: "",
    fit: "",
    approach: [],
    angle: "",
  }));
  if (briefed.length > 0) {
    log("accounts.briefed", "stack / fit / approach / angle unavailable until Phase B (status chips mapped from tags)");
  } else {
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
      intro: "",
      you: { name: customer, url: "", kind: "competitor", positionTag: "", position: "", strengths: youStrengths, differs: "" },
      rows: competitorRows,
      gaps: "",
      positioningRead: "",
      scanHookCopy: "Want this table deeper? Request a competitor scan.",
    },
    accounts: { intro: accountsIntro, briefed, worthKnowing: "" },
    providers: {
      intro: "",
      ourRead: toRanked(providerCards, (i) => (matches.service_providers ?? [])[i]?.subtitle ?? "", "providers.ourRead", log),
      all: providerCards,
    },
    govAndHubs: {
      gov: (matches.trade_investment_agencies ?? []).map((m, i) => ({
        name: matchName(m),
        url: sanitizeContractPath(m.link, `govAndHubs.gov[${i}].link`, log),
        why: trimWhy(matchDescription(m)),
      })),
      hubs: hubCards.map((card) => ({ ...card, focusTag: card.tag })),
    },
    mentors: { intro: mentorsIntro, primary: mentorCards.slice(0, 3), extra: mentorCards.slice(3) },
    investors: {
      intro: "",
      approachOrder: [],
      all: investorCards.map((card) => ({ ...card, stageTag: cleanTag(card.tag) })),
    },
    events: {
      cards: (matches.events ?? []).map((m, i) => ({
        date: m.date ?? "",
        venue: m.location ?? "",
        name: matchName(m),
        url: sanitizeContractPath(m.link, `events.cards[${i}].link`, log),
        why: trimWhy(matchDescription(m)),
      })),
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
