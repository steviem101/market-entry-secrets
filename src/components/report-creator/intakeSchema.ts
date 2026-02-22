import { z } from 'zod';

export const COUNTRY_OPTIONS = [
  'Australia', 'New Zealand',
  'United States', 'United Kingdom', 'Ireland', 'Canada', 'Germany',
  'France', 'Japan', 'Singapore', 'South Korea', 'India', 'Other'
] as const;

export const INDUSTRY_OPTIONS = [
  'Accounting', 'AI', 'Airlines/Aviation', 'Alternative Dispute Resolution',
  'Alternative Medicine', 'Animation', 'Apparel & Fashion',
  'Architecture & Planning', 'Arts & Crafts', 'Automotive',
  'Aviation & Aerospace', 'Banking', 'Biotechnology', 'Broadcast Media',
  'Building Materials', 'Business Supplies & Equipment', 'Capital Markets',
  'Chemicals', 'Civic & Social Organization', 'Civil Engineering',
  'Commercial Real Estate', 'Computer & Network Security', 'Computer Games',
  'Computer Hardware', 'Computer Networking', 'Computer Software',
  'Construction', 'Consumer Electronics', 'Consumer Goods',
  'Consumer Services', 'Cosmetics', 'Dairy', 'Defense & Space', 'Design',
  'E-learning', 'Education Management',
  'Electrical & Electronic Manufacturing', 'Entertainment',
  'Environmental Services', 'Events Services', 'Executive Office',
  'Facilities Services', 'Farming', 'Financial Services', 'Fine Art',
  'Fishery', 'Food & Beverages', 'Food Production', 'Fundraising',
  'Furniture', 'Gambling & Casinos', 'Glass, Ceramics & Concrete',
  'Government Administration', 'Government Relations', 'Graphic Design',
  'Health, Wellness & Fitness', 'Higher Education',
  'Hospital & Health Care', 'Hospitality', 'Human Resources',
  'Import & Export', 'Individual & Family Services',
  'Industrial Automation', 'Information Services',
  'Information Technology & Services', 'Insurance',
  'International Affairs', 'International Trade & Development', 'Internet',
  'Investment Banking', 'Investment Management', 'Judiciary',
  'Law Enforcement', 'Law Practice', 'Legal Services',
  'Leisure, Travel & Tourism', 'Libraries', 'Logistics & Supply Chain',
  'Luxury Goods & Jewelry', 'Machinery', 'Management Consulting',
  'Maritime', 'Market Research', 'Marketing & Advertising',
  'Mechanical or Industrial Engineering', 'Media Production',
  'Medical Devices', 'Medical Practice', 'Mental Health Care', 'Military',
  'Mining & Metals', 'Motion Pictures & Film', 'Museums & Institutions',
  'Music', 'Nanotechnology', 'Newspapers',
  'Non-profit Organization Management', 'Oil & Energy', 'Online Media',
  'Other', 'Outsourcing/Offshoring', 'Package/Freight Delivery',
  'Packaging & Containers', 'Paper & Forest Products', 'Performing Arts',
  'Pharmaceuticals', 'Philanthropy', 'Photography', 'Plastics',
  'Political Organization', 'Primary/Secondary Education', 'Printing',
  'Professional Training & Coaching', 'Program Development',
  'Public Policy', 'Public Relations & Communications', 'Public Safety',
  'Publishing', 'Railroad Manufacture', 'Ranching', 'Real Estate',
  'Recreational Facilities & Services', 'Religious Institutions',
  'Renewables & Environment', 'Research', 'Restaurants', 'Retail', 'SaaS',
  'Security & Investigations', 'Semiconductors', 'Shipbuilding',
  'Sporting Goods', 'Sports', 'Staffing & Recruiting', 'Supermarkets',
  'Telecommunications', 'Textiles', 'Think Tanks', 'Tobacco',
  'Translation & Localization', 'Transportation/Trucking/Railroad',
  'Utilities', 'Venture Capital & Private Equity', 'Veterinary',
  'Warehousing', 'Wholesale', 'Wine & Spirits', 'Wireless',
  'Writing & Editing',
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

export const step1Schema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(200),
  website_url: z.string().max(500).transform((val) => {
    const trimmed = val.trim();
    if (trimmed && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }).pipe(z.string().url('Please enter a valid URL')),
  country_of_origin: z.string().min(1, 'Country is required'),
  industry_sector: z.array(z.string()).min(1, 'Select at least one industry'),
  company_stage: z.string().min(1, 'Company stage is required'),
  employee_count: z.string().min(1, 'Employee count is required'),
});

export const competitorSchema = z.object({
  name: z.string().min(1, 'Competitor name is required').max(200),
  website: z.string().max(500).transform((val) => {
    const trimmed = val.trim();
    if (trimmed && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }).pipe(z.string().url('Please enter a valid URL')),
});

export const step2Schema = z.object({
  target_regions: z.array(z.string()).min(1, 'Select at least one target region'),
  services_needed: z.array(z.string()).min(1, 'Select at least one service'),
  timeline: z.string().min(1, 'Timeline is required'),
  budget_level: z.string().min(1, 'Budget level is required'),
  primary_goals: z.string().max(500, 'Maximum 500 characters').optional().default(''),
  key_challenges: z.string().max(500, 'Maximum 500 characters').optional().default(''),
  end_buyer_industries: z.array(z.string()).optional().default([]),
  end_buyers: z.array(competitorSchema).max(5).optional().default([]),
  known_competitors: z.array(competitorSchema).max(5).optional().default([]),
});

export const fullIntakeSchema = step1Schema.merge(step2Schema);

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type IntakeFormData = z.infer<typeof fullIntakeSchema>;
