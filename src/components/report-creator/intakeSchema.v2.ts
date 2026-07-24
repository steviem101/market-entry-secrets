/**
 * Redesigned intake schema (v2) for the Market Entry / Startup Growth report flow.
 *
 * Canonical source for the redesigned /report-creator wizard (built in Phase 2).
 * Promoted from docs/redesign/intakeSchema.v2.draft.ts with the P0.1 shim fix
 * applied. The legacy src/components/report-creator/intakeSchema.ts stays in
 * place until the legacy steps are removed, at which point this becomes the
 * canonical intakeSchema.ts.
 *
 * Design principles (unchanged from the draft):
 *   1. High-impact textareas (target_customer_description, key_challenges,
 *      additional_notes) become STRUCTURED-then-free: chips + optional free text.
 *   2. Website-first onboarding — `website_url` first; a scrape can pre-fill the
 *      rest. `website_scrape_accepted` flags acceptance for analytics.
 *   3. Persona is decided BEFORE step 1 (changes goal list, tone, queries, labels).
 *   4. "Target Customer Profile" + "End Buyer Industries" + "End Buyers" unify
 *      into one `target_customers` object.
 *   5. Free-text capped at 300 chars (real data: mean 16–47 when used).
 *   6. `mapV2ToLegacyIntake()` projects v2 into the flat user_intake_forms shape
 *      the generate-report edge function consumes.
 *
 * P0.1 fix vs the draft: the shim now ALSO writes the stable `goal_ids` column
 * (the edge function keys matching off it) and the new structured columns, not
 * just legacy `services_needed` labels. See goalServiceTags.ts.
 */

import { z } from 'zod';
import { INDUSTRY_GROUP_OPTIONS } from '@/constants/linkedinTaxonomy';

// ── Persona ──────────────────────────────────────────────────────────────
export const PERSONA = ['international', 'startup'] as const;
export type ReportPersona = (typeof PERSONA)[number];

// ── Reused option arrays ──────────────────────────────────────────────────
export const COUNTRY_OPTIONS = [
  'Singapore', 'Japan', 'South Korea', 'Ireland', 'United Kingdom', 'United States',
  'India', 'Germany', 'France', 'Canada', 'New Zealand', 'Australia', 'Other',
] as const;

export const INDUSTRY_OPTIONS = INDUSTRY_GROUP_OPTIONS;

export const STAGE_OPTIONS = [
  'Startup/Seed', 'Series A-B', 'Growth/Scale-up', 'Enterprise/Corporate',
] as const;

export const EMPLOYEE_OPTIONS = [
  '1-10', '11-50', '51-200', '201-500', '500+',
] as const;

export const REVENUE_STAGE_OPTIONS = [
  'Pre-revenue', '<$500K', '$500K-$2M', '$2M+',
] as const;

export const REGION_OPTIONS = [
  'National', 'Sydney/NSW', 'Melbourne/VIC', 'Brisbane/QLD', 'Perth/WA',
  'Adelaide/SA', 'Not Sure',
] as const;

export const TIMELINE_OPTIONS = [
  'Immediate (0-3 months)', 'Short-term (3-6 months)',
  'Medium-term (6-12 months)', 'Exploratory (12+ months)',
] as const;

export const BUDGET_OPTIONS = [
  'Bootstrap (<$10K)', 'Moderate ($10K-$50K)',
  'Significant ($50K-$200K)', 'Enterprise ($200K+)',
] as const;

// ── Goal categories (visual grouping for the cards) ───────────────────────
export const GOAL_CATEGORIES = [
  { id: 'people', label: 'People & network', icon: 'users' },
  { id: 'capital', label: 'Capital & funding', icon: 'coins' },
  { id: 'knowledge', label: 'Knowledge & research', icon: 'book' },
  { id: 'compliance', label: 'Compliance & risk', icon: 'shield' },
  { id: 'ops', label: 'Operations & setup', icon: 'settings' },
] as const;

export type GoalCategory = (typeof GOAL_CATEGORIES)[number]['id'];

// ── Goals (icon-grouped cards) ────────────────────────────────────────────
// `id` is stable and drives matching (goalServiceTags.ts). `service_tags` map
// to provider/mentor/lead `.cs.{}` matching. `icon` (lucide name) + `unlocks`
// (the report section the goal feeds) drive the cards and the live ReportPreview.
export interface GoalDef {
  id: string;
  label: string;
  category: GoalCategory;
  personas: readonly ReportPersona[];
  service_tags: readonly string[];
  icon: string;
  unlocks: string;
}

