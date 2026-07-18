import {
  FileText,
  Target,
  BarChart3,
  Building2,
  Users,
  CalendarDays,
  ListChecks,
  Database,
  Landmark,
  ClipboardCheck,
  Handshake,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';

export interface SectionConfig {
  icon: LucideIcon;
  accentColor: string; // Tailwind border/text color class
  accentBg: string;    // Tailwind background tint class
  matchLabel: string;   // Label shown above match cards
}

export const SECTION_CONFIG: Record<string, SectionConfig> = {
  executive_summary: {
    icon: FileText,
    accentColor: 'border-t-blue-500',
    accentBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    matchLabel: 'Key Highlights',
  },
  swot_analysis: {
    icon: Target,
    accentColor: 'border-t-amber-500',
    accentBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    matchLabel: 'Related Resources',
  },
  competitor_landscape: {
    icon: BarChart3,
    accentColor: 'border-t-purple-500',
    accentBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    matchLabel: 'Competitor Profiles',
  },
  service_providers: {
    icon: Building2,
    accentColor: 'border-t-emerald-500',
    accentBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    matchLabel: 'Recommended Providers',
  },
  mentor_recommendations: {
    icon: Users,
    accentColor: 'border-t-indigo-500',
    accentBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    matchLabel: 'Matched Mentors',
  },
  investor_recommendations: {
    icon: Landmark,
    accentColor: 'border-t-violet-500',
    accentBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    matchLabel: 'Matched Investors',
  },
  events_resources: {
    icon: CalendarDays,
    accentColor: 'border-t-orange-500',
    accentBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    // New reports carry events only (MES-210a moved case studies/guides to their
    // own section); legacy reports still split a "Case Studies & Resources"
    // sub-header via reportCardGroups, so "Events" stays accurate for both.
    matchLabel: 'Events',
  },
  case_studies_guides: {
    icon: BookOpen,
    accentColor: 'border-t-pink-500',
    accentBg: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
    matchLabel: 'Case Studies & Guides',
  },
  action_plan: {
    icon: ListChecks,
    accentColor: 'border-t-emerald-600',
    accentBg: 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400',
    matchLabel: 'Action Items',
  },
  setup_compliance: {
    icon: ClipboardCheck,
    accentColor: 'border-t-teal-500',
    accentBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    // No match cards — country FAQ/profile content is woven into the prose.
    matchLabel: 'Setup Resources',
  },
  lead_list: {
    icon: Database,
    accentColor: 'border-t-sky-500',
    accentBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    matchLabel: 'Lead Data Sources',
  },
  first_customers: {
    icon: Handshake,
    accentColor: 'border-t-rose-500',
    accentBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    matchLabel: 'Target Accounts',
  },
};

export const SECTION_LABELS: Record<string, string> = {
  executive_summary: 'Executive Summary',
  swot_analysis: 'SWOT Analysis',
  competitor_landscape: 'Competitor Landscape',
  service_providers: 'Service Provider Recommendations',
  mentor_recommendations: 'Mentor Recommendations',
  investor_recommendations: 'Investor Recommendations',
  // "Events & Networking" for new (events-only) reports; legacy reports that still
  // carry resources here render them under their own sub-header, so the shorter
  // title stays accurate for both vintages.
  events_resources: 'Events & Networking',
  case_studies_guides: 'Case Studies & Guides',
  action_plan: 'Action Plan & Timeline',
  setup_compliance: 'Setup & Compliance Guide',
  lead_list: 'Lead List',
  first_customers: 'Your First Customers',
};

export const SECTION_ORDER = [
  'executive_summary', 'swot_analysis', 'competitor_landscape', 'first_customers', 'service_providers',
  'mentor_recommendations', 'investor_recommendations', 'events_resources', 'case_studies_guides',
  'action_plan', 'setup_compliance', 'lead_list',
];

// Minimum subscription tier required for each gated section (MES-193). Free view
// = everything except these three. Server truth is the get_tier_gated_report /
// get_shared_report RPCs + report_templates; this mirror + rubric.ts move with them.
export const TIER_REQUIREMENTS: Record<string, string> = {
  mentor_recommendations: 'growth',
  first_customers: 'scale',
  lead_list: 'scale',
};

export const TIER_HIERARCHY = ['free', 'growth', 'scale', 'enterprise'];

// Display names for tiers — the single source for tier naming in the UI
export const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  growth: 'Growth',
  scale: 'Scale',
  enterprise: 'Enterprise',
  // Legacy tiers that may still appear on old reports
  premium: 'Premium',
  concierge: 'Concierge',
};

export const userTierMeetsRequirement = (userTier: string, requiredTier: string): boolean => {
  const userIndex = TIER_HIERARCHY.indexOf(userTier);
  const requiredIndex = TIER_HIERARCHY.indexOf(requiredTier);
  // Deny access if either tier is unrecognised (indexOf returns -1)
  if (userIndex === -1 || requiredIndex === -1) return false;
  return userIndex >= requiredIndex;
};

/** Estimate reading time in minutes from report sections */
export const estimateReadingTime = (sections: Record<string, any>): number => {
  const wordsPerMinute = 200;
  let totalWords = 0;
  Object.values(sections).forEach((section: any) => {
    if (section?.content) {
      totalWords += section.content.split(/\s+/).length;
    }
  });
  return Math.max(1, Math.ceil(totalWords / wordsPerMinute));
};
