import { z } from 'zod';

// ── Persona ──────────────────────────────────────────────────────────────
export type ReportPersona = 'international' | 'startup';

export const REVENUE_STAGE_OPTIONS = [
  'Pre-revenue',
  '<$500K',
  '$500K-$2M',
  '$2M+',
] as const;

export const INTERNATIONAL_GOALS = [
  'Find vetted service providers (legal, tax, HR, finance)',
  'Connect with trade and investment agencies',
  'Access market entry case studies and success stories',
  'Identify relevant industry associations and chambers of commerce',
  'Discover upcoming market entry events and networking opportunities',
  'Find experienced mentors and advisors',
  'Access qualified lead lists for my target sector',
  'Understand regulatory and compliance requirements',
] as const;

export const STARTUP_GOALS = [
  'Find investors and venture capital firms',
  'Discover accelerators and incubator programs',
  'Connect with mentors and startup advisors',
  'Access growth-stage service providers (legal, finance, HR)',
  'Find co-working spaces and innovation hubs',
  'Identify grant and government funding opportunities',
  'Access lead lists and customer acquisition resources',
  'Connect with other founders and peer networks',
] as const;

// ── Existing option arrays ───────────────────────────────────────────────
export const COUNTRY_OPTIONS = [
  'Australia', 'New Zealand',
  'United States', 'United Kingdom', 'Ireland', 'Canada', 'Germany',
  'France', 'Japan', 'Singapore', 'South Korea', 'India', 'Other'
] as const;

/**
 * Industry options now sourced from the LinkedIn Industry Taxonomy (2026).
 * 152 industry groups across 20 sectors. Replaces the legacy 149-item list.
 * Canonical source: src/constants/linkedinTaxonomy.ts
 */
import { INDUSTRY_GROUP_OPTIONS } from '@/constants/linkedinTaxonomy';

export const INDUSTRY_OPTIONS = INDUSTRY_GROUP_OPTIONS;

export const STAGE_OPTIONS = [
  'Startup/Seed', 'Series A-B', 'Growth/Scale-up', 'Enterprise/Corporate'
] as const;

export const EMPLOYEE_OPTIONS = [
  '1-10', '11-50', '51-200', '201-500', '500+'
] as const;

export const REGION_OPTIONS = [
  'Sydney/NSW', 'Melbourne/VIC', 'Brisbane/QLD', 'Perth/WA',
  'Adelaide/SA', 'National', 'Not Sure'
] as const;

export const SERVICES_OPTIONS = [
  'Legal & Compliance', 'Accounting & Tax', 'Recruitment & HR',
  'Office Space', 'Banking & Finance', 'PR & Marketing',
  'Government Grants', 'Visa & Immigration', 'Lead Generation',
  'Mentorship', 'Market Research', 'Investment & Funding'
] as const;

export const TIMELINE_OPTIONS = [
  'Immediate (0-3 months)', 'Short-term (3-6 months)',
  'Medium-term (6-12 months)', 'Exploratory (12+ months)'
] as const;

export const BUDGET_OPTIONS = [
  'Bootstrap (<$10K)', 'Moderate ($10K-$50K)',
  'Significant ($50K-$200K)', 'Enterprise ($200K+)'
] as const;

// ── Schemas ──────────────────────────────────────────────────────────────

export const step1Schema = z.object({
  persona: z.enum(['international', 'startup']).default('international'),
  company_name: z.string().min(1, 'Company name is required').max(200),
  website_url: z.string().max(500).transform((val) => {
    const trimmed = val.trim();
    if (trimmed && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }).pipe(z.string().url('Please enter a valid URL')),
  country_of_origin: z.string().min(1, 'Country / region is required'),
  industry_sector: z.array(z.string()).min(1, 'Select at least one industry'),
  company_stage: z.string().min(1, 'Company stage is required'),
  employee_count: z.string().optional().default(''),
  // Startup-only
  revenue_stage: z.string().optional().default(''),
});

export const competitorSchema = z.object({
  name: z.string().max(200).default(''),
  website: z.string().max(500).transform((val) => {
    const trimmed = val.trim();
    if (trimmed && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }).pipe(
    z.string().refine(
      (val) => !val || /^https?:\/\/.+/.test(val),
      { message: 'Please enter a valid URL' }
    )
  ),
});

export const step2Schema = z.object({
  // New persona-aware goals multi-select
  selected_goals: z.array(z.string()).min(1, 'Select at least one goal'),
  additional_notes: z.string().max(500, 'Maximum 500 characters').optional().default(''),
  // Legacy fields kept optional for backward compatibility with existing reports
  target_regions: z.array(z.string()).optional().default([]),
  services_needed: z.array(z.string()).optional().default([]),
  timeline: z.string().optional().default(''),
  budget_level: z.string().optional().default(''),
  primary_goals: z.string().max(500, 'Maximum 500 characters').optional().default(''),
  key_challenges: z.string().max(500, 'Maximum 500 characters').optional().default(''),
  target_customer_description: z.string().max(500, 'Maximum 500 characters').optional().default(''),
  end_buyer_industries: z.array(z.string()).optional().default([]),
  end_buyers: z.array(competitorSchema).max(5).optional().default([]),
  known_competitors: z.array(competitorSchema).max(5).optional().default([]),
});

export const fullIntakeSchema = step1Schema.merge(step2Schema);

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type IntakeFormData = z.infer<typeof fullIntakeSchema>;
