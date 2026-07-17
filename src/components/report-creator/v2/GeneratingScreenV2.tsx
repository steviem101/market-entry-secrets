/**
 * Generating overlay (v2) — an HONEST indeterminate state. Shows a real elapsed
 * timer, the live status line from the generation hook, the pipeline's phase
 * list, and a rotating tip. It does NOT fake per-phase completion: real
 * streaming progress needs pipeline instrumentation (Phase 5 / P2.1). Until
 * then the phases read as "what's happening", not a ticked checklist.
 *
 * MES-188 T5b (behind `comparison_moments`, default off): a free-vs-paid
 * comparison panel fills the 2–4 min wait and sets up the upgrade moment. It is
 * config-driven (reportSectionConfig → the server's report_templates split), so
 * it stays truthful — no faked live match counts.
 */
import { useEffect, useRef, useState } from 'react';
import { RcIcon } from './icons';
import { isFeatureEnabled } from '@/lib/featureFlags';
import { trackFunnelEvent } from '@/lib/analytics/intakeFunnel';
import { splitSectionsByTier, lockedByTier } from '@/lib/comparisonMoments';
import {
  SECTION_ORDER, TIER_REQUIREMENTS, SECTION_LABELS, TIER_LABELS, TIER_HIERARCHY,
} from '@/components/report/reportSectionConfig';

// Computed once — the tier config is static. Truthful free-vs-paid split.
const SPLIT = splitSectionsByTier(SECTION_ORDER, TIER_REQUIREMENTS, SECTION_LABELS, TIER_LABELS);
const LOCKED_GROUPS = lockedByTier(SPLIT.locked, TIER_HIERARCHY);

const PHASES = [
  'Reading your website & competitors',
  'Running live market research',
  'Matching providers, mentors & events',
  'Writing & polishing your report',
];

const TIPS = [
  'Reports cite real sources — you can verify every figure.',
  'Tip: upgrade anytime to unlock SWOT, competitor and lead sections.',
  'We match against vetted Australian providers, mentors and events.',
  'The more specific your buyer, the sharper your go-to-market plan.',
];

function mmss(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function GeneratingScreenV2({
  isVisible, statusMessage,
}: { isVisible: boolean; statusMessage?: string }) {
  const [elapsed, setElapsed] = useState(0);
  const [tip, setTip] = useState(0);
  const showComparison = isFeatureEnabled('comparison_moments');
  const impressionFired = useRef(false);

  useEffect(() => {
    if (!isVisible) return;
    setElapsed(0);
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [isVisible]);

  // Log one comparison impression per generation when the panel is shown.
  useEffect(() => {
    if (!isVisible) { impressionFired.current = false; return; }
    if (showComparison && !impressionFired.current) {
      impressionFired.current = true;
      trackFunnelEvent('gate_impression', {
        source: 'generating_screen',
        metadata: { free: SPLIT.free.length, locked: SPLIT.locked.length },
      });
    }
  }, [isVisible, showComparison]);

  useEffect(() => {
    if (!isVisible) return;
    const t = setInterval(() => setTip((i) => (i + 1) % TIPS.length), 5000);
    return () => clearInterval(t);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-rc-ink/40 px-4 backdrop-blur-sm"
      role="dialog" aria-modal="true" aria-label="Building your report"
    >
      <div className="w-full max-w-[420px] rounded-2xl border border-rc-line bg-white p-6 shadow-rc-pop sm:p-7">
        <div className="flex flex-col items-center text-center">
          <div className="relative flex h-14 w-14 items-center justify-center">
            <span className="absolute inset-0 animate-spin rounded-full border-2 border-rc-sky-soft border-t-rc-primary" />
            <RcIcon name="sparkles" size={22} className="text-rc-primary" />
          </div>
          <h2 className="mt-4 text-[20px] font-bold text-rc-ink">Building your report</h2>
          <p className="mt-1 text-[13px] text-rc-muted">Usually 2–4 minutes · {mmss(elapsed)} elapsed</p>
        </div>

        {statusMessage && (
          <p className="mt-4 rounded-xl bg-rc-sky-tint px-3 py-2 text-center text-[12.5px] font-medium text-rc-primary-700">
            {statusMessage}
          </p>
        )}

        <ul className="mt-5 space-y-2.5">
          {PHASES.map((p) => (
            <li key={p} className="flex items-center gap-2.5 text-[13px] text-rc-body">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                <span className="h-2 w-2 animate-pulse rounded-full bg-rc-primary/60" />
              </span>
              {p}
            </li>
          ))}
        </ul>

        {showComparison && (
          <div className="mt-5 border-t border-rc-line pt-4">
            <p className="text-[12px] font-semibold text-rc-ink">
              In your free report
              <span className="ml-1 font-normal text-rc-muted">· {SPLIT.free.length} sections</span>
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {SPLIT.free.map((s) => (
                <li
                  key={s.key}
                  className="inline-flex items-center gap-1 rounded-full bg-rc-sky-tint px-2 py-0.5 text-[11px] text-rc-primary-700"
                >
                  <RcIcon name="check" size={11} className="shrink-0 text-rc-primary" />
                  {s.label}
                </li>
              ))}
            </ul>

            {LOCKED_GROUPS.length > 0 && (
              <>
                <p className="mt-3 text-[12px] font-semibold text-rc-ink">Unlock with an upgrade</p>
                <ul className="mt-2 space-y-1.5">
                  {LOCKED_GROUPS.flatMap((g) =>
                    g.sections.map((s) => (
                      <li key={s.key} className="flex items-center gap-2 text-[12px] text-rc-body">
                        <RcIcon name="lock" size={12} className="shrink-0 text-rc-muted" />
                        <span className="flex-1">{s.label}</span>
                        <span className="rounded-full border border-rc-line px-1.5 py-0.5 text-[10px] font-medium text-rc-muted">
                          {s.tierLabel}
                        </span>
                      </li>
                    )),
                  )}
                </ul>
              </>
            )}
          </div>
        )}

        <div className="mt-5 flex items-start gap-2 border-t border-rc-line pt-4 text-[12px] text-rc-muted">
          <RcIcon name="lightbulb" size={14} className="mt-0.5 shrink-0 text-rc-primary" />
          <span>{TIPS[tip]}</span>
        </div>
      </div>
    </div>
  );
}
