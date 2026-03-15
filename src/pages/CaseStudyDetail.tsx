import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Globe, Clock, Calendar, Eye, Share2, ExternalLink, ArrowRight, Sparkles, Copy, CheckCheck } from "lucide-react";
import { useCaseStudy, useRelatedCaseStudies } from "@/hooks/useCaseStudies";
import { useIncrementViewCount } from "@/hooks/useContent";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { FreemiumGate } from "@/components/FreemiumGate";
import { SEOHead } from "@/components/common/SEOHead";
import { EntityBreadcrumb } from "@/components/common/EntityBreadcrumb";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import DOMPurify from "dompurify";

interface CaseStudySection {
  id: string;
  title: string;
  slug: string;
  isActive?: boolean;
}

const SAVED_STORIES_KEY = "mes_saved_stories";

const getSavedStories = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(SAVED_STORIES_KEY) || "[]");
  } catch {
    return [];
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
};

const getCountryFlag = (country: string | null | undefined): string => {
  if (!country) return "\u{1F30D}";
  return COUNTRY_FLAGS[country] || "\u{1F30D}";
};

const CaseStudyDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [savedStories, setSavedStories] = useState<string[]>(getSavedStories);
  const [copied, setCopied] = useState(false);

  const { data: caseStudy, isLoading, error } = useCaseStudy(slug || '');
  const incrementViewCount = useIncrementViewCount();

  const companyProfile = caseStudy?.content_company_profiles?.[0];
  const { data: relatedCaseStudies = [] } = useRelatedCaseStudies(
    caseStudy?.id,
    companyProfile?.industry,
    companyProfile?.origin_country
  );

  // Get section IDs for scroll spy
  const sectionIds = caseStudy?.content_sections?.map((section: any) => section.slug) || [];
  const { activeSection, scrollToSection } = useScrollSpy({ sectionIds });

  // Increment view count once when content loads
  const hasCountedRef = useRef(false);
  useEffect(() => {
    if (caseStudy?.id && !hasCountedRef.current) {
      hasCountedRef.current = true;
      incrementViewCount(caseStudy.id);
    }
  }, [caseStudy?.id, incrementViewCount]);

  const toggleSave = useCallback(() => {
    if (!caseStudy) return;

    setSavedStories(prev => {
      const next = prev.includes(caseStudy.id)
        ? prev.filter(id => id !== caseStudy.id)
        : [...prev, caseStudy.id];
      localStorage.setItem(SAVED_STORIES_KEY, JSON.stringify(next));
      return next;
    });

    const isSaved = savedStories.includes(caseStudy.id);
    toast(isSaved ? "Removed from saved stories" : "Saved to your stories");
  }, [caseStudy, savedStories]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading case study...</p>
        </div>
      </div>
    );
  }

  if (error || !caseStudy) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="bg-muted/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Globe className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Case Study Not Found</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            The case study you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/case-studies">
            <Button>Browse All Case Studies</Button>
          </Link>
        </div>
      </div>
    );
  }

  const primaryFounder = caseStudy.content_founders?.find((f: any) => f.is_primary) || caseStudy.content_founders?.[0];

  // Group content bodies by section
  const groupedContent = caseStudy.content_sections?.map((section: any) => ({
    ...section,
    bodies: caseStudy.content_bodies?.filter((body: any) => body.section_id === section.id) || []
  })).filter((section: any) => section.bodies.length > 0) || [];

  const sections: CaseStudySection[] = groupedContent.map((section: any) => ({
    id: section.id,
    title: section.title,
    slug: section.slug,
    isActive: activeSection === section.slug
  }));

  // Get content bodies that don't belong to any section
  const generalContent = caseStudy.content_bodies?.filter((body: any) => !body.section_id) || [];

  const companyName = companyProfile?.company_name || caseStudy.title;
  const metaDescription = caseStudy.subtitle || caseStudy.meta_description || caseStudy.title;
  const outcome = (companyProfile as any)?.outcome;
  const isSaved = savedStories.includes(caseStudy.id);

  return (
    <>
      <SEOHead
        title={`How ${companyName} Entered the Australian Market | Market Entry Secrets`}
        description={`${metaDescription.slice(0, 150)}. Learn the entry strategy, challenges, and lessons from ${companyName}'s expansion into Australia.`}
        canonicalPath={`/case-studies/${caseStudy.slug}`}
        ogType="article"
        ogImage={companyProfile?.company_logo || undefined}
        jsonLd={{
          type: "Article",
          data: {
            headline: caseStudy.title,
            description: metaDescription,
            ...(caseStudy.publish_date ? { datePublished: caseStudy.publish_date } : {}),
            ...(companyProfile?.origin_country ? {
              about: {
                "@type": "Organization",
                name: companyName,
                location: { "@type": "Place", name: companyProfile.origin_country }
              }
            } : {}),
            author: {
              "@type": "Organization",
              name: "Market Entry Secrets",
            },
            publisher: {
              "@type": "Organization",
              name: "Market Entry Secrets",
            },
          },
        }}
      />

      <div className="container mx-auto px-4 py-6">
        <EntityBreadcrumb
          segments={[
            { label: "Case Studies", href: "/case-studies" },
            { label: companyName },
          ]}
          className="mb-4 px-0"
        />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar Navigation */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-8">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10 rounded-lg border">
                    <AvatarImage
                      src={companyProfile?.company_logo || primaryFounder?.image}
                      alt={companyName}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-sky-100 to-blue-200 text-blue-700 text-xs font-semibold">
                      {companyName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">{companyName}</h2>
                    {outcome && (
                      <Badge
                        variant="outline"
                        className={`text-xs mt-0.5 ${
                          outcome === "successful"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-red-200 bg-red-50 text-red-700"
                        }`}
                      >
                        {outcome === "successful" ? "Success" : "Failure"}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {sections.length > 0 && (
                <nav className="space-y-0.5">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.slug)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        section.isActive
                          ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              )}

              {/* Sidebar actions */}
              <div className="mt-6 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-sm"
                  onClick={toggleSave}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
                  {isSaved ? "Saved" : "Save Story"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-sm"
                  onClick={handleShare}
                >
                  {copied ? <CheckCheck className="h-4 w-4 mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
                  {copied ? "Copied!" : "Share"}
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <FreemiumGate
              contentType="case-study"
              itemId={caseStudy.id}
              contentTitle={caseStudy.title}
              contentDescription={caseStudy.subtitle || caseStudy.meta_description}
            >
              <div className="mb-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
                  <Avatar className="h-16 w-16 rounded-xl border-2 border-border flex-shrink-0">
                    <AvatarImage
                      src={companyProfile?.company_logo || primaryFounder?.image}
                      alt={companyName}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-sky-100 to-blue-200 text-blue-700 text-lg font-bold">
                      {companyName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                        {companyName}
                      </h1>
                      {outcome && (
                        <Badge
                          variant="outline"
                          className={`${
                            outcome === "successful"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-red-200 bg-red-50 text-red-700"
                          }`}
                        >
                          {outcome === "successful" ? "Success Story" : "Failure Story"}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span>Market Entry Case Study</span>
                      {companyProfile?.origin_country && companyProfile?.target_market && (
                        <span>
                          {getCountryFlag(companyProfile.origin_country)} {companyProfile.origin_country} <ArrowRight className="inline h-3 w-3" /> {getCountryFlag("Australia")} {companyProfile.target_market}
                        </span>
                      )}
                      {caseStudy.publish_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(caseStudy.publish_date).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      {caseStudy.read_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {caseStudy.read_time} min read
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {caseStudy.view_count || 0} views
                      </span>
                    </div>
                  </div>

                  {/* Mobile actions */}
                  <div className="flex gap-2 sm:flex-shrink-0">
                    <Button variant="outline" size="sm" onClick={toggleSave}>
                      <Heart className={`h-4 w-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      {copied ? <CheckCheck className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                    </Button>
                    {companyProfile?.website && (
                      <a href={companyProfile.website} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>

                {/* Title + subtitle */}
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
                  {caseStudy.title}
                </h2>

                {caseStudy.subtitle && (
                  <p className="text-lg text-muted-foreground mb-6">
                    {caseStudy.subtitle}
                  </p>
                )}

                {/* Mobile section nav */}
                {sections.length > 0 && (
                  <div className="lg:hidden mb-6">
                    <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                      {sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => scrollToSection(section.slug)}
                          className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm transition-colors ${
                            section.isActive
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {section.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Company Info Card */}
                {companyProfile && (
                  <Card className="bg-gradient-to-r from-sky-50/50 to-blue-50/30 border-blue-100 mb-8">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <Badge variant="secondary" className="text-xs">MARKET ENTRY</Badge>
                        <Badge className="text-xs">CASE STUDY</Badge>
                        {companyProfile.industry && (
                          <Badge variant="secondary" className="text-xs">{companyProfile.industry}</Badge>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {primaryFounder && (
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border">
                              <AvatarImage src={primaryFounder.image} alt={primaryFounder.name} className="object-cover" />
                              <AvatarFallback className="text-sm">
                                {primaryFounder.name?.split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-sm font-semibold text-foreground">{primaryFounder.name}</h3>
                              <p className="text-xs text-muted-foreground">{primaryFounder.title}</p>
                              <div className="flex gap-2 mt-1">
                                {primaryFounder.social_linkedin && (
                                  <a href={primaryFounder.social_linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                                    <Globe className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-4 sm:ml-auto">
                          {companyProfile.monthly_revenue && (
                            <div className="text-center">
                              <div className="text-xl font-bold text-foreground">{companyProfile.monthly_revenue}</div>
                              <div className="text-xs text-muted-foreground">REVENUE/MO</div>
                            </div>
                          )}
                          {companyProfile.startup_costs && (
                            <div className="text-center">
                              <div className="text-xl font-bold text-foreground">{companyProfile.startup_costs}</div>
                              <div className="text-xs text-muted-foreground">ENTRY COSTS</div>
                            </div>
                          )}
                          {companyProfile.founder_count != null && (
                            <div className="text-center">
                              <div className="text-xl font-bold text-foreground">{companyProfile.founder_count}</div>
                              <div className="text-xs text-muted-foreground">FOUNDERS</div>
                            </div>
                          )}
                          {companyProfile.employee_count != null && (
                            <div className="text-center">
                              <div className="text-xl font-bold text-foreground">{companyProfile.employee_count}</div>
                              <div className="text-xs text-muted-foreground">AU EMPLOYEES</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* General Content (not in sections) */}
                {generalContent.length > 0 && (
                  <div className="prose prose-lg max-w-none mb-12">
                    {generalContent.map((body: any) => (
                      <div key={body.id} className="mb-8">
                        {body.question && (
                          <h3 className="text-2xl font-bold text-foreground mt-8 mb-4">
                            {body.question}
                          </h3>
                        )}
                        <div
                          className="text-muted-foreground leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(body.body_text) }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Sectioned Content */}
                <div className="prose prose-lg max-w-none">
                  {groupedContent.map((section: any) => (
                    <div key={section.id} id={section.slug} className="mb-14 scroll-mt-8">
                      <h2 className="text-2xl font-bold text-foreground mb-6 pb-3 border-b border-border">
                        {section.title}
                      </h2>

                      {section.bodies.map((body: any) => (
                        <div key={body.id} className="mb-6">
                          {body.question && (
                            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                              {body.question}
                            </h3>
                          )}
                          <div
                            className="text-muted-foreground leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(body.body_text) }}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom CTA: Report Creator */}
              <Card className="bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20 mb-8">
                <CardContent className="p-6 text-center">
                  <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Planning Your Own Market Entry?
                  </h3>
                  <p className="text-muted-foreground mb-4 max-w-lg mx-auto">
                    Get a personalised AI-generated market entry report tailored to your company, industry, and target market.
                  </p>
                  <Link to="/report-creator">
                    <Button size="lg">
                      Get Your Report <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Related Case Studies */}
              {relatedCaseStudies.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-foreground mb-4">Read Next</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {relatedCaseStudies.map((related: any) => {
                      const rProfile = related.content_company_profiles?.[0];
                      const rFounder = related.content_founders?.find((f: any) => f.is_primary) || related.content_founders?.[0];
                      const rOutcome = rProfile?.outcome;
                      return (
                        <Link key={related.id} to={`/case-studies/${related.slug}`} className="group block">
                          <Card className="h-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2.5 mb-2">
                                <Avatar className="h-8 w-8 rounded-md border">
                                  <AvatarImage
                                    src={rProfile?.company_logo || rFounder?.image}
                                    alt={rProfile?.company_name}
                                    className="object-cover"
                                  />
                                  <AvatarFallback className="rounded-md bg-gradient-to-br from-sky-100 to-blue-200 text-blue-700 text-xs">
                                    {(rProfile?.company_name || '?').slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-medium text-muted-foreground truncate">
                                  {rProfile?.company_name}
                                </span>
                                {rOutcome && (
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ml-auto flex-shrink-0 ${
                                      rOutcome === "successful"
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                        : "border-red-200 bg-red-50 text-red-700"
                                    }`}
                                  >
                                    {rOutcome === "successful" ? "Success" : "Failure"}
                                  </Badge>
                                )}
                              </div>
                              <h4 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                                {related.title}
                              </h4>
                              {related.subtitle && (
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                  {related.subtitle}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </FreemiumGate>
          </main>

          {/* Right Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-8 space-y-5">
              {/* Market Entry Details */}
              {companyProfile && (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Market Entry Details</h3>
                    <div className="space-y-2.5 text-sm">
                      {companyProfile.is_profitable != null && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Profitable</span>
                          <Badge variant={companyProfile.is_profitable ? "default" : "secondary"} className="text-xs">
                            {companyProfile.is_profitable ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                      )}
                      {companyProfile.origin_country && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Origin</span>
                          <span className="font-medium text-right">
                            {getCountryFlag(companyProfile.origin_country)} {companyProfile.origin_country}
                          </span>
                        </div>
                      )}
                      {companyProfile.entry_date && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Entry Date</span>
                          <span className="font-medium">{companyProfile.entry_date}</span>
                        </div>
                      )}
                      {companyProfile.industry && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Industry</span>
                          <span className="font-medium text-right max-w-[140px] truncate">{companyProfile.industry}</span>
                        </div>
                      )}
                      {companyProfile.business_model && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Business Model</span>
                          <span className="font-medium text-right max-w-[140px] truncate">{companyProfile.business_model}</span>
                        </div>
                      )}
                      {companyProfile.monthly_revenue && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Revenue (AU)</span>
                          <span className="font-medium">{companyProfile.monthly_revenue}/mo</span>
                        </div>
                      )}
                      {companyProfile.startup_costs && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Entry Cost</span>
                          <span className="font-medium">{companyProfile.startup_costs}</span>
                        </div>
                      )}
                      {companyProfile.founder_count != null && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Founders</span>
                          <span className="font-medium">{companyProfile.founder_count}</span>
                        </div>
                      )}
                      {companyProfile.employee_count != null && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">AU Employees</span>
                          <span className="font-medium">{companyProfile.employee_count}</span>
                        </div>
                      )}
                      {companyProfile.website && (
                        <div className="pt-2 border-t">
                          <a
                            href={companyProfile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm flex items-center gap-1"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Report CTA */}
              <Card className="bg-foreground text-background">
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-2">Get Your Market Entry Report</h3>
                  <p className="text-sm opacity-80 mb-4">
                    AI-powered analysis for your company's expansion into Australia.
                  </p>
                  <Link to="/report-creator">
                    <Button variant="secondary" className="w-full" size="sm">
                      Get Started <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Browse Guides CTA */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-foreground mb-2">Market Entry Guides</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Explore our comprehensive guides for entering the Australian market.
                  </p>
                  <Link to="/content">
                    <Button variant="outline" className="w-full" size="sm">
                      Browse Guides
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default CaseStudyDetail;
