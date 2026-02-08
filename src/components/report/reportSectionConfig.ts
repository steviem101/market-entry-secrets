import {
  FileText,
  Target,
  BarChart3,
  Building2,
  Users,
  CalendarDays,
  ListChecks,
  Database,
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
  events_resources: {
    icon: CalendarDays,
    accentColor: 'border-t-orange-500',
    accentBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    matchLabel: 'Upcoming Events',
  },
  action_plan: {
    icon: ListChecks,
    accentColor: 'border-t-emerald-600',
    accentBg: 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400',
    matchLabel: 'Action Items',
  },
  lead_list: {
    icon: Database,
    accentColor: 'border-t-sky-500',
    accentBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    matchLabel: 'Lead Data Sources',
  },
};

export const SECTION_LABELS: Record<string, string> = {
  executive_summary: 'Executive Summary',
  swot_analysis: 'SWOT Analysis',
  competitor_landscape: 'Competitor Landscape',
  service_providers: 'Service Provider Recommendations',
  mentor_recommendations: 'Mentor Recommendations',
  events_resources: 'Events & Resources',
  action_plan: 'Action Plan & Timeline',
  lead_list: 'Lead List',
};

export const SECTION_ORDER = [
  'executive_summary', 'swot_analysis', 'competitor_landscape', 'service_providers',
  'mentor_recommendations', 'events_resources', 'action_plan', 'lead_list',
];

// Minimum subscription tier required for each gated section
export const TIER_REQUIREMENTS: Record<string, string> = {
  swot_analysis: 'growth',
  competitor_landscape: 'growth',
  mentor_recommendations: 'growth',
  lead_list: 'scale',
};

export const TIER_HIERARCHY = ['free', 'growth', 'scale', 'enterprise'];

export const userTierMeetsRequirement = (userTier: string, requiredTier: string): boolean => {
  const userIndex = TIER_HIERARCHY.indexOf(userTier);
  const requiredIndex = TIER_HIERARCHY.indexOf(requiredTier);
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
