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
