
import { useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Twitter, Clock, Calendar, Eye, Share2, Check, BookOpen, Users, Sparkles, ChevronRight } from "lucide-react";
import { useContentItem, useContentItems, useIncrementViewCount } from "@/hooks/useContent";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { useContentActions } from "@/hooks/useContentActions";
import { useAuth } from "@/hooks/useAuth";
import { ContentEnrichmentButton } from "@/components/content/ContentEnrichmentButton";
import { FreemiumGate } from "@/components/FreemiumGate";
import { SEOHead } from "@/components/common/SEOHead";
import { SectionNav } from "@/components/detail/SectionNav";
import { ContentBodyRenderer } from "@/components/detail/ContentBodyRenderer";
import { GuideAttachments } from "@/components/content/GuideAttachments";
import { GuideAttachmentManager } from "@/components/content/GuideAttachmentManager";
import { useGuideAttachments } from "@/hooks/useGuideAttachments";

interface ContentSection {
  id: string;
  title: string;
  slug: string;
  isActive?: boolean;
}

const CONTENT_TYPE_BADGE_LABELS: Record<string, string> = {
  success_story: "SUCCESS STORY",
  guide: "GUIDE",
  article: "ARTICLE",
  case_study: "CASE STUDY",
};

const ContentDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { data: content, isLoading, error } = useContentItem(slug || '');
  const incrementViewCount = useIncrementViewCount();
  const { data: attachments = [] } = useGuideAttachments(content?.id);
  const { isSaved, toggleSave, handleShare, copied } = useContentActions(content?.id);

  // Fetch related content (same category, different slug)
  const { data: allContent = [] } = useContentItems({
    contentType: ['guide', 'article', 'success_story']
  });
  const relatedGuides = content && content.category_id
    ? allContent
        .filter(item => item.id !== content.id && item.category_id === content.category_id)
        .slice(0, 3)
    : [];

  // Get section IDs for scroll spy
  const sectionIds = content?.content_sections?.map((section: any) => section.slug) || [];
  const { activeSection, scrollToSection } = useScrollSpy({ sectionIds });

  // Increment view count once when content loads
  const hasCountedRef = useRef(false);
  useEffect(() => {
    if (content?.id && !hasCountedRef.current) {
      hasCountedRef.current = true;
      incrementViewCount(content.id);
    }
  }, [content?.id, incrementViewCount]);


  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Content Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The content you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/content">
            <Button>Back to Content</Button>
          </Link>
        </div>
      </div>
    );
  }

  const companyProfile = content.content_company_profiles?.[0];
  const primaryFounder = content.content_founders?.find((f: any) => f.is_primary) || content.content_founders?.[0];
  // Group content bodies by section
  const groupedContent = content.content_sections?.map((section: any) => ({
    ...section,
    bodies: content.content_bodies?.filter((body: any) => body.section_id === section.id) || []
  })) || [];

  const sections: ContentSection[] = content.content_sections?.map((section: any) => ({
    id: section.id,
    title: section.title,
    slug: section.slug,
    isActive: activeSection === section.slug
  })) || [];

  // For enrichment button - track which sections have content
  const sectionsWithContentStatus = content.content_sections?.map((section: any) => ({
    id: section.id,
    title: section.title,
    hasContent: (content.content_bodies?.filter((body: any) => body.section_id === section.id) || []).length > 0
  })) || [];

  // Get content bodies that don't belong to any section
  const generalContent = content.content_bodies?.filter((body: any) => !body.section_id) || [];

  const badgeLabel = CONTENT_TYPE_BADGE_LABELS[content.content_type] || content.content_type.toUpperCase();
  const categoryName = content.content_categories?.name || "Guide";
  const descriptionText = content.subtitle || content.meta_description || `Expert guidance for entering the Australian market.`;

  return (
    <>
      <SEOHead
        title={`${content.title} | Market Entry Secrets`}
        description={descriptionText}
        canonicalPath={`/content/${content.slug}`}
        ogType="article"
        jsonLd={{
          type: "Article",
          data: {
            headline: content.title,
            description: descriptionText,
            ...(content.publish_date && { datePublished: content.publish_date }),
            dateModified: content.updated_at,
            author: { "@type": "Organization", name: "Market Entry Secrets" },
            publisher: {
              "@type": "Organization",
              name: "Market Entry Secrets",
              url: typeof window !== "undefined" ? window.location.origin : "https://market-entry-secrets.lovable.app"
            }
          }
        }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
            <li><ChevronRight className="w-3.5 h-3.5" /></li>
            <li><Link to="/content" className="hover:text-foreground transition-colors">Market Entry Guides</Link></li>
            <li><ChevronRight className="w-3.5 h-3.5" /></li>
            <li className="text-foreground font-medium truncate max-w-[200px]">{content.title}</li>
          </ol>
        </nav>

        <div className="mb-6 flex items-center justify-between">
          <Link to="/content">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Content
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            {isAdmin && sections.length > 0 && (
              <ContentEnrichmentButton
                contentId={content.id}
                contentTitle={content.title}
                sectionCount={sections.length}
                sections={sectionsWithContentStatus}
                onEnrichmentComplete={() => {
                  queryClient.invalidateQueries({ queryKey: ['content-item', slug] });
                }}
              />
            )}
          </div>
        </div>

        {/* Admin attachment manager — renders below action bar when expanded */}
        {isAdmin && (
          <GuideAttachmentManager contentItemId={content.id} />
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar Navigation — hidden on mobile/tablet */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-8">
              <div className="mb-6">
                <h2 className="text-sm font-medium text-muted-foreground mb-2">
                  {companyProfile?.company_name || content.title}
                </h2>
                {companyProfile?.monthly_revenue && (
                  <h3 className="text-lg font-semibold mb-4 text-foreground">
                    Revenue: {companyProfile.monthly_revenue}/Month
                  </h3>
                )}
              </div>

              <SectionNav sections={sections} scrollToSection={scrollToSection} variant="sidebar" />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <FreemiumGate
              contentType="content"
              itemId={content.id}
              contentTitle={content.title}
              contentDescription={content.subtitle || content.meta_description}
            >
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={primaryFounder?.image || companyProfile?.company_logo || "/placeholder.svg"}
                  alt={companyProfile?.company_name || content.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge variant="outline">{badgeLabel}</Badge>
                    <Badge variant="secondary">{categoryName}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    {content.publish_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(content.publish_date).toLocaleDateString()}
                      </div>
                    )}
                    {content.read_time != null && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {content.read_time} min read
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {content.view_count || 0} views
                    </div>
                  </div>
                </div>
                {/* Share + Save buttons */}
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleShare} className="text-muted-foreground hover:text-foreground">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={toggleSave} className="text-muted-foreground hover:text-foreground">
                    <Heart
                      className={`w-4 h-4 ${
                        isSaved ? "fill-current text-red-500" : ""
                      }`}
                    />
                  </Button>
                </div>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {content.title}
              </h1>

              {content.subtitle && (
                <p className="text-lg lg:text-xl text-muted-foreground mb-6">
                  {content.subtitle}
                </p>
              )}

              {/* Mobile section nav */}
              <SectionNav sections={sections} scrollToSection={scrollToSection} variant="mobile" />

              {/* Company Info Card */}
              {companyProfile && (
                <Card className="bg-primary/5 border-primary/20 mb-8">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>{badgeLabel}</Badge>
                        <Badge variant="secondary">{companyProfile.industry}</Badge>
                        {companyProfile.origin_country && companyProfile.target_market && (
                          <Badge variant="outline">
                            {companyProfile.origin_country} → {companyProfile.target_market}
                          </Badge>
                        )}
                      </div>
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

              {/* Downloadable Attachments (inline) */}
              {attachments.length > 0 && (
                <GuideAttachments attachments={attachments} variant="inline" />
              )}

              <ContentBodyRenderer
                generalContent={generalContent}
                groupedContent={groupedContent}
                questionStyle="box"
              />
            </div>
            </FreemiumGate>

            {/* Bottom: Related Guides */}
            {relatedGuides.length > 0 && (
              <section className="mt-16 pt-8 border-t">
                <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedGuides.map((guide: any) => (
                    <Link key={guide.id} to={`/content/${guide.slug}`} className="block group">
                      <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full">
                        <CardContent className="p-5">
                          <Badge variant="outline" className="mb-2 text-xs">
                            {guide.content_categories?.name || categoryName}
                          </Badge>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                            {guide.title}
                          </h3>
                          {guide.subtitle && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{guide.subtitle}</p>
                          )}
                          {guide.read_time != null && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {guide.read_time} min read
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Bottom CTAs */}
            <section className="mt-12 pt-8 border-t space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/content" className="flex-1">
                  <Button variant="outline" className="w-full gap-2">
                    <BookOpen className="w-4 h-4" />
                    Browse All Guides
                  </Button>
                </Link>
                <Link to="/service-providers" className="flex-1">
                  <Button variant="outline" className="w-full gap-2">
                    <Users className="w-4 h-4" />
                    Find Vetted Service Providers
                  </Button>
                </Link>
                <Link to="/report-creator" className="flex-1">
                  <Button className="w-full gap-2">
                    <Sparkles className="w-4 h-4" />
                    Get Your Market Entry Report
                  </Button>
                </Link>
              </div>
            </section>
          </main>

          {/* Right Sidebar — hidden on mobile/tablet */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-8 space-y-6">
              {/* Guide Metadata Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Guide Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-medium">{categoryName}</span>
                    </div>
                    {content.publish_date && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Published</span>
                        <span className="font-medium">{new Date(content.publish_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {content.read_time != null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Read Time</span>
                        <span className="font-medium">{content.read_time} min</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Views</span>
                      <span className="font-medium">{content.view_count || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Download Files Card */}
              {attachments.length > 0 && (
                <GuideAttachments attachments={attachments} variant="sidebar" />
              )}

              {/* About Company Card */}
              {companyProfile && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">About {companyProfile.company_name}</h3>
                    <div className="space-y-3 text-sm">
                      {companyProfile.monthly_revenue && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monthly Revenue</span>
                          <span className="font-medium">{companyProfile.monthly_revenue}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Profitable</span>
                        <span className="font-medium">{companyProfile.is_profitable ? 'Yes' : 'No'}</span>
                      </div>
                      {companyProfile.founder_count != null && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Founders</span>
                          <span className="font-medium">{companyProfile.founder_count}</span>
                        </div>
                      )}
                      {companyProfile.employee_count != null && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Employees</span>
                          <span className="font-medium">{companyProfile.employee_count}</span>
                        </div>
                      )}
                      {companyProfile.entry_date && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Market Entry</span>
                          <span className="font-medium">{companyProfile.entry_date}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Report CTA */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-3">Planning Your Market Entry?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get a personalised AI-generated market entry report with competitor analysis, regulatory insights, and an action plan.
                  </p>
                  <Link to="/report-creator">
                    <Button className="w-full gap-2">
                      <Sparkles className="w-4 h-4" />
                      Get Your Report
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Related Guides in sidebar */}
              {relatedGuides.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">Related Guides</h3>
                    <div className="space-y-3">
                      {relatedGuides.slice(0, 3).map((guide: any) => (
                        <Link
                          key={guide.id}
                          to={`/content/${guide.slug}`}
                          className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <BookOpen className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{guide.title}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </aside>
        </div>
      </div>

    </>
  );
};

export default ContentDetail;
