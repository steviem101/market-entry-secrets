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
