import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, BookOpen, LayoutGrid, LayoutList, ArrowRight, Calendar, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ListingPageGate } from "@/components/ListingPageGate";
import { UsageBanner } from "@/components/UsageBanner";
import { ListPagination } from "@/components/common/ListPagination";
import { SubmissionButton } from "@/components/directory-submissions/SubmissionButton";
import { DirectoryFilterBar, type FilterOption, type SelectFilterConfig } from "@/components/common/DirectoryFilterBar";
import { useCaseStudies } from "@/hooks/useCaseStudies";
import { useDirectoryFilters } from "@/hooks/useDirectoryFilters";
import type { FilterSpec } from "@/lib/directoryFilters";
import { filterAndSortCaseStudies, parseMoneyToNumber, REVENUE_RANGES, COST_RANGES } from "@/lib/caseStudyFilters";
import { getCountryFlag } from "@/lib/countryFlags";
import { curateValues } from "@/lib/filterCuration";
import { SEOHead } from "@/components/common/SEOHead";
import { Skeleton } from "@/components/ui/skeleton";
import { getLogoUrl } from "@/lib/logoUtils";

const PAGE_SIZE = 12;

// Filter values are raw slugs; the "all" sentinel is never written to the URL, so
// old bookmarks carrying real values (e.g. ?outcome=successful&revenue=10k-50k)
// still parse and filter correctly. Sort + view are presentation-only.
const CASE_STUDY_FILTER_SPEC: FilterSpec = {
  search: { param: "search", default: "" },
  outcome: { param: "outcome", default: "all" },
  industry: { param: "industry", default: "all" },
  country: { param: "country", default: "all" },
  revenue: { param: "revenue", default: "all" },
  costs: { param: "costs", default: "all" },
  sort: { param: "sort", default: "recent", presentation: true },
  view: { param: "view", default: "grid", presentation: true },
};

const SORT_OPTIONS: FilterOption[] = [
  { value: "recent", label: "Most Recent" },
  { value: "views", label: "Most Viewed" },
  { value: "alphabetical", label: "Alphabetical" },
];

const CardSkeleton = ({ isGrid }: { isGrid: boolean }) => (
  <div className={`rounded-lg border bg-card ${isGrid ? 'p-5' : 'p-5 flex gap-5'}`}>
    {isGrid ? (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="flex justify-between pt-2 border-t">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    ) : (
      <>
        <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <div className="flex gap-4 pt-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </>
    )}
  </div>
);

