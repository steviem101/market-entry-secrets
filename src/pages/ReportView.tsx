import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ReportHeader } from '@/components/report/ReportHeader';
import { ReportSidebar } from '@/components/report/ReportSidebar';
import { ReportSection } from '@/components/report/ReportSection';
import { ReportGatedSection } from '@/components/report/ReportGatedSection';
import { ReportMatchCard } from '@/components/report/ReportMatchCard';
import { ReportFeedback } from '@/components/report/ReportFeedback';
import { ReportSources } from '@/components/report/ReportSources';
import { useReport } from '@/hooks/useReport';
import { useSubscription } from '@/hooks/useSubscription';
import { Skeleton } from '@/components/ui/skeleton';

const SECTION_LABELS: Record<string, string> = {
  executive_summary: 'Executive Summary',
  swot_analysis: 'SWOT Analysis',
  competitor_landscape: 'Competitor Landscape',
  service_providers: 'Service Provider Recommendations',
  mentor_recommendations: 'Mentor Recommendations',
  events_resources: 'Events & Resources',
  action_plan: 'Action Plan & Timeline',
  lead_list: 'Lead List',
};

const SECTION_ORDER = [
  'executive_summary', 'swot_analysis', 'competitor_landscape', 'service_providers',
  'mentor_recommendations', 'events_resources', 'action_plan', 'lead_list',
];

// Minimum subscription tier required for each gated section
const TIER_REQUIREMENTS: Record<string, string> = {
  swot_analysis: 'growth',
  competitor_landscape: 'growth',
  mentor_recommendations: 'growth',
  lead_list: 'scale',
};

// Tier hierarchy for comparison
const TIER_HIERARCHY = ['free', 'growth', 'scale', 'enterprise'];

const userTierMeetsRequirement = (userTier: string, requiredTier: string): boolean => {
  const userIndex = TIER_HIERARCHY.indexOf(userTier);
  const requiredIndex = TIER_HIERARCHY.indexOf(requiredTier);
  return userIndex >= requiredIndex;
};

const ReportView = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { data: report, isLoading, error } = useReport(reportId);
  const { subscription } = useSubscription();
  const currentTier = subscription?.tier || 'free';
  const [localShareToken, setLocalShareToken] = useState<string | null>(null);

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen pt-20 pb-16 px-4">
          <div className="container mx-auto max-w-4xl space-y-6">
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
            <p className="text-muted-foreground">This report doesn't exist or you don't have access.</p>
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
  const perplexityUsed = reportJson?.metadata?.perplexity_used || false;

  const sidebarSections = SECTION_ORDER
    .filter((id) => sections[id] || TIER_REQUIREMENTS[id])
    .map((id) => {
      const requiredTier = TIER_REQUIREMENTS[id];
      const isUnlocked = !requiredTier || userTierMeetsRequirement(currentTier, requiredTier);
      return {
        id,
        label: SECTION_LABELS[id] || id,
        visible: isUnlocked,
      };
    });

  return (
    <>
      <Helmet>
        <title>{companyName} - Market Entry Report | Market Entry Secrets</title>
      </Helmet>

      <Navigation />
      <ReportHeader
        companyName={companyName}
        generatedAt={report.created_at}
        tier={report.tier_at_generation}
        perplexityUsed={perplexityUsed}
        reportId={report.id}
        shareToken={localShareToken ?? (report as any).share_token ?? null}
        onShareTokenChange={setLocalShareToken}
      />

      <main className="min-h-screen pt-6 pb-16 px-4">
        <div className="container mx-auto">
          <div className="flex gap-8">
            {/* Sidebar - desktop only */}
            <aside className="hidden lg:block w-56 shrink-0">
              <ReportSidebar sections={sidebarSections} />
            </aside>

            {/* Main content */}
            <div className="flex-1 max-w-3xl space-y-8">
              {SECTION_ORDER.map((sectionId) => {
                const section = sections[sectionId];
                const requiredTier = TIER_REQUIREMENTS[sectionId];

                // Dynamic tier check: use current subscription, not stale visible flag
                const isGated = requiredTier && !userTierMeetsRequirement(currentTier, requiredTier);

                // If section not generated and has tier requirement, show gated
                if (!section && requiredTier) {
                  return (
                    <ReportGatedSection
                      key={sectionId}
                      id={sectionId}
                      title={SECTION_LABELS[sectionId]}
                      requiredTier={requiredTier}
                    />
                  );
                }

                if (!section) return null;

                // If user's current tier is too low, show gated overlay
                if (isGated) {
                  return (
                    <ReportGatedSection
                      key={sectionId}
                      id={sectionId}
                      title={SECTION_LABELS[sectionId]}
                      requiredTier={requiredTier || 'growth'}
                    />
                  );
                }

                const sectionMatches = section.matches || matches[sectionId] || [];

                return (
                  <ReportSection
                    key={sectionId}
                    id={sectionId}
                    title={SECTION_LABELS[sectionId]}
                    content={section.content || ''}
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
                            blurred={match.blurred}
                            upgradeCta={match.upgrade_cta}
                            website={match.website}
                          />
                        ))}
                      </div>
                    )}
                  </ReportSection>
                );
              })}

              {/* Sources */}
              {perplexityCitations.length > 0 && (
                <ReportSources citations={perplexityCitations} />
              )}

              {/* Feedback */}
              <ReportFeedback
                reportId={report.id}
                existingScore={report.feedback_score}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ReportView;
