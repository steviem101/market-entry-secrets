// Wave 8 — deterministic report-lint layer for the quality loop.
//
// Machine-detects the defect classes we previously caught only by hand-reading
// generated PDFs (Solidroad / Floats smoke tests): mid-clause TRUNCATION, a
// MISSING section intro, and possibly INCONSISTENT figures. This is advisory
// telemetry — surfaced on the report-quality Slack card and stored on the
// report_quality row — NOT a merge gate and NOT a change to the report itself.
//
// Deliberately NON-overlapping with computePresentation() in reportQuality.ts,
// which already flags duplication, walls-of-text, thin/overlong sections,
// placeholder links and AI-tells; and with `failed_sections`, which already
// lists visible-but-empty sections. This module only adds what those miss.
//
// PURE (no Deno APIs) so it runs under `npm test` alongside rubric.test.ts.

export type LintCode = "truncation" | "missing_intro" | "inconsistent_figures";

export interface LintFinding {
  code: LintCode;
  where: string; // section name, or "match:<category>" for a match blurb
  detail: string; // short human-readable string for the Slack card
}

export interface LintResult {
  findings: LintFinding[];
  counts: Record<LintCode, number>;
}

// Card-bearing sections whose prose should lead with an intro paragraph before
// the entities/cards render. (gov & hubs have no prose slot in report_json —
// their intros are epic F2 work, not lintable here.)
const SECTIONS_NEEDING_INTRO = new Set([
  "competitor_landscape",
  "service_providers",
  "mentor_recommendations",
  "investor_recommendations",
  "events_resources",
]);

// A blurb that ends mid-clause: a bare ellipsis, or a trailing
// connector/preposition/article/conjunction, or a dangling comma/semicolon/
// colon/dash. These are hard-clip signatures — normal copy ends on terminal
// punctuation or a complete noun tagline.
const DANGLING_RE =
  /(?:\.\.\.|…|[,;:]|\b(?:and|or|the|to|with|for|of|a|an|in|on|at|is|are|was|were|by|as|that|which|but|from|into|than|then|per)\b)\s*$/i;

const ENDS_CLEAN_RE = /[.!?)\]"'”’%]\s*$/;

// Only the trailing run of [n] markers matters, so bound the regex to the last
// 300 chars (dozens of markers — far more than real prose carries). This keeps
// the strip O(1) instead of O(n²) on a pathological all-citations string.
const stripTrailingCitations = (s: string): string => {
  const str = s || "";
  if (str.length <= 300) return str.replace(/(?:\s*\[\d+\])+\s*$/g, "").trimEnd();
  return (str.slice(0, -300) + str.slice(-300).replace(/(?:\s*\[\d+\])+\s*$/g, "")).trimEnd();
};

/** Section prose is truncated when its last PROSE line doesn't close cleanly.
 *  A section that legitimately ends on a markdown list item or heading (cards
 *  render from those) is structured, not truncated — skip those. A hanging
 *  prose line is a clip when it ends on an ellipsis, a dangling connector, or
 *  reads like a full sentence (≥60 chars) that never got its terminal mark. */
function sectionTruncated(content: string): boolean {
  const lines = (content || "").split("\n");
  let last = "";
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim()) { last = lines[i].trim(); break; }
  }
  if (!last) return false;
  if (/^#{1,6}\s/.test(last) || /^[-*]\s/.test(last) || /^\d+\.\s/.test(last)) return false;
  // Drop trailing emphasis markers so a dangling bold lead-in label
  // ("**Who from your matches can help with this:**" with nothing after it —
  // a real Floats artifact) is judged on the ":" it actually ends on.
  const t = stripTrailingCitations(last).replace(/\*+$/, "").trimEnd();
  if (t.endsWith("…") || t.endsWith("...")) return true;
  if (ENDS_CLEAN_RE.test(t)) return false;
  return DANGLING_RE.test(t) || t.length >= 60;
}

/** A match blurb (curated tagline, often no terminal punctuation by design) is
 *  truncated only on an explicit dangling signature. */
function blurbTruncated(text: string): boolean {
  const t = stripTrailingCitations(text);
  if (t.length < 40) return false;
  if (ENDS_CLEAN_RE.test(t)) return false;
  return DANGLING_RE.test(t);
}

/** Leading prose word count, before the first markdown list item or heading —
 *  i.e. how much intro there is ahead of the cards. */
