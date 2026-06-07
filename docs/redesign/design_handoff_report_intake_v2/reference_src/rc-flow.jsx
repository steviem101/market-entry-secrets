/* ============================================================
   rc-flow.jsx — orchestration, product chrome, device framing,
   prototype control bar, state persistence
   ============================================================ */
const { useState: useS, useEffect: useE } = React;
const LS_KEY = 'rc_redesign_v1';

const BLANK_FORM = {
  website_url: '', company_name: '', country_of_origin: '', industry_sector: [],
  company_stage: '', employee_count: '', target_regions: [],
  goal_ids: [], timeline: '', budget_level: '',
  target_customers: { customer_type: '', customer_size: '', buying_motion: '', industries: [], notes: '' },
  known_competitors: [], challenge_tags: [], report_focus: '',
  _ai: {}, _scrapeAccepted: false,
};

// ── MES product top nav (fidelity to live site) ────────────────────────
function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" stroke="#1C3A52" strokeWidth="3.2" />
        <path d="M24 13l-4 13 13-4z" fill="#3BA9DD" />
        <path d="M24 35l4-13-13 4z" fill="#1C3A52" />
        <path d="M24 7v3M24 38v3M7 24h3M38 24h3" stroke="#1C3A52" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <div className="leading-[0.82]">
        <div className="text-[12px] font-extrabold tracking-tight text-ink">MARKET<br/>ENTRY<br/><span className="text-[11px]">SECRETS</span></div>
      </div>
    </div>
  );
}

function ProductNav({ mobile }) {
  if (mobile) {
    return (
      <div className="h-14 px-4 flex items-center justify-between border-b border-line bg-white/90 backdrop-blur">
        <Logo />
        <button className="w-9 h-9 rounded-lg flex items-center justify-center text-ink">
          <span className="space-y-[5px]"><span className="block w-5 h-0.5 bg-ink"/><span className="block w-5 h-0.5 bg-ink"/><span className="block w-5 h-0.5 bg-ink"/></span>
        </button>
      </div>
    );
  }
  const items = ['Directory', 'Explore', 'Events', 'Leads', 'Resources', 'Pricing'];
  return (
    <div className="h-16 px-7 flex items-center justify-between border-b border-line bg-white/90 backdrop-blur">
      <Logo />
      <nav className="flex items-center gap-6 text-[13.5px] font-medium text-body">
        {items.map((i) => <span key={i} className="hover:text-ink cursor-default whitespace-nowrap flex items-center gap-1">{i}</span>)}
      </nav>
      <div className="flex items-center gap-3">
        <button className="btn-primary h-9 px-3.5 rounded-lg text-white text-[13px] font-semibold whitespace-nowrap inline-flex items-center gap-1.5"><Icon name="sparkles" size={14}/> Get Your Report</button>
        <button className="text-[13.5px] font-medium text-body whitespace-nowrap inline-flex items-center gap-1.5"><Icon name="arrowRight" size={14}/> Sign In</button>
      </div>
    </div>
  );
}

// ── Persona toggle (persistent, top-right of step shell) ───────────────
function PersonaToggle({ persona, onSwitch, mobile }) {
  return (
    <div className="inline-flex p-0.5 rounded-full bg-canvas border border-line text-[12px] font-semibold">
      {['international', 'startup'].map((p) => (
        <button key={p} onClick={() => onSwitch(p)}
          className={`px-3 h-7 rounded-full transition-colors flex items-center gap-1.5 whitespace-nowrap ${persona === p ? 'bg-white text-primary shadow-sm' : 'text-muted'}`}>
          <Icon name={PERSONA_COPY[p].cardIcon} size={13} />{!mobile && (p === 'international' ? 'International' : 'Startup')}
        </button>
      ))}
    </div>
  );
}

