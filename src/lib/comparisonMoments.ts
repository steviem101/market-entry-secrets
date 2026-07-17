/**
 * Free-vs-paid comparison data for the report "comparison moments" (MES-188 T5b).
 *
 * Pure + deterministic: splits the report's sections into what a FREE report
 * includes vs what upgrading unlocks, straight from the tier config. Kept
 * config-driven (no hardcoded section list) so it stays in lockstep with the
 * server truth in report_templates / the get_tier_gated_report RPC — the same
 * source reportSectionConfig mirrors. Takes the config as parameters so the pure
 * core is unit-testable without importing the lucide-laden reportSectionConfig.
 */

export interface FreeSection {
  key: string;
  label: string;
}

export interface LockedSection {
  key: string;
  label: string;
  /** Minimum tier that unlocks it (e.g. 'growth', 'scale'). */
  tier: string;
  /** Display name for that tier (e.g. 'Growth', 'Scale'). */
  tierLabel: string;
}

export interface SectionSplit {
  free: FreeSection[];
  locked: LockedSection[];
}

/**
 * Split the ordered section list into free vs tier-gated, preserving order.
 * A section is FREE unless it has an entry in `tierRequirements`.
 */
export function splitSectionsByTier(
  order: readonly string[],
  tierRequirements: Record<string, string>,
  labels: Record<string, string>,
  tierLabels: Record<string, string>,
): SectionSplit {
  const free: FreeSection[] = [];
  const locked: LockedSection[] = [];
  for (const key of order) {
    const label = labels[key] ?? humanise(key);
    const tier = tierRequirements[key];
    if (tier) {
      locked.push({ key, label, tier, tierLabel: tierLabels[tier] ?? capitalise(tier) });
    } else {
      free.push({ key, label });
    }
  }
  return { free, locked };
}

/**
 * Group locked sections by the tier that unlocks them, in tier order, so the UI
 * can say "Growth unlocks …; Scale unlocks …". Empty groups are omitted.
 */
export function lockedByTier(
  locked: readonly LockedSection[],
  tierHierarchy: readonly string[],
): Array<{ tier: string; tierLabel: string; sections: LockedSection[] }> {
  const byTier = new Map<string, LockedSection[]>();
  for (const s of locked) {
    const arr = byTier.get(s.tier) ?? [];
    arr.push(s);
    byTier.set(s.tier, arr);
  }
  // Order groups by the tier hierarchy; unknown tiers fall to the end.
  const orderIndex = (t: string) => {
    const i = tierHierarchy.indexOf(t);
    return i === -1 ? tierHierarchy.length : i;
  };
  return [...byTier.entries()]
    .sort((a, b) => orderIndex(a[0]) - orderIndex(b[0]))
    .map(([tier, sections]) => ({ tier, tierLabel: sections[0].tierLabel, sections }));
}

function capitalise(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function humanise(key: string): string {
  return key.split('_').map(capitalise).join(' ');
}
