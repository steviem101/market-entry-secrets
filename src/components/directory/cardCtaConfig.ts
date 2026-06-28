// Single source of truth for directory card CTA wording + behaviour.
//
// Every directory card renders its action row through <CardCTA> driven by this
// map — copy lives here, not hard-coded per page. Australian English, sentence
// case, verb-led. See docs/ui/card-cta-standard.md for the agreed standard.

export type DirectoryEntity =
  | "service_provider"
  | "mentor"
  | "investor"
  | "agency"
  | "innovation_hub"
  | "lead_list"
  | "event"
  | "content"
  | "case_study";

export type CtaAction = "warm_intro" | "enquire" | "navigate" | "external";

export interface CtaConfig {
  /** The single primary action on the card. */
  primary: { label: string; action: CtaAction };
  /** Optional secondary action (outline button). */
  secondary?: { label: string };
  /** Tier/visibility gated label, e.g. "Unlock with Growth". */
  gatedLabel: (tier: string) => string;
}

// Display name for a tier in gated copy (Title Case for the brand tiers).
export function tierDisplayName(tier: string): string {
  const t = (tier || "").toLowerCase();
  const map: Record<string, string> = {
    free: "Free",
    growth: "Growth",
    scale: "Scale",
    enterprise: "Enterprise",
    premium: "Growth", // legacy
    concierge: "Enterprise", // legacy
  };
  return map[t] || (t ? t.charAt(0).toUpperCase() + t.slice(1) : "a paid plan");
}

const unlockWith = (tier: string) => `Unlock with ${tierDisplayName(tier)}`;

export const CARD_CTA_CONFIG: Record<DirectoryEntity, CtaConfig> = {
  service_provider: {
    primary: { label: "Get warm intro", action: "warm_intro" },
    secondary: { label: "View profile" },
    gatedLabel: unlockWith,
  },
  mentor: {
    primary: { label: "Get warm intro", action: "warm_intro" },
    secondary: { label: "View profile" },
    gatedLabel: unlockWith,
  },
  investor: {
    primary: { label: "Get warm intro", action: "warm_intro" },
    secondary: { label: "View profile" },
    gatedLabel: unlockWith,
  },
  agency: {
    primary: { label: "Get warm intro", action: "warm_intro" },
    secondary: { label: "View details" },
    gatedLabel: unlockWith,
  },
  innovation_hub: {
    primary: { label: "Get warm intro", action: "warm_intro" },
    secondary: { label: "View details" },
    gatedLabel: unlockWith,
  },
  lead_list: {
    primary: { label: "Find out more", action: "enquire" },
    secondary: { label: "View details" },
    gatedLabel: unlockWith,
  },
  event: {
    primary: { label: "View event", action: "navigate" },
    secondary: { label: "Add to calendar" },
    gatedLabel: unlockWith,
  },
  content: {
    primary: { label: "Read more", action: "navigate" },
    secondary: { label: "Save" },
    gatedLabel: unlockWith,
  },
  case_study: {
    primary: { label: "Read more", action: "navigate" },
    secondary: { label: "Save" },
    gatedLabel: unlockWith,
  },
};

/** Human label for the entity, used in modal headings + Slack metadata. */
export const ENTITY_LABEL: Record<DirectoryEntity, string> = {
  service_provider: "service provider",
  mentor: "mentor",
  investor: "investor",
  agency: "agency",
  innovation_hub: "innovation hub",
  lead_list: "lead list",
  event: "event",
  content: "article",
  case_study: "case study",
};
