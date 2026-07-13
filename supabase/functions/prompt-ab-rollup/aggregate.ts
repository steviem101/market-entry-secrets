// MES-148 Phase 4 (PR-B) — pure candidate-vs-active aggregation for the prompt
// A/B flywheel (node --test). No I/O: the edge function fetches the report
// samples + current candidates, this computes the per-section verdict.
//
// Metric (approved): report-level report_quality.report_score (0–100), attributing
// each report to its arm. Clean when ONE candidate section runs per experiment
// (all else equal between arms). A bucketed report that ran a DIFFERENT candidate
// section is CONTAMINATED for this section's comparison and is excluded from both
// arms. Per-section verifier grounding is a secondary readout, never the gate.

export interface AbReportSample {
  /** metadata.prompt_ab.bucket — true = candidate arm, false = pure control (all-active). */
  bucket: boolean;
  /** metadata.prompt_ab.variants — section → candidate version actually written. */
  variants: Record<string, number>;
  /** report_quality.report_score (0–100); null when unscored (excluded from means). */
  score: number | null;
  /** Per-section grounding proxy 0–1 (secondary); {} when unavailable. */
  grounding: Record<string, number>;
}

export interface CandidateSpec {
  section: string;
  version: number;
}

export interface ArmStats {
  n: number;
  meanScore: number | null;
  meanGrounding: number | null;
}

export interface AbSectionResult {
  section: string;
  version: number;
  candidate: ArmStats;
  control: ArmStats;
  /** candidate.meanScore − control.meanScore (null when either arm is unscored). */
  lift: number | null;
  /** candidate.meanGrounding − control.meanGrounding (secondary readout). */
  groundingLift: number | null;
  verdict: "promote" | "retire" | "inconclusive" | "insufficient";
}

export interface AbOpts {
  /** Minimum scored reports required in EACH arm before a verdict is called. */
  minN: number;
  /** Score points the candidate must beat (or trail) the control by to promote (or retire). */
  liftThreshold: number;
}

function mean(xs: number[]): number | null {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

function round2(n: number | null): number | null {
  return n === null ? null : Math.round(n * 100) / 100;
}

/** Compute the candidate-vs-active verdict for each current candidate section. */
export function aggregateAb(
  samples: AbReportSample[],
  candidates: CandidateSpec[],
  opts: AbOpts,
): AbSectionResult[] {
  const out: AbSectionResult[] = [];
  for (const { section, version } of candidates) {
    const candScores: number[] = [];
    const ctrlScores: number[] = [];
    const candGr: number[] = [];
    const ctrlGr: number[] = [];

    for (const s of samples) {
      const v = s.variants ?? {};
      // Candidate arm requires this section to be the ONLY deviation from the
      // active prompts — a report that ALSO ran another candidate section would
      // confound the report-level score, so it is excluded from both arms (as
      // tight as the control arm). With the one-candidate-at-a-time operating
      // model this is every bucketed report; if multiple candidates are ever live
      // at once, each arm empties out and the verdict fails safe to `insufficient`
      // rather than emitting a contaminated promote/retire.
      const ranThisCandidate = v[section] === version && Object.keys(v).length === 1;
      const pureControl = s.bucket === false; // ran the active prompt for every section
      if (ranThisCandidate) {
        if (typeof s.score === "number") candScores.push(s.score);
        if (typeof s.grounding?.[section] === "number") candGr.push(s.grounding[section]);
      } else if (pureControl) {
        if (typeof s.score === "number") ctrlScores.push(s.score);
        if (typeof s.grounding?.[section] === "number") ctrlGr.push(s.grounding[section]);
      }
      // else: bucketed but a different candidate section → contaminated → skip.
    }

    const candidate: ArmStats = { n: candScores.length, meanScore: round2(mean(candScores)), meanGrounding: round2(mean(candGr)) };
    const control: ArmStats = { n: ctrlScores.length, meanScore: round2(mean(ctrlScores)), meanGrounding: round2(mean(ctrlGr)) };
    const lift = candidate.meanScore !== null && control.meanScore !== null ? round2(candidate.meanScore - control.meanScore) : null;
    const groundingLift = candidate.meanGrounding !== null && control.meanGrounding !== null
      ? round2(candidate.meanGrounding - control.meanGrounding)
      : null;

    let verdict: AbSectionResult["verdict"];
    if (candidate.n < opts.minN || control.n < opts.minN || lift === null) verdict = "insufficient";
    else if (lift >= opts.liftThreshold) verdict = "promote";
    else if (lift <= -opts.liftThreshold) verdict = "retire";
    else verdict = "inconclusive";

    out.push({ section, version, candidate, control, lift, groundingLift, verdict });
  }
  return out;
}
