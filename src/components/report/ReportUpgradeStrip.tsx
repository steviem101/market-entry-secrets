/**
 * End-of-report free-vs-paid comparison strip (MES-188 T5b).
 *
 * A single consolidated "comparison moment" at the foot of a report: after the
 * reader has their free report, it names what they already have and what an
 * upgrade unlocks — the sections gated ABOVE their current tier only. Behind the
 * `comparison_moments` flag (default off) and self-gating: renders nothing when
 * the flag is off, or when the viewer already has every section (top tier).
 *
 * Complements the per-section ReportGatedSection prompts (which drive the direct
 * per-tier checkout); this strip is the summary + "compare plans" path, so it
 * never duplicates the inline checkout logic. Truthful + config-driven from
 * reportSectionConfig (the mirror of the server report_templates split).
 */
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isFeatureEnabled } from '@/lib/featureFlags';
import { trackFunnelEvent } from '@/lib/analytics/intakeFunnel';
import { splitSectionsByTier, lockedByTier } from '@/lib/comparisonMoments';
import {
  SECTION_ORDER, TIER_REQUIREMENTS, SECTION_LABELS, TIER_LABELS, TIER_HIERARCHY,
  userTierMeetsRequirement,
} from './reportSectionConfig';

// Static split — the tier config doesn't change at runtime.
const SPLIT = splitSectionsByTier(SECTION_ORDER, TIER_REQUIREMENTS, SECTION_LABELS, TIER_LABELS);

export const ReportUpgradeStrip = ({ currentTier }: { currentTier: string }) => {
  const navigate = useNavigate();
  const show = isFeatureEnabled('comparison_moments');
  // Only the sections gated above the viewer's own tier — what an upgrade adds.
  const lockedForUser = SPLIT.locked.filter((s) => !userTierMeetsRequirement(currentTier, s.tier));
  const groups = lockedByTier(lockedForUser, TIER_HIERARCHY);
  const active = show && lockedForUser.length > 0;
  // Sections the viewer already has, derived from their ACTUAL tier — not a
  // static free-tier count. The strip renders for any viewer with locked
  // sections above their tier (incl. paid Growth), so the lead-in must not
  // claim "your free report" to a paying customer.
  const totalSections = SECTION_ORDER.length;
  const unlockedForUser = totalSections - lockedForUser.length;

  const impressionRef = useRef(false);
  useEffect(() => {
    if (!active || impressionRef.current) return;
    impressionRef.current = true;
    trackFunnelEvent('gate_impression', {
      source: 'report_end',
      metadata: { locked: lockedForUser.length, tier: currentTier },
    });
  }, [active, lockedForUser.length, currentTier]);

  if (!active) return null;

  const handleCompare = () => {
    trackFunnelEvent('gate_click', { source: 'report_end', metadata: { tier: currentTier } });
    navigate('/pricing');
  };

  return (
    <section className="rounded-xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
      <h3 className="text-lg font-semibold text-foreground">Unlock the rest of your report</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        You&rsquo;ve unlocked {unlockedForUser} of {totalSections} sections. Upgrading adds{' '}
        {lockedForUser.length} more, matched to your situation:
      </p>

      <ul className="mt-4 space-y-2">
        {groups.flatMap((g) =>
          g.sections.map((s) => (
            <li key={s.key} className="flex items-center gap-2.5 text-sm text-foreground">
              <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1">{s.label}</span>
              <span className="rounded-full border border-primary/20 bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {s.tierLabel}
              </span>
            </li>
          )),
        )}
      </ul>

      <p className="mt-4 text-xs text-muted-foreground">
        One-time upgrade — no subscription. {TIER_LABELS.growth} and {TIER_LABELS.scale} unlock more of the report.
      </p>

      <Button className="mt-3 gap-2" onClick={handleCompare}>
        Compare plans
        <ArrowRight className="h-4 w-4" />
      </Button>
    </section>
  );
};
