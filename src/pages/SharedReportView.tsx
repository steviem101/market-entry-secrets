import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ReportSection } from '@/components/report/ReportSection';
import { ReportMatchCard } from '@/components/report/ReportMatchCard';
import { ReportSources } from '@/components/report/ReportSources';
import { ReportBackToTop } from '@/components/report/ReportBackToTop';
import { ReportMobileTOC } from '@/components/report/ReportMobileTOC';
import { useSharedReport } from '@/hooks/useReport';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Eye, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import {
  SECTION_LABELS,
  SECTION_ORDER,
  estimateReadingTime,
} from '@/components/report/reportSectionConfig';

const SharedReportView = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { data: report, isLoading, error } = useSharedReport(shareToken);

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen pt-20 pb-16 px-4">
          <div className="container mx-auto max-w-3xl space-y-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        </main>
      </>
    );
  }

  if (error || !report) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen pt-20 pb-16 px-4">
          <div className="container mx-auto text-center py-20">
            <h1 className="text-2xl font-bold text-foreground mb-2">Report Not Found</h1>
            <p className="text-muted-foreground mb-6">This shared link is invalid or has been revoked.</p>
            <Link to="/report-creator">
              <Button className="gap-2">
                Create Your Own Report <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const reportJson = report.report_json as any;
  const sections = reportJson?.sections || {};
  const companyName = reportJson?.company_name || 'Market Entry Report';
  const matches = reportJson?.matches || {};
  const perplexityCitations = reportJson?.metadata?.perplexity_citations || [];
  const readingTime = estimateReadingTime(sections);

  // Build TOC sections for mobile drawer
  const tocSections = SECTION_ORDER
    .filter((id) => sections[id] && sections[id].visible !== false)
    .map((id) => ({
      id,
      label: SECTION_LABELS[id] || id,
      visible: true,
    }));

  return (
    <>
      <Helmet>
        <title>{companyName} - Shared Report | Market Entry Secrets</title>
      </Helmet>

      <Navigation />

      {/* Shared report banner */}
      <div className="sticky top-0 z-30 bg-muted/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              Shared Report
            </Badge>
            <div>
              <h1 className="text-lg font-bold text-foreground">{companyName}</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {format(new Date(report.created_at), 'MMM d, yyyy')}
                {readingTime > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {readingTime} min read
                  </span>
                )}
              </div>
            </div>
          </div>
          <Link to="/report-creator">
            <Button size="sm" className="gap-1.5">
              Create Your Own <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      <main className="min-h-screen pt-6 pb-16 px-4">
        <div className="container mx-auto max-w-3xl space-y-8">
          {SECTION_ORDER.map((sectionId) => {
            const section = sections[sectionId];

            if (!section || section.visible === false) {
              if (!section && SECTION_LABELS[sectionId]) return null;
              if (section?.visible === false) {
                return (
                  <div
                    key={sectionId}
                    id={sectionId}
                    className="rounded-xl border border-border bg-muted/30 p-8 text-center"
                  >
                    <p className="text-muted-foreground text-sm mb-3">
                      This section is available in the full report.
                    </p>
                    <Link to="/report-creator">
                      <Button variant="outline" size="sm" className="gap-1.5">
                        Create Your Own Report <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                );
              }
              return null;
            }

            const sectionMatches = section.matches || matches[sectionId] || [];

            return (
              <ReportSection
                key={sectionId}
                id={sectionId}
                title={SECTION_LABELS[sectionId]}
                content={section.content || ''}
                citations={perplexityCitations}
              >
                {sectionMatches.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {sectionMatches.map((match: any, idx: number) => (
                      <ReportMatchCard
                        key={match.id || idx}
                        name={match.name}
                        subtitle={match.subtitle || match.category || match.location}
                        tags={match.tags || match.services?.slice(0, 3)}
                        link={match.link}
                        linkLabel={match.linkLabel}
                        website={match.website}
                      />
                    ))}
                  </div>
                )}
              </ReportSection>
            );
          })}

          {perplexityCitations.length > 0 && (
            <ReportSources citations={perplexityCitations} />
          )}

          {/* CTA at bottom */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
            <h3 className="text-lg font-bold text-foreground mb-2">
              Get Your Own Market Entry Report
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              AI-powered intelligence tailored to your company's Australian market entry.
            </p>
            <Link to="/report-creator">
              <Button className="gap-2">
                Create Your Report <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Floating utilities */}
      <ReportBackToTop />
      <ReportMobileTOC sections={tocSections} />

      <Footer />
    </>
  );
};

export default SharedReportView;
