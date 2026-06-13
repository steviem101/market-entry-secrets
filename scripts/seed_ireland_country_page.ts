/**
 * Seed the Ireland country page content across the 6 country_page_* tables.
 *
 * Values are copied verbatim from design_handoff_ireland_country_page/src/core.jsx
 * (HERO, TRADE_METRICS, NARRATIVE_BULLETS, DIFFERENTIATORS, CASE_STUDIES,
 * PLAYBOOK, FUNDING_IE, FUNDING_AU, FAQS).
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed_ireland_country_page.ts
 *
 * Re-running is idempotent: each section deletes existing Ireland rows before insert.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env var.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const COUNTRY_SLUG = "ireland";

// ---------------------------------------------------------------------------
// Source-of-truth data (verbatim from core.jsx).
// ---------------------------------------------------------------------------

const HERO = {
  badge: "Strong trade relationship",
  headline: "Ireland to Australia: the founder's market entry playbook",
  subhead:
    "The complete playbook for Irish companies scaling to ANZ. Built from 11 founder case studies, 3 trade agencies, and 30+ vetted partners.",
  trust: ["Fenergo", "Wayflyer", "Tines", "LearnUpon"],
  trustExtra: 50,
};

const NARRATIVE_BULLETS = [
  {
    h: "Shared common law system.",
    b: "Contract enforcement, IP protection, and corporate governance work the way Irish founders expect. Less friction than entering civil-law markets like Germany or France.",
  },
  {
    h: "English-speaking, regulator-friendly.",
    b: "No translation costs, no localisation lift, no need for native-speaking sales hires from day one. ASIC, AUSTRAC, and APRA communicate in plain English with reasonable response times.",
  },
  {
    h: "Time-zone bridge.",
    b: "Sydney is 9 to 11 hours ahead of Dublin. Irish founders already serving the US East Coast find AU sales calls fit naturally into the morning after a US wrap-up. Australia becomes the second leg of a 24-hour coverage model.",
  },
  {
    h: "Mature SaaS buying market.",
    b: "Australian enterprise has high cloud adoption, US-comparable SaaS budgets per seat, and shorter sales cycles than the UK. Procurement is faster than continental Europe.",
  },
  {
    h: "The Irish diaspora effect.",
    b: "Sydney and Melbourne have dense Irish founder and operator networks. The Irish Australian Chamber, GAA networks, and the informal Sydney-Dublin tech corridor mean warm intros are reachable for any Irish CEO landing in the market.",
  },
];

const DIFFERENTIATORS = [
  {
    h: "Smaller market, less noise.",
    b: "AU enterprise is ~10% the size of the US but ~5x less crowded with vendors. Easier to be a category leader.",
  },
  {
    h: "Procurement moves faster than UK enterprise.",
    b: "Mid-market AU deals close in 60 to 90 days. UK equivalents take 90 to 180.",
  },
  {
    h: "More government grant access than the US.",
    b: "R&D Tax Incentive refunds 43.5% for SMEs. EMDG covers export marketing. The US has no equivalent for foreign entrants.",
  },
  {
    h: "Mandatory super and PAYG.",
    b: "Employer obligations are heavier than the US, lighter than continental Europe. Budget 12% super on top of salary.",
  },
  {
    h: "Director residency rule.",
    b: "At least one Pty Ltd director must be ordinarily resident in Australia. This shapes your first hire.",
  },
];

const TRADE_METRICS = [
  { value: "$US 560B", label: "Ireland GDP (2024)", source: "World Bank", delta: "+5.1% YoY", positive: true },
  { value: "5.3M", label: "Population", source: "CSO Ireland", delta: "+1.1% YoY", positive: true },
  { value: "A$ 3.2B", label: "Two-way trade with AU", source: "DFAT", delta: "+8.4% YoY", positive: true },
  { value: "150+", label: "Irish companies in ANZ", source: "Enterprise Ireland", delta: "12 new in 2024", positive: true },
  { value: "IE \u2192 AU", label: "Net FDI flow direction", source: "UNCTAD", delta: "Outbound", positive: true },
  { value: "Strong", label: "Trade relationship", source: "DFAT", delta: "Tier 1 partner", positive: true },
];

const CASE_STUDIES = [
  { name: "Wayflyer", sector: "Fintech", outcome: "Scaled ANZ revenue to $20M+ inside 18 months from a Sydney base", color: "#0F766E", mark: "WF" },
  { name: "Fenergo", sector: "RegTech", outcome: "Won enterprise banking customers across NAB, ANZ, and Westpac", color: "#1E3A8A", mark: "FN" },
  { name: "Tines", sector: "Cybersecurity", outcome: "Built an APAC GTM motion from Sydney serving Atlassian and Canva", color: "#0B132B", mark: "TI" },
  { name: "LearnUpon", sector: "EdTech", outcome: "Landed Telstra, Origin Energy, and 200+ AU mid-market customers", color: "#7C2D12", mark: "LU" },
  { name: "FINEOS", sector: "InsurTech", outcome: "Powers core claims systems at TAL, MLC Life, and AIA Australia", color: "#312E81", mark: "FE" },
  { name: "Spectrum.Life", sector: "HealthTech", outcome: "Deployed mental health platforms across AU corporates and universities", color: "#155E75", mark: "SL" },
  { name: "Fexco", sector: "Fintech", outcome: "Built ANZ payments and FX corridor serving multinational clients", color: "#1F2937", mark: "FX" },
  { name: "Daon", sector: "RegTech", outcome: "Embedded into AU banking onboarding with Big Four engagements", color: "#3F3F46", mark: "DA" },
  { name: "Kyckr", sector: "RegTech", outcome: "Sold KYC compliance data to AU financial institutions", color: "#581C87", mark: "KY" },
  { name: "T-Pro", sector: "HealthTech", outcome: "Rolled out clinical documentation tooling across AU public hospitals", color: "#0E7490", mark: "TP" },
  { name: "Clanwilliam", sector: "HealthTech", outcome: "Acquired AU practice management platforms to anchor APAC presence", color: "#166534", mark: "CW" },
];

const PLAYBOOK = [
  {
    number: 1,
    title: "Validate",
    timeRange: "Months 0 to 2",
    summary: "Pressure-test the AU opportunity with real buyers before you spend a euro on incorporation.",
    subSteps: [
      "Refine ICP for the AU market. Map account-level demand, not just TAM.",
      "Apply for Enterprise Ireland Market Discovery Fund (up to EUR 35k for AU market exploration).",
      "Book Austrade Dublin consultation. Free, useful, often overlooked.",
      "Run 15 to 20 buyer interviews with target AU personas. No selling, just validation.",
      "Confirm regulatory feasibility (data residency, sector-specific licensing, AUSTRAC if fintech).",
    ],
  },
  {
    number: 2,
    title: "Structure",
    timeRange: "Months 2 to 3",
    summary: "Stand up the legal entity, tax registrations, and director arrangements before the first hire.",
    subSteps: [
      "Decide Pty Ltd vs Branch. Pty Ltd is the default for SaaS. Branch is rare and tax-inefficient.",
      "Register the Pty Ltd. Choose a registered office (use Stone & Chalk or a serviced address).",
      "Apply for ABN and TFN. Allow 28 days for ATO processing.",
      "Register for GST if turnover will exceed A$ 75k. Most B2B SaaS should register voluntarily anyway.",
      "Apply for the ASIC Director ID before appointing any director. This is now mandatory.",
      "Confirm director residency. At least one director must be ordinarily resident in Australia.",
      "Decide visa pathway for the founder or first hire: 482 TSS (employer sponsorship), SC400 (short-term project), or SID (skilled independent).",
    ],
  },
  {
    number: 3,
    title: "Land",
    timeRange: "Months 3 to 4",
    summary: "Banking, payroll, workspace, insurance, super. The operational base that lets you hire.",
    subSteps: [
      "Open business banking. CommBank for traditional, Airwallex or Wise for multi-currency.",
      "Set up payroll. Employment Hero, Xero Payroll, or Deel (if pre-incorporation).",
      "Choose a working base. WeWork (multiple cities), Stone & Chalk (Sydney fintech hub), Fishburners (startup community).",
      "Insurance: public liability, professional indemnity, workers compensation. Mandatory in most states.",
      "Superannuation: register an employer super clearing house. Default fund or employee choice.",
    ],
  },
  {
    number: 4,
    title: "Hire",
    timeRange: "Months 4 to 6",
    summary: "First hire decides whether year one is revenue or research. Almost always a country lead.",
    subSteps: [
      "First AU hire is almost always a sales lead or country manager, not a junior. Budget A$ 180k to 250k OTE.",
      "Use a recruiter for the first hire. Aquent, Talent International, or sector-specific firms. Expect 15 to 20% fees.",
      "Fair Work obligations: minimum wage, NES, modern awards. Get legal advice on contracts.",
      "Employee share schemes: AU has improved ESS tax treatment in 2022, but structure carefully.",
    ],
  },
  {
    number: 5,
    title: "Sell",
    timeRange: "Months 6 to 12",
    summary: "Procurement is faster than the UK. Channel partners get you to first A$ 1M.",
    subSteps: [
      "Government procurement: AusTender for federal, individual state portals for state government.",
      "Enterprise GTM: target top 200 ASX-listed companies. Procurement is faster than UK FTSE equivalents.",
      "Channel strategy: AU has a strong reseller ecosystem (Data#3, Dicker Data, rhipe). Useful for first $1M.",
      "Partnerships: Atlassian, Canva, and SafetyCulture all run partner programmes that fast-track Irish SaaS into AU accounts.",
    ],
  },
  {
    number: 6,
    title: "Scale",
    timeRange: "Year 2+",
    summary: "Local funding, NZ add-on, APAC hub. The R&D Tax Incentive starts paying for itself.",
    subSteps: [
      "Series A or B in market. AU VCs prefer founders with AU revenue traction over EU traction.",
      "New Zealand expansion. Small market (5M people) but easy add-on. Same time zone, similar regulatory environment.",
      "APAC hub from Sydney. Singapore and Tokyo become reachable from a Sydney base.",
      "R&D Tax Incentive claims. Up to 43.5% refundable for SMEs. Worth A$ 200k to 1M per year for most SaaS.",
    ],
  },
];

const FUNDING_IE = [
  { h: "Market Discovery Fund", b: "Enterprise Ireland \u00b7 up to EUR 35k for AU market research", tag: "Grant" },
  { h: "High Potential Start-Up (HPSU)", b: "Enterprise Ireland \u00b7 up to EUR 250k equity investment", tag: "Equity" },
  { h: "SBCI guarantees", b: "Strategic Banking Corporation of Ireland \u00b7 debt backing", tag: "Debt" },
  { h: "Local Enterprise Office grants", b: "Pre-HPSU companies \u00b7 feasibility and priming grants", tag: "Grant" },
  { h: "Halo Business Angel Network", b: "Curated angel intros for Irish-incorporated companies", tag: "Angel" },
];

const FUNDING_AU = [
  { h: "R&D Tax Incentive", b: "43.5% refundable for SMEs under A$ 20M turnover", tag: "Tax credit" },
  { h: "Export Market Development Grant", b: "EMDG \u00b7 up to A$ 770k over 8 years for export marketing", tag: "Grant" },
  { h: "State-level grants", b: "NSW Going Global, Vic Global Growth, Qld Trade", tag: "Grant" },
  { h: "AU VC funds (see ecosystem)", b: "Blackbird, AirTree, Square Peg, Tidal, Folklore, Investible", tag: "Equity" },
  { h: "Irish-Australian angels", b: "Via Irish Australian Chamber and diaspora networks", tag: "Angel" },
];

const FAQS = [
  { q: "Do I need an Australian director to incorporate a Pty Ltd?", a: "Yes. ASIC requires at least one director who is ordinarily resident in Australia. For most Irish founders this means either relocating one of the founding team on a 482 visa, hiring a country manager early, or appointing a trusted local director through a corporate services firm." },
  { q: "Can Enterprise Ireland fund my Australian expansion?", a: "Enterprise Ireland clients can access the Market Discovery Fund (up to EUR 35k) specifically for new market exploration including AU. HPSU companies can stack equity investment on top. The Sydney EI office runs annual trade missions and can open buyer doors directly." },
  { q: "Should I incorporate as a Pty Ltd or open an Australian branch?", a: "For SaaS and software the default is a Pty Ltd. Branches expose the Irish parent to AU tax on worldwide income tied to the AU activity and are operationally painful. The Pty Ltd ring-fences AU liability and unlocks R&D Tax Incentive and EMDG eligibility." },
  { q: "What is the ASIC Director ID and how do I get one as an Irish founder?", a: "The Director ID is a mandatory unique identifier ASIC issues to every company director. You apply through the ABRS portal. Non-resident founders need to verify identity through a paper-based process with certified documents, which typically takes 4 to 6 weeks. Start this before incorporation." },
  { q: "Is the 482 visa the best route for the first Irish hire I send out?", a: "The 482 TSS is the most common path for sending an existing Irish team member into Australia for 2 to 4 years. It requires you to have a sponsored Pty Ltd, and the role must be on the relevant skilled occupation list. For short projects, the SC400 is faster. For permanent moves, employer-sponsored permanent residency is the goal." },
  { q: "How does Australian GST work for an Irish SaaS billing AU customers?", a: "If your AU turnover will exceed A$ 75k you must register for GST and charge 10% on AU sales. Most B2B SaaS register voluntarily from day one." },
  { q: "Can I claim R&D Tax Incentive as an Irish-founded Pty Ltd?", a: "Yes, provided the R&D activity is conducted in Australia and the Pty Ltd holds the IP or has a written agreement to do so. SMEs under A$ 20M turnover receive a 43.5% refundable credit." },
  { q: "How long does ABN and TFN registration take from Ireland?", a: "ABN is typically issued within 1 to 14 days. TFN can take up to 28 days. The Director ID step adds 4 to 6 weeks for non-residents, so start there first." },
  { q: "What is the Export Market Development Grant and am I eligible?", a: "EMDG is an AU-side reimbursement for export marketing costs, up to A$ 770k over 8 years. Your AU Pty Ltd must be the applicant, and the marketing must be aimed at non-AU markets, which often suits Irish-founded companies expanding APAC from Sydney." },
  { q: "How do I open an Australian bank account from Dublin?", a: "CommBank, NAB, and Westpac all support remote account opening for incorporated Pty Ltds, though identity verification is slow. Airwallex and Wise Business are faster for multi-currency operations." },
  { q: "What are the tax implications of paying myself dividends from the AU Pty Ltd back to Ireland?", a: "Franking credits do not flow to Irish shareholders, but the Australia-Ireland double tax treaty caps withholding at 15% (or 5% for substantial holdings). Get tax advice before declaring dividends." },
  { q: "How does the Australia-Ireland double tax treaty work for SaaS revenue?", a: "The treaty generally prevents double taxation on royalties and business profits. SaaS revenue characterisation matters; get a written position from an AU tax adviser early." },
  { q: "Should I use Deel or incorporate before my first hire?", a: "Deel as EOR is fine for the first 1 to 2 hires while you validate. Beyond that, incorporation usually pays back through R&D, EMDG, and lower per-head EOR fees." },
  { q: "What is the difference between Fair Work obligations and Irish employment law?", a: "AU has the National Employment Standards plus modern awards that set minimums by industry. Notice periods, leave, and unfair dismissal protections are stricter than the US, broadly aligned with Ireland." },
  { q: "How can I get warm intros to Australian enterprise buyers as an Irish founder?", a: "The Irish Australian Chamber, Enterprise Ireland Sydney, Austrade, and MES partner networks all run founder-to-buyer intro programmes. The Sydney-Dublin diaspora is small and reachable." },
];

const FEATURED_CITY_SLUGS = ["sydney", "melbourne", "brisbane", "perth"];

// ---------------------------------------------------------------------------
// Runner.
// ---------------------------------------------------------------------------

async function main() {
  const { data: country, error: countryError } = await supabase
    .from("countries")
    .select("id, name, slug")
    .eq("slug", COUNTRY_SLUG)
    .maybeSingle();

  if (countryError) throw countryError;
  if (!country) {
    throw new Error(`No row in countries with slug='${COUNTRY_SLUG}'. Seed countries first.`);
  }
  const countryId = country.id as string;
  console.log(`Seeding for ${country.name} (${countryId})`);

  // 1. country_page_content
  const { error: cpcError } = await supabase
    .from("country_page_content")
    .upsert(
      {
        country_id: countryId,
        hero_headline: HERO.headline,
        hero_subhead: HERO.subhead,
        hero_badge: HERO.badge,
        hero_trust_companies: HERO.trust,
        hero_trust_extra: HERO.trustExtra,
        narrative_bullets: NARRATIVE_BULLETS,
        differentiators: DIFFERENTIATORS,
        featured_city_slugs: FEATURED_CITY_SLUGS,
      },
      { onConflict: "country_id" },
    );
  if (cpcError) throw cpcError;
  console.log(" \u2713 country_page_content");

  // 2. country_trade_metrics
  await supabase.from("country_trade_metrics").delete().eq("country_id", countryId);
  const { error: tmError } = await supabase.from("country_trade_metrics").insert(
    TRADE_METRICS.map((m, i) => ({
      country_id: countryId,
      sort_order: i + 1,
      value: m.value,
      label: m.label,
      source: m.source,
      delta: m.delta,
      positive: m.positive,
    })),
  );
  if (tmError) throw tmError;
  console.log(` \u2713 country_trade_metrics (${TRADE_METRICS.length})`);

  // 3. country_case_studies
  await supabase.from("country_case_studies").delete().eq("country_id", countryId);
  const { error: csError } = await supabase.from("country_case_studies").insert(
    CASE_STUDIES.map((c, i) => ({
      country_id: countryId,
      sort_order: i + 1,
      company_name: c.name,
      sector: c.sector,
      outcome: c.outcome,
      logo_color: c.color,
      wordmark: c.mark,
    })),
  );
  if (csError) throw csError;
  console.log(` \u2713 country_case_studies (${CASE_STUDIES.length})`);

  // 4. country_playbook_stages
  await supabase.from("country_playbook_stages").delete().eq("country_id", countryId);
  const { error: pbError } = await supabase.from("country_playbook_stages").insert(
    PLAYBOOK.map((p) => ({
      country_id: countryId,
      stage_number: p.number,
      title: p.title,
      time_range: p.timeRange,
      summary: p.summary,
      sub_steps: p.subSteps,
    })),
  );
  if (pbError) throw pbError;
  console.log(` \u2713 country_playbook_stages (${PLAYBOOK.length})`);

  // 5. country_funding_instruments
  await supabase.from("country_funding_instruments").delete().eq("country_id", countryId);
  const fundingRows = [
    ...FUNDING_IE.map((f, i) => ({
      country_id: countryId,
      side: "origin" as const,
      sort_order: i + 1,
      title: f.h,
      body: f.b,
      tag: f.tag,
    })),
    ...FUNDING_AU.map((f, i) => ({
      country_id: countryId,
      side: "destination" as const,
      sort_order: i + 1,
      title: f.h,
      body: f.b,
      tag: f.tag,
    })),
  ];
  const { error: fiError } = await supabase.from("country_funding_instruments").insert(fundingRows);
  if (fiError) throw fiError;
  console.log(` \u2713 country_funding_instruments (${fundingRows.length})`);

  // 6. country_faqs
  await supabase.from("country_faqs").delete().eq("country_id", countryId);
  const { error: faqError } = await supabase.from("country_faqs").insert(
    FAQS.map((f, i) => ({
      country_id: countryId,
      sort_order: i + 1,
      question: f.q,
      answer: f.a,
    })),
  );
  if (faqError) throw faqError;
  console.log(` \u2713 country_faqs (${FAQS.length})`);

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
