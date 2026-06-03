// All inline data for the Ireland country page.
// Structured as typed-shaped constants so this is portable to Supabase.

const HERO = {
  breadcrumb: ['Explore', 'By Country', 'Ireland'],
  country: 'Ireland',
  headline: "Ireland to Australia: the founder's market entry playbook",
  subhead: "The complete playbook for Irish companies scaling to ANZ. Built from 11 founder case studies, 6 trade agencies, and 30+ vetted partners.",
  badge: 'Strong trade relationship',
  trust: ['Fenergo', 'Wayflyer', 'Tines', 'LearnUpon'],
  trustExtra: 50,
};

const TRADE_METRICS = [
  { value: '$US 560B', label: 'Ireland GDP (2024)', source: 'World Bank', delta: '+5.1% YoY', positive: true },
  { value: '5.3M',     label: 'Population',         source: 'CSO Ireland', delta: '+1.1% YoY', positive: true },
  { value: 'A$ 3.2B',  label: 'Two-way trade with AU', source: 'DFAT',     delta: '+8.4% YoY', positive: true },
  { value: '150+',     label: 'Irish companies in ANZ', source: 'Enterprise Ireland', delta: '12 new in 2024', positive: true },
  { value: 'IE → AU',  label: 'Net FDI flow direction', source: 'UNCTAD', delta: 'Outbound', positive: true },
  { value: 'Strong',   label: 'Trade relationship',    source: 'DFAT',   delta: 'Tier 1 partner', positive: true },
];

const NARRATIVE_BULLETS = [
  { h: 'Shared common law system.',  b: 'Contract enforcement, IP protection, and corporate governance work the way Irish founders expect. Less friction than entering civil-law markets like Germany or France.' },
  { h: 'English-speaking, regulator-friendly.', b: 'No translation costs, no localisation lift, no need for native-speaking sales hires from day one. ASIC, AUSTRAC, and APRA communicate in plain English with reasonable response times.' },
  { h: 'Time-zone bridge.', b: 'Sydney is 9 to 11 hours ahead of Dublin. Irish founders already serving the US East Coast find AU sales calls fit naturally into the morning after a US wrap-up. Australia becomes the second leg of a 24-hour coverage model.' },
  { h: 'Mature SaaS buying market.', b: 'Australian enterprise has high cloud adoption, US-comparable SaaS budgets per seat, and shorter sales cycles than the UK. Procurement is faster than continental Europe.' },
  { h: 'The Irish diaspora effect.',  b: 'Sydney and Melbourne have dense Irish founder and operator networks. The Irish Australian Chamber, GAA networks, and the informal Sydney-Dublin tech corridor mean warm intros are reachable for any Irish CEO landing in the market.' },
];

const DIFFERENTIATORS = [
  { h: 'Smaller market, less noise.', b: 'AU enterprise is ~10% the size of the US but ~5x less crowded with vendors. Easier to be a category leader.' },
  { h: 'Procurement moves faster than UK enterprise.', b: 'Mid-market AU deals close in 60 to 90 days. UK equivalents take 90 to 180.' },
  { h: 'More government grant access than the US.', b: 'R&D Tax Incentive refunds 43.5% for SMEs. EMDG covers export marketing. The US has no equivalent for foreign entrants.' },
  { h: 'Mandatory super and PAYG.', b: 'Employer obligations are heavier than the US, lighter than continental Europe. Budget 11.5% super on top of salary.' },
  { h: 'Director residency rule.', b: 'At least one Pty Ltd director must be ordinarily resident in Australia. This shapes your first hire.' },
];

