import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, AlertCircle, BookOpen, LayoutGrid, LayoutList, ArrowRight, Calendar, Clock, Eye, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useAuth } from "@/hooks/useAuth";
import { PaywallModal } from "@/components/PaywallModal";
import { UsageBanner } from "@/components/UsageBanner";
import { ListPagination } from "@/components/common/ListPagination";
import { SubmissionButton } from "@/components/directory-submissions/SubmissionButton";
import { useCaseStudies } from "@/hooks/useCaseStudies";
import { SEOHead } from "@/components/common/SEOHead";
import { CardGridSkeleton } from "@/components/common/CardGridSkeleton";

const PAGE_SIZE = 12;

const parseMoneyToNumber = (value: string | null | undefined): number => {
  if (!value) return 0;
  return parseFloat(value.replace(/[$,]/g, '')) || 0;
};

const matchesRevenueRange = (revenue: string | null | undefined, range: string): boolean => {
  if (range === "any") return true;
  const amount = parseMoneyToNumber(revenue);
  switch (range) {
    case "0-10k": return amount >= 0 && amount <= 10000;
    case "10k-50k": return amount > 10000 && amount <= 50000;
    case "50k-100k": return amount > 50000 && amount <= 100000;
    case "100k+": return amount > 100000;
    default: return true;
  }
};

const matchesCostsRange = (costs: string | null | undefined, range: string): boolean => {
  if (range === "any") return true;
  const amount = parseMoneyToNumber(costs);
  switch (range) {
    case "0-25k": return amount >= 0 && amount <= 25000;
    case "25k-75k": return amount > 25000 && amount <= 75000;
    case "75k-150k": return amount > 75000 && amount <= 150000;
    case "150k+": return amount > 150000;
    default: return true;
  }
};

const COUNTRY_FLAGS: Record<string, string> = {
  "United States": "\u{1F1FA}\u{1F1F8}",
  "United Kingdom": "\u{1F1EC}\u{1F1E7}",
  "Canada": "\u{1F1E8}\u{1F1E6}",
  "Germany": "\u{1F1E9}\u{1F1EA}",
  "France": "\u{1F1EB}\u{1F1F7}",
  "Japan": "\u{1F1EF}\u{1F1F5}",
  "China": "\u{1F1E8}\u{1F1F3}",
  "India": "\u{1F1EE}\u{1F1F3}",
  "Singapore": "\u{1F1F8}\u{1F1EC}",
  "Israel": "\u{1F1EE}\u{1F1F1}",
  "South Korea": "\u{1F1F0}\u{1F1F7}",
  "Sweden": "\u{1F1F8}\u{1F1EA}",
  "Netherlands": "\u{1F1F3}\u{1F1F1}",
  "Ireland": "\u{1F1EE}\u{1F1EA}",
  "New Zealand": "\u{1F1F3}\u{1F1FF}",
  "Australia": "\u{1F1E6}\u{1F1FA}",
  "Brazil": "\u{1F1E7}\u{1F1F7}",
  "Switzerland": "\u{1F1E8}\u{1F1ED}",
  "Italy": "\u{1F1EE}\u{1F1F9}",
  "Spain": "\u{1F1EA}\u{1F1F8}",
};

const getCountryFlag = (country: string | null | undefined): string => {
  if (!country) return "\u{1F30D}";
  return COUNTRY_FLAGS[country] || "\u{1F30D}";
};

