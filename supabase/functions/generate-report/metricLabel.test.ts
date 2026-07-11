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
  assert.equal(humanizeMetricLabel("AI-enabled recruitment spend"), "AI-enabled recruitment spend"); // 2-segment, lowercase 2nd → untouched
  assert.equal(humanizeMetricLabel("Trans-Tasman expansion cost"), "Trans-Tasman expansion cost"); // 2-segment → untouched
  assert.equal(humanizeMetricLabel("Average cost-per-hire (Australia)"), "Average cost-per-hire (Australia)"); // lowercase connectors → untouched
  assert.equal(humanizeMetricLabel("CAGR"), "CAGR");
  assert.equal(humanizeMetricLabel(""), "");
});

test("humanizeMetricLabel: de-hyphenates a Title-Case slug fragment embedded in a spaced label (Floats2)", () => {
  assert.equal(humanizeMetricLabel("Online-Recruitment-Services market size (Australia)"), "Online Recruitment Services market size (Australia)");
  assert.equal(humanizeMetricLabel("Implied Online-Recruitment-Services market size (VIC)"), "Implied Online Recruitment Services market size (VIC)");
  // only the slug fragment is touched; the rest of the label is preserved verbatim
  assert.equal(humanizeMetricLabel("Number of Active-Tech-Firms in 2026"), "Number of Active Tech Firms in 2026");
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
