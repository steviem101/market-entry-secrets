/**
 * Generating overlay (v2) — an HONEST indeterminate state. Shows a real elapsed
 * timer, the live status line from the generation hook, the pipeline's phase
 * list, and a rotating tip. It does NOT fake per-phase completion: real
 * streaming progress needs pipeline instrumentation (Phase 5 / P2.1). Until
 * then the phases read as "what's happening", not a ticked checklist.
 */
import { useEffect, useState } from 'react';
import { RcIcon } from './icons';

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

  useEffect(() => {
    if (!isVisible) return;
    setElapsed(0);
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    const t = setInterval(() => setTip((i) => (i + 1) % TIPS.length), 5000);
    return () => clearInterval(t);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-rc-ink/40 px-4 backdrop-blur-sm font-rc"
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

        <div className="mt-5 flex items-start gap-2 border-t border-rc-line pt-4 text-[12px] text-rc-muted">
          <RcIcon name="lightbulb" size={14} className="mt-0.5 shrink-0 text-rc-primary" />
          <span>{TIPS[tip]}</span>
        </div>
      </div>
    </div>
  );
}
