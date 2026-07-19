// kbIntents.ts — the canonical MES question battery (Sub-ticket 2A).
//
// The ~15 typical questions the intelligence layer must answer, each with a two-part
// answer shape: the HOW (playbook/regulatory/cost intelligence from insight cards, via
// `primary_lane`) paired with the WHO (matched directory entities, via
// `directory_entity_types`). This config drives distillation tagging (Haiku tags each
// insight with `answers_intents[]` chosen from these ids), evaluation, the coverage
// matrix, and the demand-gap log (Sub-tickets 3 & 4).
//
// `goal_crosswalk` maps each intent to the existing frontend hero-intent GOALS ids
// (src/lib/intentClassifier.ts), so insight-intent tagging and report-form intents stay
// aligned. (Deno edge code can't import from src/, so the ids are referenced by string;
// kbIntents.test.ts pins them and a drift check lives alongside intentClassifier.)

import { type TopicLane } from "./kbTaxonomy.ts";

export const CANONICAL_INTENTS_VERSION = "kb-intents-v1";

export interface CanonicalIntent {
  id: string;
  label: string;
  /** The typical MES question, in the user's voice — used in the distiller prompt. */
  question: string;
  primary_lane: TopicLane;
  secondary_lanes?: TopicLane[];
  /** The WHO: directory entity types retrieval pairs with the HOW for a complete answer. */
  directory_entity_types: string[];
  /** Crosswalk to src/lib/intentClassifier.ts GOALS ids (may be empty if no hero-intent twin). */
  goal_crosswalk: string[];
  keywords: string[];
}

export const CANONICAL_INTENTS: readonly CanonicalIntent[] = [
  { id: "find_service_provider", label: "Find a service provider",
    question: "How do I find a startup lawyer / accountant / HR / marketing provider in Australia?",
    primary_lane: "playbook", directory_entity_types: ["service_providers"],
    goal_crosswalk: ["find_providers"], keywords: ["lawyer", "legal", "accountant", "accounting", "hr", "payroll", "marketing", "provider", "consultant", "agency", "service"] },
  { id: "find_distribution_partner", label: "Find distribution partners",
    question: "How do I find distribution / channel partners or resellers in Australia?",
    primary_lane: "playbook", directory_entity_types: ["service_providers", "leads"],
    goal_crosswalk: ["lead_lists_intl"], keywords: ["distribution", "distributor", "channel partner", "reseller", "wholesale", "route to market"] },
  { id: "entity_setup", label: "Set up an entity",
    question: "How do I set up a company / entity (ABN, subsidiary, branch) in Australia?",
    primary_lane: "regulatory", secondary_lanes: ["cost"], directory_entity_types: ["service_providers", "trade_investment_agencies"],
    goal_crosswalk: ["compliance"], keywords: ["incorporate", "entity", "company registration", "abn", "acn", "subsidiary", "branch", "set up a company"] },
  { id: "regulatory_compliance", label: "Regulatory & compliance",
    question: "What regulations, licences and tax obligations apply when entering Australia?",
    primary_lane: "regulatory", directory_entity_types: ["service_providers", "trade_investment_agencies"],
    goal_crosswalk: ["compliance"], keywords: ["compliance", "regulation", "regulatory", "licence", "license", "permit", "tax registration", "gst", "asic"] },
  { id: "cost_of_entry", label: "Cost of entry",
    question: "What will market entry cost — setup, operating and compliance costs?",
    primary_lane: "cost", directory_entity_types: ["service_providers"],
    goal_crosswalk: ["market_research"], keywords: ["cost", "budget", "setup cost", "fees", "how much", "expense", "operating cost"] },
  { id: "funding_and_grants", label: "Funding & grants",
    question: "How do I find funding, investors or government grants for entering Australia?",
    primary_lane: "funding", directory_entity_types: ["investors", "trade_investment_agencies"],
    goal_crosswalk: ["grants", "investors"], keywords: ["grant", "funding", "investor", "vc", "capital", "r&d", "non-dilutive", "subsidy", "raise"] },
  { id: "hiring_talent", label: "Hiring talent",
    question: "How do I hire and manage talent (payroll, employment) in Australia?",
    primary_lane: "playbook", secondary_lanes: ["regulatory"], directory_entity_types: ["service_providers"],
    goal_crosswalk: ["find_providers"], keywords: ["hire", "hiring", "talent", "recruit", "payroll", "employ", "employment", "eor", "peo"] },
  { id: "visas_immigration", label: "Visas & immigration",
    question: "What visa / immigration options let me or my staff work in Australia?",
    primary_lane: "regulatory", directory_entity_types: ["service_providers", "trade_investment_agencies"],
    goal_crosswalk: ["compliance"], keywords: ["visa", "immigration", "work permit", "sponsor", "482", "skilled migration", "relocate"] },
  { id: "find_first_customers", label: "Find first customers",
    question: "How do I find my first customers / build a sales pipeline in Australia?",
    primary_lane: "playbook", secondary_lanes: ["market"], directory_entity_types: ["leads", "events"],
    goal_crosswalk: ["lead_lists_intl"], keywords: ["first customers", "sales", "pipeline", "go to market", "gtm", "buyers", "prospects", "leads"] },
  { id: "find_mentors", label: "Find mentors",
    question: "How do I find mentors or advisors who have entered the ANZ market?",
    primary_lane: "playbook", directory_entity_types: ["community_members"],
    goal_crosswalk: ["mentors_intl"], keywords: ["mentor", "advisor", "adviser", "coach", "guidance"] },
  { id: "market_sizing_competition", label: "Market sizing & competition",
    question: "How big is the market and who are the competitors in Australia?",
    primary_lane: "market", directory_entity_types: ["content_items"],
    goal_crosswalk: ["market_research"], keywords: ["market size", "tam", "sam", "competitors", "competition", "landscape", "demand", "market research"] },
  { id: "case_study_lessons", label: "Case-study lessons",
    question: "What can I learn from companies that have entered the ANZ market before?",
    primary_lane: "playbook", directory_entity_types: ["case_studies"],
    goal_crosswalk: ["case_studies"], keywords: ["case study", "example", "lessons", "success story", "who has done this"] },
  { id: "events_networking", label: "Events & networking",
    question: "What events, programs and networking should I attend in Australia?",
    primary_lane: "market", directory_entity_types: ["events", "innovation_ecosystem"],
    goal_crosswalk: ["events"], keywords: ["event", "conference", "networking", "meetup", "program", "programme", "accelerator", "summit"] },
  { id: "pricing_localisation", label: "Pricing & localisation",
    question: "How should I price and localise my product for the Australian market?",
    primary_lane: "market", secondary_lanes: ["cost"], directory_entity_types: ["content_items"],
    goal_crosswalk: ["market_research"], keywords: ["pricing", "price", "localise", "localisation", "positioning", "adapt", "packaging"] },
] as const;

export const CANONICAL_INTENT_IDS: readonly string[] = CANONICAL_INTENTS.map((i) => i.id);

export function isCanonicalIntent(id: unknown): boolean {
  return typeof id === "string" && CANONICAL_INTENT_IDS.includes(id);
}

/** Intents whose primary or secondary lane matches (for coverage matrix + gap log). */
export function intentsForLane(lane: TopicLane): CanonicalIntent[] {
  return CANONICAL_INTENTS.filter(
    (i) => i.primary_lane === lane || (i.secondary_lanes ?? []).includes(lane),
  );
}

/** Keep only real canonical intent ids from a distiller's answers_intents[] (drops hallucinations). */
export function coerceIntents(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  return [...new Set(ids.filter(isCanonicalIntent) as string[])];
}