export const GOALS: readonly GoalDef[] = [
  // International
  { id: 'find_providers', label: 'Find vetted service providers', category: 'ops', personas: ['international'], service_tags: ['Legal', 'Tax', 'HR', 'Accounting', 'Finance', 'Immigration'], icon: 'briefcase', unlocks: 'Service Providers' },
  { id: 'trade_agencies', label: 'Connect with trade & investment agencies', category: 'capital', personas: ['international'], service_tags: ['Trade Advisory', 'Government Relations', 'Investment'], icon: 'landmark', unlocks: 'Government & Trade' },
  { id: 'case_studies', label: 'Access market entry case studies', category: 'knowledge', personas: ['international'], service_tags: ['Market Research', 'Consulting'], icon: 'book', unlocks: 'Case Studies' },
  { id: 'guides', label: 'Read market entry guides & playbooks', category: 'knowledge', personas: ['international'], service_tags: ['Market Research', 'Consulting'], icon: 'lightbulb', unlocks: 'Market Entry Guides' },
  { id: 'market_research', label: 'Get market & industry research', category: 'knowledge', personas: ['international', 'startup'], service_tags: ['Market Research', 'Consulting', 'Data'], icon: 'search', unlocks: 'Market Research' },
  { id: 'associations', label: 'Find industry associations & chambers', category: 'people', personas: ['international'], service_tags: ['Industry Association', 'Chamber of Commerce'], icon: 'users', unlocks: 'Industry Bodies' },
  { id: 'events', label: 'Discover events & networking', category: 'people', personas: ['international', 'startup'], service_tags: ['Events', 'Networking'], icon: 'calendar', unlocks: 'Events & Networking' },
  { id: 'mentors_intl', label: 'Find experienced mentors & advisors', category: 'people', personas: ['international'], service_tags: ['Mentorship', 'Advisory', 'Consulting', 'Active Advisor', 'International Founder', 'Cross-border'], icon: 'compass', unlocks: 'Mentor Matches' },
  { id: 'lead_lists_intl', label: 'Access qualified lead lists', category: 'capital', personas: ['international'], service_tags: ['Lead Generation', 'Market Research', 'Data'], icon: 'target', unlocks: 'Lead List' },
  { id: 'compliance', label: 'Understand regulatory & compliance', category: 'compliance', personas: ['international'], service_tags: ['Legal', 'Compliance', 'Regulatory'], icon: 'shield', unlocks: 'Regulatory Brief' },
  // Startup
  { id: 'investors', label: 'Find investors & VCs', category: 'capital', personas: ['startup'], service_tags: ['Investment', 'Venture Capital', 'Funding'], icon: 'coins', unlocks: 'Investor Matches' },
  { id: 'accelerators', label: 'Discover accelerators & incubators', category: 'capital', personas: ['startup'], service_tags: ['Accelerator', 'Incubator', 'Startup'], icon: 'rocket', unlocks: 'Accelerators' },
  { id: 'mentors_startup', label: 'Connect with mentors & advisors', category: 'people', personas: ['startup'], service_tags: ['Mentorship', 'Advisory', 'Startup', 'Active Advisor', 'Startup Advisor', 'Scaled Founder'], icon: 'compass', unlocks: 'Mentor Matches' },
  { id: 'growth_providers', label: 'Find growth-stage service providers', category: 'ops', personas: ['startup'], service_tags: ['Legal', 'Finance', 'HR', 'Accounting'], icon: 'briefcase', unlocks: 'Service Providers' },
  { id: 'spaces', label: 'Find co-working & innovation hubs', category: 'ops', personas: ['startup'], service_tags: ['Co-working', 'Innovation Hub'], icon: 'building', unlocks: 'Co-working & Hubs' },
  { id: 'grants', label: 'Identify grants & government funding', category: 'capital', personas: ['international', 'startup'], service_tags: ['Grants', 'Government', 'Funding'], icon: 'landmark', unlocks: 'Grants & Funding' },
  { id: 'lead_lists_startup', label: 'Access lead lists & sales resources', category: 'capital', personas: ['startup'], service_tags: ['Lead Generation', 'Marketing', 'Sales'], icon: 'target', unlocks: 'Lead List' },
  // MES-236: no standalone peer-founder network exists; the real, grounded output is a
  // "Founder peers" sub-slate of vetted mentors who have themselves founded and scaled
  // (Scaled/International Founder archetypes). Copy names that so card ↔ report agree.
  { id: 'founders', label: 'Connect with founders who\'ve scaled', category: 'people', personas: ['startup'], service_tags: ['Networking', 'Community', 'Founder', 'Scaled Founder', 'Startup Ecosystem'], icon: 'users', unlocks: 'Founder peers & mentors' },
  { id: 'guides_startup', label: 'Read growth & scaling playbooks', category: 'knowledge', personas: ['startup'], service_tags: ['Market Research', 'Consulting'], icon: 'lightbulb', unlocks: 'Growth Playbooks' },
] as const;