const CASE_STUDIES = [
  { id: 'wayflyer',    name: 'Wayflyer',    sector: 'Fintech',       outcome: 'Scaled ANZ revenue to $20M+ inside 18 months from a Sydney base', color: '#0F766E', mark: 'WF' },
  { id: 'fenergo',     name: 'Fenergo',     sector: 'RegTech',       outcome: 'Won enterprise banking customers across NAB, ANZ, and Westpac', color: '#1E3A8A', mark: 'FN' },
  { id: 'tines',       name: 'Tines',       sector: 'Cybersecurity', outcome: 'Built an APAC GTM motion from Sydney serving Atlassian and Canva', color: '#0B132B', mark: 'TI' },
  { id: 'learnupon',   name: 'LearnUpon',   sector: 'EdTech',        outcome: 'Landed Telstra, Origin Energy, and 200+ AU mid-market customers', color: '#7C2D12', mark: 'LU' },
  { id: 'fineos',      name: 'FINEOS',      sector: 'InsurTech',     outcome: 'Powers core claims systems at TAL, MLC Life, and AIA Australia', color: '#312E81', mark: 'FE' },
  { id: 'spectrum',    name: 'Spectrum.Life', sector: 'HealthTech',  outcome: 'Deployed mental health platforms across AU corporates and universities', color: '#155E75', mark: 'SL' },
  { id: 'fexco',       name: 'Fexco',       sector: 'Fintech',       outcome: 'Built ANZ payments and FX corridor serving multinational clients', color: '#1F2937', mark: 'FX' },
  { id: 'daon',        name: 'Daon',        sector: 'RegTech',       outcome: 'Embedded into AU banking onboarding with Big Four engagements', color: '#3F3F46', mark: 'DA' },
  { id: 'kyckr',       name: 'Kyckr',       sector: 'RegTech',       outcome: 'Sold KYC compliance data to AU financial institutions', color: '#581C87', mark: 'KY' },
  { id: 'tpro',        name: 'T-Pro',       sector: 'HealthTech',    outcome: 'Rolled out clinical documentation tooling across AU public hospitals', color: '#0E7490', mark: 'TP' },
  { id: 'clanwilliam', name: 'Clanwilliam', sector: 'HealthTech',    outcome: 'Acquired AU practice management platforms to anchor APAC presence', color: '#166534', mark: 'CW' },
];

const SECTOR_FILTERS = ['All', 'Fintech', 'HealthTech', 'RegTech', 'EdTech', 'Cybersecurity', 'InsurTech'];

const AGENCIES = [
  { id: 'ei',     name: 'Enterprise Ireland',      role: 'Origin export agency',    description: 'Market Discovery Fund up to EUR 35k. Sydney office. Trade missions.', initials: 'EI' },
  { id: 'ida',    name: 'IDA Ireland',             role: 'Inward investment',       description: 'Reverse-direction support for AU companies entering Ireland. Useful for joint ventures.', initials: 'ID' },
  { id: 'ini',    name: 'Invest Northern Ireland', role: 'NI export agency',        description: 'Equivalent support for NI-based companies. Trade Accelerator programme.', initials: 'NI' },
  { id: 'austrade', name: 'Austrade (Dublin)',     role: 'AU destination agency',   description: 'In-market intelligence, buyer matching, free initial consultations.', initials: 'AU' },
  { id: 'dfat',   name: 'DFAT',                    role: 'AU foreign affairs',      description: 'Trade policy, bilateral agreements, business visa guidance.', initials: 'DF' },
  { id: 'iacc',   name: 'Irish Australian Chamber of Commerce', role: 'Bilateral network', description: 'Diaspora events in Sydney, Melbourne, Brisbane, Perth. Founder intros.', initials: 'IA' },
];

const MENTORS = [
  { id: 'm1', name: 'Senior Banking Operator',       archetype: 'Ex-NAB digital banking, 12 yr APAC', sector: 'Fintech' },
  { id: 'm2', name: 'Former Fenergo APAC Lead',      archetype: 'Built enterprise RegTech motion',   sector: 'RegTech' },
  { id: 'm3', name: 'Health Systems GM',             archetype: 'Public hospital procurement insider', sector: 'HealthTech' },
  { id: 'm4', name: 'EdTech Sales VP',               archetype: 'Closed Telstra, Origin, AGL',       sector: 'EdTech' },
  { id: 'm5', name: 'Cyber Channel Strategist',      archetype: 'Built reseller programme at Tines', sector: 'Cybersecurity' },
  { id: 'm6', name: 'Series B Operating Partner',    archetype: 'Two ANZ exits in SaaS',             sector: 'SaaS / GTM' },
];

