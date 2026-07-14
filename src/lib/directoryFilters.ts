/**
 * Pure state/URL helpers for the shared directory filter system.
 *
 * These are deliberately React-free so they can be unit-tested with the
 * repo's `node --test` runner. The `useDirectoryFilters` hook wraps them with
 * react-router's `useSearchParams`; the `DirectoryFilterBar` component renders
 * the values they produce.
 *
 * Conventions (from the MES-93 filter audit):
 *   - one query param per dimension, snake/lowercase (search/type/location/…)
 *   - a per-dimension `default` sentinel (usually "all", or "" for search) that
 *     is OMITTED from the URL so clean links stay clean
 *   - `page` is handled separately and only serialised when > 1
 */

/** A dimension's URL param name and the value treated as "unset". */
export interface FilterFieldSpec {
  /** URL query param, e.g. "search", "type", "location". */
  param: string;
  /** Value treated as unset — omitted from the URL. Usually "all"; "" for search. */
  default: string;
  /**
   * Presentation-only dimension (sort order, grid/list view): still URL-synced,
   * but excluded from `hasActiveFilters` and NOT reset by `clearAll` — clearing
   * *filters* shouldn't change how the user chose to view or order results.
   */
  presentation?: boolean;
}

/** Maps a stable state key to its URL param + default sentinel. */
export type FilterSpec = Record<string, FilterFieldSpec>;

/** A flat map of state key → current string value. */
export type FilterValues = Record<string, string>;

/** The reset state: every dimension at its default sentinel. */
export function defaultFilters(spec: FilterSpec): FilterValues {
  const out: FilterValues = {};
  for (const key of Object.keys(spec)) out[key] = spec[key].default;
  return out;
}

/**
 * Parse a URLSearchParams into a complete filter-values object, falling back to
 * each dimension's default when the param is absent.
 */
export function parseFilters(spec: FilterSpec, params: URLSearchParams): FilterValues {
  const out: FilterValues = {};
  for (const key of Object.keys(spec)) {
    const { param, default: def } = spec[key];
    const raw = params.get(param);
    out[key] = raw === null || raw === "" ? def : raw;
  }
  return out;
}

/** Read `page` from a URLSearchParams, clamped to a minimum of 1. */
export function parsePage(params: URLSearchParams): number {
  const n = Number(params.get("page"));
  return Number.isFinite(n) && n > 1 ? Math.floor(n) : 1;
}

/**
 * Serialise filter values (+ page) to a URLSearchParams, omitting any dimension
 * left at its default and any page ≤ 1. Params are written in spec order for
 * stable, readable URLs.
 */
export function serialiseFilters(
  spec: FilterSpec,
  values: FilterValues,
  page = 1,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of Object.keys(spec)) {
    const { param, default: def } = spec[key];
    const value = values[key];
    if (value !== undefined && value !== def) params.set(param, value);
  }
  if (page > 1) params.set("page", String(Math.floor(page)));
  return params;
}

/** True when any non-presentation dimension differs from its default sentinel. */
export function hasActiveFilters(spec: FilterSpec, values: FilterValues): boolean {
  return Object.keys(spec).some(
    (key) => !spec[key].presentation && values[key] !== spec[key].default,
  );
}

/**
 * The "clear filters" state: reset every filter dimension to its default while
 * preserving presentation dimensions (sort/view) at their current value.
 */
export function clearedFilters(spec: FilterSpec, current: FilterValues): FilterValues {
  const out: FilterValues = {};
  for (const key of Object.keys(spec)) {
    out[key] = spec[key].presentation ? current[key] : spec[key].default;
  }
  return out;
}

/**
 * Per-dimension allow-lists (usually the curated option *values* a directory's
 * dropdown offers). An absent or empty list for a key means "not known yet"
 * (data still loading) — that dimension is left untouched.
 */
export type AllowedValues = Record<string, readonly string[]>;

/**
 * Coerce one value against an allow-list. Matching is case-insensitive and
 * returns the list's own casing, so the result is valid whether the page's
 * predicate compares case-sensitively or not. The dimension default and an
 * empty/absent list both pass through unchanged (so a valid deep link isn't
 * wiped during the data-load window); any other out-of-list value becomes `def`.
 */
export function coerceValue(
  value: string,
  allowed: readonly string[] | undefined,
  def: string,
): string {
  if (value === def || !allowed || allowed.length === 0) return value;
  const match = allowed.find((a) => a.toLowerCase() === value.toLowerCase());
  return match ?? def;
}

/**
 * Apply per-dimension allow-lists to a parsed filter set. Dimensions with no
 * allow-list are left as-is. Returns the SAME object reference when nothing
 * changed, so callers can rely on it for memo/effect stability.
 */
export function coerceFilters(
  spec: FilterSpec,
  values: FilterValues,
  allowed?: AllowedValues,
): FilterValues {
  if (!allowed) return values;
  let changed = false;
  const out: FilterValues = { ...values };
  for (const key of Object.keys(spec)) {
    const list = allowed[key];
    if (!list) continue;
    const coerced = coerceValue(values[key], list, spec[key].default);
    if (coerced !== values[key]) {
      out[key] = coerced;
      changed = true;
    }
  }
  return changed ? out : values;
}