/** Default pre-selected goals per persona (top goals from real data). */
export const DEFAULT_GOALS: Record<ReportPersona, string[]> = {
  international: ['lead_lists_intl', 'mentors_intl', 'find_providers'],
  startup: ['investors', 'mentors_startup', 'grants'],
};

/**
 * Refine the persona-default goals using Step 1 data (stage, industry, country).
 * Called once at the Step 1 → Step 2 transition IF the user hasn't already
 * customised their goals. Pure config — deterministic, no I/O. The output is
 * a superset of `DEFAULT_GOALS[persona]` capped at 6 picks so the goal grid
 * doesn't arrive overwhelmingly pre-ticked.
 */
export function smartDefaultGoals(
  persona: ReportPersona,
  stage?: string,
  industries?: string[],
  country?: string,
): string[] {
  const picks = new Set<string>(DEFAULT_GOALS[persona]);

  // ── Stage refinements ──────────────────────────────────────────────
  if (persona === 'startup') {
    if (stage === 'Startup/Seed') {
      picks.add('grants');          // R&D tax incentive, non-dilutive first
      picks.add('accelerators');
      picks.add('founders');
    } else if (stage === 'Series A-B') {
      picks.add('investors');
      picks.add('mentors_startup');
      picks.add('lead_lists_startup');
    } else if (stage === 'Growth/Scale-up') {
      picks.add('investors');
      picks.add('lead_lists_startup');
      picks.add('growth_providers');
    } else if (stage === 'Enterprise/Corporate') {
      picks.add('mentors_startup');
      picks.add('growth_providers');
    }
  } else {
    // International — every entrant needs compliance + market-entry providers
    picks.add('compliance');
    picks.add('find_providers');
    if (stage === 'Enterprise/Corporate') {
      picks.add('trade_agencies');
      picks.add('associations');
    } else {
      picks.add('mentors_intl');
      picks.add('trade_agencies');
    }
  }

  // ── Industry layer (case-insensitive match over the picked groups) ─
  const industryStr = (industries ?? []).join(' ').toLowerCase();
  if (/financ|bank|insur|capital|fintech|credit|funds/.test(industryStr)) {
    picks.add('compliance');
    if (persona === 'international') picks.add('associations');
  }
  if (/health|medic|pharma|biotech|clinical|hospital/.test(industryStr)) {
    picks.add('compliance');
    if (persona === 'startup') picks.add('grants');
  }
  if (/software|tech|saas|\bai\b|cyber|cloud|data|platform|internet/.test(industryStr)) {
    if (persona === 'startup') {
      picks.add('accelerators');
      picks.add('spaces');
    }
  }
  if (/manufactur|industrial|engineer|machinery/.test(industryStr)) {
    if (persona === 'international') {
      picks.add('trade_agencies');
      picks.add('associations');
    }
  }
  if (/educat|edtech|training|learning|university/.test(industryStr)) {
    if (persona === 'startup') picks.add('grants');
    if (persona === 'international') picks.add('associations');
  }
  if (/energy|utilit|cleantech|solar|renewable|sustainab/.test(industryStr)) {
    picks.add('grants');
    if (persona === 'international') picks.add('trade_agencies');
  }

  // ── Country corridor (international only) ──────────────────────────
  // Strong corridor partners with active Austrade/equivalent presence.
  if (persona === 'international' && country &&
      ['Singapore', 'Japan', 'South Korea', 'India', 'Ireland'].includes(country)) {
    picks.add('trade_agencies');
  }

  // Filter to goals that exist for this persona (defensive), cap at 6 so the
  // grid still shows un-ticked options the user can opt in to.
  const validForPersona = new Set(
    GOALS.filter((g) => g.personas.includes(persona)).map((g) => g.id),
  );
  return Array.from(picks).filter((id) => validForPersona.has(id)).slice(0, 6);
}

/** Goals available to a persona, in card display order. */
export function goalsForPersona(persona: ReportPersona): GoalDef[] {
  return GOALS.filter((g) => g.personas.includes(persona));
}

