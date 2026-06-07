/**
 * Persona pick (entry screen). Routes tone, goal list, and every downstream
 * query. International is visually primary (≈98% of traffic) but both are one
 * tap. Mirrors reference_src/rc-persona.jsx.
 */
import type { ReportPersona } from '../intakeSchema.v2';
import { PERSONA_COPY, type PersonaCopy } from './rcData';
import { RcIcon } from './icons';

function PersonaCard({ p, onPick }: { p: PersonaCopy; onPick: (k: ReportPersona) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPick(p.key)}
      className="group relative flex flex-col rounded-2xl border border-rc-line bg-white p-6 text-left transition-all hover:border-rc-primary hover:shadow-rc-pop focus:outline-none focus-visible:border-rc-primary focus-visible:ring-4 focus-visible:ring-rc-sky-soft"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rc-sky-soft text-rc-primary transition-colors group-hover:bg-rc-primary group-hover:text-white">
          <RcIcon name={p.cardIcon} size={24} />
        </div>
        <span className="whitespace-nowrap rounded-full bg-rc-sky-soft px-2.5 py-1 text-[11px] font-semibold text-rc-primary-700">{p.badge}</span>
      </div>
      <h3 className="mt-4 text-[19px] font-bold text-rc-ink">{p.cardTitle}</h3>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-rc-body">{p.cardSub}</p>
      <div className="mt-5 flex items-center justify-between border-t border-rc-line/70 pt-4">
        <span className="whitespace-nowrap text-[13px] font-semibold text-rc-primary">Start here</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rc-canvas text-rc-primary transition-colors group-hover:bg-rc-primary group-hover:text-white">
          <RcIcon name="arrowRight" size={16} />
        </span>
      </div>
    </button>
  );
}

export function PersonaScreen({ onPick }: { onPick: (persona: ReportPersona) => void }) {
  const personas = [PERSONA_COPY.international, PERSONA_COPY.startup];
  return (
    <div className="mx-auto max-w-[760px]">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rc-sky-soft text-rc-primary">
          <RcIcon name="compass" size={24} />
        </div>
        <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-rc-primary">Choose your journey</p>
        <h1 className="mt-2 text-[26px] font-bold tracking-tight text-rc-ink sm:text-[34px]">
          What brings you to Australia?
        </h1>
        <p className="mx-auto mt-3 max-w-[320px] text-[15px] leading-relaxed text-rc-body sm:max-w-[480px] sm:text-[16px]">
          Your path shapes everything that follows — the goals we show, the matches we make, and how your report reads.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-5">
        {personas.map((p) => <PersonaCard key={p.key} p={p} onPick={onPick} />)}
      </div>

      <p className="mt-6 text-center text-[12.5px] text-rc-muted">
        You can switch journeys anytime — nothing is locked in.
      </p>
    </div>
  );
}
