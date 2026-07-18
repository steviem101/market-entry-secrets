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
const matchDescription = (m: PipelineMatch): string =>
  (m.enriched_description || m.description || m.subtitle || "").trim();

const trimWhy = (text: string): string => {
  if (text.length <= 180) return text;
  const cut = text.slice(0, 180);
  // Prefer a sentence end when it lands reasonably far in; otherwise the last
  // word boundary; otherwise the hard 180-char cut (never slice(0,-1), which
  // would silently drop a character mid-word when no boundary exists).
  const sentenceEnd = cut.lastIndexOf(". ");
  const lastSpace = cut.lastIndexOf(" ");
  const boundary = sentenceEnd > 40 ? sentenceEnd + 1 : lastSpace;
  return `${(boundary > 0 ? cut.slice(0, boundary) : cut).trimEnd()}…`;
};

function toMatchCard(m: PipelineMatch, kind: EntityKind, path: string, log: Log): MatchCard {
  const url = sanitizeContractPath(m.link, `${path}.link`, log);
  return {
    name: matchName(m),
    url,
    kind: url ? kindForPath(url, kind) : kind,
    tag: m.tags?.[0] ?? "",
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

const metricToTile = (m: KeyMetric): StatTile => ({
  value: m.value ?? "",
  chip: (m.estimated ? "est" : "sourced") as Chip,
  caption: [m.label, m.context].filter(Boolean).join(" — "),
});

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
  const narrative = toParagraphs(execRaw, "exec.narrative", log, citations.length);
  // Cover headline/scope come from the first SUBSTANTIVE paragraph — skipping
  // heading-only leads ("**Executive Summary**") and stripping chips/bold.
  let headline = "";
  let firstPara = "";
  for (const para of narrative) {
    if (/^\*\*[^*]+\*\*$/.test(para.trim())) continue; // heading-only lead
    const plain = para.replace(/\s*\{chip:[a-z]+\}/g, "").replace(/\*\*/g, "").trim();
    if (plain) {
      headline = firstSentence(plain);
      firstPara = para;
      break;
    }
  }
  if (!headline) log("cover.headline", "no executive summary to derive a headline from");
  log("cover", "cover derived from executive summary (pipeline has no cover fields until Phase B)");

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
    positionTag: m.tags?.[0] ?? "",
    position: matchDescription(m),
    strengths: "",
    differs: "",
  }));
  if (competitorRows.length > 0) {
    log("competitors.rows", "strengths/differs verdict columns unavailable until Phase B");
  }

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

  // ---- prose-only sections ------------------------------------------------
  const swotParas = toParagraphs(sections.swot_analysis?.content, "swot", log, citations.length);
  log(
    "swot",
    swotParas.length > 0
      ? "pipeline SWOT is prose — quadrant items unavailable until Phase B; quadrants render empty"
      : "swot_analysis section missing — quadrants render empty"
  );
  const actionParas = toParagraphs(sections.action_plan?.content, "actionPlan", log, citations.length);
  const phases = actionParas.length
    ? [{ period: "", title: "", body: actionParas.join(" ") }]
    : [];
  log("actionPlan.phases", `derived ${phases.length}/3 phases from prose (structured phases land in Phase B)`);
  while (phases.length < 3) phases.push({ period: "", title: "", body: "" });

  const complianceParas = toParagraphs(sections.setup_compliance?.content, "compliance", log, citations.length);
  log("compliance", "exposure table / stats / checklist unavailable until Phase B — prose intro only");

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

  for (const missing of ["exec.keyQuestionAnswer", "exec.sequence", "exec.heroStat", "close.body", "close.arriveWith"]) {
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
    cover: { kicker: "MARKET ENTRY REPORT", headline, scope: firstPara },
    exec: {
      narrative,
      keyQuestionAnswer: "",
      highlights,
      // The pipeline has no distinct "most material number" source separate
      // from the metric tiles; reusing key_metrics[0] here duplicated tile 1,
      // so the hero card is omitted (empty) until Phase B supplies one.
      heroStat: { label: "", value: "", caption: "", chip: "inferred" },
      sequence: { label: "", rows: [], caveat: "" },
    },
    metrics: { tiles: keyMetrics.slice(0, 6).map(metricToTile) },
    swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
    competitors: {
      intro: "",
      you: { name: customer, url: "", kind: "competitor", positionTag: "", position: "", strengths: "", differs: "" },
      rows: competitorRows,
      gaps: "",
      positioningRead: "",
      scanHookCopy: "Want this table deeper? Request a competitor scan.",
    },
    accounts: { intro: "", briefed, worthKnowing: "" },
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
    mentors: { intro: "", primary: mentorCards.slice(0, 3), extra: mentorCards.slice(3) },
    investors: {
      intro: "",
      approachOrder: [],
      all: investorCards.map((card) => ({ ...card, stageTag: card.tag })),
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
    compliance: { intro: complianceParas[0] ?? "", table: [], stats: [], checklist: [] },
    guides: { intro: "", cards: guides },
    leads: leadDb
      ? {
          dataset: { name: matchName(leadDb), url: leadUrl, records: leadDb.record_count ?? 0, description: matchDescription(leadDb) },
          customBuildCopy: "Need a different list? Describe your ICP and we'll build it.",
        }
      : {
          gapCopy: "No matching lead dataset yet — request a custom build below.",
          customBuildCopy: "Need a different list? Describe your ICP and we'll build it.",
        },
    close: {
      headline: "This report is the map. The route gets chosen together.",
      body: "",
      arriveWith: [],
    },
    sources: tiers,
  };

  log("meta.archetype", "pipeline has no archetype field until Phase B — defaulted to domestic_scaleup");

  return { report, mismatches };
}
