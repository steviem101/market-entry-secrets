import { useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import { PersonaFilter, type PersonaFilterValue } from "@/components/PersonaFilter";
import type { Mentor, MentorCategory } from "@/hooks/useMentors";

export interface MentorFilterState {
  search: string;
  persona: PersonaFilterValue;
  category: string;
  sector: string;
  market: string;
  availability: string;
  engagement: string;
  location: string;
  sort: string;
}

const DEFAULT_FILTERS: MentorFilterState = {
  search: "",
  persona: "all",
  category: "all",
  sector: "all",
  market: "all",
  availability: "all",
  engagement: "all",
  location: "all",
  sort: "featured",
};

interface MentorFiltersProps {
  filters: MentorFilterState;
  onFiltersChange: (filters: MentorFilterState) => void;
  mentors: Mentor[];
  categories: MentorCategory[];
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
}

export const useMentorFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: MentorFilterState = useMemo(() => ({
    search: searchParams.get("q") || "",
    persona: (searchParams.get("persona") as PersonaFilterValue) || "all",
    category: searchParams.get("category") || "all",
    sector: searchParams.get("sector") || "all",
    market: searchParams.get("market") || "all",
    availability: searchParams.get("availability") || "all",
    engagement: searchParams.get("engagement") || "all",
    location: searchParams.get("location") || "all",
    sort: searchParams.get("sort") || "featured",
  }), [searchParams]);

  const setFilters = useCallback((newFilters: MentorFilterState) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set("q", newFilters.search);
    if (newFilters.persona !== "all") params.set("persona", newFilters.persona);
    if (newFilters.category !== "all") params.set("category", newFilters.category);
    if (newFilters.sector !== "all") params.set("sector", newFilters.sector);
    if (newFilters.market !== "all") params.set("market", newFilters.market);
    if (newFilters.availability !== "all") params.set("availability", newFilters.availability);
    if (newFilters.engagement !== "all") params.set("engagement", newFilters.engagement);
    if (newFilters.location !== "all") params.set("location", newFilters.location);
    if (newFilters.sort !== "featured") params.set("sort", newFilters.sort);
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  return { filters, setFilters };
};

export const useFilteredMentors = (mentors: Mentor[], filters: MentorFilterState) => {
  return useMemo(() => {
    let result = mentors.filter((m) => {
      const searchLower = filters.search.toLowerCase();
      if (searchLower) {
        const matchesSearch =
          m.name.toLowerCase().includes(searchLower) ||
          m.title.toLowerCase().includes(searchLower) ||
          m.description.toLowerCase().includes(searchLower) ||
          (m.tagline || "").toLowerCase().includes(searchLower) ||
          m.location.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.persona !== "all") {
        const fits = m.persona_fit || [];
        if (fits.length > 0 && !fits.includes(filters.persona)) return false;
      }

      if (filters.category !== "all") {
        if (m.category_slug !== filters.category) return false;
      }

      if (filters.sector !== "all") {
        const sectors = m.sectors || [];
        if (!sectors.some((s) => s.toLowerCase() === filters.sector.toLowerCase())) return false;
      }

      if (filters.market !== "all") {
        const markets = m.markets_served || [];
        if (!markets.includes(filters.market)) return false;
      }

      if (filters.availability === "available") {
        if (m.availability !== "available") return false;
      }

      if (filters.engagement !== "all") {
        const models = m.engagement_model || [];
        if (!models.includes(filters.engagement)) return false;
      }

      if (filters.location !== "all") {
        if (m.location !== filters.location && m.location_city !== filters.location) return false;
      }

      return true;
    });

    // Sort
    switch (filters.sort) {
      case "featured":
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
      case "views":
        result.sort((a, b) => b.view_count - a.view_count);
        break;
      case "experience":
        result.sort((a, b) => (b.years_experience || 0) - (a.years_experience || 0));
        break;
      case "az":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [mentors, filters]);
};

export const getActiveFilterCount = (filters: MentorFilterState): number => {
  let count = 0;
  if (filters.search) count++;
  if (filters.persona !== "all") count++;
  if (filters.category !== "all") count++;
  if (filters.sector !== "all") count++;
  if (filters.market !== "all") count++;
  if (filters.availability !== "all") count++;
  if (filters.engagement !== "all") count++;
  if (filters.location !== "all") count++;
  return count;
};

export const MentorFilters = ({
  filters,
  onFiltersChange,
  mentors,
  categories,
  showAdvanced,
  onToggleAdvanced,
}: MentorFiltersProps) => {
  const update = (key: keyof MentorFilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const allLocations = useMemo(
    () => Array.from(new Set(mentors.map((m) => m.location))).sort(),
    [mentors]
  );

  const allSectors = useMemo(
    () =>
      Array.from(new Set(mentors.flatMap((m) => m.sectors || []))).sort(),
    [mentors]
  );

  const activeCount = getActiveFilterCount(filters);

  return (
    <>
      {/* Main Filter Bar */}
      <section className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search mentors, specialties, or locations..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => update("search", e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="w-48">
              <Select value={filters.category} onValueChange={(v) => update("category", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="w-40">
              <Select value={filters.location} onValueChange={(v) => update("location", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {allLocations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="w-40">
              <Select value={filters.sort} onValueChange={(v) => update("sort", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured first</SelectItem>
                  <SelectItem value="views">Most viewed</SelectItem>
                  <SelectItem value="experience">Most experienced</SelectItem>
                  <SelectItem value="az">A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced toggle */}
            <Button variant="outline" onClick={onToggleAdvanced} className="gap-2 relative">
              <Filter className="w-4 h-4" />
              Filters
              {activeCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Clear all */}
          {activeCount > 0 && (
            <div className="mt-3">
              <button
                onClick={() => onFiltersChange({ ...DEFAULT_FILTERS })}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Advanced filters panel */}
      {showAdvanced && (
        <section className="bg-muted/50 border-b">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Persona */}
            <PersonaFilter
              value={filters.persona}
              onChange={(v) => update("persona", v)}
            />

            {/* Market pills */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-muted-foreground mr-1">Market:</span>
              {["all", "australia", "new_zealand", "global"].map((m) => (
                <Button
                  key={m}
                  variant={filters.market === m ? "default" : "outline"}
                  size="sm"
                  onClick={() => update("market", m)}
                >
                  {m === "all"
                    ? "All Markets"
                    : m === "australia"
                    ? "🇦🇺 Australia"
                    : m === "new_zealand"
                    ? "🇳🇿 New Zealand"
                    : "🌏 Global"}
                </Button>
              ))}
            </div>

            {/* Sector pills */}
            {allSectors.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-muted-foreground mr-1">Sector:</span>
                <Button
                  variant={filters.sector === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => update("sector", "all")}
                >
                  All Sectors
                </Button>
                {allSectors.map((s) => (
                  <Button
                    key={s}
                    variant={filters.sector === s ? "default" : "outline"}
                    size="sm"
                    onClick={() => update("sector", s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            )}

            {/* Availability + Engagement */}
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-muted-foreground mr-1">Availability:</span>
                <Button
                  variant={filters.availability === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => update("availability", "all")}
                >
                  Any
                </Button>
                <Button
                  variant={filters.availability === "available" ? "default" : "outline"}
                  size="sm"
                  onClick={() => update("availability", "available")}
                >
                  Available now
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-muted-foreground mr-1">Engagement:</span>
                {["all", "paid", "pro_bono", "government_funded"].map((e) => (
                  <Button
                    key={e}
                    variant={filters.engagement === e ? "default" : "outline"}
                    size="sm"
                    onClick={() => update("engagement", e)}
                  >
                    {e === "all"
                      ? "All"
                      : e.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};
