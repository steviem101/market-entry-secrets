// Report-quality review-loop rubric. PURE logic only — no Deno globals, no I/O —
// so it runs under `node --test` (rubric.test.ts) and inside the Deno edge function.
//
// This module turns a completed report + its quality telemetry + the user's intake
// inputs into (1) a compact, PII-scrubbed payload for the LLM judge and (2) ranked,
// categorised improvement proposals. Tier-awareness lives here so a Freemium report is
// never penalised for sections its tier was never meant to include.
//
// Source of truth for tiers/sections is src/components/report/reportSectionConfig.ts;
// replicated here because the edge runtime cannot import from the Vite app.

export const RUBRIC_VERSION = "rq-loop-v1";

export const CATEGORIES = [
  "matching/relevance",
  "content/prompt-bulk",
  "data-coverage-gap",
  "input-not-actioned",
  "accuracy/hallucination",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const TIER_HIERARCHY = ["free", "growth", "scale", "enterprise"];

// Minimum tier required for each gated section (mirror of TIER_REQUIREMENTS).
export const TIER_REQUIREMENTS: Record<string, string> = {
  swot_analysis: "growth",
  competitor_landscape: "growth",
  mentor_recommendations: "growth",
  investor_recommendations: "growth",
  first_customers: "growth",
  lead_list: "scale",
};

export const SECTION_ORDER = [
  "executive_summary", "swot_analysis", "competitor_landscape", "first_customers", "service_providers",
  "mentor_recommendations", "investor_recommendations", "events_resources", "action_plan",
  "setup_compliance", "lead_list",
];

// Legacy tier values still present in user_reports.tier_at_generation: the app remaps
// these via mapDatabaseTier() (useSubscription.ts), but the loop reads the raw DB value.
// Without this, a 'premium'/'concierge' report fails every tierMeets() check and is judged
// as if ALL sections were gated — so its fidelity/coverage can never flag a missing
// section. Map them the same way; unknown/null falls back to 'free'.
const LEGACY_TIER_MAP: Record<string, string> = { premium: "growth", concierge: "enterprise" };
export function normalizeTier(raw: string | null | undefined): string {
  const t = String(raw ?? "free").trim().toLowerCase();
  const mapped = LEGACY_TIER_MAP[t] ?? t;
  return TIER_HIERARCHY.includes(mapped) ? mapped : "free";
}

export function tierMeets(userTier: string, requiredTier: string): boolean {
  const u = TIER_HIERARCHY.indexOf(userTier);
  const r = TIER_HIERARCHY.indexOf(requiredTier);
  if (u === -1 || r === -1) return false;
  return u >= r;
}

// Sections that SHOULD be visible at this tier — the fair denominator for completeness.
export function expectedVisibleSections(tier: string): string[] {
  return SECTION_ORDER.filter((s) => tierMeets(tier, TIER_REQUIREMENTS[s] ?? "free"));
}

// Sections gated ABOVE this tier — must never be flagged as "missing"/"not actioned".
export function gatedSections(tier: string): string[] {
  return SECTION_ORDER.filter((s) => !tierMeets(tier, TIER_REQUIREMENTS[s] ?? "free"));
}

const RAG_LABELS: Record<string, string> = {
  service_providers: "Providers", community_members: "Mentors", events: "Events", content_items: "Content",
  leads: "Leads", innovation_ecosystem: "Innovation", trade_investment_agencies: "Agencies", investors: "Investors",
};

function wordCount(s: string): number {
  return s ? s.trim().split(/\s+/).filter(Boolean).length : 0;
}

// deno-lint-ignore no-explicit-any
function entityName(e: any): string {
  return String(e?.name ?? e?.title ?? e?.company_name ?? e?.company ?? "").trim();
}

export interface CompactSection {
  key: string;
  visible: boolean;
  gated: boolean;
  words: number;
  snippet: string;
  match_names: string[];
}

export interface CompactInput {
  report_id: string;
  tier: string;
  company: string;
  inputs: {
    country_of_origin: string;
    industry_sector: string[];
    target_regions: string[];
    selected_goals: string[];
    end_buyer_industries: string[];
    report_focus: string;
    additional_notes: string;
  };
  expected_sections: string[];
  gated_sections: string[];
  sections: CompactSection[];
  match_counts: Record<string, number>;
  dropped: string[];
  presentation_flags: string[];
  scores: Record<string, number | null>;
}

// Build the compact, length-capped, PII-scrubbed payload. We deliberately exclude
// user_id / email / contact rows — only the user's own company name (already shown in
// the existing #report-quality card) and public directory match names are included.
// deno-lint-ignore no-explicit-any
export function buildCompactInput(rq: any, report: any, intake: any): CompactInput {
  const rj = report?.report_json ?? {};
  const tier = normalizeTier(report?.tier_at_generation);
  const gated = new Set(gatedSections(tier));
  const sectionsObj = rj.sections ?? {};

  const sections: CompactSection[] = [];
  for (const key of SECTION_ORDER) {
    const v = sectionsObj[key];
    if (!v) continue;
    const content = String(v.content ?? "");
    const matchNames = Array.isArray(v.matches)
      ? v.matches.map(entityName).filter(Boolean).slice(0, 8)
      : [];
    sections.push({
      key,
      visible: !!v.visible,
      gated: gated.has(key),
      words: wordCount(content),
      snippet: content.replace(/\s+/g, " ").trim().slice(0, 900),
      match_names: matchNames,
    });
  }

  const matchCounts: Record<string, number> = {};
  const matches = rj.matches ?? {};
  for (const k of Object.keys(RAG_LABELS)) {
    matchCounts[k] = Array.isArray(matches[k]) ? matches[k].length : 0;
  }

  return {
    report_id: String(rq?.report_id ?? report?.id ?? ""),
    tier,
    company: String(intake?.company_name ?? rj.company_name ?? rq?.metadata?.company ?? "(unknown)"),
    inputs: {
      country_of_origin: String(intake?.country_of_origin ?? ""),
      industry_sector: Array.isArray(intake?.industry_sector) ? intake.industry_sector : [],
      target_regions: Array.isArray(intake?.target_regions) ? intake.target_regions : [],
      selected_goals: Array.isArray(intake?.goal_ids) && intake.goal_ids.length
        ? intake.goal_ids
        : (Array.isArray(intake?.services_needed) ? intake.services_needed : []),
      end_buyer_industries: Array.isArray(intake?.end_buyer_industries) ? intake.end_buyer_industries : [],
      report_focus: String(intake?.report_focus ?? "").slice(0, 200),
      additional_notes: String(intake?.additional_notes ?? "").slice(0, 300),
    },
    expected_sections: expectedVisibleSections(tier),
    gated_sections: gatedSections(tier),
    sections,
    match_counts: matchCounts,
    dropped: (rq?.utilization?.dropped ?? []).map((c: string) => RAG_LABELS[c] ?? c),
    presentation_flags: rq?.presentation?.flags ?? [],
    scores: {
      build: rq?.build_health ?? null,
      report: rq?.report_score ?? null,
      presentation: rq?.score_presentation ?? null,
      substance: rq?.score_substance ?? null,
      coverage: rq?.score_coverage ?? null,
      completeness: rq?.score_completeness ?? null,
    },
  };
}

export interface ScoringMessages {
  system: string;
  user: string;
}

// Build the LLM judge prompt. Fixed rubric + explicit tier-fairness instruction so the
// model judges the report against what its tier was meant to include.
export function buildScoringMessages(c: CompactInput): ScoringMessages {
  const system =
    "You are a strict QA reviewer improving MES AI market-entry reports. You score each " +
    "report on three axes and propose concrete, high-leverage fixes to the report PIPELINE " +
    "(matching filters, section prompts, taxonomy, data coverage) — never generic advice. " +
    "Judge ONLY the excerpt shown; do NOT penalise truncation or overall length. " +
    "CRITICAL FAIRNESS RULE: gated_sections are intentionally hidden for this report's tier — " +
    "NEVER flag them as missing, not-delivered, or not-actioned. Only expected_sections count. " +
    "Respond with ONLY a JSON object, no prose, no markdown fences.";

  const sectionLines = c.sections.map((s) =>
    `- ${s.key} [${s.visible ? "visible" : "hidden"}${s.gated ? ", GATED-by-tier" : ""}] ` +
    `${s.words}w; matches: ${s.match_names.join(", ") || "none"}\n    "${s.snippet}"`,
  ).join("\n");

  const user = `REPORT ${c.report_id} — tier: ${c.tier}, company: ${c.company}

USER FORM INPUTS (what they asked for — the report must action these):
- country_of_origin: ${c.inputs.country_of_origin || "(none)"}
- industry_sector: ${c.inputs.industry_sector.join(", ") || "(none)"}
- target_regions: ${c.inputs.target_regions.join(", ") || "(none)"}
- selected_goals: ${c.inputs.selected_goals.join(", ") || "(none)"}
- end_buyer_industries: ${c.inputs.end_buyer_industries.join(", ") || "(none)"}
- report_focus: ${c.inputs.report_focus || "(none)"}
- additional_notes: ${c.inputs.additional_notes || "(none)"}

TIER FAIRNESS:
- expected_sections (should be present): ${c.expected_sections.join(", ")}
- gated_sections (DO NOT penalise as missing): ${c.gated_sections.join(", ") || "(none)"}

TELEMETRY:
- existing scores: ${JSON.stringify(c.scores)}
- match_counts: ${JSON.stringify(c.match_counts)}
- retrieval surfaced-but-unused: ${c.dropped.join(", ") || "none"}
- presentation flags: ${c.presentation_flags.join("; ") || "none"}

SECTIONS:
${sectionLines}

Score each axis 0-100:
- relevance: are matched directory items genuinely on-target for this company's industry / target market / country / goals?
- conciseness: is the report tight, or padded / duplicated (prose + cards) / stuffed with low-value content that should be trimmed?
- fidelity: did the report deliver, accurately, what the form asked for (goals, ICP, industries, country), with no hallucinated or mismatched records? (Judge only against expected_sections.)

Then produce up to 4 "findings". Each finding:
- "category": one of ${CATEGORIES.map((x) => `"${x}"`).join(", ")}
- "title": <=12 words, specific
- "evidence": the section / match / input that proves it, <=30 words (no user PII)
- "recommended_change": a concrete pipeline change (filter, prompt trim, section cap, goal-tile mapping, data to seed), <=30 words
- "impact": "high" | "medium" | "low"
- "confidence": 0.0-1.0
- "risk": "low" | "medium" | "high" (risk of the change regressing other reports)

Return ONLY:
{"relevance":n,"conciseness":n,"fidelity":n,"summary":"<=20 words","findings":[{"category":"...","title":"...","evidence":"...","recommended_change":"...","impact":"...","confidence":n,"risk":"..."}]}`;

  return { system, user };
}

export interface Finding {
  category: Category;
  title: string;
  evidence: string;
  recommended_change: string;
  impact: "high" | "medium" | "low";
  confidence: number;
  risk: "low" | "medium" | "high";
}

export interface ParsedScoring {
  axes: { relevance: number; conciseness: number; fidelity: number };
  summary: string;
  findings: Finding[];
}

function clampScore(n: unknown): number {
  const v = Number(n);
  if (!isFinite(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}
function clamp01(n: unknown): number {
  const v = Number(n);
  if (!isFinite(v)) return 0.5;
  return Math.max(0, Math.min(1, v));
}
function asCategory(x: unknown): Category {
  const s = String(x);
  return (CATEGORIES as readonly string[]).includes(s) ? (s as Category) : "content/prompt-bulk";
}
function asImpact(x: unknown): "high" | "medium" | "low" {
  const s = String(x).toLowerCase();
  return s === "high" || s === "low" ? s : "medium";
}
function asRisk(x: unknown): "low" | "medium" | "high" {
  const s = String(x).toLowerCase();
  return s === "high" || s === "medium" ? s : "low";
}

// Tolerant parse of the LLM JSON (handles ```fences``` and stray prose).
export function parseScoring(text: string): ParsedScoring {
  let body = String(text ?? "").replace(/```json/gi, "").replace(/```/g, "").trim();
  const first = body.indexOf("{");
  const last = body.lastIndexOf("}");
  if (first > 0 || last < body.length - 1) {
    if (first !== -1 && last !== -1 && last > first) body = body.slice(first, last + 1);
  }
  let j: Record<string, unknown> = {};
  try { j = JSON.parse(body); } catch { j = {}; }

  const rawFindings = Array.isArray(j.findings) ? j.findings : [];
  const findings: Finding[] = rawFindings.slice(0, 4).map((f: Record<string, unknown>) => ({
    category: asCategory(f?.category),
    title: String(f?.title ?? "").slice(0, 140),
    evidence: String(f?.evidence ?? "").slice(0, 280),
    recommended_change: String(f?.recommended_change ?? "").slice(0, 280),
    impact: asImpact(f?.impact),
    confidence: clamp01(f?.confidence),
    risk: asRisk(f?.risk),
  })).filter((f: Finding) => f.title && f.recommended_change);

  return {
    axes: {
      relevance: clampScore(j.relevance),
      conciseness: clampScore(j.conciseness),
      fidelity: clampScore(j.fidelity),
    },
    summary: String(j.summary ?? "").slice(0, 200),
    findings,
  };
}

const IMPACT_WEIGHT: Record<string, number> = { high: 3, medium: 2, low: 1 };

// rank_score = impact x confidence — higher first. Risk is surfaced, not subtracted,
// so reviewers can still see high-impact/high-risk items.
export function rankScore(impact: string, confidence: number): number {
  return Number(((IMPACT_WEIGHT[impact] ?? 2) * confidence).toFixed(3));
}

// Stable theme key for de-duping recurring issues across reports.
export function themeKey(category: string, title: string): string {
  const stop = new Set(["the", "a", "an", "of", "to", "for", "and", "in", "is", "are", "this", "that", "report", "section"]);
  const words = title.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
    .filter((w) => w && !stop.has(w)).slice(0, 4).sort();
  return `${category}:${words.join("-")}`;
}

export interface ProposalRow {
  report_id: string;
  tier_at_generation: string;
  category: Category;
  title: string;
  evidence: Record<string, unknown>;
  recommended_change: string;
  impact_estimate: string;
  confidence: number;
  risk: string;
  axis_scores: { relevance: number; conciseness: number; fidelity: number };
  rank_score: number;
  rubric_version: string;
  dedup_theme: string;
}

// Turn one report's parsed scoring into proposal rows.
export function toProposalRows(c: CompactInput, parsed: ParsedScoring): ProposalRow[] {
  return parsed.findings.map((f) => ({
    report_id: c.report_id,
    tier_at_generation: c.tier,
    category: f.category,
    title: f.title,
    evidence: {
      company: c.company,
      detail: f.evidence,
      axis_summary: parsed.summary,
      scores: c.scores,
    },
    recommended_change: f.recommended_change,
    impact_estimate: f.impact,
    confidence: f.confidence,
    risk: f.risk,
    axis_scores: parsed.axes,
    rank_score: rankScore(f.impact, f.confidence),
    rubric_version: RUBRIC_VERSION,
    dedup_theme: themeKey(f.category, f.title),
  }));
}

// Rank highest-impact first and cap the number written per run.
export function rankAndCap(rows: ProposalRow[], cap: number): ProposalRow[] {
  return [...rows].sort((a, b) => b.rank_score - a.rank_score).slice(0, Math.max(0, cap));
}

// Roll recurring proposals up into themes for the Slack digest.
export function summariseThemes(rows: ProposalRow[], topN = 5): { theme: string; category: string; count: number; example: string }[] {
  const byTheme = new Map<string, { category: string; count: number; example: string }>();
  for (const r of rows) {
    const cur = byTheme.get(r.dedup_theme);
    if (cur) cur.count += 1;
    else byTheme.set(r.dedup_theme, { category: r.category, count: 1, example: r.title });
  }
  return [...byTheme.entries()]
    .map(([theme, v]) => ({ theme, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}
