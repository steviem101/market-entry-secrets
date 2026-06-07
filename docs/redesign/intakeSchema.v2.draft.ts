/**
 * DRAFT: Redesigned intake schema for the Market Entry / Startup Growth report flow.
 *
 * Status: design draft — NOT wired into the live form.
 * Engineering handoff target: replace src/components/report-creator/intakeSchema.ts.
 *
 * Design principles applied:
 *   1. Most high-impact textareas (target_customer_description, key_challenges,
 *      additional_notes) become STRUCTURED-then-free: a chip multiselect that
 *      captures most users, with an optional free-text refinement.
 *   2. Website-first onboarding — `website_url` is collected first and a
 *      lightweight scrape can pre-fill `company_name`, `industry_sector`, etc.
 *      The schema marks `website_scrape_accepted` so we can A/B-test.
 *   3. Persona is decided BEFORE step 1 (it changes the goal list, the report
 *      tone, even the field labels). Stored as a top-level discriminator.
 *   4. Unify "Target Customer Profile" + "End Buyer Industries" + "End Buyers"
 *      into one `target_customers` object — they ask the same question.
 *   5. Cap free-text fields at 300 chars (was 500). Real data shows mean of
 *      16–47 chars when used; longer caps just add cognitive load.
 *   6. Keep backward compatibility with the existing edge function:
 *      `mapV2ToLegacyIntake()` at the bottom converts the new schema into the
 *      flat fields `generate-report` already consumes via `user_intake_forms`.
 */

import { z } from 'zod';
import { INDUSTRY_GROUP_OPTIONS } from '@/constants/linkedinTaxonomy';

// ── Persona ──────────────────────────────────────────────────────────────
export const PERSONA = ['international', 'startup'] as const;
export type ReportPersona = (typeof PERSONA)[number];

// ── Reused option arrays (mostly unchanged) ──────────────────────────────
export const COUNTRY_OPTIONS = [
  'Australia', 'New Zealand', 'United States', 'United Kingdom', 'Ireland',
  'Canada', 'Germany', 'France', 'Japan', 'Singapore', 'South Korea',
  'India', 'Other',
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
  'Sydney/NSW', 'Melbourne/VIC', 'Brisbane/QLD', 'Perth/WA',
  'Adelaide/SA', 'National', 'Not Sure',
] as const;

export const TIMELINE_OPTIONS = [
  'Immediate (0-3 months)', 'Short-term (3-6 months)',
  'Medium-term (6-12 months)', 'Exploratory (12+ months)',
] as const;

export const BUDGET_OPTIONS = [
  'Bootstrap (<$10K)', 'Moderate ($10K-$50K)',
  'Significant ($50K-$200K)', 'Enterprise ($200K+)',
] as const;

// ── NEW: structured goal cards (icon-grouped categories) ─────────────────
// Each goal has: id (stable), label (short), category (for visual grouping),
// service_tags (for downstream matching — replaces the brittle string lookup
// in supabase/functions/generate-report/index.ts:GOAL_SERVICE_TAGS).

export interface GoalDef {
  id: string;
  label: string;
  category: 'people' | 'capital' | 'knowledge' | 'compliance' | 'ops';
  personas: readonly ReportPersona[];
  service_tags: readonly string[];
}

