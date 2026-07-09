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

import { isEstimatedMetric } from "./metricLabel.ts";

test("isEstimatedMetric: flags model-derived estimates", () => {
  assert.equal(isEstimatedMetric("~AUD 80–120M", "2024 estimated spend derived from staffing-industry size"), true);
  assert.equal(isEstimatedMetric("US$4–6B", "Reasoned estimate of Sydney/NSW share, assuming ~35–50%"), true);
  assert.equal(isEstimatedMetric("Top-3 theme", "(qualitative) defining themes"), true);
  assert.equal(isEstimatedMetric("proxy share", "Sydney-fintech B2B proxy"), true);
});

test("isEstimatedMetric: does NOT flag cited/forecast figures", () => {
  assert.equal(isEstimatedMetric("US$42.9B", "Global market size in 2024 [4]"), false);
  assert.equal(isEstimatedMetric("13.4%", "projected 2024-2029 CAGR [3]"), false); // "projected" is a sourced forecast, not an estimate
  assert.equal(isEstimatedMetric("71.20%", "ANZ cloud deployment share [3]"), false);
  assert.equal(isEstimatedMetric("", ""), false);
});