const SERVICES = [
  { id: 'lawpath',     name: 'LawPath',           type: 'Legal',           description: 'Pty Ltd setup, shareholder agreements, employment contracts' },
  { id: 'airwallex',   name: 'Airwallex',         type: 'Banking & FX',    description: 'Multi-currency accounts, AUD-EUR settlement' },
  { id: 'deel',        name: 'Deel',              type: 'EOR / Payroll',   description: 'Hire AU staff before incorporating' },
  { id: 'ehero',       name: 'Employment Hero',   type: 'HR / Payroll',    description: 'Post-incorporation employer of record alternative' },
  { id: 'fcr',         name: 'FCR Media (Visa)',  type: 'Immigration',     description: '482 TSS, SC400, and employer sponsorship advice' },
  { id: 'hlb',         name: 'HLB Mann Judd',     type: 'Tax & Accounting',description: 'GST registration, R&D Tax Incentive applications, transfer pricing' },
];

const INVESTORS = [
  { id: 'blackbird', name: 'Blackbird Ventures',  stage: 'Seed → Series B', cheque: 'A$ 2 – 15M',  portfolio: 'Has co-invested in Irish-founded startups in AU' },
  { id: 'airtree',   name: 'AirTree Ventures',    stage: 'Seed → Series C', cheque: 'A$ 1 – 25M',  portfolio: 'Active in fintech, SaaS, marketplace' },
  { id: 'squarepeg', name: 'Square Peg Capital',  stage: 'Series A+',        cheque: 'A$ 5 – 30M',  portfolio: 'Cross-border specialist, EU and AU portfolio' },
  { id: 'tidal',     name: 'Tidal Ventures',      stage: 'Pre-seed → Series A', cheque: 'A$ 0.5 – 5M', portfolio: 'Open to Irish founders with AU traction' },
  { id: 'folklore',  name: 'Folklore Ventures',   stage: 'Seed',             cheque: 'A$ 0.25 – 3M',portfolio: 'Software-focused, founder-friendly terms' },
  { id: 'investible',name: 'Investible',          stage: 'Pre-seed → Seed',  cheque: 'A$ 0.1 – 1M', portfolio: 'Sector-agnostic, fast process' },
];

