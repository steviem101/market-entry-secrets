import { z } from 'zod';

export const COUNTRY_OPTIONS = [
  'United States', 'United Kingdom', 'Ireland', 'Canada', 'Germany',
  'France', 'Singapore', 'South Korea', 'India', 'Other'
] as const;

export const INDUSTRY_OPTIONS = [
  'SaaS', 'FinTech', 'MedTech/HealthTech', 'CleanTech', 'EdTech',
  'AI/ML', 'Cybersecurity', 'E-Commerce', 'Professional Services', 'Other'
] as const;

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
  'Mentorship', 'Market Research'
] as const;

export const TIMELINE_OPTIONS = [
  'Immediate (0-3 months)', 'Short-term (3-6 months)',
  'Medium-term (6-12 months)', 'Exploratory (12+ months)'
] as const;

export const BUDGET_OPTIONS = [
  'Bootstrap (<$10K)', 'Moderate ($10K-$50K)',
  'Significant ($50K-$200K)', 'Enterprise ($200K+)'
] as const;

export const step1Schema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(200),
  website_url: z.string().url('Please enter a valid URL').max(500),
  country_of_origin: z.string().min(1, 'Country is required'),
  industry_sector: z.string().min(1, 'Industry is required'),
  company_stage: z.string().min(1, 'Company stage is required'),
  employee_count: z.string().min(1, 'Employee count is required'),
});

export const step2Schema = z.object({
  target_regions: z.array(z.string()).min(1, 'Select at least one target region'),
  services_needed: z.array(z.string()).min(1, 'Select at least one service'),
  timeline: z.string().min(1, 'Timeline is required'),
  budget_level: z.string().min(1, 'Budget level is required'),
  primary_goals: z.string().max(500, 'Maximum 500 characters').optional().default(''),
  key_challenges: z.string().max(500, 'Maximum 500 characters').optional().default(''),
});

export const fullIntakeSchema = step1Schema.merge(step2Schema);

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type IntakeFormData = z.infer<typeof fullIntakeSchema>;
