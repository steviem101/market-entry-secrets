/**
 * Review — 2-col on desktop (summary cards + sticky live ReportPreview rail),
 * stacked on mobile. Scalar rows are inline-editable in place; chip-group rows
 * show pills + a pencil that deep-links back to the relevant step. A green
 * "Saved" pill sits beside the CTA. Auth precedes generation (the CTA opens the
 * AuthDialog when unauthenticated — the pipeline never runs unauthenticated).
 */
import { useEffect, useState, type ReactNode } from 'react';
import {
  GOALS, COUNTRY_OPTIONS, STAGE_OPTIONS, EMPLOYEE_OPTIONS, REVENUE_STAGE_OPTIONS,
  TIMELINE_OPTIONS, BUDGET_OPTIONS,
  type IntakeFormDataV2, type ReportPersona,
} from '../intakeSchema.v2';
import { PERSONA_COPY } from './rcData';
import { RcIcon } from './icons';
import {
  RcGhostButton, RcPrimaryButton, RcSavedPill, RcTextInput, RcSelect, RcRadioChipGroup,
} from './primitives';
import { ReportPreview } from './ReportPreview';
import type { SetPatch } from './types';

type ReviewStep = 'company' | 'goals' | 'details';

// ── Inline-editable scalar row ──────────────────────────────────────────────
function InlineScalar({
  label, value, onSave, type = 'text', options, placeholder,
}: {
  label: string;
  value?: string;
  onSave: (v: string) => void;
  type?: 'text' | 'select';
  options?: readonly string[];
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  useEffect(() => { if (!editing) setDraft(value ?? ''); }, [value, editing]);

  function save() { onSave(draft.trim()); setEditing(false); }
  function cancel() { setDraft(value ?? ''); setEditing(false); }

  return (
    <div className="flex items-center gap-3 py-2">
      <span className="w-[92px] shrink-0 text-[12px] text-rc-muted">{label}</span>
      {editing ? (
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="min-w-0 flex-1">
            {type === 'select' && options ? (
              // Selects auto-commit on change — picking from a dropdown is the
              // confirmation. Cancel button reverts.
              <RcSelect
                value={draft}
                onChange={(v) => { setDraft(v); onSave(v.trim()); setEditing(false); }}
                options={options}
                placeholder={placeholder ?? `Select ${label.toLowerCase()}`}
                ariaLabel={label}
              />
            ) : (
              <RcTextInput
                value={draft} onChange={setDraft} ariaLabel={label} placeholder={placeholder}
                onBlur={save}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); save(); } if (e.key === 'Escape') cancel(); }}
              />
            )}
          </div>
          <button type="button" onClick={save} aria-label="Save" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rc-primary text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rc-primary">
            <RcIcon name="check" size={16} />
          </button>
          <button
            type="button"
            // Prevent the input's blur-save from firing before the cancel click
            // when the user mousedowns on this button.
            onMouseDown={(e) => e.preventDefault()}
            onClick={cancel}
            aria-label="Cancel"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-rc-line text-rc-muted hover:bg-rc-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rc-primary"
          >
            <RcIcon name="x" size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button" onClick={() => setEditing(true)}
          aria-label={`Edit ${label}`}
          className="group flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-0.5 text-left hover:bg-rc-sky-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rc-primary"
        >
          <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-rc-ink">{value || <span className="text-rc-muted/60">Add {label.toLowerCase()}</span>}</span>
          {/* Always-visible (subtle) affordance so keyboard / non-mouse users can see the row is editable. */}
          <RcIcon name="pencil" size={13} className="shrink-0 text-rc-muted/60 transition-colors group-hover:text-rc-primary" />
        </button>
      )}
    </div>
  );
}

// ── Chip-group row (read-only here; pencil deep-links to its step) ───────────
function ChipRow({ label, items, onEdit }: { label: string; items: string[]; onEdit: () => void }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="w-[92px] shrink-0 pt-1 text-[12px] text-rc-muted">{label}</span>
      <div className="min-w-0 flex-1">
        {items.length ? (
          <div className="flex flex-wrap gap-1.5">
            {items.map((i) => (
              <span key={i} className="whitespace-nowrap rounded-full bg-rc-sky-soft px-2.5 py-0.5 text-[12px] font-medium text-rc-primary-700">{i}</span>
            ))}
          </div>
        ) : <span className="text-[13px] text-rc-muted/60">—</span>}
      </div>
      <button
        type="button" onClick={onEdit} aria-label={`Edit ${label}`}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-rc-muted hover:bg-rc-sky-soft hover:text-rc-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rc-primary"
      >
        <RcIcon name="pencil" size={13} />
      </button>
    </div>
  );
}