const PLAYBOOK = [
  {
    number: 1, title: 'Validate', timeRange: 'Months 0 – 2',
    summary: 'Pressure-test the AU opportunity with real buyers before you spend a euro on incorporation.',
    subSteps: [
      'Refine ICP for the AU market. Map account-level demand, not just TAM.',
      'Apply for Enterprise Ireland Market Discovery Fund (up to EUR 35k for AU market exploration).',
      'Book Austrade Dublin consultation. Free, useful, often overlooked.',
      'Run 15 to 20 buyer interviews with target AU personas. No selling, just validation.',
      'Confirm regulatory feasibility (data residency, sector-specific licensing, AUSTRAC if fintech).',
    ],
  },
  {
    number: 2, title: 'Structure', timeRange: 'Months 2 – 3',
    summary: 'Stand up the legal entity, tax registrations, and director arrangements before the first hire.',
    subSteps: [
      'Decide Pty Ltd vs Branch. Pty Ltd is the default for SaaS. Branch is rare and tax-inefficient.',
      'Register the Pty Ltd. Choose a registered office (use Stone & Chalk or a serviced address).',
      'Apply for ABN and TFN. Allow 28 days for ATO processing.',
      'Register for GST if turnover will exceed A$ 75k. Most B2B SaaS should register voluntarily anyway.',
      'Apply for the ASIC Director ID before appointing any director. This is now mandatory.',
      'Confirm director residency. At least one director must be ordinarily resident in Australia.',
      'Decide visa pathway for the founder or first hire: 482 TSS (employer sponsorship), SC400 (short-term project), or SID (skilled independent).',
    ],
  },
  {
    number: 3, title: 'Land', timeRange: 'Months 3 – 4',
    summary: 'Banking, payroll, workspace, insurance, super. The operational base that lets you hire.',
    subSteps: [
      'Open business banking. CommBank for traditional, Airwallex or Wise for multi-currency.',
      'Set up payroll. Employment Hero, Xero Payroll, or Deel (if pre-incorporation).',
      'Choose a working base. WeWork (multiple cities), Stone & Chalk (Sydney fintech hub), Fishburners (startup community).',
      'Insurance: public liability, professional indemnity, workers compensation. Mandatory in most states.',
      'Superannuation: register an employer super clearing house. Default fund or employee choice.',
    ],
  },
  {
    number: 4, title: 'Hire', timeRange: 'Months 4 – 6',
    summary: 'First hire decides whether year one is revenue or research. Almost always a country lead.',
    subSteps: [
      'First AU hire is almost always a sales lead or country manager, not a junior. Budget A$ 180k to 250k OTE.',
      'Use a recruiter for the first hire. Aquent, Talent International, or sector-specific firms. Expect 15 to 20% fees.',
      'Fair Work obligations: minimum wage, NES, modern awards. Get legal advice on contracts.',
      'Employee share schemes: AU has improved ESS tax treatment in 2022, but structure carefully.',
    ],
  },
  {
    number: 5, title: 'Sell', timeRange: 'Months 6 – 12',
    summary: 'Procurement is faster than the UK. Channel partners get you to first A$ 1M.',
    subSteps: [
      'Government procurement: AusTender for federal, individual state portals for state government.',
      'Enterprise GTM: target top 200 ASX-listed companies. Procurement is faster than UK FTSE equivalents.',
      'Channel strategy: AU has a strong reseller ecosystem (Data#3, Dicker Data, rhipe). Useful for first $1M.',
      'Partnerships: Atlassian, Canva, and SafetyCulture all run partner programmes that fast-track Irish SaaS into AU accounts.',
    ],
  },
  {
    number: 6, title: 'Scale', timeRange: 'Year 2+',
    summary: 'Local funding, NZ add-on, APAC hub. The R&D Tax Incentive starts paying for itself.',
    subSteps: [
      'Series A or B in market. AU VCs prefer founders with AU revenue traction over EU traction.',
      'New Zealand expansion. Small market (5M people) but easy add-on. Same time zone, similar regulatory environment.',
      'APAC hub from Sydney. Singapore and Tokyo become reachable from a Sydney base.',
      'R&D Tax Incentive claims. Up to 43.5% refundable for SMEs. Worth A$ 200k to 1M per year for most SaaS.',
    ],
  },
];

const FUNDING_IE = [
  { h: 'Market Discovery Fund',            b: 'Enterprise Ireland · up to EUR 35k for AU market research', tag: 'Grant' },
  { h: 'High Potential Start-Up (HPSU)',   b: 'Enterprise Ireland · up to EUR 250k equity investment',     tag: 'Equity' },
  { h: 'SBCI guarantees',                  b: 'Strategic Banking Corporation of Ireland · debt backing',   tag: 'Debt' },
  { h: 'Local Enterprise Office grants',   b: 'Pre-HPSU companies · feasibility and priming grants',       tag: 'Grant' },
  { h: 'Halo Business Angel Network',      b: 'Curated angel intros for Irish-incorporated companies',     tag: 'Angel' },
];

const FUNDING_AU = [
  { h: 'R&D Tax Incentive',                b: '43.5% refundable for SMEs under A$ 20M turnover',           tag: 'Tax credit' },
  { h: 'Export Market Development Grant',  b: 'EMDG · up to A$ 770k over 8 years for export marketing',    tag: 'Grant' },
  { h: 'State-level grants',               b: 'NSW Going Global, Vic Global Growth, Qld Trade',            tag: 'Grant' },
  { h: 'AU VC funds (see ecosystem)',      b: 'Blackbird, AirTree, Square Peg, Tidal, Folklore, Investible', tag: 'Equity' },
  { h: 'Irish-Australian angels',          b: 'Via Irish Australian Chamber and diaspora networks',        tag: 'Angel' },
];

