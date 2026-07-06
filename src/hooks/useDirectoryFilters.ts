/**
 * URL-synced filter state for directory pages, driven by a config-declared
 * `FilterSpec`. Generalises the older `useMentorFilters` so every directory
 * shares one behaviour: the URL is the single source of truth, defaults are
 * omitted from the URL, changing any filter resets the page to 1, and
 * `clearAll()` resets every dimension.
 *
 * IMPORTANT: pass a module-level constant `spec` (defined outside the
 * component). A fresh object each render would defeat the memoised callbacks.
 */
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  type FilterSpec,
  type FilterValues,
  defaultFilters,
  hasActiveFilters as computeHasActiveFilters,
  parseFilters,
  parsePage,
  serialiseFilters,
} from "@/lib/directoryFilters";

export interface UseDirectoryFiltersResult {
  filters: FilterValues;
  page: number;
  /** Set one dimension; resets page to 1. */
  setFilter: (key: string, value: string) => void;
  /** Change page without touching filters. */
  setPage: (page: number) => void;
  /** Reset every dimension to its default and page to 1. */
  clearAll: () => void;
  hasActiveFilters: boolean;
}

export function useDirectoryFilters(spec: FilterSpec): UseDirectoryFiltersResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => parseFilters(spec, searchParams), [spec, searchParams]);
  const page = useMemo(() => parsePage(searchParams), [searchParams]);

  const commit = useCallback(
    (next: FilterValues, nextPage: number) => {
      setSearchParams(serialiseFilters(spec, next, nextPage), { replace: true });
    },
    [spec, setSearchParams],
  );

  const setFilter = useCallback(
    (key: string, value: string) => {
      commit({ ...filters, [key]: value }, 1);
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
    commit(defaultFilters(spec), 1);
  }, [spec, commit]);

  const hasActiveFilters = useMemo(
    () => computeHasActiveFilters(spec, filters),
    [spec, filters],
  );

  return { filters, page, setFilter, setPage, clearAll, hasActiveFilters };
}
