/**
 * Bridges the homepage intent hero (MES-158) to the v2 report creator.
 *
 * The hero classifies a visitor's free-text ask into a `HeroIntent`
 * (intentClassifier.ts), then this module persists a partial v2 intake draft
 * plus a per-tab "origin" marker and navigates the visitor into
 * /report-creator. The report creator's existing mount draft-restore picks the
 * draft up and lands the user on the company step with their goals + focus
 * pre-selected — nothing is auto-generated, so the wizard remains the explicit
 * confirmation surface (§ ticket "avoid pretending exact matches").
 *
 * Split from the component so the draft-shaping is pure + unit-testable.
 */
import type { IntakeFormDataV2, ReportPersona } from '@/components/report-creator/intakeSchema.v2';
// Relative (not `@/`) so the `node --test` runner — which doesn't resolve the
// `@/` alias for runtime value imports — can load this module's pure core.
import type { HeroIntent } from './intentClassifier.ts';
import { toReportFocus } from './intentClassifier.ts';

// Kept in lockstep with useReportGenerationV2's LOCALSTORAGE_KEY_V2 — the report
// creator reads its draft from this exact key on mount.
const V2_DRAFT_KEY = 'mes_intake_form_draft_v2';

// Per-tab origin marker. Signals the report creator to show the "based on what
// you told us" confirm banner and lets generation attribute a completed report
// back to the hero intent. sessionStorage (not local) — this is funnel state
// for the current visit, not a durable draft.
export const HERO_INTENT_MARKER_KEY = 'mes_hero_intent';

export interface HeroIntentMarker {
  rawIntent: string;
}

/**
 * Shape the partial v2 draft to persist from a classified intent. Pure.
 * Always carries the raw phrase through as `report_focus`; only sets
 * `goal_ids` when the classifier matched something (empty → let the report
 * creator fall back to the persona's default goals).
 */
export function buildPrefillDraft(intent: HeroIntent): Partial<IntakeFormDataV2> {
  const draft: Partial<IntakeFormDataV2> = {
    persona: intent.persona,
    report_focus: toReportFocus(intent.rawIntent),
  };
  if (intent.goalIds.length > 0) {
    draft.goal_ids = [...intent.goalIds];
  }
  return draft;
}

/**
 * Merge a prefill patch over an existing draft. Pure + unit-testable.
 *
 * A new low-confidence intent sets `persona` but NOT `goal_ids` (buildPrefillDraft
 * only sets goals on a match). A naive `{...existing, ...patch}` would then keep
 * the PREVIOUS persona's goal_ids under the new persona — a self-inconsistent
 * draft whose selected goals aren't valid for the persona's grid. So: when the
 * patch changes persona without supplying its own goal_ids, drop the stale ones
 * and let the report creator fall back to the new persona's defaults.
 */
export function mergeIntentDraft(
  existing: Partial<IntakeFormDataV2>,
  patch: Partial<IntakeFormDataV2>,
): Partial<IntakeFormDataV2> {
  const merged: Partial<IntakeFormDataV2> = { ...existing, ...patch };
  if (patch.goal_ids === undefined && existing.persona && existing.persona !== patch.persona) {
    delete merged.goal_ids;
  }
  return merged;
}

/**
 * Persist the prefill draft (merged over any existing draft so a returning
 * visitor's in-progress answers aren't clobbered) + the origin marker.
 * No-op if storage is unavailable. Safe to call in a browser event handler.
 */
export function writeIntentPrefill(intent: HeroIntent): void {
  if (typeof window === 'undefined') return;
  const patch = buildPrefillDraft(intent);
  try {
    let existing: Partial<IntakeFormDataV2> = {};
    try {
      const raw = localStorage.getItem(V2_DRAFT_KEY);
      if (raw) existing = JSON.parse(raw) as Partial<IntakeFormDataV2>;
    } catch { /* corrupt draft — start fresh from the patch */ }
    localStorage.setItem(V2_DRAFT_KEY, JSON.stringify(mergeIntentDraft(existing, patch)));
  } catch { /* ignore */ }
  try {
    const marker: HeroIntentMarker = { rawIntent: intent.rawIntent };
    sessionStorage.setItem(HERO_INTENT_MARKER_KEY, JSON.stringify(marker));
  } catch { /* ignore */ }
}

/** Read the origin marker (or null). Does not clear it. */
export function readHeroIntentMarker(): HeroIntentMarker | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(HERO_INTENT_MARKER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as HeroIntentMarker;
    return typeof parsed?.rawIntent === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

/** Clear the origin marker (after generation completes, or on dismiss). */
export function clearHeroIntentMarker(): void {
  if (typeof window === 'undefined') return;
  try { sessionStorage.removeItem(HERO_INTENT_MARKER_KEY); } catch { /* ignore */ }
}

// Re-export the report persona type for consumers that only import this module.
export type { ReportPersona };
