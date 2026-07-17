import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { trackFunnelEvent } from '@/lib/analytics/intakeFunnel';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { ReportHeader } from '@/components/report/ReportHeader';
import { ReportSidebar } from '@/components/report/ReportSidebar';
import { ReportSection } from '@/components/report/ReportSection';
import { ReportGatedSection } from '@/components/report/ReportGatedSection';
import { ReportRegenerateSection } from '@/components/report/ReportRegenerateSection';
import { ReportMatchCard } from '@/components/report/ReportMatchCard';
import { ExpandableCardGrid } from '@/components/report/ExpandableCardGrid';
import { LeadListRequestCard } from '@/components/report/LeadListRequestCard';
import { ReportFeedback } from '@/components/report/ReportFeedback';
import { ReportSources } from '@/components/report/ReportSources';
import { ReportBackToTop } from '@/components/report/ReportBackToTop';
import { ReportMobileTOC } from '@/components/report/ReportMobileTOC';
import { ReportKeyMetrics } from '@/components/report/ReportKeyMetrics';
import { SessionBookingBanner } from '@/components/report/SessionBookingBanner';
import { ReportUpgradeStrip } from '@/components/report/ReportUpgradeStrip';
import { ReportSectionRefinement, SECTION_REFINEMENT_SECTIONS } from '@/components/report/ReportSectionRefinement';
import { isFeatureEnabled } from '@/lib/featureFlags';
import { useReport } from '@/hooks/useReport';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { groupSectionCards } from '@/lib/reportCardGroups';
import {
  SECTION_LABELS,
  SECTION_ORDER,
  TIER_REQUIREMENTS,
  userTierMeetsRequirement,
  estimateReadingTime,
} from '@/components/report/reportSectionConfig';

