
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Globe, Twitter, Instagram, Youtube, Clock, Calendar, Eye } from "lucide-react";
import { useContentItem, useIncrementViewCount } from "@/hooks/useContent";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { useAuth } from "@/hooks/useAuth";
import { ContentEnrichmentButton } from "@/components/content/ContentEnrichmentButton";

interface ContentSection {
  id: string;
  title: string;
  slug: string;
  isActive?: boolean;
}

const ContentDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [savedStories, setSavedStories] = useState<string[]>([]);
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { data: content, isLoading, error } = useContentItem(slug || '');
  const incrementViewCount = useIncrementViewCount();

  // Get section IDs for scroll spy
  const sectionIds = content?.content_sections?.map(section => section.slug) || [];
  const { activeSection, scrollToSection } = useScrollSpy({ sectionIds });

  // Increment view count when content loads
  useEffect(() => {
    if (content && content.id) {
      incrementViewCount(content.id);
    }
  }, [content, incrementViewCount]);

  const toggleSave = () => {
    if (!content) return;
    
    if (savedStories.includes(content.id)) {
      setSavedStories(savedStories.filter(id => id !== content.id));
    } else {
      setSavedStories([...savedStories, content.id]);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
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
      </div>
    );
  }

  const companyProfile = content.content_company_profiles?.[0];
  const primaryFounder = content.content_founders?.find(f => f.is_primary) || content.content_founders?.[0];
  // Group content bodies by section
  const groupedContent = content.content_sections?.map(section => ({
    ...section,
    bodies: content.content_bodies?.filter(body => body.section_id === section.id) || []
  })) || [];

  const sections: ContentSection[] = content.content_sections?.map(section => ({
    id: section.id,
    title: section.title,
    slug: section.slug,
    isActive: activeSection === section.slug
  })) || [];

  // For enrichment button - track which sections have content
  const sectionsWithContentStatus = content.content_sections?.map(section => ({
    id: section.id,
    title: section.title,
    hasContent: (content.content_bodies?.filter(body => body.section_id === section.id) || []).length > 0
  })) || [];

  // Get content bodies that don't belong to any section
  const generalContent = content.content_bodies?.filter(body => !body.section_id) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/content">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Content
            </Button>
          </Link>
          
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

        <div className="flex gap-8">
          {/* Left Sidebar Navigation */}
          <aside className="w-80 flex-shrink-0">
            <div className="sticky top-8">
              <div className="mb-6">
                <h2 className="text-sm font-medium text-muted-foreground mb-2">
                  {companyProfile?.company_name || content.title}
                </h2>
                <h3 className="text-lg font-semibold mb-4 text-foreground">
                  {companyProfile?.monthly_revenue && `Revenue: ${companyProfile.monthly_revenue}/Month`}
                </h3>
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
          <main className="flex-1">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={primaryFounder?.image || companyProfile?.company_logo || "/placeholder.svg"}
                  alt={companyProfile?.company_name || content.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-1">
                    {companyProfile?.company_name || content.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{content.content_type === 'success_story' ? 'Success Story' : 'Article'}</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(content.publish_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {content.read_time} min read
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {content.view_count} views
                    </div>
                  </div>
                </div>
              </div>

              <h1 className="text-4xl font-bold text-foreground mb-4">
                {content.title}
              </h1>

              {content.subtitle && (
                <p className="text-xl text-muted-foreground mb-6">
                  {content.subtitle}
                </p>
              )}

              {/* Company Info Card */}
              {companyProfile && (
                <Card className="bg-primary/5 border-primary/20 mb-8">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge>SUCCESS STORY</Badge>
                        <Badge variant="secondary">{companyProfile.industry}</Badge>
                        {companyProfile.origin_country && companyProfile.target_market && (
                          <Badge variant="outline">
                            {companyProfile.origin_country} → {companyProfile.target_market}
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
                            savedStories.includes(content.id) ? "fill-current text-red-500" : ""
                          }`} 
                        />
                        SAVE
                      </Button>
                    </div>

                    <div className="flex items-center gap-8">
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

                      <div className="flex gap-8 ml-auto">
                        {companyProfile.monthly_revenue && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-foreground">
                              {companyProfile.monthly_revenue}
                            </div>
                            <div className="text-xs text-muted-foreground">REVENUE/MO</div>
                          </div>
                        )}

                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">
                            {companyProfile.founder_count}
                          </div>
                          <div className="text-xs text-muted-foreground">FOUNDERS</div>
                        </div>

                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">
                            {companyProfile.employee_count}
                          </div>
                          <div className="text-xs text-muted-foreground">EMPLOYEES</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* General Content (not in sections) */}
              {generalContent.length > 0 && (
                <div className="prose prose-lg max-w-none mb-12">
                  {generalContent.map((body) => (
                    <div key={body.id} className="mb-8">
                      {body.question && (
                        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
                          {body.question}
                        </h2>
                      )}
                      <div 
                        className="text-muted-foreground leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: body.body_text }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Sectioned Content */}
              <div className="prose prose-lg max-w-none">
                {groupedContent.map((section) => (
                  <div key={section.id} id={section.slug} className="mb-16 scroll-mt-8">
                    <h2 className="text-3xl font-bold text-foreground mb-8 border-b border-border pb-4">
                      {section.title}
                    </h2>
                    
                    {section.bodies.map((body) => (
                      <div key={body.id} className="mb-8">
                        {body.question && (
                          <h3 className="text-xl font-semibold text-foreground mt-6 mb-4">
                            {body.question}
                          </h3>
                        )}
                        <div 
                          className="text-muted-foreground leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: body.body_text }}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="w-80 flex-shrink-0">
            <div className="sticky top-8 space-y-6">
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
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Founders</span>
                        <span className="font-medium">{companyProfile.founder_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Employees</span>
                        <span className="font-medium">{companyProfile.employee_count}</span>
                      </div>
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

              {/* Market Entry Guide Card */}
              <Card className="bg-card">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-3">Market Entry Secrets</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    See exactly how online businesses get to millions in revenue
                  </p>
                  <Button className="w-full bg-foreground text-background hover:bg-foreground/90">
                    Join Market Entry Secrets
                  </Button>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ContentDetail;
