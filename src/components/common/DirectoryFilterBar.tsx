/**
 * Shared, config-driven directory filter bar (MES-93 audit standard pattern,
 * modelled on the Investors layout). Top-to-bottom:
 *
 *   1. Primary category/type TAB row (shadcn Tabs) — optional, with counts
 *   2. Control row: search → selects (location, sector, …) → optional sort
 *   3. Advanced panel (children) — collapsed behind a "Filters" toggle
 *   4. Meta row: always-visible "Showing X of Y {noun}" + clear-all
 *
 * (The audience/persona pill row was removed in the 2026-07-14 consistency
 * sweep — the bar deliberately no longer supports one.)
 *
 * The component is presentational: it renders the values a page holds (usually
 * via `useDirectoryFilters`) and calls back on change. It owns no filter state.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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
  /**
   * Options to render. When they carry `count` (see `curateOptions`), a subtle
   * count suffix is shown and the list is expected to be popularity-ranked.
   */
  options: FilterOption[];
  /**
   * Render as a searchable combobox (MES-130). Use for curated long lists:
   * the top `cap` options show first and the whole ranked tail is one keystroke
   * away, so no value is unreachable. Plain `Select` otherwise.
   */
  searchable?: boolean;
  /** Searchable-only: how many ranked options to show before the user types. Default 10. */
  cap?: number;
  /** Optional Tailwind width class; defaults to a sensible sm width. */
  widthClass?: string;
}

/**
 * Searchable single-select combobox for curated option lists (MES-130).
 * Shows the top `cap` ranked options until the user searches, then filters the
 * full list — the popularity-ranked tail stays reachable without a giant menu.
 */
const SearchableFilterSelect = ({
  allLabel,
  options,
  value,
  onChange,
  cap = 10,
  widthClass,
}: {
  allLabel: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  cap?: number;
  widthClass?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, cap);
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, cap]);

  const selectedLabel =
    value && value !== "all" ? (options.find((o) => o.value === value)?.label ?? value) : allLabel;
  const hiddenBeforeSearch = !query.trim() && options.length > shown.length;

  return (
    <div className={widthClass ?? "w-full sm:w-44"}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            <span className={cn("truncate", value === "all" && "text-muted-foreground")}>
              {selectedLabel}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[260px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput placeholder={`Search ${allLabel.toLowerCase()}...`} value={query} onValueChange={setQuery} />
            <CommandEmpty>No matches.</CommandEmpty>
            <div className="max-h-[300px] overflow-y-auto">
              <CommandGroup>
                <CommandItem
                  value="__all__"
                  onSelect={() => {
                    onChange("all");
                    setQuery("");
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === "all" ? "opacity-100" : "opacity-0")} />
                  {allLabel}
                </CommandItem>
                {shown.map((opt, i) => (
                  <CommandItem
                    key={opt.value}
                    // cmdk lowercases/dedupes its `value`; case-duplicate option
                    // values (e.g. "Pre-seed"/"Pre-Seed") would collide and break
                    // keyboard selection. Index-qualify to keep each item distinct;
                    // selection still uses opt.value via the closure below.
                    value={`${i}:${opt.value}`}
                    onSelect={() => {
                      onChange(opt.value);
                      setQuery("");
                      setOpen(false);
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === opt.value ? "opacity-100" : "opacity-0")} />
                    <span className="flex-1 truncate">{opt.label}</span>
                    {opt.count !== undefined && (
                      <span className="ml-2 text-xs text-muted-foreground">{opt.count}</span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
              {hiddenBeforeSearch && (
                <p className="px-2 py-1.5 text-xs text-muted-foreground">
                  Showing top {shown.length} — type to search all {options.length}.
                </p>
              )}
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

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
  children,
}: DirectoryFilterBarProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Keep the page still when a filter changes. Radix tabs/selects move focus to
  // the clicked control and the browser scrolls it into view; swapping the card
  // list also reflows height and clamps scroll. Snapshot scroll at interaction
  // start (capture phase, before focus moves), then pin it back for a few frames
  // after the re-render. Owned here so every directory using the bar benefits.
  const restoreScrollY = useRef<number | null>(null);
  useEffect(() => {
    const snapshot = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest?.('[data-radix-popper-content-wrapper],[role="listbox"],[role="menu"],[role="dialog"]')) return;
      restoreScrollY.current = window.scrollY;
    };
    document.addEventListener("pointerdown", snapshot, true);
    document.addEventListener("keydown", snapshot, true);
    return () => {
      document.removeEventListener("pointerdown", snapshot, true);
      document.removeEventListener("keydown", snapshot, true);
    };
  }, []);
  const filterSignature = JSON.stringify(filters);
  const didMountRef = useRef(false);
  useLayoutEffect(() => {
    if (!didMountRef.current) { didMountRef.current = true; return; }
    const target = restoreScrollY.current;
    if (target == null) return;
    let frame = 0;
    let count = 0;
    const pin = () => {
      if (Math.abs(window.scrollY - target) > 1) window.scrollTo(0, target);
      if (count++ < 4) frame = requestAnimationFrame(pin);
    };
    pin();
    return () => cancelAnimationFrame(frame);
  }, [filterSignature]);

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

            {selects.map((sel) =>
              sel.searchable ? (
                <SearchableFilterSelect
                  key={sel.key}
                  allLabel={sel.allLabel}
                  options={sel.options}
                  value={filters[sel.key]}
                  onChange={(v) => onFilterChange(sel.key, v)}
                  cap={sel.cap}
                  widthClass={sel.widthClass}
                />
              ) : (
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
                          {opt.count !== undefined && (
                            <span className="ml-1.5 text-xs text-muted-foreground">{opt.count}</span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ),
            )}

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

          {/* 4. Meta row */}
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

      {/* 3. Advanced panel */}
      {children && showAdvanced && (
        <section className="bg-muted/50 border-b">
          <div className="container mx-auto px-4 py-6">{children}</div>
        </section>
      )}
    </>
  );
};
