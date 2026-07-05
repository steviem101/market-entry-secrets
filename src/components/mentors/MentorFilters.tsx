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
  corridor: string;
  location: string;
  sort: string;
}

const DEFAULT_FILTERS: MentorFilterState = {
  search: "",
  persona: "all",
  category: "all",
  sector: "all",
  corridor: "all",
  location: "all",
  sort: "featured",
};

// Display labels for corridor origins. market_corridors entries are `${origin}-to-${destination}`.
const ORIGIN_LABELS: Record<string, string> = {
  uk: "🇬🇧 UK",
  ireland: "🇮🇪 Ireland",
  usa: "🇺🇸 USA",
  canada: "🇨🇦 Canada",
  france: "🇫🇷 France",
  germany: "🇩🇪 Germany",
  singapore: "🇸🇬 Singapore",
  hong_kong: "🇭🇰 Hong Kong",
  china: "🇨🇳 China",
  korea: "🇰🇷 Korea",
  south_africa: "🇿🇦 South Africa",
  other_asia: "🌏 Other Asia",
  other_eu: "🇪🇺 Other EU",
};

const prettify = (s: string) =>
  s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const originLabel = (o: string) => ORIGIN_LABELS[o] || prettify(o);

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
    search: searchParams.get("search") || searchParams.get("q") || "",
    persona: (searchParams.get("persona") as PersonaFilterValue) || "all",
    category: searchParams.get("category") || "all",
    sector: searchParams.get("sector") || "all",
    corridor: searchParams.get("corridor") || "all",
    location: searchParams.get("location") || "all",
    sort: searchParams.get("sort") || "featured",
  }), [searchParams]);

  const setFilters = useCallback((newFilters: MentorFilterState) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.persona !== "all") params.set("persona", newFilters.persona);
    if (newFilters.category !== "all") params.set("category", newFilters.category);
    if (newFilters.sector !== "all") params.set("sector", newFilters.sector);
    if (newFilters.corridor !== "all") params.set("corridor", newFilters.corridor);
    if (newFilters.location !== "all") params.set("location", newFilters.location);
    if (newFilters.sort !== "featured") params.set("sort", newFilters.sort);
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  return { filters, setFilters };
};

export const useFilteredMentors = (mentors: Mentor[], filters: MentorFilterState) => {
  return useMemo(() => {
    const result = mentors.filter((m) => {
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

      // Persona: a "both" mentor serves international entrants AND local startups,
      // so it must match either persona filter.
      if (filters.persona !== "all") {
        const fits = m.persona_fit || [];
        if (fits.length > 0) {
          const wanted =
            filters.persona === "international_entrant"
              ? ["international_entrant", "both"]
              : filters.persona === "local_startup"
              ? ["local_startup", "both"]
              : [filters.persona];
          if (!wanted.some((w) => fits.includes(w))) return false;
        }
      }

      if (filters.category !== "all") {
        if (m.category_slug !== filters.category) return false;
      }

      // Sector: match against sector_tags (the real backing column).
      if (filters.sector !== "all") {
        const tags = m.sector_tags || [];
        if (!tags.some((s) => s.toLowerCase() === filters.sector.toLowerCase())) return false;
      }

      // Corridor: "Experience entering from {origin}" — match any corridor with this origin.
      if (filters.corridor !== "all") {
        const corridors = m.market_corridors || [];
        if (!corridors.some((c) => c.startsWith(`${filters.corridor}-to-`))) return false;
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
  if (filters.corridor !== "all") count++;
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
    () => Array.from(new Set(mentors.flatMap((m) => m.sector_tags || []))).sort(),
    [mentors]
  );

  const allOrigins = useMemo(() => {
    const origins = new Set<string>();
    mentors.forEach((m) =>
      (m.market_corridors || []).forEach((c) => {
        const o = c.split("-to-")[0];
        if (o) origins.add(o);
      })
    );
    return Array.from(origins).sort();
  }, [mentors]);

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

            {/* Corridor — "Experience entering from" (reads market_corridors) */}
            {allOrigins.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-muted-foreground mr-1">
                  Experience entering from:
                </span>
                <Button
                  variant={filters.corridor === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => update("corridor", "all")}
                >
                  All origins
                </Button>
                {allOrigins.map((o) => (
                  <Button
                    key={o}
                    variant={filters.corridor === o ? "default" : "outline"}
                    size="sm"
                    onClick={() => update("corridor", o)}
                  >
                    {originLabel(o)}
                  </Button>
                ))}
              </div>
            )}

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
                    {prettify(s)}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
};