const CaseStudies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { hasReachedLimit } = useUsageTracking();
  const { data: caseStudies = [], isLoading, error } = useCaseStudies();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") ?? "");
  const [outcomeFilter, setOutcomeFilter] = useState(searchParams.get("outcome") ?? "all");
  const [revenueFilter, setRevenueFilter] = useState(searchParams.get("revenue") ?? "any");
  const [costsFilter, setCostsFilter] = useState(searchParams.get("costs") ?? "any");
  const [industryFilter, setIndustryFilter] = useState(searchParams.get("industry") ?? "any");
  const [countryFilter, setCountryFilter] = useState(searchParams.get("country") ?? "any");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") ?? "recent");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    const param = searchParams.get("view");
    return param === "list" ? "list" : "grid";
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams();
    if (searchTerm) p.set("search", searchTerm);
    if (outcomeFilter !== "all") p.set("outcome", outcomeFilter);
    if (revenueFilter !== "any") p.set("revenue", revenueFilter);
    if (costsFilter !== "any") p.set("costs", costsFilter);
    if (industryFilter !== "any") p.set("industry", industryFilter);
    if (countryFilter !== "any") p.set("country", countryFilter);
    if (sortBy !== "recent") p.set("sort", sortBy);
    if (viewMode !== "grid") p.set("view", viewMode);
    if (currentPage > 1) p.set("page", String(currentPage));
    setSearchParams(p, { replace: true });
  }, [searchTerm, outcomeFilter, revenueFilter, costsFilter, industryFilter, countryFilter, sortBy, viewMode, currentPage, setSearchParams]);

  // Derive unique filter options from data — only show options that have records
  const industries = useMemo(() => Array.from(
    new Set(caseStudies.map(cs => cs.content_company_profiles?.[0]?.industry).filter(Boolean))
  ).sort(), [caseStudies]);

  const countries = useMemo(() => Array.from(
    new Set(caseStudies.map(cs => cs.content_company_profiles?.[0]?.origin_country).filter(Boolean))
  ).sort(), [caseStudies]);

  const hasRevenueData = useMemo(() =>
    caseStudies.some(cs => parseMoneyToNumber(cs.content_company_profiles?.[0]?.monthly_revenue) > 0),
    [caseStudies]
  );

  const hasCostsData = useMemo(() =>
    caseStudies.some(cs => parseMoneyToNumber(cs.content_company_profiles?.[0]?.startup_costs) > 0),
    [caseStudies]
  );

  const filteredCaseStudies = useMemo(() => {
    const filtered = caseStudies.filter(cs => {
      const profile = cs.content_company_profiles?.[0];

      const matchesSearch = searchTerm === "" ||
        cs.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cs.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile?.company_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesOutcome = outcomeFilter === "all" ||
        (profile as any)?.outcome === outcomeFilter;

      const matchesRevenue = matchesRevenueRange(profile?.monthly_revenue, revenueFilter);
      const matchesCosts = matchesCostsRange(profile?.startup_costs, costsFilter);

      const matchesIndustry = industryFilter === "any" ||
        profile?.industry === industryFilter;

      const matchesCountry = countryFilter === "any" ||
        profile?.origin_country === countryFilter;

      return matchesSearch && matchesOutcome && matchesRevenue && matchesCosts && matchesIndustry && matchesCountry;
    });

    // Sort
    switch (sortBy) {
      case "views":
        filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        break;
      case "alphabetical":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "recent":
      default:
        // Already sorted by publish_date DESC from the query
        break;
    }

    return filtered;
  }, [caseStudies, searchTerm, outcomeFilter, revenueFilter, costsFilter, industryFilter, countryFilter, sortBy]);

  const totalPages = Math.ceil(filteredCaseStudies.length / PAGE_SIZE);
  const paginatedCaseStudies = filteredCaseStudies.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const activeFilterCount = [
    revenueFilter !== "any",
    costsFilter !== "any",
    industryFilter !== "any",
    countryFilter !== "any",
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0 || outcomeFilter !== "all" || searchTerm !== "";

  const clearAllFilters = () => {
    setSearchTerm("");
    setOutcomeFilter("all");
    setRevenueFilter("any");
    setCostsFilter("any");
    setIndustryFilter("any");
    setCountryFilter("any");
    setSortBy("recent");
    setCurrentPage(1);
  };

  // Stats
  const successCount = useMemo(() =>
    caseStudies.filter(cs => (cs.content_company_profiles?.[0] as any)?.outcome === 'successful').length,
    [caseStudies]
  );
  const failureCount = useMemo(() =>
    caseStudies.filter(cs => (cs.content_company_profiles?.[0] as any)?.outcome === 'unsuccessful').length,
    [caseStudies]
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <CardGridSkeleton count={6} cardHeight="h-48" />
      </div>
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
    const outcome = (profile as any)?.outcome;
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
                    src={profile?.company_logo || primaryFounder?.image}
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
                  src={profile?.company_logo || primaryFounder?.image}
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

  const filterSidebar = (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs" onClick={clearAllFilters}>
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* Sort */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wide">Sort by</label>
        <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setCurrentPage(1); }}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="views">Most Viewed</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasRevenueData && (
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wide">Monthly Revenue</label>
          <Select value={revenueFilter} onValueChange={(v) => { setRevenueFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Any Amount" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Amount</SelectItem>
              <SelectItem value="0-10k">$0 - $10K</SelectItem>
              <SelectItem value="10k-50k">$10K - $50K</SelectItem>
              <SelectItem value="50k-100k">$50K - $100K</SelectItem>
              <SelectItem value="100k+">$100K+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {hasCostsData && (
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wide">Entry Costs</label>
          <Select value={costsFilter} onValueChange={(v) => { setCostsFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Any Amount" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Amount</SelectItem>
              <SelectItem value="0-25k">$0 - $25K</SelectItem>
              <SelectItem value="25k-75k">$25K - $75K</SelectItem>
              <SelectItem value="75k-150k">$75K - $150K</SelectItem>
              <SelectItem value="150k+">$150K+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {industries.length > 0 && (
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wide">Industry</label>
          <Select value={industryFilter} onValueChange={(v) => { setIndustryFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Any Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Industry</SelectItem>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry!}>{industry}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {countries.length > 0 && (
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wide">Origin Country</label>
          <Select value={countryFilter} onValueChange={(v) => { setCountryFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Any Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Country</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country} value={country!}>
                  {getCountryFlag(country)} {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );

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
            {industries.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-lg px-5 py-3 shadow-sm border">
                <div className="text-2xl md:text-3xl font-bold text-violet-600 mb-0.5">{industries.length}</div>
                <div className="text-xs text-muted-foreground">Industries</div>
              </div>
            )}
            {countries.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-lg px-5 py-3 shadow-sm border">
                <div className="text-2xl md:text-3xl font-bold text-amber-600 mb-0.5">{countries.length}</div>
                <div className="text-xs text-muted-foreground">Origin Countries</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tabs + Search + Controls */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          {/* Tabs */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-1">
              {[
                { value: "all", label: "All" },
                { value: "successful", label: "Success Stories" },
                { value: "unsuccessful", label: "Failure Stories" },
              ].map(tab => (
                <button
                  key={tab.value}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    outcomeFilter === tab.value
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  onClick={() => { setOutcomeFilter(tab.value); setCurrentPage(1); }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* View toggle + mobile filter button */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-1" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
              <div className="hidden sm:flex items-center border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 px-2 rounded-r-none"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 px-2 rounded-l-none"
                  onClick={() => setViewMode("list")}
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by company, industry, or keyword..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-10 h-10 text-sm"
            />
            {searchTerm && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => { setSearchTerm(""); setCurrentPage(1); }}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              Showing {paginatedCaseStudies.length} of {filteredCaseStudies.length} case studies
            </p>
            {hasActiveFilters && (
              <button
                className="text-xs text-primary hover:underline"
                onClick={clearAllFilters}
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filters drawer */}
      {showMobileFilters && (
        <div className="lg:hidden bg-card border-b border-border">
          <div className="container mx-auto px-4 py-4">
            {filterSidebar}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        <UsageBanner />
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-20">
              {filterSidebar}
            </div>
          </aside>

          {/* Case Studies Grid/List */}
          <main className="flex-1 min-w-0">
            {!authLoading && hasReachedLimit && !user ? (
              <div className="relative">
                <div className={`${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5" : "space-y-4"} blur-sm pointer-events-none select-none`} aria-hidden="true">
                  {filteredCaseStudies.slice(0, 3).map((cs) => renderCard(cs, viewMode === "grid"))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <PaywallModal contentType="case-study" />
                </div>
              </div>
            ) : (
              <>
                {filteredCaseStudies.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-muted/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Search className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No case studies found</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      No case studies match your current filters. Try broadening your search or clearing filters.
                    </p>
                    <Button variant="outline" onClick={clearAllFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Clear All Filters
                    </Button>
                  </div>
                ) : (
                  <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5" : "space-y-4"}>
                    {paginatedCaseStudies.map((cs) => renderCard(cs, viewMode === "grid"))}
                  </div>
                )}
                <div className="mt-8">
                  <ListPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default CaseStudies;
