/**
 * Step 2 — Goals. Goal cards grouped under quiet category labels, a live
 * ReportPreview bar, and a sticky "Continue with N →" action bar so
 * default-accepters never scroll past every category. Mirrors
 * reference_src/rc-step2.jsx Step2Goals.
 */
import { GOALS, GOAL_CATEGORIES } from '../intakeSchema.v2';
import type { StepProps } from './types';
import { RcIcon } from './icons';
import { RcGoalCard, RcGhostButton, RcPrimaryButton, RcSectionLabel } from './primitives';
import { ReportPreview } from './ReportPreview';

export function Step2Goals({ persona, form, set, onNext, onBack }: StepProps) {
  const goals = GOALS.filter((g) => g.personas.includes(persona));
  const cats = GOAL_CATEGORIES.filter((c) => goals.some((g) => g.category === c.id));
  const selected = form.goal_ids ?? [];

  function toggleGoal(id: string) {
    set({ goal_ids: selected.includes(id) ? selected.filter((g) => g !== id) : [...selected, id] });
  }

  return (
    <div className="space-y-5">
      <ReportPreview form={form} variant="bar" />

      <div className="space-y-4">
        <RcSectionLabel icon="target" tag="Required" hint="Select all that apply — each one shapes what your report focuses on.">
          What do you want from this report?
        </RcSectionLabel>

        {cats.map((cat) => {
          const inCat = goals.filter((g) => g.category === cat.id);
          if (!inCat.length) return null;
          return (
            <div key={cat.id} className="space-y-2">
              <div className="flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wide text-rc-muted">
                <RcIcon name={cat.icon} size={13} /> {cat.label}
              </div>
              <div role="group" aria-label={cat.label} className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {inCat.map((g) => (
                  <RcGoalCard key={g.id} goal={g} active={selected.includes(g.id)} onClick={() => toggleGoal(g.id)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 -mx-4 mt-2 bg-gradient-to-t from-white via-white to-transparent px-4 pb-1 pt-3 sm:-mx-7 sm:px-7">
        <div className="flex items-center justify-between gap-3">
          <RcGhostButton onClick={onBack}>Back</RcGhostButton>
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden whitespace-nowrap text-[12.5px] text-rc-muted sm:inline">{selected.length} selected</span>
            <RcPrimaryButton icon={null} onClick={onNext} disabled={!selected.length}>
              {selected.length ? `Continue with ${selected.length} →` : 'Pick a goal to continue'}
            </RcPrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
