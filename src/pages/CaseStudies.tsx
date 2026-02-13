import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, AlertCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useAuth } from "@/hooks/useAuth";
import { PaywallModal } from "@/components/PaywallModal";
import { UsageBanner } from "@/components/UsageBanner";
import { SubmissionButton } from "@/components/directory-submissions/SubmissionButton";
import { useCaseStudies } from "@/hooks/useCaseStudies";

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

const CaseStudies = () => {
  const { user, loading: authLoading } = useAuth();
  const { hasReachedLimit } = useUsageTracking();
  const { data: caseStudies = [], isLoading, error } = useCaseStudies();

  const [searchTerm, setSearchTerm] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState("all");
  const [revenueFilter, setRevenueFilter] = useState("any");
  const [costsFilter, setCostsFilter] = useState("any");
  const [industryFilter, setIndustryFilter] = useState("any");
  const [countryFilter, setCountryFilter] = useState("any");

  // Derive unique filter options from data
  const industries = Array.from(
    new Set(caseStudies.map(cs => cs.content_company_profiles?.[0]?.industry).filter(Boolean))
  ).sort();

  const countries = Array.from(
    new Set(caseStudies.map(cs => cs.content_company_profiles?.[0]?.origin_country).filter(Boolean))
  ).sort();

  const filteredCaseStudies = caseStudies.filter(cs => {
    const profile = cs.content_company_profiles?.[0];
    const primaryFounder = cs.content_founders?.find((f: any) => f.is_primary) || cs.content_founders?.[0];

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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading case studies...</p>
        </div>
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

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-blue-500/20 rounded-full">
              <BookOpen className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Market Entry <span className="text-blue-600">Case Studies</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Real stories from international businesses entering the Australian market — their successes, failures, and lessons learned.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <SubmissionButton submissionType="case_study" variant="hero" size="lg" />
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
              <div className="text-3xl font-bold text-blue-600 mb-1">{caseStudies.length}</div>
              <div className="text-sm text-gray-600">Case Studies</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {caseStudies.filter(cs => (cs.content_company_profiles?.[0] as any)?.outcome === 'successful').length}
              </div>
              <div className="text-sm text-gray-600">Success Stories</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {caseStudies.filter(cs => (cs.content_company_profiles?.[0] as any)?.outcome === 'unsuccessful').length}
              </div>
              <div className="text-sm text-gray-600">Lessons Learned</div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-6 text-sm mb-4">
            <button
              className={`pb-1 ${outcomeFilter === "all" ? "text-foreground font-medium border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setOutcomeFilter("all")}
            >
              All Case Studies
            </button>
            <button
              className={`pb-1 ${outcomeFilter === "successful" ? "text-foreground font-medium border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setOutcomeFilter("successful")}
            >
              Success Stories
            </button>
            <button
              className={`pb-1 ${outcomeFilter === "unsuccessful" ? "text-foreground font-medium border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setOutcomeFilter("unsuccessful")}
            >
              Failure Stories
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Try 'SaaS market entry' or 'regulatory compliance'"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-base"
            />
          </div>

          <p className="text-muted-foreground mt-4">
            Showing {filteredCaseStudies.length} market entry case studies
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <UsageBanner />
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="w-80 flex-shrink-0">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Monthly Revenue</label>
                <Select value={revenueFilter} onValueChange={setRevenueFilter}>
                  <SelectTrigger>
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

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Entry Costs</label>
                <Select value={costsFilter} onValueChange={setCostsFilter}>
                  <SelectTrigger>
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

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Industry</label>
                <Select value={industryFilter} onValueChange={setIndustryFilter}>
                  <SelectTrigger>
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

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Origin Country</label>
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Country</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country!}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </aside>

          {/* Case Studies List */}
          <main className="flex-1">
            {!authLoading && hasReachedLimit && !user ? (
              <div className="relative">
                <div className="space-y-6 blur-sm pointer-events-none select-none" aria-hidden="true">
                  {filteredCaseStudies.slice(0, 3).map((cs) => {
                    const p = cs.content_company_profiles?.[0];
                    const f = cs.content_founders?.find((f: any) => f.is_primary) || cs.content_founders?.[0];
                    return (
                      <Card key={cs.id}>
                        <CardHeader>
                          <div className="flex items-start gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={f?.image} alt={f?.name || p?.company_name} />
                              <AvatarFallback>?</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <CardTitle className="text-xl">{cs.title}</CardTitle>
                              <CardDescription className="text-base leading-relaxed mt-1">
                                {cs.subtitle || cs.meta_description}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <PaywallModal contentType="case-study" />
                </div>
              </div>
            ) : (
            <div className="space-y-6">
              {filteredCaseStudies.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">No case studies found matching your filters.</p>
                  <Button variant="outline" className="mt-4" onClick={() => {
                    setSearchTerm("");
                    setOutcomeFilter("all");
                    setRevenueFilter("any");
                    setCostsFilter("any");
                    setIndustryFilter("any");
                    setCountryFilter("any");
                  }}>
                    Clear Filters
                  </Button>
                </div>
              )}
              {filteredCaseStudies.map((cs) => {
                const profile = cs.content_company_profiles?.[0];
                const primaryFounder = cs.content_founders?.find((f: any) => f.is_primary) || cs.content_founders?.[0];

                return (
                  <Link key={cs.id} to={`/case-studies/${cs.slug}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={primaryFounder?.image} alt={primaryFounder?.name || profile?.company_name} />
                            <AvatarFallback>
                              {(primaryFounder?.name || profile?.company_name || '?').split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-xl hover:text-primary transition-colors">
                                {cs.title}
                              </CardTitle>
                              {(profile as any)?.outcome && (
                                <Badge variant={(profile as any).outcome === "successful" ? "default" : "destructive"}>
                                  {(profile as any).outcome === "successful" ? "Success" : "Failure"}
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="text-base leading-relaxed">
                              {cs.subtitle || cs.meta_description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            {profile?.monthly_revenue && (
                              <div>
                                <span className="text-2xl font-bold text-foreground">{profile.monthly_revenue}</span>
                                <span className="text-muted-foreground ml-1">Monthly Revenue</span>
                              </div>
                            )}
                            {profile?.startup_costs && (
                              <div>
                                <span className="text-2xl font-bold text-foreground">{profile.startup_costs}</span>
                                <span className="text-muted-foreground ml-1">Entry Costs</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {profile?.origin_country && (
                              <span>{profile.origin_country} → Australia</span>
                            )}
                            {profile?.industry && (
                              <Badge variant="outline">{profile.industry}</Badge>
                            )}
                            {cs.view_count > 0 && (
                              <span>{cs.view_count} views</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default CaseStudies;
