/**
 * Live report preview (P1.3; reworked for honesty in MES-228 / PD-4).
 *
 * Goal picks shape emphasis and matching — they never add or remove sections
 * (the D2 decision, documented in goalServiceTags.ts). The old preview derived
 * pseudo-sections from goals with "N more to unlock" framing, promising sections
 * that don't exist under those names. Now the bar shows the selected focus areas
 * and the rail lists the real sections by their real names.
 *
 * Deliberately makes NO per-user completeness claim ("every section included" /
 * "nothing is removed"): tier gating (get_tier_gated_report) redacts three
 * sections to locked teasers for free viewers, so an absolute promise here would
 * over-sell. Tier depth/unlock messaging lives on the report itself (MES-193 /
 * report_teasers) and is intentionally not restated in the intake preview.
 */
import { GOALS, type IntakeFormDataV2 } from '../intakeSchema.v2';
import { SECTION_LABELS, SECTION_ORDER } from '@/components/report/reportSectionConfig';
import { RcIcon } from './icons';

type PreviewForm = Partial<IntakeFormDataV2>;

/** Real section labels, in report order — what a report actually contains. */
export function reportSectionLabels(): string[] {
  return SECTION_ORDER.map((s) => SECTION_LABELS[s] ?? s);
}

/** Focus areas implied by the selected goals (emphasis + matching, not inclusion). */
export function emphasisAreas(form: PreviewForm): string[] {
  const goalIds = form.goal_ids ?? [];
  const selected = GOALS.filter((g) => goalIds.includes(g.id));
  return [...new Set(selected.map((g) => g.unlocks))];
}

export function ReportPreview({
  form, variant,
}: { form: PreviewForm; variant: 'bar' | 'rail' }) {
  const focus = emphasisAreas(form);

  if (variant === 'bar') {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-rc-primary/20 bg-rc-sky-tint px-4 py-2.5">
        <span className="mt-0.5 shrink-0 text-rc-primary"><RcIcon name="sparkles" size={16} /></span>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-rc-ink">
            Your report, built around your goals
            <span className="font-normal text-rc-muted">
              {focus.length > 0 ? ` · ${focus.length} focus ${focus.length === 1 ? 'area' : 'areas'}` : ' · pick goals to focus it'}
            </span>
          </div>
          <div className="mt-1.5 hidden flex-wrap gap-1.5 sm:flex">
            {focus.slice(0, 7).map((s) => (
              <span key={s} className="whitespace-nowrap rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-medium text-rc-primary-700">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-rc-line bg-rc-canvas p-5">
      <div className="flex min-w-0 items-center gap-2">
        <span className="shrink-0 text-rc-primary"><RcIcon name="sparkles" size={16} /></span>
        <span className="min-w-0 flex-1 text-[13.5px] font-bold text-rc-ink">Your report will include</span>
      </div>
      <div className="mt-3 space-y-2">
        {reportSectionLabels().map((label) => (
          <div key={label} className="flex items-center gap-2 text-[13px] text-rc-body">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-emerald-500">
              <RcIcon name="check" size={14} />
            </span>
            {label}
          </div>
        ))}
      </div>
      <p className="mt-3 text-[12px] text-rc-muted">
        Your goal picks shape what each section emphasises and who we match you with.
      </p>
      <div className="mt-4 flex items-center gap-2 whitespace-nowrap border-t border-rc-line pt-4 text-[12px] text-rc-muted">
        <RcIcon name="clock" size={13} /> Generates in ~2–4 minutes
      </div>
    </div>
  );
}