const EVENTS = [
  { date: '15 Mar 2026', city: 'Sydney',    name: 'Irish Australian Chamber of Commerce Annual Founder Dinner', desc: 'Diaspora-led founder dinner with operators and consuls.', tag: 'Network' },
  { date: '22 Apr 2026', city: 'Melbourne', name: 'Enterprise Ireland Trade Mission · SaaS focus',            desc: '12 Irish SaaS companies, curated AU buyer meetings.', tag: 'Mission' },
  { date: '08 May 2026', city: 'Sydney',    name: 'Stone & Chalk · Meet the Irish Founders',                   desc: 'Fintech-focused evening at the Sydney hub.', tag: 'Pitch' },
  { date: '12 Jun 2026', city: 'Brisbane',  name: 'Austrade Ireland Bilateral Tech Forum',                     desc: 'Public sector and AgTech buyer connections.', tag: 'Forum' },
];

const CITIES = [
  { name: 'Sydney',    tagline: 'Fintech and SaaS landing pad',          description: 'Where most Irish fintech and SaaS lands. Stone & Chalk, Tank Stream Labs, Atlassian HQ. Highest density of Irish operators. Sydney to Dublin direct route via Singapore.', sectors: ['Fintech', 'SaaS', 'Cyber'], swatch: '#2B7A8C' },
  { name: 'Melbourne', tagline: 'HealthTech, EdTech, creative tech',     description: 'Government grants from Vic Global. Strong Irish university partnerships (Trinity, UCD with Unimelb, Monash).', sectors: ['HealthTech', 'EdTech', 'Creative'], swatch: '#1F5C6B' },
  { name: 'Brisbane',  tagline: 'Mining-adjacent, defence, AgTech',      description: 'Lower cost base than Sydney and Melbourne. Queensland government runs Ireland-friendly trade programmes.', sectors: ['AgTech', 'Defence', 'Mining'], swatch: '#0E7490' },
  { name: 'Perth',     tagline: 'Energy and resources tech',             description: 'Time zone aligned with Singapore and Mumbai. Lower density of Irish founders but high-value sector entry.', sectors: ['Energy', 'Resources'], swatch: '#155E75' },
];

