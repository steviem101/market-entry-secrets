/* ============================================================
   rc-review.jsx — Review (inline-edit summary) + live preview rail
   ============================================================ */

// Inline-editable scalar row
function EditRow({ label, value, options, placeholder, onSave, mobile }) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value || '');
  React.useEffect(() => setDraft(value || ''), [value]);

  if (editing) {
    return (
      <div className="py-2.5 flex items-center gap-2">
        <span className="text-[12.5px] text-muted w-[110px] shrink-0">{label}</span>
        {options ? (
          <Select value={draft} options={options} placeholder={placeholder} onChange={setDraft} />
        ) : (
          <input value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus
            className="flex-1 h-10 rounded-lg border border-primary bg-white px-3 text-[14px] text-ink focus:ring-2 focus:ring-sky-soft outline-none" />
        )}
        <button onClick={() => { onSave(draft); setEditing(false); }}
          className="h-9 px-3 rounded-lg btn-primary text-white text-[12.5px] font-semibold shrink-0">Save</button>
      </div>
    );
  }
  return (
    <button onClick={() => setEditing(true)}
      className="w-full py-2.5 flex items-center gap-2 text-left group hover:bg-canvas rounded-lg px-1 -mx-1 transition-colors">
      <span className="text-[12.5px] text-muted w-[110px] shrink-0">{label}</span>
      <span className={`flex-1 text-[14px] font-medium ${value ? 'text-ink' : 'text-muted/60 italic'}`}>{value || placeholder}</span>
      <span className="text-muted/50 group-hover:text-primary transition-colors shrink-0"><Icon name="pencil" size={14} /></span>
    </button>
  );
}

// Chip-group row (edit jumps back to the step)
function ChipRow({ label, items, onEdit }) {
  return (
    <div className="py-2.5 flex items-start gap-2">
      <span className="text-[12.5px] text-muted w-[110px] shrink-0 mt-1">{label}</span>
      <div className="flex-1 flex flex-wrap gap-1.5">
        {(items && items.length) ? items.map((t) => (
          <span key={t} className="text-[12.5px] font-medium text-primary-700 bg-sky-soft rounded-full px-2.5 py-1">{t}</span>
        )) : <span className="text-[13px] text-muted/60 italic mt-1">None added</span>}
      </div>
      <button onClick={onEdit} className="text-muted/50 hover:text-primary transition-colors shrink-0 mt-1"><Icon name="pencil" size={14} /></button>
    </div>
  );
}

function ReviewScreen({ mobile, persona, form, set, onGenerate, onBack, goToStep }) {
  const copy = PERSONA_COPY[persona];
  const selectedGoals = GOALS.filter((g) => (form.goal_ids || []).includes(g.id));
  const tc = form.target_customers || {};

  return (
    <div className={mobile ? 'space-y-5' : 'grid grid-cols-[1fr_300px] gap-6 items-start'}>
      <div className="space-y-5">
        {mobile && <ReportPreview form={form} mobile={mobile} />}

        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="flex items-center gap-2 mb-1 min-w-0">
            <span className="text-primary shrink-0"><Icon name="building" size={16} /></span>
            <span className="text-[14px] font-bold text-ink flex-1 min-w-0">Company details</span>
          </div>
          <div className="divide-y divide-line/70">
            <EditRow label="Company" value={form.company_name} onSave={(v) => set({ company_name: v })} placeholder="Add name" />
            <EditRow label="Website" value={form.website_url} onSave={(v) => set({ website_url: v })} placeholder="Add website" />
            <EditRow label="Country" value={form.country_of_origin} options={COUNTRY_OPTIONS} onSave={(v) => set({ country_of_origin: v })} placeholder="Select" />
            <EditRow label="Stage" value={form.company_stage} options={STAGE_OPTIONS} onSave={(v) => set({ company_stage: v })} placeholder="Select" />
            <EditRow label="Employees" value={form.employee_count} options={EMPLOYEE_OPTIONS} onSave={(v) => set({ employee_count: v })} placeholder="Select" />
            <ChipRow label="Industry" items={form.industry_sector} onEdit={() => goToStep(1)} />
            <ChipRow label="Regions" items={form.target_regions} onEdit={() => goToStep(1)} />
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="flex items-center gap-2 mb-1 min-w-0">
            <span className="text-primary shrink-0"><Icon name="target" size={16} /></span>
            <span className="text-[14px] font-bold text-ink flex-1 min-w-0">Goals & context</span>
          </div>
          <div className="divide-y divide-line/70">
            <ChipRow label="Goals" items={selectedGoals.map((g) => g.label)} onEdit={() => goToStep(2)} />
            <ChipRow label="Sells to" items={[tc.customer_type, tc.customer_size, tc.buying_motion, ...(tc.industries || []), ...((tc.named_companies || []).filter((c) => c.name).map((c) => c.name))].filter(Boolean)} onEdit={() => goToStep(3)} />
            <ChipRow label="Challenges" items={form.challenge_tags} onEdit={() => goToStep(3)} />
            <EditRow label="Focus" value={form.report_focus} onSave={(v) => set({ report_focus: v })} placeholder="Optional" />
          </div>
        </div>

        <div className={`flex items-center justify-between gap-3 ${mobile ? 'flex-col-reverse' : ''}`}>
          <GhostButton onClick={onBack} className={mobile ? 'w-full' : ''}>Back</GhostButton>
          <div className={`flex items-center gap-3 ${mobile ? 'w-full' : ''}`}>
            <SavedPill />
            <PrimaryButton icon="sparkles" onClick={onGenerate} className={mobile ? 'flex-1' : ''}>{copy.generateCta}</PrimaryButton>
          </div>
        </div>
      </div>

      {!mobile && <div className="sticky top-4"><ReportPreview form={form} mobile={mobile} /></div>}
    </div>
  );
}

window.ReviewScreen = ReviewScreen;
