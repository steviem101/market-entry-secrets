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
      "Answer a few questions about your company, sector, and goals. MES combines 500+ vetted providers, real case studies, and AI-powered intelligence to generate a plan for entering the ANZ market.",
    primaryCTA: { label: "Create my free market entry report →", href: "/report-creator?persona=international" },
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
    primaryCTA: { label: "Create my free growth report →", href: "/report-creator?persona=startup" },
    secondaryCTA: { label: "Find a mentor", href: "/mentors" },
    toggleDescription: "Growing your Aussie startup",
    mockupScenario: {
      companyName: "Alpine Fintech",
      country: "Australia",
      industry: "Financial Services",
      targetRegion: "National",
    },
  },
};

export type HeroStatKey =
  | "investors"
  | "leads"
  | "mentors"
  | "serviceProviders"
  | "accelerators"
  | "events"
  | "guides";

export interface HeroStatConfig {
  key: HeroStatKey;
  label: string;
  suffix: string;
  fallback: number;
  href: string;
}

export const HERO_PERSONA_STATS: Record<HeroPersona, HeroStatConfig[]> = {
  startup: [
    { key: "investors", label: "Investors", suffix: "+", fallback: 50, href: "/investors" },
    { key: "leads", label: "Lead Databases", suffix: "+", fallback: 20, href: "/leads" },
    { key: "mentors", label: "Mentors", suffix: "+", fallback: 30, href: "/mentors" },
    { key: "serviceProviders", label: "Service Providers", suffix: "+", fallback: 100, href: "/service-providers" },
    { key: "accelerators", label: "Accelerators", suffix: "+", fallback: 10, href: "/investors?type=accelerator" },
  ],
  international: [
    { key: "leads", label: "Lead Databases", suffix: "+", fallback: 20, href: "/leads" },
    { key: "mentors", label: "Mentors", suffix: "+", fallback: 30, href: "/mentors" },
    { key: "events", label: "Events", suffix: "+", fallback: 50, href: "/events" },
    { key: "guides", label: "Market Entry Guides", suffix: "+", fallback: 10, href: "/content?type=guide" },
    { key: "serviceProviders", label: "Service Providers", suffix: "+", fallback: 100, href: "/service-providers" },
  ],
};

export const HERO_FLAGS = ["🇺🇸", "🇬🇧", "🇩🇪", "🇯🇵", "🇸🇬", "🇰🇷", "🇮🇳", "🇫🇷", "🇨🇦", "🇮🇪"];
