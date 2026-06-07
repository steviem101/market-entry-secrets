/* ============================================================
   rc-step1.jsx — Step 1: company (website-first + scrape prefill)
   scrapeState: 'idle' | 'loading' | 'detected' | 'error'
   ============================================================ */

function Step1({ mobile, persona, form, set, onNext, inline, onPersona }) {
  const copy = PERSONA_COPY[persona];
  const [scrape, setScrape] = React.useState('idle'); // idle|loading|detected|error
  const [expanded, setExpanded] = React.useState(false); // confirm-card vs full fields
  const [showMoreInd, setShowMoreInd] = React.useState(false);
  const [indQuery, setIndQuery] = React.useState('');
  const [customInd, setCustomInd] = React.useState('');
  const [errors, setErrors] = React.useState({});

  const aiFields = scrape === 'detected' ? form._ai || {} : {};

  function runScrape() {
    const url = (form.website_url || '').trim();
    if (!url) return;
    setScrape('loading');
    setTimeout(() => {
      // Simulate failure for urls containing "fail"
      if (/fail|error/i.test(url)) { setScrape('error'); return; }
      const m = MOCK_SCRAPE;
      const hadRegion = (form.target_regions || []).length > 0;
      set({
        company_name: form.company_name || m.company_name,
        country_of_origin: m.country_of_origin,
        industry_sector: m.industry_sector,
        company_stage: m.company_stage,
        employee_count: m.employee_count,
        // #2 — default the most likely AU entry point so the user confirms, not cold-picks
        target_regions: hadRegion ? form.target_regions : ['Sydney/NSW'],
        _regionSuggested: !hadRegion,
        _ai: { country_of_origin: true, industry_sector: true, company_stage: true, employee_count: true, company_name: !form.company_name },
        _scrapeAccepted: true,
      });
      setExpanded(false);
      setScrape('detected');
    }, 1600);
  }

  function toggleIndustry(ind) {
    const cur = form.industry_sector || [];
    if (cur.includes(ind)) { set({ industry_sector: cur.filter((x) => x !== ind) }); return; }
    if (cur.length >= 3) return; // cap at 3
    set({ industry_sector: [...cur, ind] });
  }
  function addCustomIndustry() {
    const v = customInd.trim();
    if (!v) return;
    const cur = form.industry_sector || [];
    if (!cur.includes(v) && cur.length < 3) set({ industry_sector: [...cur, v] });
    setCustomInd(''); setIndQuery('');
  }
  function toggleRegion(r) {
    const cur = form.target_regions || [];
    set({ target_regions: cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r] });
  }
  function setRegionTouched() { if (form._regionSuggested) set({ _regionSuggested: false }); }

  function validate() {
    const e = {};
    if (!form.website_url) e.website_url = 'Website is required';
    if (!form.company_name) e.company_name = 'Company name is required';
    if (!form.country_of_origin) e.country_of_origin = 'Country is required';
    if (!(form.industry_sector || []).length) e.industry_sector = 'Pick at least one industry';
    if (!form.company_stage) e.company_stage = 'Stage is required';
    if (!(form.target_regions || []).length) e.target_regions = 'Pick at least one region';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const baseChips = showMoreInd ? [...TOP_INDUSTRIES, ...MORE_INDUSTRIES] : TOP_INDUSTRIES;
  const grid2 = mobile ? '' : 'grid grid-cols-2 gap-x-5 gap-y-5';

  return (
    <div className="space-y-6">
      {/* Inline persona chooser (A/B: personaMode === 'inline') */}
      {inline && (
        <div className="space-y-2">
          <span className="text-[13.5px] font-semibold text-ink">Which best describes you?</span>
          <div className={`grid gap-2 ${mobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {['international', 'startup'].map((pk) => {
              const c = PERSONA_COPY[pk];
              const on = persona === pk;
              return (
                <button key={pk} type="button" onClick={() => onPersona && onPersona(pk)}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors border ${on ? 'bg-sky-tint border-primary' : 'bg-white border-line hover:border-primary/40'}`}>
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${on ? 'bg-primary text-white' : 'bg-sky-soft text-primary'}`}><Icon name={c.cardIcon} size={16} /></span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-ink truncate">{c.cardTitle}</span>
                    <span className="block text-[11.5px] text-muted truncate">{c.cardSub}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Website-first block */}
      <div className="rounded-2xl bg-sky-tint border border-primary/15 p-4">
        <div className="flex items-center gap-2 mb-2.5 min-w-0">
          <span className="text-primary shrink-0"><Icon name="sparkles" size={16} /></span>
          <span className="text-[13.5px] font-semibold text-ink flex-1 min-w-0">Start with your website — we'll fill in the rest</span>
        </div>
        <div className={mobile ? 'space-y-3' : 'grid grid-cols-[1fr_auto] gap-3 items-end'}>
          <Field label="Company website" required htmlFor="website_url" error={errors.website_url}>
            <TextInput id="website_url" iconLeft="link" placeholder="yourcompany.com"
              value={form.website_url} onChange={(v) => set({ website_url: v })}
              onBlur={() => { if (form.website_url && scrape === 'idle') runScrape(); }}
              onKeyDown={(e) => { if (e.key === 'Enter') runScrape(); }} />
          </Field>
          <PrimaryButton icon={null} iconLeft={scrape === 'loading' ? null : 'search'} onClick={runScrape}
            className={`${mobile ? 'w-full' : ''} h-11`} disabled={scrape === 'loading'}>
            {scrape === 'loading' ? 'Reading…' : 'Fetch details'}
          </PrimaryButton>
        </div>

        {scrape === 'loading' && (
          <p className="mt-2.5 text-[12.5px] text-primary flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            Reading {form.website_url}… we only read public pages.
          </p>
        )}
        {scrape === 'detected' && (
          <p className="mt-2.5 text-[12.5px] text-emerald-600 flex items-center gap-2">
            <Icon name="check" size={14} /> Read {form.website_url} — review what we found below.
          </p>
        )}
        {scrape === 'error' && (
          <p className="mt-2.5 text-[12.5px] text-amber-600 flex items-center gap-2">
            <Icon name="lightbulb" size={14} /> Couldn't auto-read that site — just fill in the details below.
          </p>
        )}
      </div>

      {/* #1 — high-confidence scrape collapses to a confirm card (happy path = 1 tap) */}
      {scrape === 'detected' && !expanded && (
        <div className="rounded-2xl border border-primary/25 bg-sky-tint p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-primary shrink-0"><Icon name="sparkles" size={16} /></span>
            <span className="text-[13.5px] font-bold text-ink flex-1 min-w-0">Here's what we found</span>
            <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-primary bg-white rounded-full px-2 py-0.5 shrink-0">
              <Icon name="sparkles" size={11} /> AI
            </span>
          </div>
          <div className="rounded-xl bg-white border border-line divide-y divide-line/70">
            {[
              ['Company', form.company_name],
              ['Country', form.country_of_origin],
              ['Industry', (form.industry_sector || []).join(', ')],
              ['Stage', form.company_stage],
              ['Employees', form.employee_count],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center gap-3 px-3.5 py-2.5">
                <span className="text-[12px] text-muted w-[78px] shrink-0">{k}</span>
                <span className="text-[13.5px] font-medium text-ink flex-1 min-w-0 truncate">{v || '—'}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2.5">
            <PrimaryButton icon="check" iconLeft="check" onClick={() => { /* confirmed; fields already set */ }}>Looks right</PrimaryButton>
            <button onClick={() => setExpanded(true)}
              className="h-12 px-4 rounded-xl border border-line bg-white text-[14px] font-semibold text-body hover:bg-canvas inline-flex items-center gap-2 whitespace-nowrap">
              <Icon name="pencil" size={15} /> Edit details
            </button>
          </div>
        </div>
      )}

      {/* Company fields (hidden behind the confirm card on the happy path) */}
      {(scrape !== 'detected' || expanded) && (
      <React.Fragment>
      <div className={grid2}>
        <Field label="Company name" required htmlFor="company_name" error={errors.company_name}>
          <TextInput id="company_name" placeholder="e.g. Acme Robotics" value={form.company_name}
            onChange={(v) => set({ company_name: v })} ai={aiFields.company_name} />
        </Field>
        <Field label="Country of origin" required error={errors.country_of_origin}>
          <Select placeholder="Select country" options={COUNTRY_OPTIONS} value={form.country_of_origin}
            onChange={(v) => set({ country_of_origin: v })} ai={aiFields.country_of_origin} />
        </Field>
        <Field label="Company stage" required error={errors.company_stage}>
          <Select placeholder="Select stage" options={STAGE_OPTIONS} value={form.company_stage}
            onChange={(v) => set({ company_stage: v })} ai={aiFields.company_stage} />
        </Field>
        <Field label="Number of employees">
          <Select placeholder="Select range" options={EMPLOYEE_OPTIONS} value={form.employee_count}
            onChange={(v) => set({ employee_count: v })} ai={aiFields.employee_count} />
        </Field>
      </div>

      {/* Industry — top first, full taxonomy via search, free-text fallback */}
      {(() => {
        const selected = form.industry_sector || [];
        const offList = selected.filter((s) => !baseChips.includes(s)); // scraped/custom/searched
        const q = indQuery.trim().toLowerCase();
        const results = q
          ? ALL_INDUSTRIES.filter((i) => i.toLowerCase().includes(q) && !selected.includes(i)).slice(0, 8)
          : [];
        const exactish = ALL_INDUSTRIES.some((i) => i.toLowerCase() === q);
        const atCap = selected.length >= 3;
        return (
          <Field label="Industry / sector" required hint="Pick up to 3. Don't see yours? Search all 152 or add your own." error={errors.industry_sector}>
            <div className="flex flex-wrap gap-2">
              {/* selected off-list values always render so nothing disappears */}
              {offList.map((ind) => (
                <Chip key={ind} active onClick={() => toggleIndustry(ind)}>{ind}</Chip>
              ))}
              {baseChips.map((ind) => (
                <Chip key={ind} active={selected.includes(ind)} onClick={() => toggleIndustry(ind)}>{ind}</Chip>
              ))}
              <button onClick={() => setShowMoreInd(!showMoreInd)}
                className="h-9 px-3.5 text-[13px] rounded-full border border-dashed border-line text-muted hover:border-primary/40 hover:text-primary transition-colors inline-flex items-center gap-1.5">
                <Icon name={showMoreInd ? 'x' : 'plus'} size={13} /> {showMoreInd ? 'Show less' : `More (${MORE_INDUSTRIES.length})`}
              </button>
            </div>

            {/* Search across the full taxonomy + free-text fallback */}
            <div className="mt-2.5">
              {atCap ? (
                <p className="text-[12px] text-muted flex items-center gap-1.5"><Icon name="check" size={13} /> Maximum of 3 selected — deselect one to change.</p>
              ) : (
                <div className="relative">
                  <TextInput iconLeft="search" placeholder="Search all industries, or type your own…"
                    value={indQuery} onChange={setIndQuery}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (results[0]) toggleIndustry(results[0]); else { setCustomInd(indQuery); addCustomIndustry(); } } }} />
                  {q && (
                    <div className="mt-1.5 rounded-xl border border-line bg-white shadow-card overflow-hidden">
                      {results.map((r) => (
                        <button key={r} onClick={() => { toggleIndustry(r); setIndQuery(''); }}
                          className="w-full text-left px-3.5 h-10 text-[13.5px] text-body hover:bg-sky-tint flex items-center gap-2 border-b border-line/60 last:border-0">
                          <Icon name="plus" size={13} className="text-primary" /> {r}
                        </button>
                      ))}
                      {!exactish && (
                        <button onClick={() => { setCustomInd(indQuery); addCustomIndustry(); }}
                          className="w-full text-left px-3.5 h-10 text-[13.5px] text-primary-700 hover:bg-sky-tint flex items-center gap-2 font-medium whitespace-nowrap overflow-hidden">
                          <Icon name="plus" size={13} className="shrink-0" /> <span className="truncate">Add “{indQuery.trim()}” as a custom industry</span>
                        </button>
                      )}
                      {!results.length && exactish && (
                        <div className="px-3.5 h-10 text-[13px] text-muted flex items-center">Already in the list above.</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Field>
        );
      })()}
      </React.Fragment>
      )}

      {/* Target regions — promoted up */}
      <Field label={copy.regionLabel} required hint={form._regionSuggested ? 'Pre-filled to the most common entry point — change if needed.' : copy.regionHint} error={errors.target_regions}>
        <div className="flex flex-wrap gap-2">
          {REGION_OPTIONS.map((r) => (
            <Chip key={r} active={(form.target_regions || []).includes(r)} onClick={() => { setRegionTouched(); toggleRegion(r); }}>{r}</Chip>
          ))}
        </div>
      </Field>

      <div className="pt-2 flex items-center justify-end">
        <PrimaryButton onClick={() => { if (validate()) onNext(); }}>Next: {copy.step2Title}</PrimaryButton>
      </div>
    </div>
  );
}

window.Step1 = Step1;
