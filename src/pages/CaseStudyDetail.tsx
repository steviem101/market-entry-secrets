import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Globe, Twitter, Clock, Calendar, Eye } from "lucide-react";
import { useCaseStudy } from "@/hooks/useCaseStudies";
import { useIncrementViewCount } from "@/hooks/useContent";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { FreemiumGate } from "@/components/FreemiumGate";
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

const CaseStudyDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [savedStories, setSavedStories] = useState<string[]>(getSavedStories);

  const { data: caseStudy, isLoading, error } = useCaseStudy(slug || '');
  const incrementViewCount = useIncrementViewCount();

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
  }, [caseStudy]);

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
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Case Study Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The case study you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/case-studies">
            <Button>Back to Case Studies</Button>
          </Link>
        </div>
      </div>
    );
  }

  const companyProfile = caseStudy.content_company_profiles?.[0];
  const primaryFounder = caseStudy.content_founders?.find((f: any) => f.is_primary) || caseStudy.content_founders?.[0];

  // Group content bodies by section
  const groupedContent = caseStudy.content_sections?.map((section: any) => ({
    ...section,
    bodies: caseStudy.content_bodies?.filter((body: any) => body.section_id === section.id) || []
  })) || [];

  const sections: CaseStudySection[] = caseStudy.content_sections?.map((section: any) => ({
    id: section.id,
    title: section.title,
    slug: section.slug,
    isActive: activeSection === section.slug
  })) || [];

  // Get content bodies that don't belong to any section
  const generalContent = caseStudy.content_bodies?.filter((body: any) => !body.section_id) || [];

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <Link to="/case-studies">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Case Studies
          </Button>
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar Navigation — hidden on mobile/tablet */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-8">
              <div className="mb-6">
                <h2 className="text-sm font-medium text-muted-foreground mb-2">
                  {companyProfile?.company_name || caseStudy.title}
                </h2>
                {companyProfile?.monthly_revenue && (
                  <h3 className="text-lg font-semibold mb-4 text-foreground">
                    Revenue: {companyProfile.monthly_revenue}/Month
                  </h3>
                )}
              </div>

              {sections.length > 0 && (
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.slug)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        section.isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              )}
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
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={primaryFounder?.image || companyProfile?.company_logo || "/placeholder.svg"}
                    alt={companyProfile?.company_name || caseStudy.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">
                      {companyProfile?.company_name || caseStudy.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span>Market Entry Case Study</span>
                      {companyProfile?.origin_country && companyProfile?.target_market && (
                        <span>{companyProfile.origin_country} → {companyProfile.target_market}</span>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(caseStudy.publish_date).toLocaleDateString()}
                      </div>
                      {caseStudy.read_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {caseStudy.read_time} min read
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {caseStudy.view_count} views
                      </div>
                    </div>
                  </div>
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  {caseStudy.title}
                </h1>

                {caseStudy.subtitle && (
                  <p className="text-lg lg:text-xl text-muted-foreground mb-6">
                    {caseStudy.subtitle}
                  </p>
                )}

                {/* Mobile section nav */}
                {sections.length > 0 && (
                  <div className="lg:hidden mb-6">
                    <div className="flex overflow-x-auto gap-2 pb-2">
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
                  <Card className="bg-primary/5 border-primary/20 mb-8">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">MARKET ENTRY</Badge>
                          <Badge>CASE STUDY</Badge>
                          {companyProfile.industry && (
                            <Badge variant="secondary">{companyProfile.industry}</Badge>
                          )}
                          {companyProfile.outcome && (
                            <Badge variant={companyProfile.outcome === "successful" ? "default" : "destructive"}>
                              {companyProfile.outcome === "successful" ? "Success" : "Failure"}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleSave}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Heart
                            className={`w-4 h-4 mr-1 ${
                              savedStories.includes(caseStudy.id) ? "fill-current text-red-500" : ""
                            }`}
                          />
                          SAVE STORY
                        </Button>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        {primaryFounder && (
                          <div className="flex items-center gap-4">
                            <img
                              src={primaryFounder.image || "/placeholder.svg"}
                              alt={primaryFounder.name}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                            <div>
                              <h3 className="font-semibold text-foreground">{primaryFounder.name}</h3>
                              <p className="text-sm text-muted-foreground">{primaryFounder.title}</p>
                              <div className="flex gap-2 mt-2">
                                {primaryFounder.social_twitter && (
                                  <Twitter className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer" />
                                )}
                                {primaryFounder.social_linkedin && (
                                  <Globe className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer" />
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-6 sm:ml-auto">
                          {companyProfile.monthly_revenue && (
                            <div className="text-center">
                              <div className="text-xl sm:text-2xl font-bold text-foreground">
                                {companyProfile.monthly_revenue}
                              </div>
                              <div className="text-xs text-muted-foreground">REVENUE/MO</div>
                            </div>
                          )}
                          {companyProfile.startup_costs && (
                            <div className="text-center">
                              <div className="text-xl sm:text-2xl font-bold text-foreground">
                                {companyProfile.startup_costs}
                              </div>
                              <div className="text-xs text-muted-foreground">ENTRY COSTS</div>
                            </div>
                          )}
                          {companyProfile.founder_count != null && (
                            <div className="text-center">
                              <div className="text-xl sm:text-2xl font-bold text-foreground">
                                {companyProfile.founder_count}
                              </div>
                              <div className="text-xs text-muted-foreground">FOUNDERS</div>
                            </div>
                          )}
                          {companyProfile.employee_count != null && (
                            <div className="text-center">
                              <div className="text-xl sm:text-2xl font-bold text-foreground">
                                {companyProfile.employee_count}
                              </div>
                              <div className="text-xs text-muted-foreground">EMPLOYEES</div>
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
                          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
                            {body.question}
                          </h2>
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
                    <div key={section.id} id={section.slug} className="mb-16 scroll-mt-8">
                      <h2 className="text-3xl font-bold text-foreground mb-8 border-b border-border pb-4">
                        {section.title}
                      </h2>

                      {section.bodies.map((body: any) => (
                        <div key={body.id} className="mb-8">
                          {body.question && (
                            <h3 className="text-xl font-semibold text-foreground mt-6 mb-4">
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
            </FreemiumGate>
          </main>

          {/* Right Sidebar — hidden on mobile/tablet */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-8 space-y-6">
              {/* About Company Card */}
              {companyProfile && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">Market Entry Details</h3>
                    <div className="space-y-3 text-sm">
                      {companyProfile.monthly_revenue && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monthly Revenue (AU)</span>
                          <span className="font-medium">{companyProfile.monthly_revenue}</span>
                        </div>
                      )}
                      {companyProfile.startup_costs && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Entry Investment</span>
                          <span className="font-medium">{companyProfile.startup_costs}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Profitable</span>
                        <span className="font-medium">{companyProfile.is_profitable ? 'Yes' : 'No'}</span>
                      </div>
                      {companyProfile.origin_country && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Origin Country</span>
                          <span className="font-medium">{companyProfile.origin_country}</span>
                        </div>
                      )}
                      {companyProfile.entry_date && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Entry Date</span>
                          <span className="font-medium">{companyProfile.entry_date}</span>
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
                      {companyProfile.business_model && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Business Model</span>
                          <span className="font-medium">{companyProfile.business_model}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* CTA Card */}
              <Card className="bg-card">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-3">Australian Market Entry Guide</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get our comprehensive guide to entering the Australian market
                  </p>
                  <Link to="/content">
                    <Button className="w-full bg-foreground text-background hover:bg-foreground/90">
                      Browse Market Entry Guides
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
