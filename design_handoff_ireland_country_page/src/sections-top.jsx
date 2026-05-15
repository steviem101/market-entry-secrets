// Sections 1-3: Hero, Trade Snapshot, Why-Ireland narrative.

function TopNav() {
  return (
    <header className="border-b border-mes-border bg-white/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-5 md:px-10 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a href="#" className="flex items-center gap-2 group">
            <span className="w-7 h-7 rounded-md bg-mes-ink text-white grid place-items-center font-mono font-bold text-[12px] tracking-tight">M</span>
            <span className="font-semibold tracking-tight text-[15px]">Market Entry Secrets</span>
          </a>
          <nav className="hidden md:flex items-center gap-6 text-[13.5px] text-mes-ink-soft">
            <a href="#" className="hover:text-mes-ink flex items-center gap-1">Explore <Icon name="chevron-down" className="w-3 h-3" /></a>
            <a href="#" className="hover:text-mes-ink">Countries</a>
            <a href="#" className="hover:text-mes-ink">Partners</a>
            <a href="#" className="hover:text-mes-ink">Ignite</a>
            <a href="#" className="hover:text-mes-ink">Pricing</a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button className="hidden md:flex items-center gap-2 px-3 h-8 rounded-md border border-mes-border text-mes-ink-soft text-[12.5px] hover:border-mes-ink">
            <Icon name="search" className="w-3.5 h-3.5" />
            <span>Search 24 markets</span>
            <span className="font-mono text-[10px] px-1 py-px rounded bg-mes-bg border border-mes-border">⌘K</span>
          </button>
          <Button variant="dark" size="sm">Sign in</Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section data-screen-label="01 Hero" className="relative border-b border-mes-border overflow-hidden">
      <div className="absolute inset-0 grain opacity-60 pointer-events-none" />
      <div className="absolute right-0 top-0 w-1/2 h-full pointer-events-none hidden md:block">
        <div className="absolute right-[-10%] top-[-10%] w-[680px] h-[680px] rounded-full" style={{background: 'radial-gradient(circle at center, rgba(184,228,240,.4) 0%, rgba(184,228,240,0) 65%)'}} />
      </div>
      <div className="relative max-w-7xl mx-auto px-5 md:px-10 pt-10 pb-14 md:pt-16 md:pb-24">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[12.5px] text-mes-ink-muted mb-10">
          {HERO.breadcrumb.map((b, i) => (
            <React.Fragment key={b}>
              <a href="#" className={`${i === HERO.breadcrumb.length - 1 ? 'text-mes-ink font-medium' : 'hover:text-mes-ink-soft'}`}>{b}</a>
              {i < HERO.breadcrumb.length - 1 && <Icon name="chevron-right" className="w-3 h-3" />}
            </React.Fragment>
          ))}
        </nav>

        <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-end">
          <div className="md:col-span-8">
            {/* Country marker */}
            <div className="flex items-center gap-3 mb-6">
              <IrishFlag className="w-10 h-7 rounded-[3px] overflow-hidden border border-mes-border shadow-[0_1px_2px_rgba(0,0,0,.06)]" />
              <span className="text-[28px] font-semibold tracking-tight">Ireland</span>
              <span className="text-[12px] font-mono text-mes-ink-muted">IE · EUR · GMT+0</span>
            </div>

            {/* Headline */}
            <h1 className="text-[34px] md:text-[56px] leading-[1.02] tracking-[-0.02em] font-semibold text-mes-ink" style={{textWrap: 'balance'}}>
              Ireland to Australia: the founder's market entry playbook.
            </h1>

            <p className="mt-5 text-[17px] md:text-[19px] leading-relaxed text-mes-ink-soft max-w-2xl">
              {HERO.subhead}
            </p>

            {/* Trade badge */}
            <div className="mt-7 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-[12.5px] font-medium">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              {HERO.badge}
              <span className="text-emerald-700/60 font-mono text-[11px]">· DFAT tier 1</span>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button variant="primary" size="lg" trailingIcon="arrow-right">
                <span className="inline-flex items-center gap-2">
                  Generate my Ireland report
                  <span className="ml-1 font-mono text-[11px] px-1.5 py-0.5 rounded-md bg-white/15 border border-white/20">$</span>
                </span>
              </Button>
              <Button variant="outline" size="lg" leadingIcon="calendar">Book a 30-min Ireland specialist call</Button>
              <a href="#" className="group inline-flex items-center gap-1.5 text-[14px] font-medium text-mes-ink-soft hover:text-mes-ink">
                Download the Ireland playbook PDF
                <Icon name="arrow-right" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>

            {/* Trust */}
            <div className="mt-8 flex items-center gap-3 text-[12.5px] text-mes-ink-muted">
              <Icon name="users" className="w-3.5 h-3.5" />
              <span>Used by founders from</span>
              <span className="flex flex-wrap items-center gap-1.5">
                {HERO.trust.map((c) => (
                  <span key={c} className="px-2 py-0.5 rounded-md border border-mes-border bg-white text-mes-ink-soft font-medium">{c}</span>
                ))}
                <span className="text-mes-ink-muted">and {HERO.trustExtra}+ more</span>
              </span>
            </div>
          </div>

          {/* Right rail: live snapshot */}
          <div className="md:col-span-4">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-mes-ink-muted">Ireland · Live snapshot</div>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-mes-ink-muted font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> updated 14 May 2026
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-mes-ink-muted font-mono">EUR / AUD</dt>
                  <dd className="text-[20px] font-semibold tabular-nums tracking-tight">1.6428</dd>
                  <dd className="text-[11px] text-emerald-700 font-mono">▲ 0.42%</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-mes-ink-muted font-mono">AU policy rate</dt>
                  <dd className="text-[20px] font-semibold tabular-nums tracking-tight">3.85%</dd>
                  <dd className="text-[11px] text-mes-ink-muted font-mono">RBA · held</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-mes-ink-muted font-mono">DUB → SYD</dt>
                  <dd className="text-[20px] font-semibold tabular-nums tracking-tight">21h 35m</dd>
                  <dd className="text-[11px] text-mes-ink-muted font-mono">via SIN · daily</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-mes-ink-muted font-mono">Director ID lead time</dt>
                  <dd className="text-[20px] font-semibold tabular-nums tracking-tight">4-6 wk</dd>
                  <dd className="text-[11px] text-amber-700 font-mono">non-resident</dd>
                </div>
              </dl>
              <div className="mt-5 pt-4 border-t border-mes-border flex items-center justify-between">
                <span className="text-[12px] text-mes-ink-soft">Visa pathway · 482 TSS most common</span>
                <a href="#" className="text-[12px] font-medium text-mes-teal-dark hover:text-mes-ink inline-flex items-center gap-1">All signals <Icon name="arrow-up-right" className="w-3 h-3" /></a>
              </div>
            </Card>
            <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-mes-ink-muted px-1">
              <span>11 case studies</span>
              <span>·</span>
              <span>6 trade agencies</span>
              <span>·</span>
              <span>30+ partners</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TradeSnapshot() {
  return (
    <section data-screen-label="02 Trade snapshot" className="bg-mes-ink text-white border-b border-mes-border">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-10 md:py-14">
        <div className="flex flex-wrap items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-mes-blue-light mb-2">Trade snapshot · IE × AU</div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">The numbers that matter before you incorporate.</h2>
          </div>
          <div className="text-[12px] font-mono text-white/50">Refreshed quarterly · last update Q1 2026</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 border border-white/10 rounded-xl overflow-hidden">
          {TRADE_METRICS.map((m, i) => (
            <div key={i} className={`p-5 md:p-6 ${i % 2 === 1 ? 'border-l border-white/10' : ''} ${i >= 2 ? 'border-t md:border-t-0 border-white/10' : ''} ${i > 0 && i % 6 !== 0 ? 'md:border-l md:border-white/10' : ''} bg-mes-ink hover:bg-white/[.02] transition-colors group`}>
              <div className="text-[11px] uppercase tracking-wider font-mono text-white/50 mb-3">{String(i + 1).padStart(2, '0')}</div>
              <div className="text-[26px] md:text-[30px] font-semibold tracking-tight tabular-nums leading-none">{m.value}</div>
              <div className="mt-2 text-[13px] text-white/85 leading-snug">{m.label}</div>
              <div className="mt-4 flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-wider">
                <span className={`${m.positive ? 'text-emerald-300' : 'text-amber-300'}`}>{m.delta}</span>
              </div>
              <div className="mt-1 text-[10.5px] font-mono uppercase tracking-wider text-white/40">src · {m.source}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyIreland() {
  return (
    <SectionShell
      id="why"
      label="03 Why this corridor works"
      eyebrow="03 · Why this corridor works"
      title="Why Ireland into Australia works."
      kicker="A common-law, English-speaking, mid-size SaaS economy 17,000km away. For an Irish founder, almost everything that matters is already familiar."
    >
      <div className="grid md:grid-cols-12 gap-10">
        <div className="md:col-span-7 space-y-7">
          {NARRATIVE_BULLETS.map((n, i) => (
            <div key={n.h} className="flex gap-5">
              <div className="shrink-0 w-9 h-9 rounded-lg bg-mes-bg border border-mes-border grid place-items-center font-mono text-[12px] text-mes-ink-soft">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <h3 className="text-[18px] font-semibold tracking-tight text-mes-ink">{n.h}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-mes-ink-soft">{n.b}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="md:col-span-5">
          <div className="sticky top-20">
            {/* Pull quote */}
            <figure className="bg-mes-ink text-white rounded-xl p-6 md:p-7 mb-5">
              <Icon name="quote" className="w-5 h-5 text-mes-blue-light mb-3" />
              <blockquote className="text-[19px] leading-snug tracking-tight font-medium">
                Sydney is where Irish fintech lands. Melbourne is where healthtech and edtech build.
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 text-[12px] text-white/60">
                <span className="w-7 h-7 rounded-full bg-mes-blue-light text-mes-ink-soft grid place-items-center font-semibold text-[11px]">MR</span>
                <span>MES editorial · founder briefing 2026</span>
              </figcaption>
            </figure>

            {/* Differentiators callout */}
            <div className="border border-mes-border rounded-xl p-6 bg-gradient-to-b from-mes-blue-light/30 to-white">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="git-compare-arrows" className="w-4 h-4 text-mes-teal-dark" />
                <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-mes-teal-dark">What is different vs US or UK</span>
              </div>
              <ul className="space-y-3.5">
                {DIFFERENTIATORS.map((d, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-mes-teal" />
                    <div>
                      <div className="text-[14px] font-semibold text-mes-ink leading-snug">{d.h}</div>
                      <div className="text-[13px] text-mes-ink-soft leading-relaxed mt-0.5">{d.b}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

Object.assign(window, { TopNav, Hero, TradeSnapshot, WhyIreland });
