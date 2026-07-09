/**
 * Humanise a key-metric label. Pure + unit-tested.
 *
 * The landscape extraction keeps Perplexity's machine-slug labels verbatim, so
 * the Key Metrics cards render "Recruitment-tech-SaaS-market-size-Australia"
 * (Floats feedback). When a label is a hyphen-joined slug with no spaces, turn
 * the joining hyphens into spaces; labels that already read as prose (contain a
 * space) are left untouched, and genuine hyphenation inside a spaced label
 * ("AI-enabled recruitment") is preserved.
 */
export function humanizeMetricLabel(label: string): string {
  const s = (label ?? "").replace(/\s+/g, " ").trim();
  if (!s || s.includes(" ")) return s; // already human-readable (has spaces)
  if (!s.includes("-")) return s; // single token, nothing to split
  return s.split("-").filter(Boolean).join(" ");
}

// Language that marks a metric as MODEL-DERIVED rather than a cited figure.
// Deliberately excludes "projected"/"forecast" — those describe legitimate
// sourced forecasts, not model estimates. A leading "~" on the value is also an
// estimate tell.
const ESTIMATE_RE =
  /\b(estimate[ds]?|estimation|estimated|reasoned|proxy|derived|assum(?:e|ed|ing|ption)|indicative|approximate(?:ly)?|order[- ]of[- ]magnitude|ballpark|qualitative)\b/i;

/**
 * True when a key metric is a model-derived estimate rather than a cited figure
 * (Floats feedback: the metrics panel showed "Reasoned estimate", "proxy share",
 * "~AUD 80–120M (derived from …)", "(qualitative)" with the same authority + [N]
 * citations as sourced numbers). The report surfaces this via an "Est." marker so
 * readers don't mistake a derivation for hard data. Reads the value + context.
 */
export function isEstimatedMetric(value: string, context: string): boolean {
  if ((value ?? "").trim().startsWith("~")) return true;
  return ESTIMATE_RE.test(`${value ?? ""} ${context ?? ""}`);
}
