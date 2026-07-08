import { test } from "node:test";
import assert from "node:assert/strict";
import { humanizeMetricLabel } from "./metricLabel.ts";

test("humanizeMetricLabel: de-hyphenates machine slugs", () => {
  assert.equal(humanizeMetricLabel("Recruitment-tech-SaaS-market-size-Australia"), "Recruitment tech SaaS market size Australia");
  assert.equal(humanizeMetricLabel("AI-recruitment-SaaS-CAGR-Australia"), "AI recruitment SaaS CAGR Australia");
  assert.equal(humanizeMetricLabel("ANZ-cloud-deployment-share"), "ANZ cloud deployment share");
});

test("humanizeMetricLabel: leaves human labels and their internal hyphens alone", () => {
  assert.equal(humanizeMetricLabel("Embedded finance market (Australia)"), "Embedded finance market (Australia)");
  assert.equal(humanizeMetricLabel("AI-enabled recruitment spend"), "AI-enabled recruitment spend"); // has a space → untouched
  assert.equal(humanizeMetricLabel("CAGR"), "CAGR");
  assert.equal(humanizeMetricLabel(""), "");
});
