// kbTaxonomy.ts — the Content Studio -> MES taxonomy bridge (Sub-ticket 2A).
//
// Config-driven, not conditional sprawl: a single editable map from Content Studio
// `content_types` (a small closed vocabulary observed on the synced knowledge_chunk
// rows) to MES topic LANES. Applied at distillation so every insight card carries a
// lane. Sectors are carried through from the chunk metadata (already corridor-seeded);
// the distiller assigns canonical sectors from CANONICAL_SECTORS below.
//
// Lanes are the durability axis of the intelligence layer:
//   regulatory · market · playbook · cost · funding
// `cost` and `funding` have no direct content_type — they are inferred by the distiller
// from the claim itself (a chunk about payroll-tax thresholds is `cost`; a chunk about
// R&D grants is `funding`), so contentTypesToLanes never invents them.

export const TOPIC_LANES = ["regulatory", "market", "playbook", "cost", "funding"] as const;
export type TopicLane = typeof TOPIC_LANES[number];

/** Version stamp for the bridge (house `*_version` convention). Bump on map edits so
 *  re-distilled cards are attributable. */
export const TAXONOMY_BRIDGE_VERSION = "kb-taxonomy-v1";

// Keyed by lowercased content_type. A content_type may imply more than one lane.
// Keep in lockstep with the Content Studio content_types vocabulary.
const CONTENT_TYPE_LANES: Record<string, TopicLane[]> = {
  "regulatory & legal": ["regulatory"],
  "market entry": ["market", "playbook"],
  "industry insight": ["market"],
  "anz ecosystem": ["market"],
  "tech & product": ["market"],
  "growth & gtm": ["playbook"],
  "case study": ["playbook"],
};

/** Map a chunk's content_types[] to distinct candidate topic lanes (order: TOPIC_LANES).
 *  Unknown/empty content_types yield [] — the distiller then infers the lane from content. */
export function contentTypesToLanes(contentTypes: string[] | null | undefined): TopicLane[] {
  if (!contentTypes || contentTypes.length === 0) return [];
  const set = new Set<TopicLane>();
  for (const ct of contentTypes) {
    const lanes = CONTENT_TYPE_LANES[String(ct).trim().toLowerCase()];
    if (lanes) for (const l of lanes) set.add(l);
  }
  return TOPIC_LANES.filter((l) => set.has(l));
}

/** True if a string is one of the five canonical lanes (validates distiller output). */
export function isTopicLane(value: unknown): value is TopicLane {
  return typeof value === "string" && (TOPIC_LANES as readonly string[]).includes(value);
}

// Canonical MES sector slugs (the 20-sector taxonomy, mirrored from
// src/constants/linkedinTaxonomy.ts LINKEDIN_SECTORS / src/lib/sectorLabels.ts). Deno
// edge code can't import from src/, so this is duplicated deliberately; the
// kbTaxonomy.test.ts count assertion fails loudly if the two drift in size.
export const CANONICAL_SECTORS = [
  "technology", "financial-services", "healthcare", "manufacturing", "retail",
  "energy", "professional-services", "media-entertainment", "education", "real-estate",
  "transportation-logistics", "agriculture", "construction", "hospitality-tourism",
  "telecommunications", "consumer-goods", "government-nonprofit", "mining-resources",
  "life-sciences", "creative-industries",
] as const;
export type CanonicalSector = typeof CANONICAL_SECTORS[number];

export function isCanonicalSector(value: unknown): value is CanonicalSector {
  return typeof value === "string" && (CANONICAL_SECTORS as readonly string[]).includes(value);
}
