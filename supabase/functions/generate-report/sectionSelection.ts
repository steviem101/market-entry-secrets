/**
 * Honour explicit section selection (MES-234) — feature-flagged, default OFF.
 *
 * Reverses the D2 default ("keep all sections, emphasise picked") ONLY when the
 * HONOUR_SECTION_SELECTION env flag is on: sections the user explicitly DESELECTED on
 * the Review screen are skipped at generation (cutting cost + clutter) and omitted at
 * render. Deliberately upsell-safe:
 *   • CORE sections (executive_summary, action_plan) are NEVER skipped.
 *   • Sections ABOVE the viewer's tier (willBeVisible === false) are NEVER skipped —
 *     their tier-gated teaser must remain, so no upsell surface is ever lost (PD-3).
 *   • The tier-gating RPC (get_tier_gated_report) is untouched; this is an ADDITIONAL
 *     filter over accessible sections only.
 * The Review control only ever offers the accessible, non-core, non-gated sections for
 * removal, so the persisted set can only contain those — but the guards below enforce
 * safety independently of the UI. Flag off / no deselection → byte-identical D2.
 *
 * `raw_input.section_selection` stores the DESELECTED (removed) section keys — an
 * absent/empty list means "nothing removed" (D2).
 *
 * Pure module — NO Deno globals, NO I/O — importable by the edge function AND
 * unit-tested under Node.
 */

// Always generated regardless of selection — the report's spine.
export const CORE_SECTIONS = new Set(["executive_summary", "action_plan"]);

/**
 * Normalise raw_input.section_selection (the sections the user REMOVED) into a Set,
 * or null when selection is not active: flag off, not an array, or empty. Empty means
 * "nothing removed" → D2.
 */
export function parseDeselectedSections(enabled: boolean, raw: unknown): Set<string> | null {
  if (!enabled) return null;
  if (!Array.isArray(raw)) return null;
  const keys = raw.filter((s): s is string => typeof s === "string" && s.trim().length > 0);
  return keys.length > 0 ? new Set(keys) : null;
}

/**
 * Should this section be SKIPPED because the user removed it? True only for a section
 * that is in the deselected set, non-core, AND accessible to the viewer (willBeVisible).
 * Core and above-tier sections are never skipped — no gated/upsell surface is lost.
 */
export function isSectionDeselected(
  sectionName: string,
  deselected: Set<string> | null,
  willBeVisible: boolean,
): boolean {
  if (!deselected) return false;                    // no active deselection → D2
  if (CORE_SECTIONS.has(sectionName)) return false; // core always generates
  if (!willBeVisible) return false;                 // above the viewer's tier → keep the teaser
  return deselected.has(sectionName);               // explicitly removed accessible section → skip
}
