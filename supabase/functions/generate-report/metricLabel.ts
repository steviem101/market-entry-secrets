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
