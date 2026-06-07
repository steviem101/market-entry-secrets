/* ============================================================
   rc-data.jsx — content + config for the intake redesign
   Mirrors docs/redesign/intakeSchema.v2.draft.ts (GOALS, categories,
   challenges, customer chips, focus prompts) plus persona copy.
   ============================================================ */

// ── Persona copy (the "copy doc" for both voices) ──────────────────────
const PERSONA_COPY = {
  international: {
    key: 'international',
    cardTitle: 'International Entry',
    cardSub: 'Entering the Australian market from overseas',
    cardIcon: 'globe',
    badge: 'Most chosen',
    pageTitle: 'AI Market Entry Report',
    pageSub: "A few quick questions and we'll build a personalised report — matched providers, mentors, and an action plan for landing in Australia.",
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
    pageSub: "A few quick questions and we'll build a personalised report — matched investors, mentors, and a growth plan for your Aussie startup.",
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

// ── Goal categories (visual grouping for the cards) ────────────────────
const GOAL_CATEGORIES = [
  { id: 'people',     label: 'People & network',   icon: 'users' },
  { id: 'capital',    label: 'Capital & funding',  icon: 'coins' },
  { id: 'knowledge',  label: 'Knowledge & research', icon: 'book' },
  { id: 'compliance', label: 'Compliance & risk',  icon: 'shield' },
  { id: 'ops',        label: 'Operations & setup', icon: 'settings' },
];

// ── Goals — mirrors GOALS[] in intakeSchema.v2.draft.ts ────────────────
// icon + `unlocks` (the report section the goal feeds) added for the cards.
const GOALS = [
  { id: 'find_providers',     label: 'Find vetted service providers', category: 'ops',        personas: ['international'],            icon: 'briefcase', unlocks: 'Service Providers' },
  { id: 'trade_agencies',     label: 'Connect with trade & investment agencies', category: 'capital', personas: ['international'],     icon: 'landmark',  unlocks: 'Government & Trade' },
  { id: 'case_studies',       label: 'Access market entry case studies', category: 'knowledge', personas: ['international'],           icon: 'book',      unlocks: 'Case Studies' },
  { id: 'guides',             label: 'Read market entry guides & playbooks', category: 'knowledge', personas: ['international'],        icon: 'lightbulb', unlocks: 'Market Entry Guides' },
  { id: 'market_research',    label: 'Get market & industry research', category: 'knowledge', personas: ['international', 'startup'], icon: 'search',    unlocks: 'Market Research' },
  { id: 'associations',       label: 'Find industry associations & chambers', category: 'people', personas: ['international'],         icon: 'users',     unlocks: 'Industry Bodies' },
  { id: 'events',             label: 'Discover events & networking', category: 'people',      personas: ['international', 'startup'], icon: 'calendar',  unlocks: 'Events & Networking' },
  { id: 'mentors_intl',       label: 'Find experienced mentors & advisors', category: 'people', personas: ['international'],          icon: 'compass',   unlocks: 'Mentor Matches' },
  { id: 'lead_lists_intl',    label: 'Access qualified lead lists', category: 'capital',      personas: ['international'],            icon: 'target',    unlocks: 'Lead List' },
  { id: 'compliance',         label: 'Understand regulatory & compliance', category: 'compliance', personas: ['international'],       icon: 'shield',    unlocks: 'Regulatory Brief' },
  { id: 'investors',          label: 'Find investors & VCs', category: 'capital',             personas: ['startup'],                 icon: 'coins',     unlocks: 'Investor Matches' },
  { id: 'accelerators',       label: 'Discover accelerators & incubators', category: 'capital', personas: ['startup'],               icon: 'rocket',    unlocks: 'Accelerators' },
  { id: 'mentors_startup',    label: 'Connect with mentors & advisors', category: 'people',   personas: ['startup'],                 icon: 'compass',   unlocks: 'Mentor Matches' },
  { id: 'growth_providers',   label: 'Find growth-stage service providers', category: 'ops',  personas: ['startup'],                 icon: 'briefcase', unlocks: 'Service Providers' },
  { id: 'spaces',             label: 'Find co-working & innovation hubs', category: 'ops',    personas: ['startup'],                 icon: 'building',  unlocks: 'Co-working & Hubs' },
  { id: 'grants',             label: 'Identify grants & government funding', category: 'capital', personas: ['international', 'startup'], icon: 'landmark', unlocks: 'Grants & Funding' },
  { id: 'lead_lists_startup', label: 'Access lead lists & sales resources', category: 'capital', personas: ['startup'],              icon: 'target',    unlocks: 'Lead List' },
  { id: 'founders',           label: 'Connect with other founders', category: 'people',       personas: ['startup'],                 icon: 'users',     unlocks: 'Founder Network' },
  { id: 'guides_startup',     label: 'Read growth & scaling playbooks', category: 'knowledge',  personas: ['startup'],                 icon: 'lightbulb', unlocks: 'Growth Playbooks' },
];

// Default pre-selected goals per persona (top goals from real data)
const DEFAULT_GOALS = {
  international: ['lead_lists_intl', 'mentors_intl', 'find_providers'],
  startup: ['investors', 'mentors_startup', 'grants'],
};

// ── Common challenges (chip multiselect, per persona) ──────────────────
const COMMON_CHALLENGES = {
  international: [
    'Regulatory & licensing', 'Setting up a legal entity', 'Visa & immigration',
    'Hiring local talent', 'Finding distribution partners', 'Tax & GST setup',
    'Cultural / business norms', 'Logistics & supply chain', 'Pricing for the AU market',
    'Cost of doing business', 'Brand awareness', 'Competing with incumbents',
  ],
  startup: [
    'Finding product-market fit', 'Raising the next round', 'Hiring engineering talent',
    'Customer acquisition cost', 'Building partnerships', 'Navigating R&D grants',
    'Scaling go-to-market', 'Founder isolation', 'Pricing strategy', 'International expansion',
  ],
};

// ── Structured target-customer chips ───────────────────────────────────
const CUSTOMER_TYPE = ['B2B', 'B2C', 'B2G', 'Mixed'];
const CUSTOMER_SIZE = ['SMB (<50)', 'Mid-market (50-500)', 'Enterprise (500+)', 'Mixed'];
const BUYING_MOTION = ['Direct sales', 'Channel / partners', 'Self-serve / marketplace', 'Mixed'];

// ── Report-focus prompts (replaces additional_notes) ───────────────────
const FOCUS_PROMPTS = {
  international: [
    'Help me prioritise where to start',
    'Compare AU vs my home market',
    'Show me who to email first',
    'Surface non-obvious risks',
    'Find me a launch partner',
  ],
  startup: [
    'Help me prioritise where to start',
    'Show me who to pitch first',
    'Which grants am I eligible for?',
    'Surface non-obvious risks',
    'Find me a strategic partner',
  ],
};

// ── Option arrays (from the live schema) ───────────────────────────────
const COUNTRY_OPTIONS = [
  'Singapore', 'Japan', 'South Korea', 'Ireland', 'United Kingdom', 'United States',
  'India', 'Germany', 'France', 'Canada', 'New Zealand', 'Australia', 'Other',
];

// Top-10 industries surfaced first (70% of real usage); rest behind "more".
const TOP_INDUSTRIES = [
  'Architecture & Planning', 'Data Infrastructure & Analytics', 'Capital Markets',
  'Credit Intermediation', 'Software Development', 'IT Services & Consulting',
  'Financial Services', 'Biotechnology Research', 'Medical Devices', 'Renewables & Environment',
];
const MORE_INDUSTRIES = [
  'Advertising Services', 'Manufacturing', 'Retail', 'Logistics & Supply Chain',
  'Education', 'Hospitality', 'Real Estate', 'Telecommunications', 'Agriculture',
  'Legal Services', 'Pharmaceuticals', 'Insurance', 'Construction', 'Media & Entertainment',
];

// Long tail of the LinkedIn taxonomy (~152 total) — reachable via search only.
// Representative slice; the production build reads src/constants/linkedinTaxonomy.ts in full.
const MORE_INDUSTRIES_TAIL = [
  'Accounting', 'Airlines & Aviation', 'Apparel & Fashion', 'Automotive', 'Aquaculture',
  'Banking', 'Broadcast Media', 'Chemicals', 'Civil Engineering', 'Computer Hardware',
  'Computer & Network Security', 'Consumer Electronics', 'Consumer Goods', 'Cosmetics',
  'Dairy', 'Defense & Space', 'Design Services', 'E-Learning', 'Electrical Manufacturing',
  'Environmental Services', 'Events Services', 'Facilities Services', 'Farming', 'Fishery',
  'Food & Beverages', 'Food Production', 'Fundraising', 'Furniture', 'Gambling & Casinos',
  'Government Administration', 'Graphic Design', 'Health, Wellness & Fitness',
  'Hospital & Health Care', 'Human Resources', 'Import & Export', 'Industrial Automation',
  'Information Services', 'International Trade & Development', 'Internet', 'Investment Banking',
  'Investment Management', 'Law Practice', 'Libraries', 'Logistics & Supply Chain',
  'Luxury Goods & Jewelry', 'Machinery', 'Management Consulting', 'Maritime', 'Marketing & Advertising',
  'Market Research', 'Mechanical & Industrial Engineering', 'Mining & Metals', 'Music',
  'Nanotechnology', 'Newspapers', 'Nonprofit Organization Management', 'Oil & Energy',
  'Online Media', 'Outsourcing & Offshoring', 'Packaging & Containers', 'Paper & Forest Products',
  'Performing Arts', 'Plastics', 'Primary/Secondary Education', 'Printing', 'Public Relations',
  'Public Safety', 'Publishing', 'Railroad Manufacture', 'Ranching', 'Recreational Facilities',
  'Religious Institutions', 'Research', 'Restaurants', 'Security & Investigations', 'Semiconductors',
  'Shipbuilding', 'Sporting Goods', 'Sports', 'Staffing & Recruiting', 'Textiles', 'Tobacco',
  'Translation & Localization', 'Transportation/Trucking/Railroad', 'Utilities', 'Venture Capital',
  'Veterinary', 'Warehousing', 'Wholesale', 'Wine & Spirits', 'Wireless', 'Writing & Editing',
];

// Full searchable taxonomy (deduped)
const ALL_INDUSTRIES = [...new Set([...TOP_INDUSTRIES, ...MORE_INDUSTRIES, ...MORE_INDUSTRIES_TAIL])];

const STAGE_OPTIONS = ['Startup/Seed', 'Series A-B', 'Growth/Scale-up', 'Enterprise/Corporate'];
const EMPLOYEE_OPTIONS = ['1-10', '11-50', '51-200', '201-500', '500+'];
const REVENUE_STAGE_OPTIONS = ['Pre-revenue', '<$500K', '$500K-$2M', '$2M+'];
const REGION_OPTIONS = ['National', 'Sydney/NSW', 'Melbourne/VIC', 'Brisbane/QLD', 'Perth/WA', 'Adelaide/SA', 'Not Sure'];
const TIMELINE_OPTIONS = ['Immediate (0-3 months)', 'Short-term (3-6 months)', 'Medium-term (6-12 months)', 'Exploratory (12+ months)'];
const BUDGET_OPTIONS = ['Bootstrap (<$10K)', 'Moderate ($10K-$50K)', 'Significant ($50K-$200K)', 'Enterprise ($200K+)'];

// ── Mock website-scrape result (the pre-fill demo) ─────────────────────
// Keyed loosely; any URL returns this so the "detected" moment can be shown.
const MOCK_SCRAPE = {
  company_name: 'Acme Robotics',
  country_of_origin: 'Singapore',
  industry_sector: ['Data Infrastructure & Analytics'],
  company_stage: 'Growth/Scale-up',
  employee_count: '51-200',
  customer_hint: { customer_type: 'B2B', customer_size: 'Mid-market (50-500)', buying_motion: 'Direct sales' },
};

// ── Mock company directory (autocomplete source) ──────────────────────
// In production this queries the AU directory tables (investors,
// service_providers, innovation_ecosystem, leads) which already carry domains.
const COMPANY_DIRECTORY = [
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

Object.assign(window, {
  PERSONA_COPY, GOAL_CATEGORIES, GOALS, DEFAULT_GOALS, COMMON_CHALLENGES,
  CUSTOMER_TYPE, CUSTOMER_SIZE, BUYING_MOTION, FOCUS_PROMPTS,
  COUNTRY_OPTIONS, TOP_INDUSTRIES, MORE_INDUSTRIES, MORE_INDUSTRIES_TAIL, ALL_INDUSTRIES,
  STAGE_OPTIONS, EMPLOYEE_OPTIONS,
  REVENUE_STAGE_OPTIONS, REGION_OPTIONS, TIMELINE_OPTIONS, BUDGET_OPTIONS, MOCK_SCRAPE, COMPANY_DIRECTORY,
});
