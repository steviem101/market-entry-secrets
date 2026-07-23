// insightRetrieval.ts — pure helpers for grounding report sections in distilled insight cards
// (Intelligence Layer, Sub-ticket 3). The RPC call (match_report_insights) is done in index.ts;
// this module maps the intake's goals to canonical intents, decides which insight topic-lanes are
// relevant to which report section, and formats the grounded MARKET INTELLIGENCE system-prompt note.
// No I/O — unit-testable.
//
// The note mirrors the synthesisSignalNote provenance guardrail already in generate-report: the
// cards are uncited BACKGROUND, applied in the model's own words, never quoted/attributed/cited,
// and — because the distiller strips dated figures — they carry NO numbers to leak into prose.

import { CANONICAL_INTENTS } from "../_shared/kbIntents.ts";
import { isCanonicalSector, GENERAL_SECTOR } from "../_shared/kbTaxonomy.ts";

/** One distilled insight card as returned by match_report_insights (claim + lane + tags). */
export interface InsightCard {
  claim: string;
  topic_lane: string;
  sectors: string[];
  answers_intents: string[];
  is_proprietary: boolean;
}

/** Invert kbIntents' goal_crosswalk: frontend goal_ids -> canonical intent ids (one-to-many; e.g.
 *  "compliance" -> entity_setup + regulatory_compliance + visas_immigration). Unknown ids drop. */
export function goalIdsToIntents(goalIds: string[] | null | undefined): string[] {
  if (!Array.isArray(goalIds) || goalIds.length === 0) return [];
  const wanted = new Set(goalIds.filter((g) => typeof g === "string"));
  if (wanted.size === 0) return [];
  const out = new Set<string>();
  for (const intent of CANONICAL_INTENTS) {
    if ((intent.goal_crosswalk ?? []).some((g) => wanted.has(g))) out.add(intent.id);
  }
  return [...out];
}

// Bridge from generate-report's display-derived sector slugs (sectorTaxonomy.ts —
// e.g. "technology-information-and-media", "hospitals-and-health-care") to the KB's short
// CANONICAL_SECTORS the cards are tagged with (e.g. "technology", "healthcare"). Same 20 concepts,
// different slug encoding — without this a tech intake would match only 'general' cards, never
// 'technology' ones. Slugs that are ALREADY canonical (financial-services, retail, construction,
// education, manufacturing, professional-services) pass straight through below.
const DISPLAY_SLUG_TO_CANONICAL: Record<string, string> = {
  "accommodation-and-food-services": "hospitality-tourism",
  "administrative-and-support-services": "professional-services",
  "consumer-services": "consumer-goods",
  "entertainment-providers": "media-entertainment",
  "farming-ranching-forestry": "agriculture",
  "government-administration": "government-nonprofit",
  "holding-companies": "financial-services",
  "hospitals-and-health-care": "healthcare",
  "oil-gas-and-mining": "mining-resources",
  "real-estate-and-equipment-rental-services": "real-estate",
  "technology-information-and-media": "technology",
  "transportation-logistics-supply-chain-and-storage": "transportation-logistics",
  "utilities": "energy",
  "wholesale": "consumer-goods",
};

/** Map generate-report's sector slugs to the KB CANONICAL_SECTORS the insight cards use (deduped).
 *  Already-canonical slugs pass through; the divergent 14 are bridged; unknowns drop. */
export function toCanonicalSectors(reportSlugs: string[] | null | undefined): string[] {
  if (!Array.isArray(reportSlugs)) return [];
  const out = new Set<string>();
  for (const s of reportSlugs) {
    if (isCanonicalSector(s)) { out.add(s); continue; }
    const c = DISPLAY_SLUG_TO_CANONICAL[s];
    if (c) out.add(c);
  }
  return [...out];
}

/** Which insight topic-lanes are worth surfacing in each report section. A section not listed here
 *  gets no market-intelligence note (keeps the injection targeted, not blanket). Lanes are the five
 *  kbTaxonomy lanes: regulatory · market · playbook · cost · funding. */
export const SECTION_LANES: Record<string, string[]> = {
  executive_summary: ["market", "playbook", "regulatory"],
  swot_analysis: ["market", "regulatory", "playbook"],
  competitor_landscape: ["market"],
  service_providers: ["playbook", "regulatory"],
  mentor_recommendations: ["playbook"],
  investor_recommendations: ["funding"],
  events_resources: ["market", "playbook"],
  action_plan: ["playbook", "regulatory", "cost"],
  setup_compliance: ["regulatory", "cost"],
  lead_list: ["playbook", "market"],
  first_customers: ["playbook", "market"],
};

/** Cards injected per section. Keeps the prompt lean. */
export const MAX_CARDS_PER_SECTION = 6;

/** Ranking weight so the per-section cap keeps the most DIFFERENTIATED cards rather than generic
 *  ones: the corpus is ~60% 'general'-only, so without this the cap fills with boilerplate. Order:
 *  proprietary (future-proof; none in the corpus today) > sector-specific > general-only. */
export function specificityScore(c: InsightCard): number {
  const hasSpecificSector = Array.isArray(c.sectors) && c.sectors.some((s) => s !== GENERAL_SECTOR);
  return (c.is_proprietary ? 4 : 0) + (hasSpecificSector ? 2 : 0);
}

/** Build the grounded MARKET INTELLIGENCE note for one section from the retrieved cards, filtered to
 *  the section's relevant lanes. Returns "" when the section has no relevant lane or no matching
 *  cards (so the caller can interpolate it unconditionally). Proprietary cards rank first. */
export function buildInsightNote(cards: InsightCard[], sectionName: string): string {
  const lanes = SECTION_LANES[sectionName];
  if (!lanes || !Array.isArray(cards) || cards.length === 0) return "";
  const laneSet = new Set(lanes);
  const relevant = cards
    .filter((c) => c && typeof c.claim === "string" && c.claim.trim().length > 0 && laneSet.has(c.topic_lane))
    // Sector-specific cards win the per-section cap over generic 'general' ones (stable sort keeps
    // the RPC's own specific-first/recency order within a tier).
    .sort((a, b) => specificityScore(b) - specificityScore(a))
    .slice(0, MAX_CARDS_PER_SECTION);
  if (relevant.length === 0) return "";
  const bullets = relevant.map((c) => `- ${c.claim.trim()}`).join("\n");
  return `\n\nMARKET INTELLIGENCE (BACKGROUND ONLY — STRICT RULES): Below are durable, anonymised market-entry insights distilled from curated ANZ market-entry sources, selected as relevant to this section. Use them ONLY to inform substance, framing, and what matters when entering Australia. You MUST: (a) apply and combine them in your own words for THIS company; (b) NEVER reproduce a line verbatim or near-verbatim; (c) NEVER quote them or wrap their wording in quotation marks; (d) NEVER attribute any statement to a named source, document, person, or company; (e) NEVER cite them or attach a citation marker to them; (f) NEVER introduce a specific figure, rate, threshold, or year from them — they are deliberately figure-free, so keep them qualitative. If an insight conflicts with the canonical figures or data provided elsewhere in this prompt, defer to that data. Treat these as uncited background, not evidence.\n${bullets}`;
}
