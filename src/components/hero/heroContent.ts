import { REPORT_CREATOR_PATH, REPORT_CTA_LABEL } from "@/config/reportCta";

export interface HeroContent {
  headline: { prefix: string; rotatingWords: string[]; suffix: string };
  subheadline: string;
  primaryCTA: { label: string; href: string };
  secondaryCTA: { label: string; href: string };
  mockupScenario: {
    companyName: string;
    country: string;
    industry: string;
    targetRegion: string;
  };
}

export const HERO_CONTENT: HeroContent = {
  headline: {
    prefix: "Find the",
    rotatingWords: [
      "Leads",
      "Mentors",
      "Events",
      "Guides",
      "Providers",
      "Investors",
      "Accelerators",
      "Advisors",
      "Service Providers",
      "Grants",
      "Playbooks",
      "Associations",
    ],
    suffix: "to enter Australia",
  },
  subheadline:
    "Market Entry Secrets turns a 5-minute questionnaire into a full ANZ market entry report — live market intelligence, competitor landscape, vetted providers, mentors, and a step-by-step action plan.",
  primaryCTA: { label: REPORT_CTA_LABEL, href: REPORT_CREATOR_PATH },
  secondaryCTA: { label: "Explore the platform", href: "/service-providers" },
  mockupScenario: {
    companyName: "TechStart Solutions",
    country: "United States",
    industry: "SaaS / Cloud",
    targetRegion: "Sydney, NSW",
  },
};

export const HERO_FLAGS = ["🇺🇸", "🇬🇧", "🇩🇪", "🇯🇵", "🇸🇬", "🇰🇷", "🇮🇳", "🇫🇷", "🇨🇦", "🇮🇪"];
