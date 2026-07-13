/**
 * Filter option curation (MES-130).
 *
 * Pure, React-free helpers that turn a directory's raw filter values into a
 * short, popularity-ranked, bounded option list. Ranking/zero-hiding is the
 * product here; *display* concerns (cap, "search the tail") live in the
 * DirectoryFilterBar select. Unit-tested with `node --test`.
 *
 * The platform rules (docs/audits/mes-130-filter-option-curation-audit.md §4):
 *   - order by result count desc, then label A→Z as a stable tie-break
 *   - hide options below `minCount` (default 1 ⇒ zero-count hidden)
 *   - `pin` values are always kept and float to the front in the given order
 *   - null/empty values are never options (rows carrying them stay reachable
 *     via the "All" row)
 */
import type { FilterOption } from "@/components/common/DirectoryFilterBar";

/** A raw option with its result count, before curation. */
export interface CountedOption {
  value: string;
  label: string;
  count: number;
}

export interface CurateConfig {
  /** Options with count below this are dropped. Default 1 (hide zero-count). */
  minCount?: number;
  /** Values kept regardless of count, floated to the front in this order. */
  pin?: string[];
}

/**
 * Count how often each value appears. Accepts scalar values or the flattened
 * contents of array fields (pass `items.flatMap(i => i.tags ?? [])`). Null,
 * undefined and empty strings are ignored so they never become an option.
 */
export function countValues(values: (string | null | undefined)[]): CountedOption[] {
  const counts = new Map<string, number>();
  for (const v of values) {
    if (v == null || v === "") continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return [...counts.entries()].map(([value, count]) => ({ value, label: value, count }));
}

/**
 * Rank + filter a counted option list into the curated order the UI renders.
 * Returns a full `FilterOption[]` (popularity desc, stable label tie-break,
 * zero-count hidden, pinned values first). Capping to a visible top-N and the
 * "search the tail" affordance are the select's concern — this returns the
 * complete ranked list so nothing is lost.
 */
export function curateOptions(
  options: CountedOption[],
  config: CurateConfig = {},
): FilterOption[] {
  const minCount = config.minCount ?? 1;
  const pin = config.pin ?? [];

  const ranked = options
    .filter((o) => o.count >= minCount)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const pinned: CountedOption[] = [];
  const rest: CountedOption[] = [];
  for (const o of ranked) {
    if (pin.includes(o.value)) pinned.push(o);
    else rest.push(o);
  }
  pinned.sort((a, b) => pin.indexOf(a.value) - pin.indexOf(b.value));

  return [...pinned, ...rest].map((o) => ({ value: o.value, label: o.label, count: o.count }));
}

/**
 * Convenience: raw values → curated FilterOption[] in one step. `label`
 * defaults to the value; pass `labelFor` to map slugs to display names.
 */
export function curateValues(
  values: (string | null | undefined)[],
  config: CurateConfig & { labelFor?: (value: string) => string } = {},
): FilterOption[] {
  const counted = countValues(values);
  const withLabels = config.labelFor
    ? counted.map((o) => ({ ...o, label: config.labelFor!(o.value) }))
    : counted;
  return curateOptions(withLabels, config);
}