const ReportViewInner = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const { data: report, isLoading, error } = useReport(reportId);
  const { subscription, refetch: refetchSubscription } = useSubscription();
  const currentTier = subscription?.tier || 'free';
  // T14: concierge refinement boxes on matched sections (flag `section_refinement`).
  const showRefinement = isFeatureEnabled('section_refinement');
  const [localShareToken, setLocalShareToken] = useState<string | null>(null);
  // Track if user arrived from Stripe (before we clean the URL params)
  const [cameFromStripe] = useState(
    () => new URLSearchParams(window.location.search).get('stripe_status') === 'success'
  );

  // Post-payment unlock progress: 'polling' while we wait for the Stripe
  // webhook to land, 'timeout' when the window elapses (manual refresh
  // offered), 'unlocked' once the tier flips.
  const [unlockState, setUnlockState] = useState<'idle' | 'polling' | 'timeout' | 'unlocked'>('idle');

  // Handle Stripe checkout return — poll for subscription update
  // because the webhook may not have processed yet when Stripe redirects.
  // Intentionally uses empty deps: runs once on mount using initial URL params.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const initialStatus = new URLSearchParams(window.location.search).get('stripe_status');
    if (!initialStatus) return;

    // Clean up URL params immediately
    navigate(`/report/${reportId}`, { replace: true });

    if (initialStatus === 'success') {
      toast.success('Payment successful! Unlocking your premium sections...');
      setUnlockState('polling');

      // Poll for subscription update — webhook may take a few seconds.
      // Compare against 'free' (default tier before purchase). ~30s window:
      // 15 attempts x 2s covers slow webhook delivery.
      let attempts = 0;
      let cancelled = false;
      const poll = async () => {
        if (cancelled) return;
        const newTier = await refetchSubscription();
        attempts++;
        if (cancelled) return;
        if (newTier && newTier !== 'free') {
          setUnlockState('unlocked');
          toast.success('Your premium sections are unlocked.');
        } else if (attempts < 15) {
          timerId = window.setTimeout(poll, 2000);
        } else {
          setUnlockState('timeout');
        }
      };
      // Start polling after a brief delay to give the webhook time
      let timerId = window.setTimeout(poll, 2000);

      // Cleanup: cancel outstanding timer if component unmounts
      return () => {
        cancelled = true;
        clearTimeout(timerId);
      };
    } else if (initialStatus === 'cancel') {
      toast.info('Checkout was cancelled. You can upgrade anytime.');
    }
  }, []);

  // Manual "refresh access" for when the webhook outlasts the polling window.
  const handleRefreshAccess = async () => {
    const newTier = await refetchSubscription();
    if (newTier && newTier !== 'free') {
      setUnlockState('unlocked');
      toast.success('Access refreshed — your premium sections are unlocked.');
    } else {
      toast.info('Payment is still processing. Give it a few more seconds and try again.');
    }
  };

  // When the tier flips to unlocked, the cached report_json is still the
  // pre-payment, server-stripped payload: get_tier_gated_report strips gated
  // sections by the caller's tier AT FETCH TIME (reportApi.fetchReport). Bumping
  // currentTier alone re-renders those sections as "unlocked but empty", which
  // falls into the legacy ReportRegenerateSection ("Generate a new report")
  // branch. Invalidate so the RPC re-runs at the new tier and the just-paid-for
  // sections render inline, no reload needed (MES-192, the concrete #45 case).
  // (T5a/MES-191 attaches the `checkout_completed` funnel event here once its
  // event taxonomy lands — deliberately not forked into this fix.)
  useEffect(() => {
    if (unlockState === 'unlocked' && reportId) {
      queryClient.invalidateQueries({ queryKey: ['report', reportId] });
    }
  }, [unlockState, reportId, queryClient]);

  // T5a (MES-191) funnel events. report_viewed fires once per report open;
  // checkout_completed fires once when the post-payment tier flip lands (a Stripe
  // return lands on ONE surface, so this + PaymentStatusModal never double-count
  // a single checkout). Fire-and-forget; no PII in the payload.
  const viewedRef = useRef<string | null>(null);
  useEffect(() => {
    const rid = (report as { id?: string } | undefined)?.id;
    if (rid && viewedRef.current !== rid) {
      viewedRef.current = rid;
      trackFunnelEvent('report_viewed', {
        source: 'report',
        user_id: user?.id ?? null,
        metadata: { tier: (report as { tier_at_generation?: string } | undefined)?.tier_at_generation ?? null },
      });
    }
  }, [report, user]);

  const checkoutTrackedRef = useRef(false);
  useEffect(() => {
    if (unlockState === 'unlocked' && !checkoutTrackedRef.current) {
      checkoutTrackedRef.current = true;
      trackFunnelEvent('checkout_completed', {
        source: 'report',
        user_id: user?.id ?? null,
        metadata: { tier: currentTier },
      });
    }
  }, [unlockState, user, currentTier]);

  // Wait for auth to settle before showing report (especially after Stripe redirect)
  if (isLoading || (authLoading && cameFromStripe)) {
    return (
      <>
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

  // If user arrived from Stripe but isn't signed in, show a helpful message
  // instead of the generic "Report Not Found"
  if ((error || !report) && cameFromStripe && !user) {
    return (
      <>
        <main className="min-h-screen pt-20 pb-16 px-4">
          <div className="container mx-auto text-center py-20">
            <h1 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground mb-4">
              Please sign in to view your upgraded report.
            </p>
          </div>
        </main>
      </>
    );
  }

  if (error || !report) {
    return (
      <>
        <main className="min-h-screen pt-20 pb-16 px-4">
          <div className="container mx-auto text-center py-20">
            <h1 className="text-2xl font-bold text-foreground mb-2">Report Not Found</h1>
            <p className="text-muted-foreground">This report doesn't exist or you don't have access.</p>
          </div>
        </main>
      </>
    );
  }

  const reportJson = report.report_json as any;
  const sections = reportJson?.sections || {};
  const companyName = reportJson?.company_name || 'Market Entry Report';
  const matches = reportJson?.matches || {};
  const perplexityCitations = reportJson?.metadata?.perplexity_citations || [];
  const perplexityUsed = reportJson?.metadata?.perplexity_used || false;
  const keyMetrics = reportJson?.metadata?.key_metrics || [];
  const readingTime = estimateReadingTime(sections);

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

      <ReportHeader
        companyName={companyName}
        generatedAt={report.created_at}
        tier={report.tier_at_generation}
        perplexityUsed={perplexityUsed}
        reportId={report.id}
        shareToken={localShareToken ?? (report as any).share_token ?? null}
        onShareTokenChange={setLocalShareToken}
        readingTimeMinutes={readingTime}
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
              {unlockState === 'polling' && (
                <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                  <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-b-2 border-primary" />
                  <p className="text-sm text-foreground">
                    Payment received — still unlocking your premium sections. This usually takes a few seconds.
                  </p>
                </div>
              )}
              {unlockState === 'timeout' && (
                <div className="flex flex-col gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-foreground">
                    Your payment went through, but access is taking longer than usual to activate.
                  </p>
                  <Button variant="outline" size="sm" className="shrink-0" onClick={handleRefreshAccess}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh access
                  </Button>
                </div>
              )}

              {/* Advisor-session booking for entitled paid users (MES-196 / T13).
                  Entitlement-driven: renders nothing for free users. */}
              <SessionBookingBanner />

              {/* Key Metrics stat cards — only for new reports with metrics */}
              <ReportKeyMetrics metrics={keyMetrics} />

              {/* Prominent one-click feedback at report open (T5a / MES-191).
                  The fuller notes widget stays at the report footer. */}
              <ReportFeedback
                variant="prominent"
                reportId={report.id}
                existingScore={report.feedback_score}
              />

              {SECTION_ORDER.map((sectionId) => {
                const section = sections[sectionId];
                const requiredTier = TIER_REQUIREMENTS[sectionId];
                const isGated = requiredTier && !userTierMeetsRequirement(currentTier, requiredTier);
                const hasContent = section?.content && section.content.trim().length > 0;

                // Case 1: Section requires a tier the user doesn't have → show upgrade prompt
                if (isGated) {
                  return (
                    <ReportGatedSection
                      key={sectionId}
                      id={sectionId}
                      title={SECTION_LABELS[sectionId]}
                      requiredTier={requiredTier || 'growth'}
                      teaser={(section as { teaser?: { count: number; samples: Array<Record<string, unknown>> } } | undefined)?.teaser}
                    />
                  );
                }

                // Case 2 (LEGACY): Section is unlocked but has no content. New
                // reports never hit this — generate-report now stores gated
                // content with visible:false so an upgrade unlocks inline.
                // This branch remains for reports generated before that fix.
                if (requiredTier && !hasContent) {
                  return (
                    <ReportRegenerateSection
                      key={sectionId}
                      id={sectionId}
                      title={SECTION_LABELS[sectionId]}
                    />
                  );
                }

                // Case 3: No section data and no tier requirement → skip
                if (!section) return null;

                // Case 4: Section is unlocked with content → render normally
                const sectionMatches = section.matches || matches[sectionId] || [];

                const renderCardGrid = (items: any[], groupLabel?: string) => (
                  <ExpandableCardGrid
                    items={items}
                    label={groupLabel?.toLowerCase() || 'matches'}
                    renderItem={(match: any) => (
                      <ReportMatchCard
                        name={match.name}
                        subtitle={match.subtitle || match.category || match.location}
                        tags={match.tags || match.services?.slice(0, 3)}
                        link={match.link}
                        linkLabel={match.linkLabel}
                        blurred={match.blurred}
                        upgradeCta={match.upgrade_cta}
                        requiredTier={requiredTier || undefined}
                        website={match.website}
                        source={match.source}
                      />
                    )}
                  />
                );

                // Sections that mix entity types (service providers + agencies +
                // hubs; events + resources; datasets + contacts) render one
                // sub-headed grid per type instead of a single jumbled grid (B9).
                const cardGroups = groupSectionCards(sectionId, sectionMatches);
                const renderMatchArea = () => {
                  if (sectionMatches.length === 0) return null;
                  if (!cardGroups || cardGroups.length <= 1) return renderCardGrid(sectionMatches);
                  return (
                    <div className="space-y-6">
                      {cardGroups.map((group) => (
                        <div key={group.key}>
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                              {group.label}
                            </span>
                            <div className="flex-1 border-t border-border" />
                          </div>
                          {renderCardGrid(group.items, group.label)}
                        </div>
                      ))}
                    </div>
                  );
                };

                // Lead-list section: offer a custom-list request (P1-D). When the
                // ICP gate left no lists, the request box is the section's primary
                // CTA — surface it right under the "no match" message (Floats2 review
                // item 3), not buried below all the prose. When lists DID match, it's
                // a quiet "need a different list?" box under the datasets.
                const leadEmpty = sectionId === 'lead_list' && sectionMatches.length === 0;
                const leadRequest =
                  sectionId === 'lead_list' ? (
                    <div className="mt-6">
                      <LeadListRequestCard reportId={report.id} emptyState={leadEmpty} />
                    </div>
                  ) : null;

                // T14: refinement box on matched mentor/investor sections (only
                // when there are matches to refine), behind `section_refinement`.
                const refinement =
                  showRefinement &&
                  SECTION_REFINEMENT_SECTIONS.includes(sectionId) &&
                  sectionMatches.length > 0 ? (
                    <ReportSectionRefinement sectionKey={sectionId} reportId={report.id} />
                  ) : null;

                return (
                  <ReportSection
                    key={sectionId}
                    id={sectionId}
                    title={SECTION_LABELS[sectionId]}
                    content={section.content || ''}
                    citations={perplexityCitations}
                    hideMatchLabel={leadEmpty}
                  >
                    {renderMatchArea()}
                    {leadRequest}
                    {refinement}
                  </ReportSection>
                );
              })}

              {perplexityCitations.length > 0 && (
                <ReportSources citations={perplexityCitations} />
              )}

              <ReportFeedback
                reportId={report.id}
                existingScore={report.feedback_score}
              />

              {/* End-of-report free-vs-paid comparison (MES-188 T5b, behind
                  `comparison_moments`). Self-gates: renders nothing for the flag
                  off or a viewer who already has every section. */}
              <ReportUpgradeStrip currentTier={currentTier} />
            </div>
          </div>
        </div>
      </main>

      {/* Floating utilities */}
      <ReportBackToTop />
      <ReportMobileTOC sections={sidebarSections} />

    </>
  );
};

const ReportView = () => (
  <ProtectedRoute fallbackMessage="Please sign in to view your report.">
    <ReportViewInner />
  </ProtectedRoute>
);

export default ReportView;