// ── Common challenges (chip multiselect, per persona) ─────────────────────
export const COMMON_CHALLENGES: Record<ReportPersona, readonly string[]> = {
  international: [
    'Regulatory & licensing',
    'Setting up a legal entity',
    'Visa & immigration',
    'Hiring local talent',
    'Finding distribution partners',
    'Tax & GST setup',
    'Cultural / business norms',
    'Logistics & supply chain',
    'Pricing for the AU market',
    'Cost of doing business',
    'Brand awareness',
    'Competing with incumbents',
  ],
  startup: [
    'Finding product-market fit',
    'Raising the next round',
    'Hiring engineering talent',
    'Customer acquisition cost',
    'Building partnerships',
    'Navigating R&D grants',
    'Scaling go-to-market',
    'Founder isolation',
    'Pricing strategy',
    'International expansion',
  ],
} as const;

// ── Structured target-customer chips ──────────────────────────────────────
export const CUSTOMER_TYPE = ['B2B', 'B2C', 'B2G', 'Mixed'] as const;
export const CUSTOMER_SIZE = ['SMB (<50)', 'Mid-market (50-500)', 'Enterprise (500+)', 'Mixed'] as const;
export const BUYING_MOTION = ['Direct sales', 'Channel / partners', 'Self-serve / marketplace', 'Mixed'] as const;

export const targetCustomerSchema = z.object({
  customer_type: z.enum(CUSTOMER_TYPE).optional(),
  customer_size: z.enum(CUSTOMER_SIZE).optional(),
  buying_motion: z.enum(BUYING_MOTION).optional(),
  // MES-231: explicit "we sell to every industry" catch-all for horizontal sellers.
  // Mutually exclusive with `industries` (selecting it clears the specific list);
  // the matcher reads it via raw_input to keep the buyer ICP neutral-wide.
  all_industries: z.boolean().default(false),
  industries: z.array(z.string()).max(5).default([]),
  named_companies: z.array(z.object({
    name: z.string().max(200),
    website: z.string().max(500).optional().default(''),
  })).max(5).default([]),
  notes: z.string().max(300).optional().default(''),
});

// ── Report-focus prompts (per persona; replaces additional_notes) ──────────
export const FOCUS_PROMPTS: Record<ReportPersona, readonly string[]> = {
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
} as const;

// ── Challenges structured ─────────────────────────────────────────────────
export const challengeSchema = z.object({
  tags: z.array(z.string()).max(8).default([]),
  other: z.string().max(200).optional().default(''),
});

// ── Step schemas ──────────────────────────────────────────────────────────

/** STEP 0 — Persona selection. */
export const step0Schema = z.object({
  persona: z.enum(PERSONA),
});

