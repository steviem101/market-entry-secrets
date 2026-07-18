/**
 * Pure logic for the homepage value-journey proof section (MES-162, flag
 * `hero_journey`). The lead-list panel must expose categories and counts only
 * (never real lead or user records), so this module reduces the live
 * lead_databases stats into a small, junk-guarded category summary.
 */
// Relative with extension (not "@/") — unit-tested with node --test, whose
// resolver needs explicit .ts extensions and doesn't understand the Vite alias.
import { isJunkValue } from './filterCuration.ts';

export interface LeadCategorySummary {
  label: string;
  count: number;
}

/**
 * Top lead-list categories from the `countsByType` map produced by
 * useLeadDatabaseStats. Sorted by count desc (label asc tie-break), junk
 * sentinels and non-positive counts dropped, capped at `max`.
 */
export function topLeadCategories(
  countsByType: Record<string, number> | undefined,
  max: number = 4,
): LeadCategorySummary[] {
  if (!countsByType) return [];
  return Object.entries(countsByType)
    .filter(([label, count]) => !isJunkValue(label) && Number.isFinite(count) && count > 0)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, max);
}

export type JourneyStepKey = 'report' | 'leads' | 'introductions';

export const JOURNEY_STEP_ORDER: JourneyStepKey[] = ['report', 'leads', 'introductions'];
