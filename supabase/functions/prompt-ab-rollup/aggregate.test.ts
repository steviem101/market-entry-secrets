import { test } from "node:test";
import assert from "node:assert/strict";
import { aggregateAb, type AbReportSample } from "./aggregate.ts";

const cand = (section: string, version: number, score: number, grounding = 1): AbReportSample =>
  ({ bucket: true, variants: { [section]: version }, score, grounding: { [section]: grounding } });
const ctrl = (score: number, section = "executive_summary", grounding = 1): AbReportSample =>
  ({ bucket: false, variants: {}, score, grounding: { [section]: grounding } });

test("aggregateAb: promotes when candidate beats control by >= threshold at min n", () => {
  const samples = [
    ...Array.from({ length: 20 }, () => cand("executive_summary", 2, 85)),
    ...Array.from({ length: 20 }, () => ctrl(78)),
  ];
  const [r] = aggregateAb(samples, [{ section: "executive_summary", version: 2 }], { minN: 20, liftThreshold: 3 });
  assert.equal(r.candidate.n, 20);
  assert.equal(r.control.n, 20);
  assert.equal(r.candidate.meanScore, 85);
  assert.equal(r.control.meanScore, 78);
  assert.equal(r.lift, 7);
  assert.equal(r.verdict, "promote");
});

test("aggregateAb: retires when candidate trails control by >= threshold", () => {
  const samples = [
    ...Array.from({ length: 20 }, () => cand("executive_summary", 2, 70)),
    ...Array.from({ length: 20 }, () => ctrl(80)),
  ];
  const [r] = aggregateAb(samples, [{ section: "executive_summary", version: 2 }], { minN: 20, liftThreshold: 3 });
  assert.equal(r.lift, -10);
  assert.equal(r.verdict, "retire");
});

test("aggregateAb: inconclusive when the gap is within the threshold band", () => {
  const samples = [
    ...Array.from({ length: 20 }, () => cand("executive_summary", 2, 81)),
    ...Array.from({ length: 20 }, () => ctrl(80)),
  ];
  const [r] = aggregateAb(samples, [{ section: "executive_summary", version: 2 }], { minN: 20, liftThreshold: 3 });
  assert.equal(r.lift, 1);
  assert.equal(r.verdict, "inconclusive");
});

test("aggregateAb: insufficient until BOTH arms hit min n", () => {
  const samples = [
    ...Array.from({ length: 25 }, () => cand("executive_summary", 2, 90)),
    ...Array.from({ length: 5 }, () => ctrl(70)), // control under-sampled
  ];
  const [r] = aggregateAb(samples, [{ section: "executive_summary", version: 2 }], { minN: 20, liftThreshold: 3 });
  assert.equal(r.control.n, 5);
  assert.equal(r.verdict, "insufficient");
});

test("aggregateAb: a report running a DIFFERENT candidate section is excluded from both arms", () => {
  const samples: AbReportSample[] = [
    // 20 candidates for exec_summary, 20 pure controls...
    ...Array.from({ length: 20 }, () => cand("executive_summary", 2, 85)),
    ...Array.from({ length: 20 }, () => ctrl(78)),
    // ...plus a report that ran a candidate for action_plan (contaminated for exec_summary).
    { bucket: true, variants: { action_plan: 1 }, score: 10, grounding: {} },
  ];
  const [r] = aggregateAb(samples, [{ section: "executive_summary", version: 2 }], { minN: 20, liftThreshold: 3 });
  // The score:10 contaminant must not drag the control mean down.
  assert.equal(r.control.n, 20);
  assert.equal(r.control.meanScore, 78);
  assert.equal(r.verdict, "promote");
});

test("aggregateAb: a report that ALSO ran another candidate section is excluded from the candidate arm", () => {
  const samples: AbReportSample[] = [
    // 20 clean single-section candidates + 20 pure controls → would be 'promote'...
    ...Array.from({ length: 20 }, () => cand("executive_summary", 2, 85)),
    ...Array.from({ length: 20 }, () => ctrl(78)),
    // ...plus 5 reports that ran BOTH exec_summary v2 AND action_plan v1 with a
    // tanked score. Under a naive `variants[section]===version` these would count
    // into the exec_summary candidate arm and corrupt the lift; the single-section
    // guard must exclude them.
    ...Array.from({ length: 5 }, () => ({ bucket: true, variants: { executive_summary: 2, action_plan: 1 }, score: 20, grounding: {} } as AbReportSample)),
  ];
  const [r] = aggregateAb(samples, [{ section: "executive_summary", version: 2 }], { minN: 20, liftThreshold: 3 });
  assert.equal(r.candidate.n, 20);      // the 5 multi-candidate reports are NOT counted
  assert.equal(r.candidate.meanScore, 85);
  assert.equal(r.verdict, "promote");
});

test("aggregateAb: multiple candidate sections live at once → each arm fails safe to insufficient", () => {
  // Every bucketed report ran two candidates, so no report is a single-section
  // candidate for EITHER section → both arms empty → insufficient (not a wrong verdict).
  const samples: AbReportSample[] = [
    ...Array.from({ length: 30 }, () => ({ bucket: true, variants: { executive_summary: 2, action_plan: 1 }, score: 90, grounding: {} } as AbReportSample)),
    ...Array.from({ length: 30 }, () => ctrl(78)),
  ];
  const results = aggregateAb(samples, [
    { section: "executive_summary", version: 2 },
    { section: "action_plan", version: 1 },
  ], { minN: 20, liftThreshold: 3 });
  assert.equal(results[0].candidate.n, 0);
  assert.equal(results[0].verdict, "insufficient");
  assert.equal(results[1].candidate.n, 0);
  assert.equal(results[1].verdict, "insufficient");
});

test("aggregateAb: only the matching candidate VERSION counts as the candidate arm", () => {
  const samples = [
    ...Array.from({ length: 20 }, () => cand("executive_summary", 3, 85)), // version 3 running
    ...Array.from({ length: 20 }, () => ctrl(78)),
  ];
  // We're evaluating version 2 — none of the v3 reports count as its candidate arm.
  const [r] = aggregateAb(samples, [{ section: "executive_summary", version: 2 }], { minN: 20, liftThreshold: 3 });
  assert.equal(r.candidate.n, 0);
  assert.equal(r.verdict, "insufficient");
});

test("aggregateAb: unscored reports are excluded from the means but grounding still reads", () => {
  const samples: AbReportSample[] = [
    ...Array.from({ length: 20 }, () => cand("executive_summary", 2, 85, 0.9)),
    ...Array.from({ length: 19 }, () => ctrl(80, "executive_summary", 0.7)),
    { bucket: false, variants: {}, score: null, grounding: { executive_summary: 0.7 } }, // unscored control
  ];
  const [r] = aggregateAb(samples, [{ section: "executive_summary", version: 2 }], { minN: 20, liftThreshold: 3 });
  assert.equal(r.control.n, 19); // the null-score report is NOT counted in scored n
  assert.equal(r.verdict, "insufficient");
  assert.equal(r.groundingLift, 0.2); // 0.9 − 0.7
});

test("aggregateAb: empty candidates → empty result", () => {
  assert.deepEqual(aggregateAb([ctrl(80)], [], { minN: 20, liftThreshold: 3 }), []);
});