/** STEP 1 — Company (website-first). */
export const step1Schema = z.object({
  persona: z.enum(PERSONA),
  website_url: z.string().max(500).transform((val) => {
    const t = val.trim();
    if (t && !/^https?:\/\//i.test(t)) return `https://${t}`;
    return t;
  }).pipe(z.string().url('Please enter a valid URL')),
  company_name: z.string().min(1, 'Company name is required').max(200),
  country_of_origin: z.string().min(1, 'Country is required'),
  industry_sector: z.array(z.string()).min(1, 'Select at least one industry').max(3),
  company_stage: z.enum(STAGE_OPTIONS, { required_error: 'Company stage is required' }),
  employee_count: z.enum(EMPLOYEE_OPTIONS).optional(),
  revenue_stage: z.enum(REVENUE_STAGE_OPTIONS).optional(),
  target_regions: z.array(z.string()).min(1, 'Pick at least one target region'),
  website_scrape_accepted: z.boolean().default(false),
});

/** STEP 2 — Goals + customers + context. */
export const step2Schema = z.object({
  // No max: all goals are selectable (MES-228). The old .max(8) had no cost
  // rationale — goal count changes neither section count nor research volume
  // (D2: every section always generates) — and the UI never rendered its error,
  // so 9+ selections just dead-ended the Continue button.
  goal_ids: z.array(z.string()).min(1, 'Select at least one goal'),
  timeline: z.enum(TIMELINE_OPTIONS).optional(),
  budget_level: z.enum(BUDGET_OPTIONS).optional(),
  target_customers: targetCustomerSchema,
  known_competitors: z.array(z.object({
    name: z.string().max(200),
    website: z.string().max(500),
  })).max(3).default([]),
  challenges: challengeSchema,
  report_focus: z.string().max(200).optional().default(''),
});

export const fullIntakeSchema = step1Schema.merge(step2Schema);

export type Step0Data = z.infer<typeof step0Schema>;
export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type TargetCustomerData = z.infer<typeof targetCustomerSchema>;
export type ChallengeData = z.infer<typeof challengeSchema>;
export type IntakeFormDataV2 = z.infer<typeof fullIntakeSchema>;

// ── Legacy compatibility shim ─────────────────────────────────────────────
// Projects the v2 schema into the flat shape generate-report consumes, AND the
// new structured columns the migration added. P0.1: writes the stable goal_ids
// column (edge matching keys off it) — not just legacy services_needed labels.

interface LegacyIntakePayload {
  user_id: string;
  company_name: string;
  website_url: string;
  country_of_origin: string;
  industry_sector: string[];
  company_stage: string;
  employee_count: string;
  target_regions: string[];
  services_needed: string[]; // legacy: goal LABELS, for backward-compat reads
  timeline: string;
  budget_level: string;
  primary_goals: string;
  key_challenges: string;
  known_competitors: { name: string; website: string }[];
  end_buyer_industries: string[];
  end_buyers: { name: string; website: string }[];
  // v2 structured columns (added by intake_redesign migration)
  goal_ids: string[];
  customer_type: string | null;
  customer_size: string | null;
  buying_motion: string | null;
  challenge_tags: string[];
  challenge_other: string | null;
  report_focus: string | null;
  website_scrape_accepted: boolean;
  revenue_stage: string | null;
  raw_input: IntakeFormDataV2 & {
    target_customer_description: string;
    additional_notes: string;
  };
  status: 'pending';
}

export function mapV2ToLegacyIntake(
  data: IntakeFormDataV2,
  userId: string,
): LegacyIntakePayload {
  const selectedGoals = data.goal_ids
    .map((id) => GOALS.find((g) => g.id === id))
    .filter((g): g is GoalDef => Boolean(g));

  const goalLabels = selectedGoals.map((g) => g.label);
  const goalsText = goalLabels.join('; ');

  // Synthesise target_customer_description from structured fields.
  const tc = data.target_customers;
  const tcParts = [
    tc.customer_type && `${tc.customer_type} customers`,
    tc.customer_size,
    tc.buying_motion && `via ${tc.buying_motion.toLowerCase()}`,
    tc.industries.length > 0 && `in ${tc.industries.join(', ')}`,
    tc.notes,
  ].filter(Boolean).join(' — ');

  // Synthesise key_challenges from chip tags + free text.
  const challengesText = [
    data.challenges.tags.join(', '),
    data.challenges.other,
  ].filter(Boolean).join('. ');

  return {
    user_id: userId,
    company_name: data.company_name,
    website_url: data.website_url,
    country_of_origin: data.country_of_origin,
    industry_sector: data.industry_sector,
    company_stage: data.company_stage,
    employee_count: data.employee_count || '',
    target_regions: data.target_regions,
    services_needed: goalLabels, // legacy read-path
    timeline: data.timeline || '',
    budget_level: data.budget_level || '',
    primary_goals: goalsText,
    key_challenges: challengesText,
    known_competitors: data.known_competitors
      .filter((c) => (c.name ?? '').trim() || (c.website ?? '').trim())
      .map((c) => ({ name: c.name ?? '', website: c.website ?? '' })),
    // MES-231: a "sells to all industries" catch-all writes an EMPTY buyer list —
    // the sentinel (all_industries) rides in raw_input below, where the matcher
    // reads it to keep the ICP neutral-wide rather than gating to the own sector.
    end_buyer_industries: tc.all_industries ? [] : tc.industries,
    end_buyers: tc.named_companies
      .filter((b) => (b.name ?? '').trim() || (b.website ?? '').trim())
      .map((b) => ({ name: b.name ?? '', website: b.website ?? '' })),
    // v2 structured columns — write NULL (not '') so CHECK constraints pass.
    goal_ids: data.goal_ids,
    customer_type: tc.customer_type ?? null,
    customer_size: tc.customer_size ?? null,
    buying_motion: tc.buying_motion ?? null,
    challenge_tags: data.challenges.tags,
    challenge_other: data.challenges.other || null,
    report_focus: data.report_focus || null,
    website_scrape_accepted: data.website_scrape_accepted ?? false,
    revenue_stage: data.revenue_stage || null,
    raw_input: {
      ...data,
      target_customer_description: tcParts,
      additional_notes: data.report_focus || '',
    },
    status: 'pending',
  };
}
