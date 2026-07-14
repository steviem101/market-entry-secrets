/**
 * URL-synced filter state for directory pages, driven by a config-declared
 * `FilterSpec`. Generalises the older `useMentorFilters` so every directory
 * shares one behaviour: the URL is the single source of truth, defaults are
 * omitted from the URL, changing any filter resets the page to 1, and
 * `clearAll()` resets every dimension.
 *
 * Optionally coerces stale/case-variant URL values against per-dimension
 * allow-lists (the curated option values). Coercion is first-class here rather
 * than hand-rolled per page: the coerced value is what `filters`,
 * `hasActiveFilters`, `setFilter` and serialisation all see, so a stale
 * `?sector=bogus` shows every control at its default (no phantom "Clear all"),
 * and the URL is reconciled to drop the dead param instead of re-serialising it.
 *
 * IMPORTANT: pass a module-level constant `spec` (defined outside the
 * component), and a memoised `allowedValues` object, so the memoised callbacks
 * aren't defeated by fresh references each render.
 */
import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  type AllowedValues,
  type FilterSpec,
  type FilterValues,
  clearedFilters,
  coerceFilters,
  hasActiveFilters as computeHasActiveFilters,
  parseFilters,
  parsePage,
  serialiseFilters,
} from "@/lib/directoryFilters";

export interface UseDirectoryFiltersOptions {
  /**
   * Per-dimension valid values (usually `options.map(o => o.value)`). A URL
   * value outside a non-empty list is coerced to that dimension's default;
   * an absent/empty list leaves the dimension untouched (data still loading).
   * Memoise this so the hook's derivations stay stable.
   */
  allowedValues?: AllowedValues;
}

export interface UseDirectoryFiltersResult {
  filters: FilterValues;
  page: number;
  /** Set one dimension; resets page to 1. */
  setFilter: (key: string, value: string) => void;
  /** Set several dimensions atomically (one URL write); resets page to 1. */
  setFilters: (partial: FilterValues) => void;
  /** Change page without touching filters. */
  setPage: (page: number) => void;
  /** Reset every dimension to its default and page to 1. */
  clearAll: () => void;
  hasActiveFilters: boolean;
}

export function useDirectoryFilters(
  spec: FilterSpec,
  options: UseDirectoryFiltersOptions = {},
): UseDirectoryFiltersResult {
  const { allowedValues } = options;
  const [searchParams, setSearchParams] = useSearchParams();

  const rawFilters = useMemo(() => parseFilters(spec, searchParams), [spec, searchParams]);
  // Coerced view: what every consumer (bar, predicate, active-filter check) sees.
  const filters = useMemo(
    () => coerceFilters(spec, rawFilters, allowedValues),
    [spec, rawFilters, allowedValues],
  );
  const page = useMemo(() => parsePage(searchParams), [searchParams]);

  const commit = useCallback(
    (next: FilterValues, nextPage: number) => {
      setSearchParams(serialiseFilters(spec, next, nextPage), { replace: true });
    },
    [spec, setSearchParams],
  );

  // Reconcile the URL when coercion changed a value, so a dead ?param= doesn't
  // linger (or re-serialise on the next edit). Comparing canonicalised raw vs
  // coerced serialisations is loop-safe: after the write the URL re-parses to
  // the coerced values, so raw === coerced and no further write fires.
  useEffect(() => {
    if (!allowedValues) return;
    const canonicalRaw = serialiseFilters(spec, rawFilters, page).toString();
    const canonicalCoerced = serialiseFilters(spec, filters, page).toString();
    if (canonicalRaw !== canonicalCoerced) {
      setSearchParams(serialiseFilters(spec, filters, page), { replace: true });
    }
  }, [allowedValues, spec, rawFilters, filters, page, setSearchParams]);

  const setFilter = useCallback(
    (key: string, value: string) => {
      commit({ ...filters, [key]: value }, 1);
    },
    [filters, commit],
  );

  const setFilters = useCallback(
    (partial: FilterValues) => {
      commit({ ...filters, ...partial }, 1);
    },
    [filters, commit],
  );

  const setPage = useCallback(
    (nextPage: number) => {
      commit(filters, nextPage);
    },
    [filters, commit],
  );

  const clearAll = useCallback(() => {
    commit(clearedFilters(spec, filters), 1);
  }, [spec, filters, commit]);

  const hasActiveFilters = useMemo(
    () => computeHasActiveFilters(spec, filters),
    [spec, filters],
  );

  return { filters, page, setFilter, setFilters, setPage, clearAll, hasActiveFilters };
}
