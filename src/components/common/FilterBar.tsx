import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { DebouncedSearchInput } from "./DebouncedSearchInput";

export interface FilterConfig {
  key: string;
  label: string;
  options: string[];
  defaultValue?: string;
  width?: string;
}

interface FilterBarProps {
  filters: FilterConfig[];
  searchPlaceholder?: string;
  searchLoading?: boolean;
  onFiltersChange?: (filters: Record<string, string>, search: string) => void;
  children?: React.ReactNode;
}

export const useURLFilters = (filterConfigs: FilterConfig[]) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const getFilterValue = useCallback(
    (key: string) => searchParams.get(key) || "all",
    [searchParams]
  );

  const getSearchValue = useCallback(
    () => searchParams.get("q") || "",
    [searchParams]
  );

  const setFilterValue = useCallback(
    (key: string, value: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value === "all" || value === "") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        return next;
      });
    },
    [setSearchParams]
  );

  const setSearchValue = useCallback(
    (value: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value === "") {
          next.delete("q");
        } else {
          next.set("q", value);
        }
        return next;
      });
    },
    [setSearchParams]
  );

  const clearAllFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const activeFilters = filterConfigs
    .filter((f) => {
      const val = searchParams.get(f.key);
      return val && val !== "all";
    })
    .map((f) => ({
      key: f.key,
      label: f.label,
      value: searchParams.get(f.key)!,
    }));

  const hasActiveFilters = activeFilters.length > 0 || !!searchParams.get("q");

  return {
    getFilterValue,
    getSearchValue,
    setFilterValue,
    setSearchValue,
    clearAllFilters,
    activeFilters,
    hasActiveFilters,
  };
};

export const FilterBar = ({
  filters,
  searchPlaceholder = "Search...",
  searchLoading = false,
  children,
}: FilterBarProps) => {
  const {
    getFilterValue,
    getSearchValue,
    setFilterValue,
    setSearchValue,
    clearAllFilters,
    activeFilters,
    hasActiveFilters,
  } = useURLFilters(filters);

  return (
    <section className="bg-background border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-4 items-center">
          <DebouncedSearchInput
            value={getSearchValue()}
            onChange={setSearchValue}
            placeholder={searchPlaceholder}
            isLoading={searchLoading}
          />

          {filters.map((filter) => (
            <div key={filter.key} className={filter.width || "w-40"}>
              <Select
                value={getFilterValue(filter.key)}
                onValueChange={(val) => setFilterValue(filter.key, val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {filter.label}s</SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {children}
        </div>

        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {activeFilters.map((filter) => (
              <Badge key={filter.key} variant="secondary" className="gap-1 pr-1">
                {filter.label}: {filter.value}
                <button
                  onClick={() => setFilterValue(filter.key, "all")}
                  className="ml-1 hover:text-destructive"
                  aria-label={`Remove ${filter.label} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <button
              onClick={clearAllFilters}
              className="text-sm text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
