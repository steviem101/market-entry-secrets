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
      "Grants",
      "Playbooks",
      "Associations",
      "Conferences",
      "Communities",
    ],
    suffix: "to grow in Australia",
  },
  subheadline:
    "Whether you're entering Australia from overseas or scaling an Aussie startup, we turn a few quick questions into a tailored report: live market intelligence, competitor landscape, vetted providers, mentors, and a step-by-step action plan.",
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
