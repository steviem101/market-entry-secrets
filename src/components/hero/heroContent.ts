export type HeroPersona = 'international' | 'startup';

export interface PersonaContent {
  headline: { line1: string; line2: string };
  subheadline: string;
  primaryCTA: { label: string; href: string };
  secondaryCTA: { label: string; href: string };
  toggleDescription: string;
  mockupScenario: {
    companyName: string;
    country: string;
    industry: string;
    targetRegion: string;
  };
}

export const HERO_PERSONAS: Record<HeroPersona, PersonaContent> = {
  international: {
    headline: {
      line1: "Enter the Australian market",
      line2: "with confidence.",
    },
    subheadline:
      "Answer a few questions about your company, sector, and goals. MES combines 500+ vetted providers, real case studies, and AI-powered intelligence to generate a tailored action plan for entering the ANZ market.",
    primaryCTA: { label: "Plan my market entry", href: "/planner?persona=international_entrant" },
    secondaryCTA: { label: "Explore providers", href: "/service-providers" },
    toggleDescription: "Entering the ANZ market",
    mockupScenario: {
      companyName: "TechStart Solutions",
      country: "United States",
      industry: "SaaS / Cloud",
      targetRegion: "Sydney, NSW",
    },
  },
  startup: {
    headline: {
      line1: "Scale your Australian startup",
      line2: "faster than ever.",
    },
    subheadline:
      "Get a growth plan tailored to your stage: funding sources, accelerators, hiring strategy, customer acquisition channels, and the right mentors to scale your business.",
    primaryCTA: { label: "Plan my growth strategy", href: "/planner?persona=local_startup" },
    secondaryCTA: { label: "Find a mentor", href: "/community" },
    toggleDescription: "Growing your Aussie startup",
    mockupScenario: {
      companyName: "Alpine Fintech",
      country: "Australia",
      industry: "Financial Services",
      targetRegion: "National",
    },
  },
};

export const HERO_STATS = [
  { value: 500, suffix: "+", label: "Vetted Providers" },
  { value: 50, suffix: "+", label: "Monthly Events" },
  { value: 37, suffix: "", label: "Market Reports" },
  { value: 8, suffix: "", label: "Sectors Covered" },
  { value: 12, suffix: "+", label: "Countries" },
];

export const HERO_FLAGS = ["🇺🇸", "🇬🇧", "🇩🇪", "🇯🇵", "🇸🇬", "🇰🇷", "🇮🇳", "🇫🇷", "🇨🇦", "🇮🇪"];
