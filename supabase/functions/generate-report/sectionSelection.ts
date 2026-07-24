/**
 * Honour explicit section selection (MES-234) — feature-flagged, default OFF.
 *
 * Reverses the D2 default ("keep all sections, emphasise picked") ONLY when the
 * HONOUR_SECTION_SELECTION env flag is on: sections the user explicitly DESELECTED on
 * the Review screen are dropped from the generation batch (cutting cost + clutter), so
 * they never reach report_json — every renderer then omits them exactly like an absent
 * section (the report already tolerates missing sections). Deliberately upsell-safe:
 *   • CORE sections (executive_summary, action_plan) are NEVER dropped.
 *   • GATED sections (any that require a tier above the base) are NEVER dropped — their
 *     tier-gated teaser + upgrade/regenerate render paths depend on the section being
 *     present, so no upsell surface is ever lost (PD-3). Only always-free, non-core
 *     sections are removable — which is exactly the set the Review control offers.
 *   • The tier-gating RPC (get_tier_gated_report) is untouched; this is an ADDITIONAL
 *     filter over always-free sections only.
 * Flag off / no deselection → byte-identical D2.
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
 * Should this section be DROPPED from generation because the user removed it? True only
 * for a section that is in the deselected set, non-core, AND not gated (a plain
 * always-free section). Core and gated sections are never dropped — no gated/upsell
 * surface is lost, and no empty-shell / regenerate-CTA render path can be triggered.
 *
 * `isGatedSection` = the section requires any tier above the base (its report_templates
 * visibility_tier is not the base "free" tier). Deliberately tier-INDEPENDENT: a
 * plain-free section is safe to drop for every viewer, a gated one for none.
 */
export function isSectionDeselected(
  sectionName: string,
  deselected: Set<string> | null,
  isGatedSection: boolean,
): boolean {
  if (!deselected) return false;                    // no active deselection → D2
  if (CORE_SECTIONS.has(sectionName)) return false; // core always generates
  if (isGatedSection) return false;                 // gated → keep (teaser/upgrade paths need it present)
  return deselected.has(sectionName);               // removed always-free section → drop
}