// ── Single-select chip row (interactive; optional — re-tap the active chip to clear) ──
// MES-235: timeline & budget were captured by the v2 schema but no screen collected
// them, so generate-report always saw '' → "Not specified" — yet {{timeline}} feeds 3
// live templates and {{budget_level}} feeds 4 (incl. both money sections). Restored here
// as optional chips (v2 parity); they already flow to the columns + template vars.
function ChipSelectRow({
  label, options, value, onChange,
}: {
  label: string; options: readonly string[]; value?: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="w-[92px] shrink-0 pt-1 text-[12px] text-rc-muted">{label}</span>
      <div className="min-w-0 flex-1">
        <RcRadioChipGroup label={label} options={options} value={value ?? ''} onChange={onChange} />
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-rc-line bg-white p-4 shadow-rc-card">
      <h3 className="mb-1 text-[13.5px] font-bold text-rc-ink">{title}</h3>
      <div className="divide-y divide-rc-line/70">{children}</div>
    </div>
  );
}

export function ReviewScreen({
  persona, form, set, isGenerating, onBack, onGenerate, goToStep,
}: {
  persona: ReportPersona;
  form: IntakeFormDataV2;
  set: SetPatch;
  isGenerating: boolean;
  onBack: () => void;
  onGenerate: () => void;
  goToStep: (step: ReviewStep) => void;
}) {
  const copy = PERSONA_COPY[persona];
  const tc = form.target_customers ?? { industries: [], named_companies: [], notes: '' };
  const goalLabels = GOALS.filter((g) => (form.goal_ids ?? []).includes(g.id)).map((g) => g.label);
  const customerBits = [tc.customer_type, tc.customer_size, tc.buying_motion].filter(Boolean) as string[];
  const sellsTo = [
    ...customerBits,
    ...(tc.industries ?? []),
    ...(tc.named_companies ?? []).map((c) => c.name).filter(Boolean),
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
        <div className="order-2 space-y-4 lg:order-1">
          <Card title="Company details">
            <InlineScalar label="Company" value={form.company_name} onSave={(v) => set({ company_name: v })} placeholder="Company name" />
            <InlineScalar label="Website" value={form.website_url} onSave={(v) => set({ website_url: v })} placeholder="yourcompany.com" />
            <InlineScalar label="Country" value={form.country_of_origin} onSave={(v) => set({ country_of_origin: v })} type="select" options={COUNTRY_OPTIONS} />
            <InlineScalar label="Stage" value={form.company_stage} onSave={(v) => set({ company_stage: v as IntakeFormDataV2['company_stage'] })} type="select" options={STAGE_OPTIONS} />
            <InlineScalar label="Employees" value={form.employee_count} onSave={(v) => set({ employee_count: v as IntakeFormDataV2['employee_count'] })} type="select" options={EMPLOYEE_OPTIONS} />
            {persona === 'startup' && (
              <InlineScalar label="Revenue" value={form.revenue_stage} onSave={(v) => set({ revenue_stage: v as IntakeFormDataV2['revenue_stage'] })} type="select" options={REVENUE_STAGE_OPTIONS} />
            )}
            <ChipRow label="Industry" items={form.industry_sector ?? []} onEdit={() => goToStep('company')} />
            <ChipRow label={copy.regionLabel} items={form.target_regions ?? []} onEdit={() => goToStep('company')} />
          </Card>

          <Card title="Goals & context">
            <ChipRow label="Goals" items={goalLabels} onEdit={() => goToStep('goals')} />
            <ChipRow label="Sells to" items={sellsTo} onEdit={() => goToStep('details')} />
            {tc.notes ? (
              <div className="flex items-start gap-3 py-2">
                <span className="w-[92px] shrink-0 pt-0.5 text-[12px] text-rc-muted">In a line</span>
                <p className="min-w-0 flex-1 text-[12.5px] italic text-rc-body">“{tc.notes}”</p>
              </div>
            ) : null}
            {(form.known_competitors ?? []).length > 0 && (
              <ChipRow label="Competitors" items={(form.known_competitors ?? []).map((c) => c.name).filter(Boolean)} onEdit={() => goToStep('details')} />
            )}
            <ChipRow label="Challenges" items={form.challenges?.tags ?? []} onEdit={() => goToStep('details')} />
            <ChipSelectRow
              label="Timeline" options={TIMELINE_OPTIONS} value={form.timeline}
              onChange={(v) => set({ timeline: (v || undefined) as IntakeFormDataV2['timeline'] })}
            />
            <ChipSelectRow
              label="Budget" options={BUDGET_OPTIONS} value={form.budget_level}
              onChange={(v) => set({ budget_level: (v || undefined) as IntakeFormDataV2['budget_level'] })}
            />
            <InlineScalar label="Focus" value={form.report_focus} onSave={(v) => set({ report_focus: v })} placeholder="What should the report answer?" />
          </Card>
        </div>

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
