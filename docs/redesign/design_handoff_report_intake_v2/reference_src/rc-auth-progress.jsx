/* ============================================================
   rc-auth-progress.jsx — Auth gate (pre-generation) + Generating
   ============================================================ */

function AuthSheet({ mobile, onClose, onAuthed }) {
  const [tab, setTab] = React.useState('signup');
  return (
    <div className={`fixed inset-0 z-40 flex justify-center ${mobile ? 'items-end' : 'items-center'}`}>
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative bg-white shadow-pop border border-line w-full max-w-[400px] p-5 ${mobile ? 'rounded-t-2xl mx-1 mb-1' : 'rounded-2xl m-4'}`}>
        {/* Reassurance banner — the key fix */}
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-3.5 py-3 flex items-center gap-2.5 mb-4">
          <span className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0"><Icon name="check" size={16} /></span>
          <div className="text-[13px] leading-snug">
            <b className="text-emerald-800">Your answers are saved.</b>
            <span className="text-emerald-700"> Create a free account to see your report.</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[16px] font-bold text-ink">One last step</h3>
          <button onClick={onClose} className="text-muted hover:text-ink"><Icon name="x" size={18} /></button>
        </div>

        {/* SSO primary */}
        <div className="space-y-2.5">
          <button onClick={onAuthed} className="w-full h-11 rounded-xl border border-line bg-white hover:bg-canvas flex items-center justify-center gap-2.5 text-[14px] font-semibold text-ink transition-colors">
            <span className="w-5 h-5 rounded-full bg-gradient-to-br from-sky-400 to-blue-500" /> Continue with Google
          </button>
          <button onClick={onAuthed} className="w-full h-11 rounded-xl border border-line bg-white hover:bg-canvas flex items-center justify-center gap-2.5 text-[14px] font-semibold text-ink transition-colors">
            <span className="w-5 h-5 rounded bg-gradient-to-br from-sky-500 to-indigo-500" /> Continue with Microsoft
          </button>
        </div>

        <div className="flex items-center gap-3 my-4">
          <div className="h-px bg-line flex-1" /><span className="text-[11px] text-muted">or email</span><div className="h-px bg-line flex-1" />
        </div>

        <div className="space-y-2.5">
          <input placeholder="you@company.com" className="w-full h-11 rounded-xl border border-line px-3.5 text-[14px] text-ink placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-sky-soft outline-none" />
          <PrimaryButton icon="arrowRight" onClick={onAuthed} className="w-full">Email me a magic link</PrimaryButton>
        </div>

        <p className="mt-3 text-center text-[11.5px] text-muted leading-snug flex items-center justify-center gap-1.5">
          <Icon name="lock" size={12} /> No password needed · takes 10 seconds
        </p>
      </div>
    </div>
  );
}

const GEN_PHASES = [
  { label: 'Reading your website & competitors', sub: 'Mapping pages, scraping public content' },
  { label: 'Running market research', sub: '6 parallel sources · landscape, regulation, costs, grants' },
  { label: 'Matching providers, mentors & events', sub: 'Searching the Australian directory' },
  { label: 'Writing & polishing your report', sub: 'Drafting 9 sections in Australian English' },
];
const FACTS = [
  'Tip: 67% of UK fintechs that entered AU used the EMDG grant.',
  'Sydney and Melbourne account for ~70% of new market entries.',
  "We're citing every claim — your report is source-backed.",
  'Your answers shaped 9 tailored sections, not a template.',
];

function GeneratingScreen({ mobile, onDone }) {
  const [phase, setPhase] = React.useState(0);
  const [fact, setFact] = React.useState(0);
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);
  React.useEffect(() => {
    if (phase >= GEN_PHASES.length) { const d = setTimeout(onDone, 900); return () => clearTimeout(d); }
    const t = setTimeout(() => setPhase((p) => p + 1), 2200);
    return () => clearTimeout(t);
  }, [phase]);
  React.useEffect(() => { const t = setInterval(() => setFact((f) => (f + 1) % FACTS.length), 3200); return () => clearInterval(t); }, []);

  const done = phase >= GEN_PHASES.length;
  const mm = String(Math.floor(elapsed / 60)).padStart(1, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  return (
    <div className={`mx-auto ${mobile ? 'max-w-[360px]' : 'max-w-[460px]'}`}>
      <div className="rounded-2xl border border-line bg-white shadow-card p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-sky-soft flex items-center justify-center mb-4">
            {done ? <span className="text-emerald-500"><Icon name="check" size={30} /></span>
              : <span className="w-8 h-8 rounded-full border-[3px] border-primary/25 border-t-primary animate-spin" />}
          </div>
          <h2 className="text-[21px] font-bold text-ink">{done ? 'Report ready' : 'Building your report'}</h2>
          <p className="mt-1 text-[13.5px] text-muted">
            {done ? 'Redirecting you now…' : <>Usually 2–4 minutes · <span className="tabular-nums text-body font-medium">{mm}:{ss}</span> elapsed</>}
          </p>
        </div>

        <div className="mt-5 space-y-2.5">
          {GEN_PHASES.map((p, i) => {
            const state = i < phase ? 'done' : i === phase ? 'active' : 'todo';
            return (
              <div key={i} className={`flex items-start gap-3 rounded-xl border p-3 transition-colors
                ${state === 'active' ? 'border-primary/40 bg-sky-tint' : 'border-line bg-white'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5
                  ${state === 'done' ? 'bg-emerald-500 text-white' : state === 'active' ? 'bg-sky-soft text-primary' : 'bg-canvas text-muted/40'}`}>
                  {state === 'done' ? <Icon name="check" size={14} />
                    : state === 'active' ? <span className="w-3 h-3 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                    : <span className="w-2 h-2 rounded-full bg-current" />}
                </span>
                <div className="min-w-0">
                  <div className={`text-[13.5px] font-semibold ${state === 'todo' ? 'text-muted' : 'text-ink'}`}>{p.label}</div>
                  <div className="text-[12px] text-muted leading-snug">{p.sub}</div>
                </div>
              </div>
            );
          })}
        </div>

        {!done && (
          <div className="mt-4 rounded-xl bg-canvas px-3.5 py-2.5 text-[12.5px] text-body flex items-center gap-2 min-h-[44px]">
            <span className="text-primary shrink-0"><Icon name="lightbulb" size={14} /></span>
            <span>{FACTS[fact]}</span>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { AuthSheet, GeneratingScreen });