export const GOALS: readonly GoalDef[] = [
  // International
  { id: 'find_providers', label: 'Find vetted service providers', category: 'ops', personas: ['international'], service_tags: ['Legal', 'Tax', 'HR', 'Accounting', 'Finance', 'Immigration'] },
  { id: 'trade_agencies', label: 'Connect with trade & investment agencies', category: 'capital', personas: ['international'], service_tags: ['Trade Advisory', 'Government Relations', 'Investment'] },
  { id: 'case_studies', label: 'Access market entry case studies', category: 'knowledge', personas: ['international'], service_tags: ['Market Research', 'Consulting'] },
  { id: 'associations', label: 'Find industry associations & chambers', category: 'people', personas: ['international'], service_tags: ['Industry Association', 'Chamber of Commerce'] },
  { id: 'events', label: 'Discover events & networking', category: 'people', personas: ['international', 'startup'], service_tags: ['Events', 'Networking'] },
  { id: 'mentors_intl', label: 'Find experienced mentors & advisors', category: 'people', personas: ['international'], service_tags: ['Mentorship', 'Advisory', 'Consulting'] },
  { id: 'lead_lists_intl', label: 'Access qualified lead lists', category: 'capital', personas: ['international'], service_tags: ['Lead Generation', 'Market Research', 'Data'] },
  { id: 'compliance', label: 'Understand regulatory & compliance', category: 'compliance', personas: ['international'], service_tags: ['Legal', 'Compliance', 'Regulatory'] },
  // Startup
  { id: 'investors', label: 'Find investors & VCs', category: 'capital', personas: ['startup'], service_tags: ['Investment', 'Venture Capital', 'Funding'] },
  { id: 'accelerators', label: 'Discover accelerators & incubators', category: 'capital', personas: ['startup'], service_tags: ['Accelerator', 'Incubator', 'Startup'] },
  { id: 'mentors_startup', label: 'Connect with mentors & advisors', category: 'people', personas: ['startup'], service_tags: ['Mentorship', 'Advisory', 'Startup'] },
  { id: 'growth_providers', label: 'Find growth-stage service providers', category: 'ops', personas: ['startup'], service_tags: ['Legal', 'Finance', 'HR', 'Accounting'] },
  { id: 'spaces', label: 'Find co-working & innovation hubs', category: 'ops', personas: ['startup'], service_tags: ['Co-working', 'Innovation Hub'] },
  { id: 'grants', label: 'Identify grants & government funding', category: 'capital', personas: ['international', 'startup'], service_tags: ['Grants', 'Government', 'Funding'] },
  { id: 'lead_lists_startup', label: 'Access lead lists & sales resources', category: 'capital', personas: ['startup'], service_tags: ['Lead Generation', 'Marketing', 'Sales'] },
  { id: 'founders', label: 'Connect with other founders', category: 'people', personas: ['startup'], service_tags: ['Networking', 'Community', 'Founder'] },
] as const;

// ── NEW: common challenges (chip multiselect) ────────────────────────────
// Real data shows users either skip the textarea (12% complete it) or write
// 5-30 chars. A chip selector captures most intent without typing.

export const COMMON_CHALLENGES = {
  international: [
    'Regulatory & licensing',
    'Setting up legal entity',
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

// ── NEW: structured target-customer profile ──────────────────────────────
// Replaces the open-ended `target_customer_description` textarea (only 27%
// completion in real data). Structured fields are required-ish; free text
// is optional refinement.

export const CUSTOMER_TYPE = ['B2B', 'B2C', 'B2G', 'Mixed'] as const;
export const CUSTOMER_SIZE = ['SMB (<50)', 'Mid-market (50-500)', 'Enterprise (500+)', 'Mixed'] as const;
export const BUYING_MOTION = ['Direct sales', 'Channel / partners', 'Self-serve / marketplace', 'Mixed'] as const;

export const targetCustomerSchema = z.object({
  customer_type: z.enum(CUSTOMER_TYPE).optional(),
  customer_size: z.enum(CUSTOMER_SIZE).optional(),
  buying_motion: z.enum(BUYING_MOTION).optional(),
  // industries you sell into (replaces end_buyer_industries)
  industries: z.array(z.string()).max(5).default([]),
  // specific named companies you want to sell to (replaces end_buyers list)
  named_companies: z.array(z.object({
    name: z.string().max(200),
    website: z.string().max(500).optional().default(''),
  })).max(5).default([]),
  // optional free-text refinement (was 500 chars — cut to 300)
  notes: z.string().max(300).optional().default(''),
});

// ── NEW: report focus (replaces additional_notes) ────────────────────────
// Reframed as "What's the one thing you most want this report to answer?"
// with prompted example chips. Real data: 34% completion, mean 16 chars.

export const FOCUS_PROMPTS = [
  'Help me prioritise where to start',
  'Compare AU vs my home market',
  'Show me who to email first',
  'Surface non-obvious risks',
  'Find me a launch partner',
] as const;

// ── NEW: challenges structured ───────────────────────────────────────────

export const challengeSchema = z.object({
  // Pre-selected tags from COMMON_CHALLENGES (persona-switched)
  tags: z.array(z.string()).max(8).default([]),
  // Optional free-text "anything else?" — 200 char cap (was 500)
  other: z.string().max(200).optional().default(''),
});

// ── Step schemas ─────────────────────────────────────────────────────────

/**
 * STEP 0 — Persona selection (NEW).
 * A dedicated landing decision. Sets all downstream tone, goal options,
 * Perplexity queries, and report sections. No "back" — you can swap personas
 * via a small toggle on Step 1.
 */
export const step0Schema = z.object({
  persona: z.enum(PERSONA),
});

/**
 * STEP 1 — Company (WEBSITE-FIRST).
 * `website_url` is the FIRST field. The form runs a lightweight scrape on
 * blur and prefills the rest. `website_scrape_accepted` tracks whether the
 * user kept the AI suggestions (analytics signal for the redesign).
 */
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
  // Analytics
  website_scrape_accepted: z.boolean().default(false),
});

