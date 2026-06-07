/**
 * Copy + curated option lists for the v2 intake redesign.
 * Mirrors docs/redesign/handoff/reference_src/rc-data.jsx (persona copy, the
 * curated quick-pick industries, the autocomplete seed). The full industry
 * search runs over the complete LinkedIn taxonomy (INDUSTRY_GROUP_OPTIONS),
 * not these slices.
 */
import type { ReportPersona } from '../intakeSchema.v2';

export interface PersonaCopy {
  key: ReportPersona;
  cardTitle: string;
  cardSub: string;
  cardIcon: string;
  badge: string;
  pageTitle: string;
  pageSub: string;
  step1Title: string;
  step1Sub: string;
  step2Title: string;
  step2Sub: string;
  regionLabel: string;
  regionHint: string;
  customerLabel: string;
  generateCta: string;
}

export const PERSONA_COPY: Record<ReportPersona, PersonaCopy> = {
  international: {
    key: 'international',
    cardTitle: 'International Entry',
    cardSub: 'Entering the Australian market from overseas',
    cardIcon: 'globe',
    badge: 'Most chosen',
    pageTitle: 'AI Market Entry Report',
    pageSub:
      "A few quick questions and we'll build a personalised report — matched providers, mentors, and an action plan for landing in Australia.",
    step1Title: 'Tell us about your company',
    step1Sub: "We'll read your website and match you to the right resources.",
    step2Title: 'Your market entry goals',
    step2Sub: 'Pick what matters — each goal shapes a section of your report.',
    regionLabel: 'Target regions in Australia',
    regionHint: 'Where are you looking to land? This drives provider, event and lead matching.',
    customerLabel: 'Who you sell to in Australia',
    generateCta: 'Generate my report',
  },
  startup: {
    key: 'startup',
    cardTitle: 'Startup Growth',
    cardSub: 'Scaling an Australian startup',
    cardIcon: 'rocket',
    badge: 'For local founders',
    pageTitle: 'AI Startup Growth Report',
    pageSub:
      "A few quick questions and we'll build a personalised report — matched investors, mentors, and a growth plan for your Aussie startup.",
    step1Title: 'Tell us about your startup',
    step1Sub: "We'll read your website and match you to the right resources.",
    step2Title: 'Your growth goals',
    step2Sub: 'Pick what matters — each goal shapes a section of your report.',
    regionLabel: 'Where you operate',
    regionHint: 'Your main markets in Australia. This drives investor, hub and lead matching.',
    customerLabel: 'Who you sell to',
    generateCta: 'Generate my report',
  },
};

// Top-10 industries surfaced first (≈70% of real usage); the rest sit behind
// "More (N)". Both are quick-picks — the search field covers the full taxonomy.
export const TOP_INDUSTRIES = [
  'Architecture & Planning', 'Data Infrastructure & Analytics', 'Capital Markets',
  'Credit Intermediation', 'Software Development', 'IT Services & Consulting',
  'Financial Services', 'Biotechnology Research', 'Medical Devices', 'Renewables & Environment',
];

export const MORE_INDUSTRIES = [
  'Advertising Services', 'Manufacturing', 'Retail', 'Logistics & Supply Chain',
  'Education', 'Hospitality', 'Real Estate', 'Telecommunications', 'Agriculture',
  'Legal Services', 'Pharmaceuticals', 'Insurance', 'Construction', 'Media & Entertainment',
];

/**
 * Autocomplete seed for the CompanyPicker. In production (P1.5 / Phase 4) this
 * is replaced by a type-ahead against the AU directory tables (investors,
 * service_providers, innovation_ecosystem, leads) which already carry domains.
 */
export interface DirectoryCompany {
  name: string;
  website: string;
  sector?: string;
}

export const COMPANY_DIRECTORY_SEED: DirectoryCompany[] = [
  { name: 'BHP Group', website: 'bhp.com', sector: 'Mining & Metals' },
  { name: 'Rio Tinto', website: 'riotinto.com', sector: 'Mining & Metals' },
  { name: 'Fortescue', website: 'fortescue.com', sector: 'Mining & Metals' },
  { name: 'Woodside Energy', website: 'woodside.com', sector: 'Oil & Energy' },
  { name: 'Commonwealth Bank', website: 'commbank.com.au', sector: 'Banking' },
  { name: 'Westpac', website: 'westpac.com.au', sector: 'Banking' },
  { name: 'NAB', website: 'nab.com.au', sector: 'Banking' },
  { name: 'ANZ', website: 'anz.com.au', sector: 'Banking' },
  { name: 'Macquarie Group', website: 'macquarie.com', sector: 'Capital Markets' },
  { name: 'Telstra', website: 'telstra.com.au', sector: 'Telecommunications' },
  { name: 'Optus', website: 'optus.com.au', sector: 'Telecommunications' },
  { name: 'Woolworths Group', website: 'woolworthsgroup.com.au', sector: 'Retail' },
  { name: 'Coles Group', website: 'colesgroup.com.au', sector: 'Retail' },
  { name: 'Wesfarmers', website: 'wesfarmers.com.au', sector: 'Retail' },
  { name: 'Qantas', website: 'qantas.com', sector: 'Airlines & Aviation' },
  { name: 'Atlassian', website: 'atlassian.com', sector: 'Software Development' },
  { name: 'Canva', website: 'canva.com', sector: 'Software Development' },
  { name: 'Xero', website: 'xero.com', sector: 'Software Development' },
  { name: 'WiseTech Global', website: 'wisetechglobal.com', sector: 'Software Development' },
  { name: 'REA Group', website: 'rea-group.com', sector: 'Internet' },
  { name: 'Seek', website: 'seek.com.au', sector: 'Internet' },
  { name: 'CSL', website: 'csl.com', sector: 'Biotechnology Research' },
  { name: 'Cochlear', website: 'cochlear.com', sector: 'Medical Devices' },
  { name: 'ResMed', website: 'resmed.com', sector: 'Medical Devices' },
  { name: 'Transurban', website: 'transurban.com', sector: 'Construction' },
  { name: 'Lendlease', website: 'lendlease.com', sector: 'Real Estate' },
  { name: 'AGL Energy', website: 'agl.com.au', sector: 'Utilities' },
  { name: 'Origin Energy', website: 'originenergy.com.au', sector: 'Utilities' },
  { name: 'Brambles', website: 'brambles.com', sector: 'Logistics & Supply Chain' },
  { name: 'Aristocrat', website: 'aristocrat.com', sector: 'Gambling & Casinos' },
];