function introWordCount(content: string): number {
  const lines = (content || "").split("\n");
  const lead: string[] = [];
  for (const raw of lines) {
    const t = raw.trim();
    if (!t) continue;
    if (/^#{1,6}\s/.test(t) || /^[-*]\s/.test(t) || /^\d+\.\s/.test(t)) break;
    lead.push(t);
  }
  return lead.join(" ").split(/\s+/).filter(Boolean).length;
}

const STOPWORDS = new Set([
  "the", "a", "an", "of", "for", "in", "on", "at", "to", "and", "or", "is", "are",
  "was", "were", "by", "as", "that", "which", "market", "valued", "worth", "about",
  "approximately", "around", "reaching", "reach", "estimated", "current", "value",
]);

interface FigureHit {
  norm: string; // canonical magnitude, e.g. "usd|700|m"
  ctx: string; // up to 2 content words immediately preceding the figure
}

/** Currency magnitudes with a scale word (million/billion). Percentages are
 *  intentionally excluded — CAGR/percentage reuse is legitimate and noisy. */
function extractFigures(prose: string): FigureHit[] {
  const re =
    /([a-z][a-z\s&-]{2,60}?)\s*(?:is\s+valued\s+at\s+|valued\s+at\s+|worth\s+|of\s+|at\s+)?((?:usd|aud|us\$|a\$|\$)\s?)([\d][\d.,]*)\s?(million|billion|bn|m)\b/gi;
  const out: FigureHit[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(prose)) !== null) {
    const value = m[3].replace(/,/g, "");
    const scaleRaw = m[4].toLowerCase();
    const scale = scaleRaw.startsWith("b") ? "bn" : "m";
    const ctxWords = m[1]
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w));
    const ctx = ctxWords.slice(-2).join(" ");
    if (ctx.split(" ").filter(Boolean).length < 2) continue; // need a specific context
    out.push({ norm: `${value}|${scale}`, ctx });
  }
  return out;
}

// deno-lint-ignore no-explicit-any
function entityBlurb(m: any): string {
  return String(m?.description ?? m?.subtitle ?? "").trim();
}

// deno-lint-ignore no-explicit-any
function entityLabel(m: any): string {
  return String(m?.name ?? m?.title ?? m?.company_name ?? "").trim();
}

/**
 * Lint a completed report_json. Returns structured findings + per-code counts.
 * Never throws; unknown shapes degrade to an empty result.
 */
// deno-lint-ignore no-explicit-any
export function lintReport(rj: any): LintResult {
  const findings: LintFinding[] = [];
  const sections = (rj && rj.sections) ?? {};
  const matches = (rj && rj.matches) ?? {};

  const visibleProse: string[] = [];

  // deno-lint-ignore no-explicit-any
  for (const [name, v] of Object.entries(sections) as [string, any][]) {
    const content: string = (v && typeof v.content === "string" ? v.content : "").trim();
    const visible = !!(v && v.visible);
    if (!visible || !content) continue;
    visibleProse.push(content);

    if (sectionTruncated(content)) {
      const tail = stripTrailingCitations(content).slice(-48).replace(/\s+/g, " ");
      findings.push({ code: "truncation", where: name, detail: `…${tail}` });
    }
    if (SECTIONS_NEEDING_INTRO.has(name) && introWordCount(content) < 12) {
      findings.push({ code: "missing_intro", where: name, detail: "no lead paragraph before the cards" });
    }
  }

  // Truncated match blurbs (the "…39…" / "…thou" card clips from the smoke tests).
  // deno-lint-ignore no-explicit-any
  for (const [cat, arr] of Object.entries(matches) as [string, any][]) {
    if (!Array.isArray(arr)) continue;
    for (const m of arr) {
      const blurb = entityBlurb(m);
      if (blurb && blurbTruncated(blurb)) {
        const label = entityLabel(m) || "(unnamed)";
        findings.push({ code: "truncation", where: `match:${cat}`, detail: `${label}: …${blurb.slice(-40).replace(/\s+/g, " ")}` });
        break; // one representative finding per category keeps the card readable
      }
    }
  }

  // Inconsistent figures: the SAME 2-word context attached to divergent currency
  // magnitudes across the report (e.g. "recruitment platforms" → USD 700m AND
  // USD 775m). Context-keyed so genuinely different metrics (ATS niche 250m vs
  // total market 700m) don't false-positive.
  const byCtx = new Map<string, Set<string>>();
  for (const hit of extractFigures(visibleProse.join("\n"))) {
    const set = byCtx.get(hit.ctx) ?? new Set<string>();
    set.add(hit.norm);
    byCtx.set(hit.ctx, set);
  }
  for (const [ctx, values] of byCtx) {
    if (values.size >= 2) {
      const shown = [...values].map((v) => v.replace("|", " ")).join(" vs ");
      findings.push({ code: "inconsistent_figures", where: "prose", detail: `"${ctx}": ${shown}` });
    }
  }

  const counts: Record<LintCode, number> = { truncation: 0, missing_intro: 0, inconsistent_figures: 0 };
  for (const f of findings) counts[f.code]++;
  return { findings, counts };
}

/** One-line Slack summary, or "" when clean. */
export function lintSummary(result: LintResult | null | undefined): string {
  if (!result || result.findings.length === 0) return "";
  const parts: string[] = [];
  if (result.counts.truncation) parts.push(`${result.counts.truncation} truncation`);
  if (result.counts.missing_intro) parts.push(`${result.counts.missing_intro} missing-intro`);
  if (result.counts.inconsistent_figures) parts.push(`${result.counts.inconsistent_figures} figure-conflict`);
  return parts.join(" · ");
}
