/**
 * Review — Phase 2: read-only summary cards + the full ReportPreview rail, with
 * pencils that deep-link back to the relevant step. Phase 3 adds inline editing
 * of scalar rows and the AuthDialog restyle. Auth precedes generation (the CTA
 * opens auth when unauthenticated; the pipeline never runs unauthenticated).
 */
import { GOALS, type IntakeFormDataV2, type ReportPersona } from '../intakeSchema.v2';
import { PERSONA_COPY } from './rcData';
import { RcIcon } from './icons';
import { RcGhostButton, RcPrimaryButton, RcSavedPill } from './primitives';
import { ReportPreview } from './ReportPreview';

type ReviewStep = 'company' | 'goals' | 'details';

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="w-[92px] shrink-0 text-[12px] text-rc-muted">{label}</span>
      <span className="min-w-0 flex-1 text-[13.5px] font-medium text-rc-ink">{value || <span className="text-rc-muted/60">—</span>}</span>
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  if (!items.length) return <span className="text-[13px] text-rc-muted/60">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <span key={i} className="whitespace-nowrap rounded-full bg-rc-sky-soft px-2.5 py-0.5 text-[12px] font-medium text-rc-primary-700">{i}</span>
      ))}
    </div>
  );
}

function CardHeader({ title, onEdit }: { title: string; onEdit: () => void }) {
  return (
    <div className="mb-1 flex items-center justify-between">
      <h3 className="text-[13.5px] font-bold text-rc-ink">{title}</h3>
      <button
        type="button" onClick={onEdit}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-medium text-rc-primary hover:bg-rc-sky-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rc-primary"
      >
        <RcIcon name="pencil" size={13} /> Edit
      </button>
    </div>
  );
}

export function ReviewScreen({
  persona, form, isGenerating, onBack, onGenerate, goToStep,
}: {
  persona: ReportPersona;
  form: IntakeFormDataV2;
  isGenerating: boolean;
  onBack: () => void;
  onGenerate: () => void;
  goToStep: (step: ReviewStep) => void;
}) {
  const copy = PERSONA_COPY[persona];
  const tc = form.target_customers ?? { industries: [], named_companies: [], notes: '' };
  const goalLabels = GOALS.filter((g) => (form.goal_ids ?? []).includes(g.id)).map((g) => g.label);
  const customerBits = [tc.customer_type, tc.customer_size, tc.buying_motion].filter(Boolean) as string[];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
        {/* Summary cards */}
        <div className="order-2 space-y-4 lg:order-1">
          <div className="rounded-2xl border border-rc-line bg-white p-4 shadow-rc-card">
            <CardHeader title="Company details" onEdit={() => goToStep('company')} />
            <div className="divide-y divide-rc-line/70">
              <Row label="Company" value={form.company_name} />
              <Row label="Website" value={form.website_url} />
              <Row label="Country" value={form.country_of_origin} />
              <Row label="Stage" value={form.company_stage} />
              <Row label="Employees" value={form.employee_count} />
              {persona === 'startup' && <Row label="Revenue" value={form.revenue_stage} />}
              <div className="flex items-start gap-3 py-2">
                <span className="w-[92px] shrink-0 pt-0.5 text-[12px] text-rc-muted">Industry</span>
                <div className="min-w-0 flex-1"><Chips items={form.industry_sector ?? []} /></div>
              </div>
              <div className="flex items-start gap-3 py-2">
                <span className="w-[92px] shrink-0 pt-0.5 text-[12px] text-rc-muted">{copy.regionLabel}</span>
                <div className="min-w-0 flex-1"><Chips items={form.target_regions ?? []} /></div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-rc-line bg-white p-4 shadow-rc-card">
            <CardHeader title="Goals & context" onEdit={() => goToStep('goals')} />
            <div className="divide-y divide-rc-line/70">
              <div className="flex items-start gap-3 py-2">
                <span className="w-[92px] shrink-0 pt-0.5 text-[12px] text-rc-muted">Goals</span>
                <div className="min-w-0 flex-1"><Chips items={goalLabels} /></div>
              </div>
              <div className="flex items-start gap-3 py-2">
                <span className="w-[92px] shrink-0 pt-0.5 text-[12px] text-rc-muted">Sells to</span>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Chips items={customerBits} />
                  {(tc.industries ?? []).length > 0 && <Chips items={tc.industries} />}
                  {(tc.named_companies ?? []).length > 0 && <Chips items={tc.named_companies.map((c) => c.name)} />}
                  {tc.notes && <p className="text-[12.5px] italic text-rc-body">“{tc.notes}”</p>}
                </div>
              </div>
              {(form.known_competitors ?? []).length > 0 && (
                <div className="flex items-start gap-3 py-2">
                  <span className="w-[92px] shrink-0 pt-0.5 text-[12px] text-rc-muted">Competitors</span>
                  <div className="min-w-0 flex-1"><Chips items={(form.known_competitors ?? []).map((c) => c.name)} /></div>
                </div>
              )}
              <div className="flex items-start gap-3 py-2">
                <span className="w-[92px] shrink-0 pt-0.5 text-[12px] text-rc-muted">Challenges</span>
                <div className="min-w-0 flex-1"><Chips items={form.challenges?.tags ?? []} /></div>
              </div>
              <Row label="Focus" value={form.report_focus} />
              <div className="pt-2 text-right">
                <button
                  type="button" onClick={() => goToStep('details')}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-medium text-rc-primary hover:bg-rc-sky-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rc-primary"
                >
                  <RcIcon name="pencil" size={13} /> Edit customers & priorities
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live preview rail */}
        <div className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-6"><ReportPreview form={form} variant="rail" /></div>
        </div>
      </div>

      <div className="flex flex-col-reverse items-stretch gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <RcGhostButton onClick={onBack}>Back</RcGhostButton>
        <div className="flex items-center justify-end gap-3">
          <RcSavedPill />
          <RcPrimaryButton icon="sparkles" iconLeft="sparkles" onClick={onGenerate} disabled={isGenerating}>
            {isGenerating ? 'Generating…' : copy.generateCta}
          </RcPrimaryButton>
        </div>
      </div>
    </div>
  );
}
