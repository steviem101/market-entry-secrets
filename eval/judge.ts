// MES-148 Phase 1c — golden-set judge (pure logic, no I/O).
//
// Shared by the Deno runner (eval/run-goldens.ts) and node --test. Builds the
// judge prompt for a generated report, parses/validates the judge's JSON reply,
// and diffs a run against the committed baseline (eval/baselines.json).
//
// Rubric (fixed, 1-5 per dimension — judge model is pinned in the runner so
// score drift measures the PIPELINE, not the judge):
//   grounding        — every entity/figure traceable to directory rows or cited research
//   specificity      — concrete, decision-ready detail vs generic advice
//   personalisation  — written for THIS company/corridor/persona, not any company
//   duplication      — free of repeated facts/phrasing across sections (5 = none)

export const RUBRIC_VERSION = "golden-judge-v1";
export const DIMENSIONS = ["grounding", "specificity", "personalisation", "duplication"] as const;
export type Dimension = (typeof DIMENSIONS)[number];

export type SectionScores = Record<Dimension, number> & { notes?: string };

/** A section's mean score across the four dimensions. */
export function sectionMean(scores: SectionScores): number {
  const sum = DIMENSIONS.reduce((s, d) => s + scores[d], 0);
  return sum / DIMENSIONS.length;
}

export function buildJudgePrompt(
  golden: { golden_id: string; description: string; intake: Record<string, unknown> },
  sections: Array<{ name: string; content: string }>,
): string {
  const intakeSummary = JSON.stringify(
    {
      company_name: golden.intake.company_name,
      country_of_origin: golden.intake.country_of_origin,
      industry_sector: golden.intake.industry_sector,
      company_stage: golden.intake.company_stage,
      target_regions: golden.intake.target_regions,
      end_buyer_industries: golden.intake.end_buyer_industries,
      report_focus: golden.intake.report_focus,
      key_challenges: golden.intake.key_challenges,
      persona: (golden.intake.raw_input as Record<string, unknown> | undefined)?.persona,
    },
    null,
    2,
  );
  const body = sections
    .map((s) => `=== SECTION: ${s.name} ===\n${s.content}`)
    .join("\n\n");
  return `You are grading one AI-generated Australian market-entry report against a fixed rubric. The report was generated for this frozen intake (golden "${golden.golden_id}" — ${golden.description}):

${intakeSummary}

Score EVERY section below on four dimensions, each an integer 1-5:
- grounding: 5 = every named organisation and figure is plausible, sourced or clearly hedged; 1 = confident unsupported specifics.
- specificity: 5 = concrete, decision-ready recommendations for this company; 1 = generic filler any company could receive.
- personalisation: 5 = clearly written for this company's corridor, sector, stage and stated priority; 1 = interchangeable.
- duplication: 5 = no fact/recommendation repeated from other sections; 1 = heavy repetition.

Return ONLY a JSON array (no markdown fences), one element per section, same order:
[{"section": "<name>", "grounding": 1-5, "specificity": 1-5, "personalisation": 1-5, "duplication": 1-5, "notes": "<=25 words on the biggest weakness"}]

Report sections:
${body}`;
}

/** Parse + validate the judge reply. Returns null on any violation (the runner
 *  retries once, then marks the golden's judging as failed). */
export function parseJudgeResponse(
  raw: string,
  expectedSections: string[],
): Record<string, SectionScores> | null {
  let parsed: unknown;
  try {
    let cleaned = (raw || "").replace(/```json?\n?/gi, "").replace(/```/g, "").trim();
    // Salvage an array wrapped in stray prose ("Here are the scores: [ ... ]")
    // by slicing to the outermost brackets — mirrors rubric.ts's parseScoring.
    if (!cleaned.startsWith("[")) {
      const s = cleaned.indexOf("["), e = cleaned.lastIndexOf("]");
      if (s !== -1 && e > s) cleaned = cleaned.slice(s, e + 1);
    }
    parsed = JSON.parse(cleaned);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) return null;
  const out: Record<string, SectionScores> = {};
  for (const item of parsed) {
    if (typeof item !== "object" || item === null) return null;
    const o = item as Record<string, unknown>;
    const section = String(o.section ?? "");
    if (!expectedSections.includes(section)) return null;
    const scores = {} as SectionScores;
    for (const d of DIMENSIONS) {
      const v = Number(o[d]);
      if (!Number.isInteger(v) || v < 1 || v > 5) return null;
      scores[d] = v;
    }
    scores.notes = String(o.notes ?? "").slice(0, 300);
    out[section] = scores;
  }
  // Every expected section must be scored exactly once.
  for (const s of expectedSections) if (!out[s]) return null;
  return out;
}

// ── Baseline comparison ───────────────────────────────────────────────────

export interface Regression {
  golden_id: string;
  section: string;
  baseline_mean: number;
  current_mean: number;
  delta: number;
}

export interface BaselineFile {
  rubric_version?: string;
  judge_model?: string; // the judge that produced these scores; a mismatch invalidates the gate
  goldens: Record<string, Record<string, SectionScores>>; // golden_id -> section -> scores
}

/** Merge-gate rule from the ticket: fail when any section's mean score drops
 *  >= 1.0 versus baseline. New sections/goldens (no baseline) never fail. */
export const REGRESSION_THRESHOLD = 1.0;

export function compareToBaseline(
  goldenId: string,
  current: Record<string, SectionScores>,
  baseline: BaselineFile | null,
): Regression[] {
  const base = baseline?.goldens?.[goldenId];
  if (!base) return [];
  const regressions: Regression[] = [];
  for (const [section, scores] of Object.entries(current)) {
    const baseScores = base[section];
    if (!baseScores) continue;
    const baselineMean = sectionMean(baseScores);
    const currentMean = sectionMean(scores);
    const delta = currentMean - baselineMean;
    if (delta <= -REGRESSION_THRESHOLD) {
      regressions.push({
        golden_id: goldenId,
        section,
        baseline_mean: Number(baselineMean.toFixed(2)),
        current_mean: Number(currentMean.toFixed(2)),
        delta: Number(delta.toFixed(2)),
      });
    }
  }
  return regressions;
}

export function summarizeScores(scores: Record<string, SectionScores>): {
  overall: number;
  per_section: Record<string, number>;
} {
  const per_section: Record<string, number> = {};
  let total = 0;
  const names = Object.keys(scores);
  for (const name of names) {
    const mean = sectionMean(scores[name]);
    per_section[name] = Number(mean.toFixed(2));
    total += mean;
  }
  return {
    overall: names.length ? Number((total / names.length).toFixed(2)) : 0,
    per_section,
  };
}
