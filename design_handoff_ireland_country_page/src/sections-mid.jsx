// Sections 4-6: Case studies carousel, Ecosystem tabs, Playbook accordion.

function LogoMark({ mark, color }) {
  return (
    <div className="w-12 h-12 rounded-lg grid place-items-center font-mono font-bold text-[14px] text-white tracking-tight shadow-[0_1px_0_rgba(255,255,255,.15)_inset]" style={{ background: color }}>
      {mark}
    </div>
  );
}

function CaseStudies() {
  const [filter, setFilter] = useState('All');
  const scrollerRef = useRef(null);
  const filtered = useMemo(
    () => filter === 'All' ? CASE_STUDIES : CASE_STUDIES.filter(c => c.sector === filter),
    [filter]
  );

  const scroll = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: 'smooth' });
  };

  return (
    <SectionShell
      id="case-studies"
      label="04 Case studies"
      eyebrow="04 · Featured Irish success stories"
      title="11 Irish companies. 11 playbooks worth stealing."
      kicker="Sorted by sector relevance. Every card links to the underlying GTM motion, hires, regulatory hurdles, and timeline."
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {SECTOR_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium border transition-all ${
                filter === s
                  ? 'bg-mes-ink text-white border-mes-ink'
                  : 'bg-white text-mes-ink-soft border-mes-border hover:border-mes-ink'
              }`}
            >
              {s}
              {filter === s && <span className="ml-1.5 opacity-50 font-mono text-[10px]">{filtered.length}</span>}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll(-1)} className="w-9 h-9 rounded-full border border-mes-border bg-white grid place-items-center hover:border-mes-ink transition-colors">
            <Icon name="arrow-left" className="w-4 h-4" />
          </button>
          <button onClick={() => scroll(1)} className="w-9 h-9 rounded-full border border-mes-border bg-white grid place-items-center hover:border-mes-ink transition-colors">
            <Icon name="arrow-right" className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-snap-x pb-4 -mx-5 px-5 md:-mx-10 md:px-10"
      >
        {filtered.map((c, i) => (
          <Card key={c.id} className="shrink-0 w-[320px] md:w-[360px] p-6 hover:border-mes-ink/40 transition-colors group">
            <div className="flex items-start justify-between mb-5">
              <LogoMark mark={c.mark} color={c.color} />
              <div className="text-right">
                <div className="text-[10.5px] font-mono uppercase tracking-wider text-mes-ink-muted">№{String(i + 1).padStart(2, '0')}</div>
                <div className="text-[11px] text-mes-ink-muted mt-0.5">Ireland → AU</div>
              </div>
            </div>
            <div className="mb-3 flex items-center gap-2">
              <h3 className="text-[20px] font-semibold tracking-tight text-mes-ink">{c.name}</h3>
              <Badge tone="teal">{c.sector}</Badge>
            </div>
            <p className="text-[14px] leading-relaxed text-mes-ink-soft min-h-[80px]">{c.outcome}</p>
            <div className="mt-5 pt-5 border-t border-mes-border flex items-center justify-between">
              <a href="#" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-mes-teal-dark hover:text-mes-ink">
                Read the playbook
                <Icon name="arrow-right" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </a>
              <div className="flex items-center gap-1 text-[11px] text-mes-ink-muted font-mono">
                <Icon name="clock" className="w-3 h-3" />
                <span>12 min</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-mes-ink-muted px-1">
        <span>Showing {filtered.length} of {CASE_STUDIES.length}</span>
        <span>Drag → or use ← → keys</span>
      </div>
    </SectionShell>
  );
}

// --- Ecosystem tabs ----------------------------------------------------------

function TabBar({ tabs, value, onChange }) {
  return (
    <div className="border-b border-mes-border mb-8 -mx-5 md:mx-0 px-5 md:px-0 overflow-x-auto no-scrollbar">
      <div className="flex items-stretch gap-1 min-w-max">
        {tabs.map((t) => {
          const active = t.id === value;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-t-lg transition-colors ${
                active ? 'text-mes-ink' : 'text-mes-ink-soft hover:text-mes-ink'
              }`}
            >
              <span className={`w-7 h-7 rounded-md grid place-items-center text-[11px] font-mono ${active ? 'bg-mes-ink text-white' : 'bg-mes-bg text-mes-ink-soft border border-mes-border'}`}>
                {String(t.idx).padStart(2, '0')}
              </span>
              <div className="text-left">
                <div className="text-[13.5px] font-semibold tracking-tight whitespace-nowrap">{t.title}</div>
                <div className="text-[11px] text-mes-ink-muted -mt-0.5">{t.count} entries</div>
              </div>
              {active && <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-mes-ink" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GridCard({ children, className = '' }) {
  return (
    <Card className={`p-5 hover:border-mes-ink/30 transition-colors flex flex-col ${className}`}>
      {children}
    </Card>
  );
}

function AgencyCard({ a }) {
  return (
    <GridCard>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 rounded-lg bg-mes-blue-light/40 border border-mes-blue-light text-mes-teal-dark grid place-items-center font-mono font-semibold text-[13px]">
          {a.initials}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[15px] font-semibold tracking-tight text-mes-ink leading-snug">{a.name}</h4>
          <div className="text-[12px] text-mes-ink-muted mt-0.5">{a.role}</div>
        </div>
      </div>
      <p className="text-[13.5px] leading-relaxed text-mes-ink-soft flex-1">{a.description}</p>
      <div className="mt-4 pt-4 border-t border-mes-border flex items-center justify-between">
        <a href="#" className="text-[12.5px] font-medium text-mes-teal-dark hover:text-mes-ink inline-flex items-center gap-1">View agency <Icon name="arrow-up-right" className="w-3 h-3" /></a>
        <span className="text-[11px] font-mono text-mes-ink-muted">Verified · 2026</span>
      </div>
    </GridCard>
  );
}

function MentorCard({ m }) {
  const initials = m.name.split(' ').map(w => w[0]).slice(0, 2).join('');
  return (
    <GridCard>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-mes-teal to-mes-teal-dark text-white grid place-items-center font-semibold text-[14px]">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[15px] font-semibold tracking-tight text-mes-ink leading-snug">{m.name}</h4>
          <div className="text-[12px] text-mes-ink-muted mt-0.5">{m.archetype}</div>
        </div>
      </div>
      <div className="flex items-center justify-between flex-1">
        <Badge tone="teal">{m.sector}</Badge>
        <span className="inline-flex items-center gap-1 text-[10.5px] font-mono uppercase tracking-wider text-amber-700">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Onboarding
        </span>
      </div>
      <div className="mt-4 pt-4 border-t border-mes-border">
        <Button variant="outline" size="sm" trailingIcon="arrow-right" className="w-full justify-center">Request an intro</Button>
      </div>
    </GridCard>
  );
}

function ServiceCard({ s }) {
  return (
    <GridCard>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-[16px] font-semibold tracking-tight text-mes-ink leading-snug">{s.name}</h4>
          <Badge tone="default" className="mt-1.5">{s.type}</Badge>
        </div>
        <Icon name="briefcase" className="w-4 h-4 text-mes-ink-muted" />
      </div>
      <p className="text-[13.5px] leading-relaxed text-mes-ink-soft flex-1">{s.description}</p>
      <div className="mt-4 pt-4 border-t border-mes-border flex items-center justify-between">
        <a href="#" className="text-[12.5px] font-medium text-mes-teal-dark hover:text-mes-ink inline-flex items-center gap-1">View partner <Icon name="arrow-up-right" className="w-3 h-3" /></a>
        <span className="inline-flex items-center gap-1 text-[10.5px] font-mono uppercase tracking-wider text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Vetted
        </span>
      </div>
    </GridCard>
  );
}

function InvestorCard({ inv }) {
  return (
    <GridCard>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-[16px] font-semibold tracking-tight text-mes-ink leading-snug">{inv.name}</h4>
          <div className="text-[12px] text-mes-ink-muted mt-1">{inv.stage}</div>
        </div>
        <Icon name="trending-up" className="w-4 h-4 text-mes-ink-muted" />
      </div>
      <dl className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-mes-bg rounded-md px-3 py-2 border border-mes-border">
          <dt className="text-[10px] uppercase tracking-wider font-mono text-mes-ink-muted">Cheque</dt>
          <dd className="text-[13px] font-semibold tabular-nums mt-0.5">{inv.cheque}</dd>
        </div>
        <div className="bg-mes-bg rounded-md px-3 py-2 border border-mes-border">
          <dt className="text-[10px] uppercase tracking-wider font-mono text-mes-ink-muted">Focus</dt>
          <dd className="text-[12px] font-semibold mt-0.5">{inv.stage.split(' ')[0]}</dd>
        </div>
      </dl>
      <p className="text-[13px] leading-relaxed text-mes-ink-soft flex-1">{inv.portfolio}</p>
      <div className="mt-4 pt-4 border-t border-mes-border">
        <Button variant="outline" size="sm" trailingIcon="arrow-right" className="w-full justify-center">View profile</Button>
      </div>
    </GridCard>
  );
}

function Ecosystem() {
  const tabs = [
    { id: 'agencies',  idx: 1, title: 'Government & trade agencies', count: AGENCIES.length },
    { id: 'mentors',   idx: 2, title: 'Mentors',                     count: MENTORS.length },
    { id: 'services',  idx: 3, title: 'Service providers',           count: SERVICES.length },
    { id: 'investors', idx: 4, title: 'Investors',                   count: INVESTORS.length },
  ];
  const [active, setActive] = useState('agencies');

  return (
    <SectionShell
      id="ecosystem"
      label="05 Support ecosystem"
      eyebrow="05 · Ireland into ANZ support ecosystem"
      title="Every door an Irish founder needs to knock on."
      kicker="Four interlocking layers. Government, mentors, service providers, capital. All vetted, all in one panel."
    >
      <TabBar tabs={tabs} value={active} onChange={setActive} />

      {active === 'mentors' && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/60 px-5 py-4 flex items-start gap-3">
          <div className="shrink-0 w-8 h-8 rounded-full bg-amber-100 border border-amber-200 grid place-items-center mt-0.5">
            <Icon name="users-round" className="w-4 h-4 text-amber-700" />
          </div>
          <div className="flex-1">
            <div className="text-[13.5px] font-semibold text-amber-900">We are building the Ireland mentor network.</div>
            <p className="text-[13px] text-amber-800/90 mt-0.5 leading-relaxed">Request an intro and we will match you with the right Irish-Australian operator for your stage.</p>
          </div>
          <Button variant="dark" size="sm" trailingIcon="arrow-right">Join the waitlist</Button>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {active === 'agencies'  && AGENCIES.map(a => <AgencyCard  key={a.id} a={a} />)}
        {active === 'mentors'   && MENTORS.map(m   => <MentorCard  key={m.id} m={m} />)}
        {active === 'services'  && SERVICES.map(s  => <ServiceCard key={s.id} s={s} />)}
        {active === 'investors' && INVESTORS.map(i => <InvestorCard key={i.id} inv={i} />)}
      </div>
    </SectionShell>
  );
}

// --- Playbook accordion -----------------------------------------------------

function PlaybookSection() {
  const [open, setOpen] = useState(1);

  return (
    <SectionShell
      id="playbook"
      label="06 Entry playbook"
      eyebrow="06 · Step-by-step entry playbook"
      title="Six stages. 12 months. Zero guesswork."
      kicker="From first buyer interview to second-year R&D refund. Built from the entry timelines of the 11 case studies above."
    >
      <div className="grid md:grid-cols-12 gap-8">
        {/* Stepper rail on left */}
        <div className="md:col-span-3 hidden md:block">
          <div className="sticky top-20 space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-mes-ink-muted mb-3 px-2">Timeline</div>
            {PLAYBOOK.map((s) => (
              <button
                key={s.number}
                onClick={() => setOpen(s.number)}
                className={`w-full text-left flex items-center gap-3 px-2.5 py-2 rounded-md transition-colors ${
                  open === s.number ? 'bg-mes-ink text-white' : 'hover:bg-mes-bg text-mes-ink-soft'
                }`}
              >
                <span className={`w-7 h-7 rounded-full grid place-items-center font-mono text-[12px] font-semibold ${
                  open === s.number ? 'bg-white text-mes-ink' : 'bg-mes-bg border border-mes-border text-mes-ink-soft'
                }`}>
                  {s.number}
                </span>
                <span className="flex-1">
                  <span className="block text-[13.5px] font-semibold tracking-tight">{s.title}</span>
                  <span className={`block text-[11px] ${open === s.number ? 'text-white/60' : 'text-mes-ink-muted'} font-mono`}>{s.timeRange}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Stage panels */}
        <div className="md:col-span-9 space-y-3">
          {PLAYBOOK.map((s, i) => {
            const isOpen = open === s.number;
            return (
              <Card key={s.number} className={`overflow-hidden transition-all ${isOpen ? 'border-mes-ink/30 shadow-[0_4px_20px_-8px_rgba(26,26,46,.12)]' : ''}`}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : s.number)}
                  className="w-full text-left p-5 md:p-6 flex items-center gap-5"
                >
                  <div className={`shrink-0 w-12 h-12 rounded-full grid place-items-center font-mono font-semibold transition-colors ${
                    isOpen ? 'bg-mes-teal text-white' : 'bg-mes-bg border border-mes-border text-mes-ink-soft'
                  }`}>
                    {String(s.number).padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="text-[20px] font-semibold tracking-tight text-mes-ink">{s.title}</h3>
                      <span className="text-[12px] font-mono text-mes-ink-muted">{s.timeRange}</span>
                    </div>
                    <p className="text-[14px] text-mes-ink-soft mt-1.5 leading-relaxed">{s.summary}</p>
                  </div>
                  <Icon name={isOpen ? 'minus' : 'plus'} className="w-5 h-5 text-mes-ink-soft shrink-0" />
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 md:px-6 md:pb-7 fadeup">
                    <div className="ml-0 md:ml-[68px] border-l-2 border-dashed border-mes-border pl-5 md:pl-7 space-y-4">
                      {s.subSteps.map((step, idx) => (
                        <div key={idx} className="relative flex gap-3">
                          <span className="absolute -left-[31px] md:-left-[37px] top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-mes-teal" />
                          <span className="font-mono text-[11px] text-mes-ink-muted shrink-0 mt-1 w-5">{String(idx + 1).padStart(2, '0')}</span>
                          <p className="text-[14.5px] leading-relaxed text-mes-ink">{step}</p>
                        </div>
                      ))}
                    </div>
                    <div className="ml-0 md:ml-[68px] mt-6 flex flex-wrap items-center gap-3">
                      <Button variant="dark" size="sm" trailingIcon="arrow-right">Open the {s.title.toLowerCase()} checklist</Button>
                      <a href="#" className="text-[12.5px] font-medium text-mes-teal-dark hover:text-mes-ink inline-flex items-center gap-1">See partners for this stage <Icon name="arrow-up-right" className="w-3 h-3" /></a>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}

Object.assign(window, { CaseStudies, Ecosystem, PlaybookSection });