/**
 * STEP 2 — Goals + customers + context.
 * Goal multiselect uses GOAL IDs (stable), not labels (translatable).
 * Structured customer profile replaces 3 textareas.
 * Challenges become chip multiselect + optional 200-char "other".
 */
export const step2Schema = z.object({
  // Was selected_goals (8 long-phrase checkboxes). Now structured goal IDs.
  goal_ids: z.array(z.string()).min(1, 'Select at least one goal').max(8),
  // Project context
  timeline: z.enum(TIMELINE_OPTIONS).optional(),
  budget_level: z.enum(BUDGET_OPTIONS).optional(),
  // Unified customer profile (replaces target_customer_description +
  // end_buyer_industries + end_buyers)
  target_customers: targetCustomerSchema,
  // Known competitors — cap at 3, structure unchanged
  known_competitors: z.array(z.object({
    name: z.string().max(200),
    website: z.string().max(500),
  })).max(3).default([]),
  // Challenges — was 500-char textarea; now structured + optional notes
  challenges: challengeSchema,
  // Report focus — was additional_notes textarea; now prompted single question
  report_focus: z.string().max(200).optional().default(''),
});

/**
 * STEP 3 — Review (no new data captured, just inline-edit summary).
 */

export const fullIntakeSchema = step1Schema.merge(step2Schema);

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type IntakeFormDataV2 = z.infer<typeof fullIntakeSchema>;

// ── Legacy compatibility shim ────────────────────────────────────────────
// Translates the V2 schema into the flat shape `user_intake_forms` expects.
// This lets us ship the new form WITHOUT touching generate-report/index.ts,
// then deprecate the legacy columns in a follow-up migration.

interface LegacyIntakePayload {
  user_id: string;
  company_name: string;
  website_url: string;
  country_of_origin: string;
  industry_sector: string[];
  company_stage: string;
  employee_count: string;
  target_regions: string[];
  services_needed: string[]; // <- legacy: receives goal LABELS for matching
  timeline: string;
  budget_level: string;
  primary_goals: string;
  key_challenges: string;
  known_competitors: { name: string; website: string }[];
  end_buyer_industries: string[];
  end_buyers: { name: string; website: string }[];
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

  // Synthesise target_customer_description from structured fields
  const tc = data.target_customers;
  const tcParts = [
    tc.customer_type && `${tc.customer_type} customers`,
    tc.customer_size,
    tc.buying_motion && `via ${tc.buying_motion.toLowerCase()}`,
    tc.industries.length > 0 && `in ${tc.industries.join(', ')}`,
    tc.notes,
  ].filter(Boolean).join(' — ');

  // Synthesise key_challenges from chip tags + free text
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
    services_needed: goalLabels, // generate-report still reads this
    timeline: data.timeline || '',
    budget_level: data.budget_level || '',
    primary_goals: goalsText,
    key_challenges: challengesText,
    known_competitors: data.known_competitors.filter(
      (c) => c.name.trim() || c.website.trim(),
    ),
    end_buyer_industries: tc.industries,
    end_buyers: tc.named_companies
      .filter((b) => b.name.trim() || b.website.trim())
      .map((b) => ({ name: b.name, website: b.website || '' })),
    raw_input: {
      ...data,
      target_customer_description: tcParts,
      additional_notes: data.report_focus || '',
    },
    status: 'pending',
  };
}