const FAQS = [
  { id: 'f1', q: 'Do I need an Australian director to incorporate a Pty Ltd?', a: 'Yes. ASIC requires at least one director who is ordinarily resident in Australia. For most Irish founders this means either relocating one of the founding team on a 482 visa, hiring a country manager early, or appointing a trusted local director through a corporate services firm.' },
  { id: 'f2', q: 'Can Enterprise Ireland fund my Australian expansion?', a: 'Enterprise Ireland clients can access the Market Discovery Fund (up to EUR 35k) specifically for new market exploration including AU. HPSU companies can stack equity investment on top. The Sydney EI office runs annual trade missions and can open buyer doors directly.' },
  { id: 'f3', q: 'Should I incorporate as a Pty Ltd or open an Australian branch?', a: 'For SaaS and software the default is a Pty Ltd. Branches expose the Irish parent to AU tax on worldwide income tied to the AU activity and are operationally painful. The Pty Ltd ring-fences AU liability and unlocks R&D Tax Incentive and EMDG eligibility.' },
  { id: 'f4', q: 'What is the ASIC Director ID and how do I get one as an Irish founder?', a: 'The Director ID is a mandatory unique identifier ASIC issues to every company director. You apply through the ABRS portal. Non-resident founders need to verify identity through a paper-based process with certified documents, which typically takes 4 to 6 weeks. Start this before incorporation.' },
  { id: 'f5', q: 'Is the 482 visa the best route for the first Irish hire I send out?', a: 'The 482 TSS is the most common path for sending an existing Irish team member into Australia for 2 to 4 years. It requires you to have a sponsored Pty Ltd, and the role must be on the relevant skilled occupation list. For short projects, the SC400 is faster. For permanent moves, employer-sponsored permanent residency is the goal.' },
  { id: 'f6', q: 'How does Australian GST work for an Irish SaaS billing AU customers?', a: 'If your AU turnover will exceed A$ 75k you must register for GST and charge 10% on AU sales. Most B2B SaaS register voluntarily from day one.' },
  { id: 'f7', q: 'Can I claim R&D Tax Incentive as an Irish-founded Pty Ltd?', a: 'Yes, provided the R&D activity is conducted in Australia and the Pty Ltd holds the IP or has a written agreement to do so. SMEs under A$ 20M turnover receive a 43.5% refundable credit.' },
  { id: 'f8', q: 'How long does ABN and TFN registration take from Ireland?', a: 'ABN is typically issued within 1 to 14 days. TFN can take up to 28 days. The Director ID step adds 4 to 6 weeks for non-residents, so start there first.' },
  { id: 'f9', q: 'What is the Export Market Development Grant and am I eligible?', a: 'EMDG is an AU-side reimbursement for export marketing costs, up to A$ 770k over 8 years. Your AU Pty Ltd must be the applicant, and the marketing must be aimed at non-AU markets, which often suits Irish-founded companies expanding APAC from Sydney.' },
  { id: 'f10', q: 'How do I open an Australian bank account from Dublin?', a: 'CommBank, NAB, and Westpac all support remote account opening for incorporated Pty Ltds, though identity verification is slow. Airwallex and Wise Business are faster for multi-currency operations.' },
  { id: 'f11', q: 'What are the tax implications of paying myself dividends from the AU Pty Ltd back to Ireland?', a: 'Franking credits do not flow to Irish shareholders, but the Australia-Ireland double tax treaty caps withholding at 15% (or 5% for substantial holdings). Get tax advice before declaring dividends.' },
  { id: 'f12', q: 'How does the Australia-Ireland double tax treaty work for SaaS revenue?', a: 'The treaty generally prevents double taxation on royalties and business profits. SaaS revenue characterisation matters; get a written position from an AU tax adviser early.' },
  { id: 'f13', q: 'Should I use Deel or incorporate before my first hire?', a: 'Deel as EOR is fine for the first 1 to 2 hires while you validate. Beyond that, incorporation usually pays back through R&D, EMDG, and lower per-head EOR fees.' },
  { id: 'f14', q: 'What is the difference between Fair Work obligations and Irish employment law?', a: 'AU has the National Employment Standards plus modern awards that set minimums by industry. Notice periods, leave, and unfair dismissal protections are stricter than the US, broadly aligned with Ireland.' },
  { id: 'f15', q: 'How can I get warm intros to Australian enterprise buyers as an Irish founder?', a: 'The Irish Australian Chamber, Enterprise Ireland Sydney, Austrade, and MES partner networks all run founder-to-buyer intro programmes. The Sydney-Dublin diaspora is small and reachable.' },
];

Object.assign(window, {
  HERO, TRADE_METRICS, NARRATIVE_BULLETS, DIFFERENTIATORS,
  CASE_STUDIES, SECTOR_FILTERS,
  AGENCIES, MENTORS, SERVICES, INVESTORS,
  PLAYBOOK, FUNDING_IE, FUNDING_AU, EVENTS, CITIES, FAQS,
});


// Shared UI primitives & icons.

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// Lucide icon helper -- creates an <i> with data-lucide attr and replaces icons after mount.
function Icon({ name, className = 'w-4 h-4', strokeWidth = 2 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons({ attrs: { 'stroke-width': strokeWidth }, nameAttr: 'data-lucide' });
    }
  });
  return <i ref={ref} data-lucide={name} className={className}></i>;
}

