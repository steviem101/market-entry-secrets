/**
 * Step shell — page header + 4-node stepper + the step card (icon, title, sub),
 * with the persistent persona toggle (top-right) and the "Saved" pill on every
 * step. Mirrors reference_src/rc-flow.jsx StepShell + PersonaToggle (the
 * prototype's dark control bar / Tweaks panel are intentionally NOT ported).
 */
import type { ReactNode } from 'react';
import type { ReportPersona } from '../intakeSchema.v2';
import { PERSONA_COPY } from './rcData';
import { RcIcon } from './icons';
import { RcIconBadge, RcStepper, RcSavedPill } from './primitives';

const STEP_TITLES = (persona: ReportPersona) => {
  const copy = PERSONA_COPY[persona];
  return [copy.step1Title, copy.step2Title, 'Your customers & priorities', 'Review & generate'];
};
const STEP_SUBS = (persona: ReportPersona) => {
  const copy = PERSONA_COPY[persona];
  return [
    copy.step1Sub,
    'Pick what you want — each goal adds a section.',
    'Who you sell to, and what to prioritise.',
    "Tweak anything inline, then we'll build it.",
  ];
};
const STEP_ICONS = ['building', 'target', 'users', 'sparkles'];

function PersonaToggle({
  persona, onSwitch,
}: { persona: ReportPersona; onSwitch: (p: ReportPersona) => void }) {
  return (
    <div role="group" aria-label="Report journey" className="inline-flex rounded-full border border-rc-line bg-rc-canvas p-0.5 text-[12px] font-semibold">
      {(['international', 'startup'] as ReportPersona[]).map((p) => {
        const active = persona === p;
        return (
          <button
            key={p}
            type="button"
            aria-pressed={active}
            onClick={() => onSwitch(p)}
            className={`flex h-7 items-center gap-1.5 whitespace-nowrap rounded-full px-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rc-primary ${
              active ? 'bg-white text-rc-primary shadow-sm' : 'text-rc-muted'
            }`}
          >
            <RcIcon name={PERSONA_COPY[p].cardIcon} size={13} />
            <span className="hidden sm:inline">{p === 'international' ? 'International' : 'Startup'}</span>
          </button>
        );
      })}
    </div>
  );
}

export function StepShell({
  persona, stepIndex, onSwitchPersona, children,
}: {
  persona: ReportPersona;
  stepIndex: number;
  onSwitchPersona: (p: ReportPersona) => void;
  children: ReactNode;
}) {
  const copy = PERSONA_COPY[persona];
  const steps = ['Company', 'Goals', 'Details', 'Review'];
  const title = STEP_TITLES(persona)[stepIndex];
  const sub = STEP_SUBS(persona)[stepIndex];
  const icon = STEP_ICONS[stepIndex] || 'building';

  return (
    <div className="mx-auto max-w-[420px] px-4 py-6 sm:max-w-[920px] sm:px-6 sm:py-9">
      <div className="mb-6 text-center">
        <h1 className="text-[24px] font-bold tracking-tight text-rc-ink sm:text-[32px]">{copy.pageTitle}</h1>
        <p className="mx-auto mt-2 max-w-[340px] text-[13.5px] leading-relaxed text-rc-muted sm:max-w-[560px] sm:text-[15px]">{copy.pageSub}</p>
      </div>

      <div className="mb-7"><RcStepper steps={steps} current={stepIndex} /></div>

      <div className="rounded-2xl border border-rc-line bg-white p-4 shadow-rc-card sm:p-7">
        <div className="mb-5 flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <RcIconBadge name={icon} />
            <div>
              <h2 className="text-[18px] font-bold text-rc-ink sm:text-[20px]">{title}</h2>
              <p className="text-[13px] text-rc-muted">{sub}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:mt-1 sm:self-auto">
            <RcSavedPill />
            <PersonaToggle persona={persona} onSwitch={onSwitchPersona} />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