const CaseStudies = () => {
  const { data: caseStudies = [], isLoading, error } = useCaseStudies();
  const { filters, page, setFilter, setPage, clearAll, hasActiveFilters } =
    useDirectoryFilters(CASE_STUDY_FILTER_SPEC);

  const viewMode = filters.view === "list" ? "list" : "grid";

  // MES-130: popularity-ranked, zero-hidden filter options; the long industry
  // tail is searchable. Values stay the raw industry/country (predicate unchanged).
  const industryOptions = useMemo(
    () => curateValues(caseStudies.map(cs => cs.content_company_profiles?.[0]?.industry)),
    [caseStudies]
  );
  const countryOptions = useMemo(
    () => curateValues(
      caseStudies.map(cs => cs.content_company_profiles?.[0]?.origin_country),
      { labelFor: (c) => `${getCountryFlag(c)} ${c}` },
    ),
    [caseStudies]
  );

  const hasRevenueData = useMemo(() =>
    caseStudies.some(cs => parseMoneyToNumber(cs.content_company_profiles?.[0]?.monthly_revenue) > 0),
    [caseStudies]
  );

  const hasCostsData = useMemo(() =>
    caseStudies.some(cs => parseMoneyToNumber(cs.content_company_profiles?.[0]?.startup_costs) > 0),
    [caseStudies]
  );

  const filteredCaseStudies = useMemo(
    () => filterAndSortCaseStudies(caseStudies, filters),
    [caseStudies, filters]
  );

  const totalPages = Math.ceil(filteredCaseStudies.length / PAGE_SIZE);
  const paginatedCaseStudies = filteredCaseStudies.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Stats + tab counts.
  const successCount = useMemo(() =>
    caseStudies.filter(cs => cs.content_company_profiles?.[0]?.outcome === 'successful').length,
    [caseStudies]
  );
  const failureCount = useMemo(() =>
    caseStudies.filter(cs => cs.content_company_profiles?.[0]?.outcome === 'unsuccessful').length,
    [caseStudies]
  );

  // MES-130: hide zero-count outcome tabs (e.g. "Failure Stories" when no row
  // carries an 'unsuccessful' outcome) so the row never shows a dead tab.
  const outcomeTabs: FilterOption[] = [
    { value: "all", label: "All", count: caseStudies.length },
    { value: "successful", label: "Success Stories", count: successCount },
    { value: "unsuccessful", label: "Failure Stories", count: failureCount },
  ].filter((t) => t.value === "all" || (t.count ?? 0) > 0);

  const selects: SelectFilterConfig[] = [];
  if (industryOptions.length > 0) {
    selects.push({ key: "industry", allLabel: "Any Industry", options: industryOptions, searchable: true });
  }
  if (countryOptions.length > 0) {
    selects.push({ key: "country", allLabel: "Any Country", options: countryOptions, searchable: true });
  }

  const advancedPanel = (hasRevenueData || hasCostsData) ? (
    <div className="flex flex-col sm:flex-row gap-4">
      {hasRevenueData && (
        <div className="w-full sm:w-56">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wide">Monthly Revenue</label>
          <Select value={filters.revenue} onValueChange={(v) => setFilter("revenue", v)}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Any Amount" /></SelectTrigger>
            <SelectContent>
              {REVENUE_RANGES.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {hasCostsData && (
        <div className="w-full sm:w-56">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wide">Entry Costs</label>
          <Select value={filters.costs} onValueChange={(v) => setFilter("costs", v)}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Any Amount" /></SelectTrigger>
            <SelectContent>
              {COST_RANGES.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  ) : undefined;

  if (isLoading) {
    return (
      <>
        <section className="bg-gradient-to-br from-sky-50 via-blue-50/50 to-indigo-50/30 py-16 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <Skeleton className="h-12 w-12 rounded-full mx-auto mb-6" />
            <Skeleton className="h-12 w-full max-w-sm mx-auto mb-4" />
            <Skeleton className="h-6 w-full max-w-md mx-auto mb-8" />
            <div className="flex justify-center gap-6">
              <Skeleton className="h-20 w-32 rounded-lg" />
              <Skeleton className="h-20 w-32 rounded-lg" />
              <Skeleton className="h-20 w-32 rounded-lg" />
            </div>
          </div>
        </section>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} isGrid={true} />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Error Loading Case Studies</h2>
          <p className="text-muted-foreground mb-6">{error.message || 'Failed to load case studies'}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  const renderCard = (cs: any, isGrid: boolean) => {
    const profile = cs.content_company_profiles?.[0];
    const primaryFounder = cs.content_founders?.find((f: any) => f.is_primary) || cs.content_founders?.[0];
    const outcome = profile?.outcome;
    const borderColor = outcome === "successful"
      ? "hover:border-l-emerald-500"
      : outcome === "unsuccessful"
        ? "hover:border-l-red-400"
        : "hover:border-l-blue-400";

    if (isGrid) {
      return (
        <Link key={cs.id} to={`/case-studies/${cs.slug}`} className="group block">
          <Card className={`h-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-l-4 border-l-transparent ${borderColor}`}>
            <CardContent className="p-5">
              {/* Company header */}
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10 rounded-lg border">
                  <AvatarImage
                    src={profile?.company_logo || getLogoUrl(profile?.website, 40) || primaryFounder?.image}
                    alt={profile?.company_name}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-sky-100 to-blue-200 text-blue-700 text-xs font-semibold">
                    {(profile?.company_name || '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {profile?.company_name || cs.title}
                  </p>
                  {profile?.origin_country && (
                    <p className="text-xs text-muted-foreground">
                      {getCountryFlag(profile.origin_country)} {profile.origin_country} <ArrowRight className="inline h-3 w-3" /> {getCountryFlag("Australia")} Australia
                    </p>
                  )}
                </div>
                {outcome && (
                  <Badge
                    variant="outline"
                    className={`text-xs flex-shrink-0 ${
                      outcome === "successful"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    {outcome === "successful" ? "Success" : "Failure"}
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h2 className="text-base font-semibold text-foreground mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
                {cs.title}
              </h2>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {cs.subtitle || cs.meta_description}
              </p>

              {/* Tags row */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {profile?.industry && (
                  <Badge variant="secondary" className="text-xs font-normal">
                    {profile.industry}
                  </Badge>
                )}
                {profile?.entry_date && (
                  <Badge variant="secondary" className="text-xs font-normal">
                    Est. {profile.entry_date}
                  </Badge>
                )}
              </div>

              {/* Footer metrics */}
              <div className="flex items-center justify-between pt-3 border-t text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  {cs.read_time && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {cs.read_time} min
                    </span>
                  )}
                  {cs.publish_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(cs.publish_date).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
                {cs.view_count > 0 && (
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {cs.view_count}
                  </span>
                )}
              </div>

              <div className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                View case study details
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </CardContent>
          </Card>
        </Link>
      );
    }

    // List view
    return (
      <Link key={cs.id} to={`/case-studies/${cs.slug}`} className="group block">
        <Card className={`transition-all duration-200 hover:shadow-md border-l-4 border-l-transparent ${borderColor}`}>
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12 rounded-lg border flex-shrink-0">
                <AvatarImage
                  src={profile?.company_logo || getLogoUrl(profile?.website, 48) || primaryFounder?.image}
                  alt={profile?.company_name}
                  className="object-cover"
                />
                <AvatarFallback className="rounded-lg bg-gradient-to-br from-sky-100 to-blue-200 text-blue-700 text-sm font-semibold">
                  {(profile?.company_name || '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {cs.title}
                  </h2>
                  {outcome && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        outcome === "successful"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-red-200 bg-red-50 text-red-700"
                      }`}
                    >
                      {outcome === "successful" ? "Success" : "Failure"}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {cs.subtitle || cs.meta_description}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {profile?.origin_country && (
                    <span>
                      {getCountryFlag(profile.origin_country)} {profile.origin_country} <ArrowRight className="inline h-3 w-3" /> {getCountryFlag("Australia")} Australia
                    </span>
                  )}
                  {profile?.industry && (
                    <Badge variant="secondary" className="text-xs font-normal">
                      {profile.industry}
                    </Badge>
                  )}
                  {profile?.entry_date && (
                    <span>Est. {profile.entry_date}</span>
                  )}
                  {cs.read_time && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {cs.read_time} min
                    </span>
                  )}
                  {cs.publish_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(cs.publish_date).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                  {cs.view_count > 0 && (
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {cs.view_count}
                    </span>
                  )}
                </div>
              </div>

              {/* Revenue/costs on desktop list view */}
              <div className="hidden md:flex items-center gap-6 flex-shrink-0">
                {profile?.monthly_revenue && (
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground">{profile.monthly_revenue}</div>
                    <div className="text-xs text-muted-foreground">Revenue/mo</div>
                  </div>
                )}
                {profile?.startup_costs && (
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground">{profile.startup_costs}</div>
                    <div className="text-xs text-muted-foreground">Entry Cost</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <>
      <SEOHead
        title="Market Entry Case Studies | Market Entry Secrets"
        description="Real stories from international businesses entering the Australian market. Learn from their successes, failures, and lessons learned."
        canonicalPath="/case-studies"
        jsonLd={{
          type: "Dataset",
          data: {
            name: "Market Entry Case Studies",
            description: "Case studies of international companies entering the Australian market",
            provider: {
              "@type": "Organization",
              name: "Market Entry Secrets",
            },
          },
        }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-sky-50 via-blue-50/50 to-indigo-50/30 py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-5">
            <div className="p-3 bg-blue-100 rounded-full">
              <BookOpen className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Market Entry <span className="text-blue-600">Case Studies</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Real stories from international businesses entering the Australian market — their successes, failures, and lessons learned.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
            <SubmissionButton submissionType="case_study" variant="hero" size="lg" />
          </div>

          {/* Stats — hide zeros */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {caseStudies.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-lg px-5 py-3 shadow-sm border">
                <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-0.5">{caseStudies.length}</div>
                <div className="text-xs text-muted-foreground">Case Studies</div>
              </div>
            )}
            {successCount > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-lg px-5 py-3 shadow-sm border">
                <div className="text-2xl md:text-3xl font-bold text-emerald-600 mb-0.5">{successCount}</div>
                <div className="text-xs text-muted-foreground">Success Stories</div>
              </div>
            )}
            {failureCount > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-lg px-5 py-3 shadow-sm border">
                <div className="text-2xl md:text-3xl font-bold text-red-500 mb-0.5">{failureCount}</div>
                <div className="text-xs text-muted-foreground">Lessons Learned</div>
              </div>
            )}
            {industryOptions.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-lg px-5 py-3 shadow-sm border">
                <div className="text-2xl md:text-3xl font-bold text-violet-600 mb-0.5">{industryOptions.length}</div>
                <div className="text-xs text-muted-foreground">Industries</div>
              </div>
            )}
            {countryOptions.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-lg px-5 py-3 shadow-sm border">
                <div className="text-2xl md:text-3xl font-bold text-amber-600 mb-0.5">{countryOptions.length}</div>
                <div className="text-xs text-muted-foreground">Origin Countries</div>
              </div>
            )}
          </div>
        </div>
      </section>

      <DirectoryFilterBar
        filters={filters}
        onFilterChange={setFilter}
        onClearAll={clearAll}
        hasActiveFilters={hasActiveFilters}
        noun="case studies"
        shownCount={paginatedCaseStudies.length}
        totalCount={filteredCaseStudies.length}
        tabs={{ key: "outcome", options: outcomeTabs }}
        search={{ key: "search", placeholder: "Search by company, industry, or keyword..." }}
        selects={selects}
        sort={{ key: "sort", options: SORT_OPTIONS }}
      >
        {advancedPanel}
      </DirectoryFilterBar>

      <div className="container mx-auto px-4 py-6">
        <UsageBanner />

        {/* View toggle (presentation only, outside the filter bar) */}
        <div className="flex justify-end mb-4">
          <div className="hidden sm:flex items-center border rounded-md">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2 rounded-r-none"
              aria-label="Grid view"
              onClick={() => setFilter("view", "grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2 rounded-l-none"
              aria-label="List view"
              onClick={() => setFilter("view", "list")}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {filteredCaseStudies.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-muted/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No case studies found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              No case studies match your current filters. Try broadening your search or clearing filters.
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearAll}>Clear All Filters</Button>
            )}
          </div>
        ) : (
          <>
            <ListingPageGate contentType="case-study">
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5" : "space-y-4"}>
                {paginatedCaseStudies.map((cs) => renderCard(cs, viewMode === "grid"))}
              </div>
            </ListingPageGate>
            <div className="mt-8">
              <ListPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CaseStudies;
