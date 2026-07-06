/**
 * Shared, config-driven directory filter bar (MES-93 audit standard pattern,
 * modelled on the Investors layout). Top-to-bottom:
 *
 *   1. Primary category/type TAB row (shadcn Tabs) — optional, with counts
 *   2. Control row: search → selects (location, sector, …) → optional sort
 *   3. Audience pills (PersonaFilter) — optional, only where data supports it
 *   4. Advanced panel (children) — collapsed behind a "Filters" toggle
 *   5. Meta row: always-visible "Showing X of Y {noun}" + clear-all
 *
 * The component is presentational: it renders the values a page holds (usually
 * via `useDirectoryFilters`) and calls back on change. It owns no filter state.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import { PersonaFilter, type PersonaFilterValue } from "@/components/PersonaFilter";
import type { FilterValues } from "@/lib/directoryFilters";

/** An option for a tab or select. `count` renders as a subtle suffix on tabs. */
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

/** A dropdown filter bound to one state key. */
export interface SelectFilterConfig {
  /** Filter state key this select drives (matches the page's FilterSpec key). */
  key: string;
  /** Label for the default "all" row, e.g. "All Locations". */
  allLabel: string;
  options: FilterOption[];
  /** Optional Tailwind width class; defaults to a sensible sm width. */
  widthClass?: string;
}

export interface DirectoryFilterBarProps {
  /** Current values + change handler, typically from useDirectoryFilters. */
  filters: FilterValues;
  onFilterChange: (key: string, value: string) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;

  /** Noun for the result line, e.g. "investors". */
  noun: string;
  shownCount: number;
  totalCount: number;

  /** Primary tab axis (e.g. investor type). Options should include the "all" row. */
  tabs?: { key: string; options: FilterOption[] };

  /** Free-text search. Its FilterSpec default should be "". */
  search?: { key: string; placeholder?: string; loading?: boolean };

  /** Dropdown filters rendered left-to-right in the control row. */
  selects?: SelectFilterConfig[];

  /** Optional sort dropdown (rendered after the selects). */
  sort?: { key: string; options: FilterOption[] };

  /** Audience pills (international entrant vs local startup). */
  audience?: { key: string };

  /** Directory-specific extras rendered in the collapsible advanced panel. */
  children?: React.ReactNode;
}

export const DirectoryFilterBar = ({
  filters,
  onFilterChange,
  onClearAll,
  hasActiveFilters,
  noun,
  shownCount,
  totalCount,
  tabs,
  search,
  selects = [],
  sort,
  audience,
  children,
}: DirectoryFilterBarProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <>
      <section className="bg-background border-b">
        <div className="container mx-auto px-4 py-6 space-y-4">
          {/* 1. Primary tab axis */}
          {tabs && tabs.options.length > 0 && (
            <Tabs
              value={filters[tabs.key]}
              onValueChange={(v) => onFilterChange(tabs.key, v)}
            >
              <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
                {tabs.options.map((opt) => (
                  <TabsTrigger key={opt.value} value={opt.value} className="text-sm">
                    {opt.label}
                    {opt.count !== undefined && (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        {opt.count}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          {/* 2. Control row */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:items-center">
            {search && (
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={search.placeholder ?? "Search..."}
                  className="pl-10"
                  value={filters[search.key] ?? ""}
                  onChange={(e) => onFilterChange(search.key, e.target.value)}
                />
                {search.loading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                  </div>
                )}
              </div>
            )}

            {selects.map((sel) => (
              <div key={sel.key} className={sel.widthClass ?? "w-full sm:w-44"}>
                <Select
                  value={filters[sel.key]}
                  onValueChange={(v) => onFilterChange(sel.key, v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={sel.allLabel} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{sel.allLabel}</SelectItem>
                    {sel.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            {sort && (
              <div className="w-full sm:w-44">
                <Select
                  value={filters[sort.key]}
                  onValueChange={(v) => onFilterChange(sort.key, v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    {sort.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {children && (
              <Button
                variant="outline"
                onClick={() => setShowAdvanced((s) => !s)}
                className="gap-2 w-full sm:w-auto"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            )}
          </div>

          {/* 3. Audience pills */}
          {audience && (
            <PersonaFilter
              value={filters[audience.key] as PersonaFilterValue}
              onChange={(v) => onFilterChange(audience.key, v)}
            />
          )}

          {/* 5. Meta row */}
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Showing {shownCount} of {totalCount} {noun}
            </p>
            {hasActiveFilters && (
              <button
                onClick={onClearAll}
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 4. Advanced panel */}
      {children && showAdvanced && (
        <section className="bg-muted/50 border-b">
          <div className="container mx-auto px-4 py-6">{children}</div>
        </section>
      )}
    </>
  );
};
