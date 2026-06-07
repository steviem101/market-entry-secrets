/**
 * Live "your report will include" preview (P1.3). Derives sections from current
 * form state. Rendered as a compact `bar` on Steps 2 & 3 and a full `rail` on
 * Review. Logic mirrors reference_src/rc-ui.jsx (reportSections / ReportPreview),
 * adapted to the real v2 schema shape (challenges.tags, target_customers, …).
 */
import { GOALS, type IntakeFormDataV2 } from '../intakeSchema.v2';
import { RcIcon } from './icons';

type PreviewForm = Partial<IntakeFormDataV2>;

interface PreviewSection { label: string; on: boolean }

export function reportSections(form: PreviewForm): PreviewSection[] {
  const goalIds = form.goal_ids ?? [];
  const selectedGoals = GOALS.filter((g) => goalIds.includes(g.id));
  const tc = form.target_customers ?? ({} as NonNullable<PreviewForm['target_customers']>);
  const competitors = form.known_competitors ?? [];
  const challengeTags = form.challenges?.tags ?? [];
  const industries = form.industry_sector ?? [];

  const base: PreviewSection[] = [
    { label: 'Executive summary', on: true },
    { label: 'Market landscape', on: industries.length > 0 },
    ...[...new Set(selectedGoals.map((g) => g.unlocks))].map((s) => ({ label: s, on: true })),
    { label: 'Competitor landscape', on: competitors.some((c) => c.name || c.website) },
    { label: 'SWOT & risks', on: challengeTags.length > 0 },
    {
      label: 'Lead List',
      on: !!tc.customer_type
        || (tc.industries ?? []).length > 0
        || (tc.named_companies ?? []).some((c) => c.name),
    },
    { label: '90-day action plan', on: true },
  ];

  const seen = new Set<string>();
  return base.filter((s) => (seen.has(s.label) ? false : (seen.add(s.label), true)));
}

export function ReportPreview({
  form, variant,
}: { form: PreviewForm; variant: 'bar' | 'rail' }) {
  const sections = reportSections(form);
  const unlocked = sections.filter((s) => s.on);
  const off = sections.length - unlocked.length;

  if (variant === 'bar') {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-rc-primary/20 bg-rc-sky-tint px-4 py-2.5">
        <span className="mt-0.5 shrink-0 text-rc-primary"><RcIcon name="sparkles" size={16} /></span>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-rc-ink">
            {unlocked.length} report sections ready
            {off > 0 && <span className="font-normal text-rc-muted"> · {off} more to unlock</span>}
          </div>
          <div className="mt-1.5 hidden flex-wrap gap-1.5 sm:flex">
            {unlocked.slice(0, 7).map((s) => (
              <span key={s.label} className="whitespace-nowrap rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-medium text-rc-primary-700">
                {s.label}
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
        {sections.map((s) => (
          <div key={s.label} className={`flex items-center gap-2 text-[13px] ${s.on ? 'text-rc-body' : 'text-rc-muted/50'}`}>
            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${s.on ? 'text-emerald-500' : 'text-rc-muted/30'}`}>
              <RcIcon name={s.on ? 'check' : 'plus'} size={14} />
            </span>
            {s.label}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 whitespace-nowrap border-t border-rc-line pt-4 text-[12px] text-rc-muted">
        <RcIcon name="clock" size={13} /> Generates in ~2–4 minutes
      </div>
    </div>
  );
}
