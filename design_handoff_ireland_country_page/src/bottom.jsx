// Sections 7-11: Funding, Events, Cities, FAQs, Lead-capture footer.

function FundingPathways() {
  return (
    <SectionShell
      id="funding"
      label="07 Funding pathways"
      eyebrow="07 · Funding pathways for Irish founders"
      title="Stack Irish-side equity with AU-side tax credits."
      kicker="Most successful Irish entrants combine an Enterprise Ireland grant with R&D Tax Incentive refunds and EMDG. Map your funding stack before incorporation."
    >
      <div className="grid md:grid-cols-2 gap-6">
        {/* IE column */}
        <Card className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <IrishFlag className="w-9 h-6 rounded-sm overflow-hidden border border-mes-border" />
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-mes-ink-muted">Origin side</div>
              <h3 className="text-[20px] font-semibold tracking-tight">Ireland — capital out</h3>
            </div>
          </div>
          <ul className="space-y-4">
            {FUNDING_IE.map((f, i) => (
              <li key={i} className="flex items-start gap-4 pb-4 border-b border-mes-border last:border-b-0 last:pb-0">
                <span className="font-mono text-[11px] text-mes-ink-muted mt-1 w-6 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <h4 className="text-[15px] font-semibold tracking-tight text-mes-ink">{f.h}</h4>
                    <Badge tone="default">{f.tag}</Badge>
                  </div>
                  <p className="text-[13.5px] text-mes-ink-soft mt-1 leading-relaxed">{f.b}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* AU column */}
        <Card className="p-6 md:p-8 bg-gradient-to-b from-white to-mes-blue-light/15">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-9 h-6 rounded-sm overflow-hidden border border-mes-border grid">
              <svg viewBox="0 0 30 20" className="w-full h-full block">
                <rect width="30" height="20" fill="#012169" />
                <g fill="#fff"><circle cx="22" cy="6" r="0.9"/><circle cx="25" cy="11" r="0.7"/><circle cx="20" cy="13" r="0.7"/><circle cx="24" cy="15" r="0.6"/></g>
                <path d="M0 0 L8 6 M8 0 L0 6" stroke="#fff" strokeWidth="1.2" />
                <path d="M0 0 L8 6 M8 0 L0 6" stroke="#E4002B" strokeWidth="0.6" />
                <path d="M4 -1 V7 M-1 3 H9" stroke="#fff" strokeWidth="2" />
                <path d="M4 -1 V7 M-1 3 H9" stroke="#E4002B" strokeWidth="1" />
              </svg>
            </span>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-mes-teal-dark">Destination side</div>
              <h3 className="text-[20px] font-semibold tracking-tight">Australia — credits in</h3>
            </div>
          </div>
          <ul className="space-y-4">
            {FUNDING_AU.map((f, i) => (
              <li key={i} className="flex items-start gap-4 pb-4 border-b border-mes-border last:border-b-0 last:pb-0">
                <span className="font-mono text-[11px] text-mes-ink-muted mt-1 w-6 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <h4 className="text-[15px] font-semibold tracking-tight text-mes-ink">{f.h}</h4>
                    <Badge tone="teal">{f.tag}</Badge>
                  </div>
                  <p className="text-[13.5px] text-mes-ink-soft mt-1 leading-relaxed">{f.b}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 rounded-xl border border-mes-border bg-mes-ink text-white px-6 py-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-mes-blue-light mb-1">Worked example</div>
          <p className="text-[14.5px] text-white/85"><span className="font-semibold text-white">Typical Series A Irish SaaS:</span> EUR 35k Market Discovery Fund + A$ 250k R&D refund + A$ 120k EMDG = roughly A$ 600k non-dilutive in year one.</p>
        </div>
        <Button variant="primary" size="md" trailingIcon="arrow-right">Model my stack</Button>
      </div>
    </SectionShell>
  );
}

// --- Events -----------------------------------------------------------------

function Events() {
  return (
    <SectionShell
      id="events"
      label="08 Events"
      eyebrow="08 · Upcoming events"
      title="Where to land an Irish CEO in Australia this year."
      kicker="Four curated events between March and June 2026. Diaspora dinners, trade missions, and bilateral forums."
    >
      <div className="grid md:grid-cols-4 gap-4">
        {EVENTS.map((e, i) => {
          const [day, month, year] = e.date.split(' ');
          return (
            <Card key={i} className="p-5 flex flex-col hover:border-mes-ink/30 transition-colors group">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="text-[40px] font-semibold tabular-nums leading-none tracking-tight text-mes-ink">{day}</div>
                  <div className="text-[13px] font-mono uppercase tracking-wider text-mes-ink-soft mt-1">{month} {year}</div>
                </div>
                <Badge tone="teal">{e.tag}</Badge>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-mes-ink-muted mb-2">
                <Icon name="map-pin" className="w-3.5 h-3.5" />
                <span className="font-mono uppercase tracking-wider">{e.city}</span>
              </div>
              <h4 className="text-[15px] font-semibold tracking-tight text-mes-ink leading-snug mb-2 min-h-[44px]">{e.name}</h4>
              <p className="text-[13px] text-mes-ink-soft leading-relaxed flex-1">{e.desc}</p>
              <div className="mt-4 pt-4 border-t border-mes-border">
                <a href="#" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-mes-teal-dark hover:text-mes-ink">
                  View event
                  <Icon name="arrow-right" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            </Card>
          );
        })}
      </div>
    </SectionShell>
  );
}

// --- Cities ------------------------------------------------------------------

function Cities() {
  return (
    <SectionShell
      id="cities"
      label="09 Cities"
      eyebrow="09 · Cities where Irish companies land"
      title="Sydney first. Then Melbourne. Then it depends."
      kicker="Four cities, three sector fits each. Pick your landing city based on customer concentration, not lifestyle."
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {CITIES.map((c, i) => (
          <Card key={c.name} className="overflow-hidden group flex flex-col">
            <div className="relative h-32 stripes border-b border-mes-border" style={{background: `linear-gradient(135deg, ${c.swatch}25, ${c.swatch}08)`}}>
              <div className="absolute inset-0 grain opacity-30" />
              <div className="absolute top-3 left-4 right-4 flex items-start justify-between">
                <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-mes-ink-soft">№{String(i + 1).padStart(2, '0')}</div>
                <div className="w-4 h-4 rounded-full border-2 border-white shadow" style={{background: c.swatch}} />
              </div>
              <div className="absolute bottom-3 left-4 right-4">
                <div className="text-[26px] font-semibold tracking-tight text-mes-ink leading-none">{c.name}</div>
                <div className="text-[12px] text-mes-ink-soft mt-1.5">{c.tagline}</div>
              </div>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <p className="text-[13.5px] leading-relaxed text-mes-ink-soft flex-1">{c.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {c.sectors.map(s => <Badge key={s} tone="default">{s}</Badge>)}
              </div>
              <div className="mt-4 pt-4 border-t border-mes-border">
                <a href="#" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-mes-teal-dark hover:text-mes-ink">
                  See {c.name} partners
                  <Icon name="arrow-right" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </SectionShell>
  );
}

// --- FAQs -------------------------------------------------------------------

function FAQs() {
  const [open, setOpen] = useState({ f1: true });
  const toggle = (id) => setOpen(o => ({ ...o, [id]: !o[id] }));

  return (
    <SectionShell
      id="faqs"
      label="10 FAQs"
      eyebrow="10 · Founder FAQs"
      title="15 questions Irish founders actually ask."
      kicker="From Director ID to franking credits. Long-form answers to the questions that surface on every Sydney-Dublin call."
    >
      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-4">
          <div className="sticky top-20">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-mes-ink-muted mb-3">Cant find your question?</div>
            <Card className="p-5 bg-mes-ink text-white border-mes-ink">
              <Icon name="message-circle-question" className="w-5 h-5 text-mes-blue-light mb-3" />
              <p className="text-[14.5px] leading-relaxed text-white/90">Submit a question and an Irish-Australian operator will answer it within 48 hours. We add it to this page if 3+ founders ask the same thing.</p>
              <div className="mt-4">
                <Button variant="primary" size="sm" trailingIcon="arrow-right">Ask a question</Button>
              </div>
            </Card>
            <div className="mt-5 flex items-center gap-3 text-[12px] text-mes-ink-muted">
              <Icon name="search" className="w-4 h-4" />
              <input placeholder="Search FAQs…" className="flex-1 bg-transparent border-b border-mes-border focus:border-mes-ink outline-none py-2 text-[13px] text-mes-ink placeholder-mes-ink-muted" />
            </div>
          </div>
        </div>

        <div className="md:col-span-8">
          <Card className="overflow-hidden divide-y divide-mes-border">
            {FAQS.map((f, i) => {
              const isOpen = open[f.id];
              return (
                <div key={f.id}>
                  <button onClick={() => toggle(f.id)} className="w-full text-left flex items-start gap-4 px-5 py-4 md:px-6 md:py-5 hover:bg-mes-bg/60 transition-colors">
                    <span className="font-mono text-[11px] text-mes-ink-muted w-7 shrink-0 mt-1">{String(i + 1).padStart(2, '0')}</span>
                    <span className="flex-1 text-[15px] font-semibold tracking-tight text-mes-ink leading-snug">{f.q}</span>
                    <Icon name={isOpen ? 'minus' : 'plus'} className="w-4 h-4 text-mes-ink-soft mt-1 shrink-0" />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 md:px-6 md:pb-6 fadeup">
                      <div className="ml-0 md:ml-11 text-[14.5px] leading-relaxed text-mes-ink-soft">{f.a}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </SectionShell>
  );
}

// --- Lead capture ------------------------------------------------------------

function TierCard({ tier, title, body, price, cta, featured, smallText, children }) {
  return (
    <Card className={`p-7 md:p-8 flex flex-col relative ${featured ? 'border-mes-ink shadow-[0_8px_40px_-12px_rgba(26,26,46,.25)] bg-white' : ''}`}>
      {featured && (
        <div className="absolute -top-3 left-7">
          <Badge tone="ink">Most popular</Badge>
        </div>
      )}
      <div className="flex items-center justify-between mb-5">
        <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-mes-ink-muted">{tier}</div>
        {price && <div className="text-[13px] font-semibold tabular-nums">{price}</div>}
      </div>
      <h3 className="text-[22px] font-semibold tracking-tight text-mes-ink leading-snug" style={{textWrap: 'balance'}}>{title}</h3>
      <p className="mt-3 text-[14px] text-mes-ink-soft leading-relaxed">{body}</p>
      <div className="mt-6 flex-1 flex flex-col justify-end gap-3">
        {children}
        <Button variant={featured ? 'primary' : 'dark'} size="md" trailingIcon="arrow-right" className="w-full justify-center">{cta}</Button>
        {smallText && <p className="text-[11.5px] text-mes-ink-muted leading-relaxed">{smallText}</p>}
      </div>
    </Card>
  );
}

function LeadCapture() {
  return (
    <section data-screen-label="11 Lead capture" className="border-b border-mes-border bg-gradient-to-b from-mes-bg to-white">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-16 md:py-24">
        <div className="max-w-3xl mb-12">
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-mes-teal-dark mb-3">11 · Get the playbook</div>
          <h2 className="text-3xl md:text-[40px] leading-[1.1] tracking-tight font-semibold">Three ways to get serious about Australia.</h2>
          <p className="mt-4 text-[16px] md:text-[17px] leading-relaxed text-mes-ink-soft">Free PDF, bespoke AI report, or a 30-minute call with an operator who has scaled an Irish company into ANZ. Pick the depth that matches your stage.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <TierCard
            tier="Tier 01 · Free"
            title="Get the Ireland to ANZ playbook"
            body="A 40-page PDF covering everything on this page in offline-readable format, plus the Irish founder checklist."
            cta="Send me the playbook"
            smallText="We will also add you to the Ireland founder newsletter (monthly, no spam)."
          >
            <div className="flex items-center gap-2 px-3 h-11 rounded-lg border border-mes-border bg-white">
              <Icon name="mail" className="w-4 h-4 text-mes-ink-muted" />
              <input placeholder="ceo@yourcompany.ie" className="flex-1 bg-transparent outline-none text-[13.5px] placeholder-mes-ink-muted" />
            </div>
          </TierCard>

          <TierCard
            tier="Tier 02 · Paid"
            title="Generate your Ireland-specific market entry report"
            body="A bespoke 60-page report covering your company, sector, ICP, regulatory exposure, partner shortlist, and 90-day GTM plan. Verified by an Irish-Australian operator."
            price="From A$ 299"
            cta="Start my report"
            featured
          >
            <div className="bg-mes-bg border border-mes-border rounded-lg p-3.5 text-[12.5px] text-mes-ink-soft space-y-1.5">
              <div className="flex items-center gap-2"><Icon name="check" className="w-3.5 h-3.5 text-emerald-600" /> Sector-specific buyer map</div>
              <div className="flex items-center gap-2"><Icon name="check" className="w-3.5 h-3.5 text-emerald-600" /> Regulatory exposure scoring</div>
              <div className="flex items-center gap-2"><Icon name="check" className="w-3.5 h-3.5 text-emerald-600" /> 90-day GTM plan</div>
              <div className="flex items-center gap-2"><Icon name="check" className="w-3.5 h-3.5 text-emerald-600" /> Operator-verified PDF</div>
            </div>
          </TierCard>

          <TierCard
            tier="Tier 03 · Premium"
            title="Book a 30-min Ireland-ANZ specialist call"
            body="Talk to an operator who has scaled an Irish company into Australia. Get answers to your specific situation, plus a written action plan."
            cta="Book a call"
            smallText="Free 30-minute discovery, paid consulting from A$ 500/hour."
          >
            <div className="bg-mes-bg border border-mes-border rounded-lg p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="calendar-days" className="w-4 h-4 text-mes-ink-soft" />
                <span className="text-[12.5px] text-mes-ink-soft">Next slot</span>
              </div>
              <span className="text-[12.5px] font-mono font-semibold tabular-nums">Thu 21 May · 09:30 IST</span>
            </div>
          </TierCard>
        </div>

        {/* Trust band */}
        <div className="mt-14 pt-10 border-t border-mes-border">
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-mes-ink-muted text-center mb-6">Trusted by Irish founders entering ANZ</div>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {CASE_STUDIES.slice(0, 8).map(c => (
              <div key={c.id} className="flex items-center gap-2 text-mes-ink-soft">
                <span className="w-7 h-7 rounded-md grid place-items-center text-white font-mono font-bold text-[10px]" style={{background: c.color}}>{c.mark}</span>
                <span className="text-[13.5px] font-semibold tracking-tight">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-mes-ink text-white">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-14">
        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-7 h-7 rounded-md bg-white text-mes-ink grid place-items-center font-mono font-bold text-[12px]">M</span>
              <span className="font-semibold tracking-tight text-[15px]">Market Entry Secrets</span>
            </div>
            <p className="text-[13.5px] text-white/60 leading-relaxed max-w-sm">B2B intelligence for international companies entering Australia and New Zealand. Bloomberg meets a smart directory.</p>
          </div>
          <div className="md:col-span-2">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-white/40 mb-3">Countries</div>
            <ul className="space-y-2 text-[13px] text-white/80">
              <li>Ireland</li><li>United Kingdom</li><li>United States</li><li>Singapore</li><li>Canada</li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-white/40 mb-3">Product</div>
            <ul className="space-y-2 text-[13px] text-white/80">
              <li>AI reports</li><li>Partner directory</li><li>Ignite consulting</li><li>API</li>
            </ul>
          </div>
          <div className="md:col-span-4">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-white/40 mb-3">Stay in the loop</div>
            <div className="flex items-center gap-2 px-3 h-11 rounded-lg border border-white/20 bg-white/5 mb-3">
              <input placeholder="Your email" className="flex-1 bg-transparent outline-none text-[13.5px] placeholder-white/40 text-white" />
              <button className="text-[12.5px] font-semibold text-mes-blue-light hover:text-white">Subscribe →</button>
            </div>
            <p className="text-[11.5px] text-white/40 leading-relaxed">Monthly Ireland-ANZ briefing. No spam.</p>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[12px] text-white/40">
          <div>© 2026 Market Entry Secrets</div>
          <div className="font-mono">Sydney · Melbourne · Dublin (via partners)</div>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { FundingPathways, Events, Cities, FAQs, LeadCapture, Footer });


// Root composition + sticky scroll bar.

function StickyBar() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`hidden md:block fixed top-14 left-0 right-0 z-20 transition-all duration-200 ${show ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0 pointer-events-none'}`}>
      <div className="bg-white/95 backdrop-blur border-b border-mes-border">
        <div className="max-w-7xl mx-auto px-5 md:px-10 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[12.5px]">
            <IrishFlag className="w-5 h-3.5 rounded-[2px] overflow-hidden border border-mes-border" />
            <nav className="flex items-center gap-1.5 text-mes-ink-muted">
              <span>Explore</span><Icon name="chevron-right" className="w-3 h-3" />
              <span>By Country</span><Icon name="chevron-right" className="w-3 h-3" />
              <span className="text-mes-ink font-medium">Ireland</span>
            </nav>
            <span className="hidden lg:inline text-mes-ink-muted">·</span>
            <span className="hidden lg:inline text-mes-ink-soft">Ireland → Australia playbook</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="#playbook" className="text-[12.5px] font-medium text-mes-ink-soft hover:text-mes-ink">Playbook</a>
            <a href="#ecosystem" className="text-[12.5px] font-medium text-mes-ink-soft hover:text-mes-ink">Ecosystem</a>
            <a href="#faqs" className="text-[12.5px] font-medium text-mes-ink-soft hover:text-mes-ink">FAQs</a>
            <Button variant="primary" size="sm" trailingIcon="arrow-right">Generate my Ireland report</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  // Refresh lucide icons after render
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  return (
    <div>
      <TopNav />
      <StickyBar />
      <main>
        <Hero />
        <TradeSnapshot />
        <WhyIreland />
        <CaseStudies />
        <Ecosystem />
        <PlaybookSection />
        <FundingPathways />
        <Events />
        <Cities />
        <FAQs />
        <LeadCapture />
      </main>
      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