// ── Step shell (header + stepper + card) ───────────────────────────────
function StepShell({ mobile, persona, stepIndex, onSwitchPersona, children }) {
  const copy = PERSONA_COPY[persona];
  const steps = ['Company', 'Goals', 'Details', 'Review'];
  const titles = [copy.step1Title, copy.step2Title, 'Your customers & priorities', 'Review & generate'];
  const subs = [copy.step1Sub, 'Pick what you want — each goal adds a section.', 'Who you sell to, and what to prioritise.', "Tweak anything inline, then we'll build it."];
  const icons = ['building', 'target', 'users', 'sparkles'];
  return (
    <div className={`rc-shell mx-auto ${mobile ? 'max-w-[420px] px-4 py-6' : 'max-w-[920px] px-6 py-9'}`}>
      <div className="text-center mb-6">
        <h1 className={`font-bold text-ink tracking-tight ${mobile ? 'text-[24px]' : 'text-[32px]'}`}>{copy.pageTitle}</h1>
        <p className={`mt-2 text-muted mx-auto ${mobile ? 'text-[13.5px] max-w-[340px]' : 'text-[15px] max-w-[560px]'} leading-relaxed`}>{copy.pageSub}</p>
      </div>
      <div className="mb-7"><Stepper steps={steps} current={stepIndex} mobile={mobile} /></div>

      <div className={`rc-card rounded-2xl bg-white border border-line shadow-card ${mobile ? 'p-4' : 'p-7'}`}>
        <div className={`flex items-start gap-3 mb-5 ${mobile ? 'flex-col' : 'justify-between'}`}>
          <div className="flex items-center gap-3">
            <IconBadge name={icons[stepIndex] || 'building'} />
            <div>
              <h2 className={`font-bold text-ink ${mobile ? 'text-[18px]' : 'text-[20px]'}`}>{titles[stepIndex]}</h2>
              <p className="text-[13px] text-muted">{subs[stepIndex]}</p>
            </div>
          </div>
          <div className={mobile ? 'self-end' : 'mt-1'}><PersonaToggle persona={persona} onSwitch={onSwitchPersona} mobile={mobile} /></div>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Device frame ───────────────────────────────────────────────────────
function DeviceFrame({ device, overlay, children }) {
  if (device === 'mobile') {
    return (
      <div className="flex justify-center py-8">
        <div className="w-[392px] rounded-[2.4rem] border-[9px] border-ink/90 bg-canvas shadow-pop overflow-hidden">
          <div className="h-7 flex items-center justify-center">
            <div className="w-24 h-1.5 rounded-full bg-ink/15" />
          </div>
          {children}
        </div>
        {overlay}
      </div>
    );
  }
  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-[1200px] rounded-2xl border border-line bg-canvas shadow-pop overflow-hidden">
        <div className="h-9 bg-white border-b border-line flex items-center gap-1.5 px-4">
          <span className="w-3 h-3 rounded-full bg-rose-300" /><span className="w-3 h-3 rounded-full bg-amber-300" /><span className="w-3 h-3 rounded-full bg-emerald-300" />
          <div className="ml-3 h-5 flex-1 max-w-[320px] rounded bg-canvas border border-line text-[11px] text-muted flex items-center px-2">marketentrysecrets.com/report-creator</div>
        </div>
        <div className="bg-canvas">{children}</div>
      </div>
      {overlay}
    </div>
  );
}

// ── Prototype control bar ──────────────────────────────────────────────
const SCREENS = [
  { id: 'persona', label: 'Persona' }, { id: 'company', label: 'Company' },
  { id: 'goals', label: 'Goals' }, { id: 'profile', label: 'Details' }, { id: 'review', label: 'Review' },
  { id: 'auth', label: 'Auth' }, { id: 'generating', label: 'Generating' },
];
function ControlBar({ screen, setScreen, device, setDevice, persona, setPersona, onReset }) {
  return (
    <div className="sticky top-0 z-50 bg-ink text-white/90 border-b border-white/10">
      <div className="max-w-[1280px] mx-auto px-4 h-12 flex items-center gap-3 text-[12.5px]">
        <span className="font-semibold text-white whitespace-nowrap hidden sm:inline">Intake Redesign · v2</span>
        <div className="h-5 w-px bg-white/15 hidden sm:block" />
        <div className="flex items-center gap-1 overflow-x-auto">
          {SCREENS.map((s) => (
            <button key={s.id} onClick={() => setScreen(s.id)}
              className={`px-2.5 h-7 rounded-md whitespace-nowrap transition-colors ${screen === s.id ? 'bg-white text-ink font-semibold' : 'hover:bg-white/10'}`}>{s.label}</button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <div className="inline-flex p-0.5 rounded-md bg-white/10">
            {['desktop', 'mobile'].map((d) => (
              <button key={d} onClick={() => setDevice(d)} className={`px-2.5 h-6 rounded text-[11.5px] capitalize ${device === d ? 'bg-white text-ink font-semibold' : ''}`}>{d}</button>
            ))}
          </div>
          <div className="inline-flex p-0.5 rounded-md bg-white/10">
            {['international', 'startup'].map((p) => (
              <button key={p} onClick={() => setPersona(p)} className={`px-2.5 h-6 rounded text-[11.5px] ${persona === p ? 'bg-white text-ink font-semibold' : ''}`}>{p === 'international' ? 'Intl' : 'Startup'}</button>
            ))}
          </div>
          <button onClick={onReset} className="px-2 h-6 rounded text-[11.5px] hover:bg-white/10" title="Reset form">Reset</button>
        </div>
      </div>
    </div>
  );
}

// ── Tweak config ───────────────────────────────────────────────────────
const ACCENTS = {
  '#1AA3E0': { p: '#1AA3E0', pr: '26 163 224', d: '#0F6FA0', dr: '15 111 160', soft: '230 244 252', tint: '243 250 254' },
  '#4F6BED': { p: '#4F6BED', pr: '79 107 237', d: '#33449E', dr: '51 68 158', soft: '236 239 254', tint: '245 247 254' },
  '#119B8E': { p: '#119B8E', pr: '17 155 142', d: '#0B6A61', dr: '11 106 97', soft: '224 244 241', tint: '240 250 248' },
  '#8A5CF0': { p: '#8A5CF0', pr: '138 92 240', d: '#5E3DB0', dr: '94 61 176', soft: '239 233 254', tint: '247 244 254' },
};
const TYPEFACES = ['Plus Jakarta Sans', 'Manrope', 'Figtree'];
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#1AA3E0",
  "typeface": "Plus Jakarta Sans",
  "personaMode": "screen",
  "cardStyle": "soft",
  "density": "comfortable"
}/*EDITMODE-END*/;

// ── Root app ───────────────────────────────────────────────────────────
function App() {
  const saved = (() => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; } })();
  const [screen, setScreen] = useS(saved.screen || 'persona');
  const [device, setDevice] = useS(saved.device || 'desktop');
  const [persona, setPersonaRaw] = useS(saved.persona || 'international');
  const [form, setForm] = useS(saved.form || BLANK_FORM);
  const [authed, setAuthed] = useS(saved.authed || false);
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply accent + typeface to CSS variables
  useE(() => {
    const a = ACCENTS[tw.accent] || ACCENTS['#1AA3E0'];
    const r = document.documentElement.style;
    r.setProperty('--primary', a.p); r.setProperty('--primary-rgb', a.pr);
    r.setProperty('--primary-700', a.d); r.setProperty('--primary-700-rgb', a.dr);
    r.setProperty('--sky-soft-rgb', a.soft); r.setProperty('--sky-tint-rgb', a.tint);
    r.setProperty('--tw-primary', a.p);
    r.setProperty('--app-font', `'${tw.typeface}'`);
  }, [tw.accent, tw.typeface]);

  // Persona-mode A/B: in 'inline' mode there is no entry screen
  useE(() => {
    if (tw.personaMode === 'inline' && screen === 'persona') setScreen('company');
  }, [tw.personaMode, screen]);

  useE(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ screen, device, persona, form, authed }));
  }, [screen, device, persona, form, authed]);

  const mobile = device === 'mobile';
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  function pickPersona(p) {
    setPersonaRaw(p);
    set({ goal_ids: DEFAULT_GOALS[p] });
    setScreen('company');
  }
  function switchPersona(p) {
    if (p === persona) return;
    setPersonaRaw(p);
    set({ goal_ids: DEFAULT_GOALS[p] }); // goals differ per persona
  }
  function setPersonaCtl(p) { setPersonaRaw(p); if (!(form.goal_ids || []).length) set({ goal_ids: DEFAULT_GOALS[p] }); }
  function reset() { setForm(BLANK_FORM); setAuthed(false); setScreen(tw.personaMode === 'inline' ? 'company' : 'persona'); }

  const stepIndex = screen === 'company' ? 0 : screen === 'goals' ? 1 : screen === 'profile' ? 2 : screen === 'review' ? 3 : 0;

  let body;
  if (screen === 'persona') {
    body = <div className={mobile ? 'px-4 py-8' : 'px-6 py-12'}><PersonaScreen mobile={mobile} onPick={pickPersona} /></div>;
  } else if (screen === 'generating') {
    body = <div className={mobile ? 'px-4 py-10' : 'px-6 py-14'}><GeneratingScreen mobile={mobile} onDone={() => setScreen('done')} /></div>;
  } else if (screen === 'done') {
    body = (
      <div className={`mx-auto text-center ${mobile ? 'px-4 py-16 max-w-[340px]' : 'px-6 py-20 max-w-[440px]'}`}>
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4"><Icon name="check" size={32} /></div>
        <h2 className="text-[22px] font-bold text-ink">Your report is ready</h2>
        <p className="mt-2 text-[14px] text-muted">In the live product this opens your personalised market entry report.</p>
        <div className="mt-6 flex flex-col gap-2.5">
          <PrimaryButton icon="arrowRight" onClick={() => {}}>View report (demo)</PrimaryButton>
          <button onClick={reset} className="text-[13px] font-medium text-muted hover:text-ink">Start over</button>
        </div>
      </div>
    );
  } else {
    const inner =
      screen === 'company' ? <Step1 mobile={mobile} persona={persona} form={form} set={set} onNext={() => setScreen('goals')} inline={tw.personaMode === 'inline'} onPersona={switchPersona} /> :
      screen === 'goals' ? <Step2Goals mobile={mobile} persona={persona} form={form} set={set} onNext={() => setScreen('profile')} onBack={() => setScreen('company')} /> :
      screen === 'profile' ? <Step3Profile mobile={mobile} persona={persona} form={form} set={set} onNext={() => setScreen('review')} onBack={() => setScreen('goals')} /> :
      <ReviewScreen mobile={mobile} persona={persona} form={form} set={set} onGenerate={() => setScreen(authed ? 'generating' : 'auth')} onBack={() => setScreen('profile')} goToStep={(i) => setScreen(i === 1 ? 'company' : i === 2 ? 'goals' : 'profile')} />;
    body = <StepShell mobile={mobile} persona={persona} stepIndex={stepIndex} onSwitchPersona={switchPersona}>{inner}</StepShell>;
  }

  return (
    <div className={`min-h-screen app-${tw.density} card-${tw.cardStyle}`}>
      <ControlBar screen={screen} setScreen={setScreen} device={device} setDevice={setDevice} persona={persona} setPersona={setPersonaCtl} onReset={reset} />
      <DeviceFrame device={device} overlay={screen === 'auth' ? <AuthSheet mobile={mobile} onClose={() => setScreen('review')} onAuthed={() => { setAuthed(true); setScreen('generating'); }} /> : null}>
        <ProductNav mobile={mobile} />
        <div className="rc-surface">{body}</div>
      </DeviceFrame>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Experiment" />
        <TweakRadio label="Persona step" value={tw.personaMode}
          options={[{ value: 'screen', label: 'Full screen' }, { value: 'inline', label: 'Inline' }]}
          onChange={(v) => setTweak('personaMode', v)} />
        <TweakSection label="Brand" />
        <TweakColor label="Accent" value={tw.accent}
          options={Object.keys(ACCENTS)} onChange={(v) => setTweak('accent', v)} />
        <TweakSelect label="Typeface" value={tw.typeface}
          options={TYPEFACES} onChange={(v) => setTweak('typeface', v)} />
        <TweakSection label="Layout" />
        <TweakRadio label="Card style" value={tw.cardStyle}
          options={[{ value: 'soft', label: 'Soft' }, { value: 'outline', label: 'Outline' }, { value: 'elevated', label: 'Raised' }]}
          onChange={(v) => setTweak('cardStyle', v)} />
        <TweakRadio label="Density" value={tw.density}
          options={[{ value: 'comfortable', label: 'Comfortable' }, { value: 'compact', label: 'Compact' }]}
          onChange={(v) => setTweak('density', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
