/**
 * Shared report_v2 formatting helpers. Kept dependency-light (no adapter or
 * component imports) so both the renderer and the adapter can use them.
 */

// MES is an ANZ market-entry product; report dates are meaningful in the
// customer's landing market, so we render the Australia/Sydney calendar day
// rather than the UTC day (a report generated before ~10am local otherwise
// shows yesterday's date). Formatters are constructed once at module load.
const LONG_DATE = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Australia/Sydney",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const SHORT_DATE = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Australia/Sydney",
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * Format an ISO date/timestamp for the report header/footer as an uppercased
 * "18 JULY 2026" (long) or "18 JUL 2026" (short). Invalid dates fall back to
 * the raw string uppercased rather than printing "Invalid Date".
 */
export function formatReportDate(iso: string, style: "long" | "short" = "long"): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return (iso ?? "").toUpperCase();
  return (style === "long" ? LONG_DATE : SHORT_DATE).format(parsed).toUpperCase();
}

/**
 * Platform-relative path guard. Contract URLs are ALWAYS site-relative paths
 * ("/investors/aura-ventures"); anything else — absolute URLs, protocol-
 * relative, or scheme-carrying (javascript:, https:) — is unsafe. Used by the
 * adapter to reject pipeline links AND by the renderer as defense in depth for
 * links embedded in LLM prose (which never pass through the adapter's mapping).
 */
export function isPlatformPath(url: unknown): url is string {
  return (
    typeof url === "string" &&
    url.startsWith("/") &&
    !url.startsWith("//") &&
    !/[\s:]/.test(url)
  );
}

/** Up-to-two-letter monogram initials for an entity name (people or company). */
export function entityInitials(name: string): string {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return initials || "·";
}
