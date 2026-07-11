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
// A hyphen-joined run of 3+ Title-Case words ("Online-Recruitment-Services") is a
// machine-slug fragment even when embedded in an otherwise-human label — the
// whole-label check below only catches labels with NO spaces at all (Floats2
// review: "Online-Recruitment-Services market size" slipped through). Requiring
// 3+ segments that are ALL capitalised leaves legitimate hyphenation intact:
// "AI-enabled" (2 segments), "Trans-Tasman" (2 segments), "cost-per-hire" /
// "order-of-magnitude" (lowercase connectors).
const TITLE_SLUG_RE = /\b[A-Z][a-z0-9]*(?:-[A-Z][a-z0-9]*){2,}\b/g;

export function humanizeMetricLabel(label: string): string {
  const s = (label ?? "").replace(/\s+/g, " ").trim();
  if (!s) return s;
  // Whole label is a single hyphen slug ("ANZ-cloud-deployment-share") → split all.
  if (!s.includes(" ")) return s.includes("-") ? s.split("-").filter(Boolean).join(" ") : s;
  // Otherwise de-hyphenate only Title-Case slug fragments embedded in prose.
  return s.replace(TITLE_SLUG_RE, (m) => m.split("-").join(" "));
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