function Badge({ children, tone = 'default', className = '' }) {
  const tones = {
    default: 'bg-mes-bg text-mes-ink-soft border-mes-border',
    teal:    'bg-mes-teal/10 text-mes-teal-dark border-mes-teal/20',
    blue:    'bg-mes-blue-light/40 text-mes-teal-dark border-mes-blue-light',
    ink:     'bg-mes-ink text-white border-mes-ink',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warn:    'bg-amber-50 text-amber-800 border-amber-200',
    outline: 'bg-transparent text-mes-ink-soft border-mes-border',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase rounded-full border ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

function Button({ children, variant = 'primary', size = 'md', className = '', leadingIcon, trailingIcon, ...props }) {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-[15px]',
  };
  const variants = {
    primary:  'bg-mes-teal text-white border border-mes-teal hover:bg-mes-teal-dark hover:border-mes-teal-dark active:translate-y-px shadow-[0_1px_0_rgba(255,255,255,.2)_inset,0_1px_2px_rgba(26,26,46,.12)]',
    outline:  'bg-white text-mes-ink border border-mes-border hover:border-mes-ink hover:bg-white active:translate-y-px',
    ghost:    'bg-transparent text-mes-ink-soft border border-transparent hover:text-mes-ink hover:bg-mes-bg',
    link:     'bg-transparent text-mes-teal-dark hover:text-mes-ink p-0 border-0',
    dark:     'bg-mes-ink text-white border border-mes-ink hover:bg-black',
  };
  const sz = variant === 'link' ? '' : sizes[size];
  return (
    <button {...props} className={`inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-150 ${sz} ${variants[variant]} ${className}`}>
      {leadingIcon && <Icon name={leadingIcon} className="w-4 h-4" />}
      <span>{children}</span>
      {trailingIcon && <Icon name={trailingIcon} className="w-4 h-4" />}
    </button>
  );
}

function Card({ children, className = '', as: As = 'div', ...props }) {
  return (
    <As {...props} className={`bg-mes-card border border-mes-border rounded-xl shadow-[0_1px_0_rgba(26,26,46,.02),0_1px_2px_rgba(26,26,46,.04)] ${className}`}>
      {children}
    </As>
  );
}

function SectionShell({ id, eyebrow, title, kicker, children, dark = false, label }) {
  return (
    <section id={id} data-screen-label={label} className={`${dark ? 'bg-mes-ink text-white' : ''} border-b border-mes-border`}>
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-16 md:py-24">
        {(eyebrow || title || kicker) && (
          <div className="mb-10 md:mb-14 max-w-3xl">
            {eyebrow && (
              <div className={`text-[11px] font-mono uppercase tracking-[0.18em] mb-3 ${dark ? 'text-mes-blue-light' : 'text-mes-teal-dark'}`}>
                {eyebrow}
              </div>
            )}
            {title && (
              <h2 className={`text-3xl md:text-[40px] leading-[1.1] tracking-tight font-semibold ${dark ? 'text-white' : 'text-mes-ink'}`} style={{textWrap: 'balance'}}>
                {title}
              </h2>
            )}
            {kicker && (
              <p className={`mt-4 text-[16px] md:text-[17px] leading-relaxed max-w-2xl ${dark ? 'text-white/70' : 'text-mes-ink-soft'}`}>
                {kicker}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

// Tricolour SVG -- accurate green/white/orange.
function IrishFlag({ className = 'w-7 h-5 rounded-sm overflow-hidden border border-mes-border' }) {
  return (
    <span className={className} aria-label="Ireland">
      <svg viewBox="0 0 30 20" className="w-full h-full block">
        <rect x="0"  y="0" width="10" height="20" fill="#169B62" />
        <rect x="10" y="0" width="10" height="20" fill="#FFFFFF" />
        <rect x="20" y="0" width="10" height="20" fill="#FF883E" />
      </svg>
    </span>
  );
}

// Source tooltip / persistent caption.
function SourceTag({ label }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10.5px] font-mono uppercase tracking-wider text-mes-ink-muted">
      <span className="w-1 h-1 rounded-full bg-mes-ink-muted" />
      <span>src · {label}</span>
    </span>
  );
}

Object.assign(window, { Icon, Badge, Button, Card, SectionShell, IrishFlag, SourceTag });
