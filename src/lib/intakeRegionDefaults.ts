/**
 * Persona-aware target-region defaults for the report-creator (MES-227).
 *
 * With the `intake_prefill_v3` flag OFF, both journeys keep the historical
 * hardcoded ['Sydney/NSW'] suggestion. With it ON: the international journey
 * pre-fills ['National'] (which the events matcher treats as "no location
 * constraint" — see targetRegion.ts), and the startup journey ("Where you
 * operate") starts empty so founders state where they actually are.
 */

export type IntakePersona = 'international' | 'startup';

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
