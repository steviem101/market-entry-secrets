/* ============================================================
   rc-step2.jsx — split into Step2Goals + Step3Profile
   ============================================================ */

// ── STEP 2 — Goals (short) ─────────────────────────────────────────────
function Step2Goals({ mobile, persona, form, set, onNext, onBack }) {
  const copy = PERSONA_COPY[persona];
  const goals = GOALS.filter((g) => g.personas.includes(persona));
  const cats = GOAL_CATEGORIES.filter((c) => goals.some((g) => g.category === c.id));
  const selected = form.goal_ids || [];

  function toggleGoal(id) {
    set({ goal_ids: selected.includes(id) ? selected.filter((g) => g !== id) : [...selected, id] });
  }

  return (
    <div className="space-y-5">
      <ReportPreview form={form} mobile={mobile} variant="bar" />

      <div className="space-y-4" role="group" aria-label="Report goals">
        <SectionLabel icon="target" tag="Required" hint="Select all that apply — each one adds a section to your report.">What do you want from this report?</SectionLabel>
        {cats.map((cat) => {
          const inCat = goals.filter((g) => g.category === cat.id);
          if (!inCat.length) return null;
          return (
            <div key={cat.id} className="space-y-2">
              <div className="flex items-center gap-1.5 text-[11.5px] font-bold tracking-wide text-muted uppercase">
                <Icon name={cat.icon} size={13} /> {cat.label}
              </div>
              <div className={`grid gap-2.5 ${mobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {inCat.map((g) => <GoalCard key={g.id} goal={g} active={selected.includes(g.id)} onClick={() => toggleGoal(g.id)} />)}
              </div>
            </div>
          );
        })}
      </div>

      {/* #3 — sticky action bar so default-accepters never scroll to find Next */}
      <div className="sticky bottom-0 -mx-4 sm:-mx-7 px-4 sm:px-7 pt-3 pb-1 mt-2 bg-gradient-to-t from-white via-white to-transparent">
        <div className="flex items-center justify-between gap-3">
          <GhostButton onClick={onBack}>Back</GhostButton>
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-[12.5px] text-muted hidden sm:inline whitespace-nowrap">{selected.length} selected</span>
            <PrimaryButton icon={null} onClick={onNext} disabled={!selected.length}>
              {selected.length ? `Continue with ${selected.length} →` : 'Pick a goal to continue'}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── STEP 3 — Customers & priorities ────────────────────────────────────
function Step3Profile({ mobile, persona, form, set, onNext, onBack }) {
  const copy = PERSONA_COPY[persona];
  const challenges = COMMON_CHALLENGES[persona];
  const prompts = FOCUS_PROMPTS[persona];
  const tc = form.target_customers || {};
  const comps = form.known_competitors || [];
  const named = tc.named_companies || [];
  const [sellQuery, setSellQuery] = React.useState('');
  const [showBuyerDetail, setShowBuyerDetail] = React.useState(!!(tc.customer_size || tc.buying_motion));

  // #4 — default the dominant segment so it's a confirm, not a cold pick
  React.useEffect(() => { if (!tc.customer_type) setTC({ customer_type: 'B2B' }); }, []);

  function toggleSell(ind) {
    const arr = tc.industries || [];
    if (arr.includes(ind)) { setTC({ industries: arr.filter((x) => x !== ind) }); return; }
    if (arr.length >= 5) return;
    setTC({ industries: [...arr, ind] });
  }

  function setTC(patch) { set({ target_customers: { ...tc, ...patch } }); }
  function toggleChallenge(c) {
    const cur = form.challenge_tags || [];
    set({ challenge_tags: cur.includes(c) ? cur.filter((x) => x !== c) : (cur.length < 8 ? [...cur, c] : cur) });
  }
  function setComp(i, patch) { set({ known_competitors: comps.map((c, idx) => idx === i ? { ...c, ...patch } : c) }); }
  function setNamed(i, patch) { setTC({ named_companies: named.map((c, idx) => idx === i ? { ...c, ...patch } : c) }); }

  // Single-select chip group (radio semantics)
  const single = (label, opts, key) => (
    <div className="space-y-1.5">
      <span className="text-[12.5px] font-medium text-body">{label} <span className="text-muted font-normal">· pick one</span></span>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {opts.map((o) => <Chip key={o} size="sm" mode="single" active={tc[key] === o} onClick={() => setTC({ [key]: tc[key] === o ? '' : o })}>{o}</Chip>)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <ReportPreview form={form} mobile={mobile} variant="bar" />

      {/* CUSTOMER PROFILE */}
      <div className="space-y-4">
        <SectionLabel icon="users" tag="Recommended" hint="Tap a few chips or describe your buyer in a sentence — either works. This powers your lead list and go-to-market plan.">{copy.customerLabel}</SectionLabel>
        <div className="grid gap-4">
          {single('Customer type', CUSTOMER_TYPE, 'customer_type')}
          {/* #4 — size + motion are genuinely skippable behind an opt-in expander */}
          {showBuyerDetail ? (
            <React.Fragment>
              {single('Customer size', CUSTOMER_SIZE, 'customer_size')}
              {single('Buying motion', BUYING_MOTION, 'buying_motion')}
            </React.Fragment>
          ) : (
            <button onClick={() => setShowBuyerDetail(true)}
              className="self-start h-9 px-3.5 inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-dashed border-line text-[13px] text-body hover:border-primary/40 hover:text-primary transition-colors">
              <Icon name="plus" size={14} /> Add buyer detail <span className="text-muted">— size &amp; sales motion (optional)</span>
            </button>
          )}
        </div>
        <Field label="Industries you sell into" hint="Pick any · up to 5. Search for more or add your own.">
          {(() => {
            const arr = tc.industries || [];
            const baseSell = TOP_INDUSTRIES.slice(0, 8);
            const offList = arr.filter((s) => !baseSell.includes(s));
            const q = sellQuery.trim().toLowerCase();
            const results = q ? ALL_INDUSTRIES.filter((i) => i.toLowerCase().includes(q) && !arr.includes(i)).slice(0, 8) : [];
            const exactish = ALL_INDUSTRIES.some((i) => i.toLowerCase() === q);
            const atCap = arr.length >= 5;
            const addCustom = () => { const v = sellQuery.trim(); if (v && !arr.includes(v) && arr.length < 5) setTC({ industries: [...arr, v] }); setSellQuery(''); };
            return (
              <div>
                <div role="group" aria-label="Industries you sell into" className="flex flex-wrap gap-2">
                  {offList.map((ind) => <Chip key={ind} size="sm" mode="multi" active onClick={() => toggleSell(ind)}>{ind}</Chip>)}
                  {baseSell.map((ind) => <Chip key={ind} size="sm" mode="multi" active={arr.includes(ind)} onClick={() => toggleSell(ind)}>{ind}</Chip>)}
                </div>
                <div className="mt-2.5">
                  {atCap ? (
                    <p className="text-[12px] text-muted flex items-center gap-1.5"><Icon name="check" size={13} /> Maximum of 5 selected — deselect one to change.</p>
                  ) : (
                    <div className="relative">
                      <TextInput iconLeft="search" placeholder="Search all industries, or type your own…"
                        value={sellQuery} onChange={setSellQuery}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (results[0]) toggleSell(results[0]); else addCustom(); setSellQuery(''); } }} />
                      {q && (
                        <div className="mt-1.5 rounded-xl border border-line bg-white shadow-card overflow-hidden">
                          {results.map((r) => (
                            <button key={r} onClick={() => { toggleSell(r); setSellQuery(''); }}
                              className="w-full text-left px-3.5 h-10 text-[13.5px] text-body hover:bg-sky-tint flex items-center gap-2 border-b border-line/60 last:border-0">
                              <Icon name="plus" size={13} className="text-primary" /> {r}
                            </button>
                          ))}
                          {!exactish && (
                            <button onClick={addCustom}
                              className="w-full text-left px-3.5 h-10 text-[13.5px] text-primary-700 hover:bg-sky-tint flex items-center gap-2 font-medium whitespace-nowrap overflow-hidden">
                              <Icon name="plus" size={13} className="shrink-0" /> <span className="truncate">Add “{sellQuery.trim()}” as a custom industry</span>
                            </button>
                          )}
                          {!results.length && exactish && (
                            <div className="px-3.5 h-10 text-[13px] text-muted flex items-center">Already selected above.</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </Field>
        <Field label="Specific companies you want to sell to" hint="Optional · up to 5. Search by name, or paste a website for the most accurate match.">
          <CompanyPicker rows={named} max={5} mobile={mobile}
            placeholder="Name or website — e.g. BHP or bhp.com…"
            onChange={(next) => setTC({ named_companies: next })} />
        </Field>
        <Field label="Or, in one line: what makes a perfect customer?" hint="Optional — skip it if the chips above cover it, but a sentence is the single most useful thing you can tell us.">
          <input value={tc.notes || ''} maxLength={300} onChange={(e) => setTC({ notes: e.target.value })}
            placeholder={persona === 'startup' ? 'e.g. ops leaders at mid-size logistics firms tired of manual scheduling' : 'e.g. procurement teams at NSW miners frustrated with slow compliance'}
            className="w-full h-11 rounded-xl border border-line bg-white px-3.5 text-[14.5px] text-ink placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-sky-soft outline-none" />
        </Field>
      </div>

      <div className="h-px bg-line" />

      {/* COMPETITORS */}
      <div className="space-y-2.5">
        <SectionLabel icon="swords" tag="Optional" hint="Search by name, or paste a website for the most accurate match. Up to 3.">{persona === 'startup' ? 'Key competitors' : 'Known competitors in Australia'}</SectionLabel>
        <CompanyPicker rows={comps} max={3} mobile={mobile}
          placeholder="Name or website — e.g. CompetitorCo or competitor.com…"
          onChange={(next) => set({ known_competitors: next })} />
      </div>

      <div className="h-px bg-line" />

      {/* CHALLENGES */}
      <div className="space-y-2">
        <SectionLabel icon="shield" tag="Optional" hint="Tap any that apply — sharpens your SWOT and action plan.">Biggest challenges right now?</SectionLabel>
        <div role="group" aria-label="Challenges" className="flex flex-wrap gap-2">
          {challenges.map((c) => <Chip key={c} size="sm" mode="multi" active={(form.challenge_tags || []).includes(c)} onClick={() => toggleChallenge(c)}>{c}</Chip>)}
        </div>
      </div>

      {/* REPORT FOCUS */}
      <div className="rounded-2xl bg-sky-tint border border-primary/15 p-4 space-y-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-primary shrink-0"><Icon name="lightbulb" size={17} /></span>
          <span className="text-[14px] font-semibold text-ink flex-1 min-w-0">What's the one thing you most want this report to answer?</span>
        </div>
        <div className="relative">
          <input value={form.report_focus || ''} maxLength={200} onChange={(e) => set({ report_focus: e.target.value })}
            placeholder={`e.g. “${prompts[0]}”`}
            className="w-full h-11 rounded-xl border border-line bg-white pl-3.5 pr-[92px] text-[14.5px] text-ink placeholder:text-muted/60 placeholder:italic focus:border-primary focus:ring-2 focus:ring-sky-soft outline-none" />
          {!form.report_focus && (
            <button onClick={() => set({ report_focus: prompts[0] })}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2.5 rounded-lg bg-sky-soft text-primary-700 text-[12px] font-semibold inline-flex items-center gap-1 whitespace-nowrap hover:bg-primary hover:text-white transition-colors">
              <Icon name="check" size={12} /> Use this
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {prompts.map((p) => {
            const on = form.report_focus === p;
            return (
              <button key={p} onClick={() => set({ report_focus: on ? '' : p })}
                className={`h-8 px-3 text-[12.5px] whitespace-nowrap rounded-full border transition-colors inline-flex items-center gap-1.5 ${on ? 'border-primary bg-sky-soft text-primary-700' : 'border-line bg-white text-body hover:border-primary/50 hover:text-primary'}`}>
                {on && <Icon name="check" size={12} />}{p}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-1 flex items-center justify-between gap-3">
        <GhostButton onClick={onBack}>Back</GhostButton>
        <PrimaryButton onClick={onNext}>Review</PrimaryButton>
      </div>
    </div>
  );
}

Object.assign(window, { Step2Goals, Step3Profile });
