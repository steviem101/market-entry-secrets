/**
 * Persona-aware target-region defaults for the report-creator (MES-227).
 *
 * With the `intake_prefill_v3` flag OFF, both journeys keep the historical
 * hardcoded ['Sydney/NSW'] suggestion. With it ON: the international journey
 * pre-fills ['National'] (which the events matcher treats as "no location
 * constraint" — see targetRegion.ts), and the startup journey ("Where you
 * operate") starts empty so founders state where they actually are.
 */

// Reuse the canonical persona union (type-only import — erased at runtime, so the
// node:test runner never resolves the aliased module graph). A future third
// persona then fails to type-check here instead of silently taking the else-branch.
import type { ReportPersona } from '../components/report-creator/intakeSchema.v2';

export type IntakePersona = ReportPersona;

export function defaultTargetRegions(persona: IntakePersona, nationalPrefill: boolean): string[] {
  if (!nationalPrefill) return ['Sydney/NSW'];
  return persona === 'international' ? ['National'] : [];
}

/** Is the current selection exactly the untouched persona default suggestion? */
export function isSuggestedRegionDefault(
  regions: string[] | undefined,
  persona: IntakePersona,
  nationalPrefill: boolean,
): boolean {
  const def = defaultTargetRegions(persona, nationalPrefill);
  const current = regions ?? [];
  return def.length > 0 && current.length === def.length && current.every((r, i) => r === def[i]);
}
