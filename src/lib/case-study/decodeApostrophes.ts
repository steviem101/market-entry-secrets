/**
 * Render-time fallback for the doubled-apostrophe encoding bug found in Go1
 * case study bodies during the Phase 1 audit.
 *
 * Migration 20260504120200_fix_go1_apostrophe_encoding.sql is the primary fix.
 * This utility is defence-in-depth: if a future ingest path regresses the bug,
 * rendering still looks right.
 *
 * @deprecated Tech debt — remove once we're confident no ingest path regresses.
 */
export function decodeApostrophes(html: string): string {
  if (!html) return html;
  return html.replace(/''/g, "'");
}
