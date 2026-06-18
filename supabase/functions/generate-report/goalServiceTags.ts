/**
 * Goal → service-tag mapping for downstream Supabase `.cs.{}` matching.
 *
 * Pure module — NO Deno globals and NO external imports — so it can be imported
 * by the Deno edge function (`./goalServiceTags.ts`) AND unit-tested under Node
 * (`node --test`). Keep it dependency-free.
 *
 * P0.1 fix (docs/redesign/handoff/ENGINEERING_TODO.md): matching is keyed by
 * stable `goal_id`, not by the brittle long-label string lookup that the v2
 * intake shim broke. `expandGoalsToServiceTags` reads the `goal_ids` column
 * first and falls back to the legacy long labels in `services_needed` so
 * historical rows and the still-live legacy form keep matching.
 *
 * GOAL_SERVICE_TAGS_BY_ID mirrors GOALS[].service_tags in
 * src/components/report-creator/intakeSchema.v2.ts — keep the two in sync.
 */

// Keyed by stable goal_id (what the v2 form writes to the goal_ids column).
export const GOAL_SERVICE_TAGS_BY_ID: Record<string, string[]> = {
  // International
  find_providers: ["Legal", "Tax", "HR", "Accounting", "Finance", "Immigration"],
  trade_agencies: ["Trade Advisory", "Government Relations", "Investment"],
  case_studies: ["Market Research", "Consulting"],
  guides: ["Market Research", "Consulting"],
  market_research: ["Market Research", "Consulting", "Data"],
  associations: ["Industry Association", "Chamber of Commerce"],
  events: ["Events", "Networking"],
  mentors_intl: ["Mentorship", "Advisory", "Consulting"],
  lead_lists_intl: ["Lead Generation", "Market Research", "Data"],
  compliance: ["Legal", "Compliance", "Regulatory"],
  // Startup
  investors: ["Investment", "Venture Capital", "Funding"],
  accelerators: ["Accelerator", "Incubator", "Startup"],
  mentors_startup: ["Mentorship", "Advisory", "Startup"],
  growth_providers: ["Legal", "Finance", "HR", "Accounting"],
  spaces: ["Co-working", "Innovation Hub"],
  grants: ["Grants", "Government", "Funding"],
  lead_lists_startup: ["Lead Generation", "Marketing", "Sales"],
  founders: ["Networking", "Community", "Founder"],
  guides_startup: ["Market Research", "Consulting"],
};

// Legacy long-label → tags. Backward compatibility for historical rows and the
// pre-v2 form, which only ever wrote long labels into services_needed[].
export const GOAL_SERVICE_TAGS_BY_LABEL: Record<string, string[]> = {
  "Find vetted service providers (legal, tax, HR, finance)": ["Legal", "Tax", "HR", "Accounting", "Finance", "Immigration"],
  "Connect with trade and investment agencies": ["Trade Advisory", "Government Relations", "Investment"],
  "Access market entry case studies and success stories": ["Market Research", "Consulting"],
  "Identify relevant industry associations and chambers of commerce": ["Industry Association", "Chamber of Commerce"],
  "Discover upcoming market entry events and networking opportunities": ["Events", "Networking"],
  "Find experienced mentors and advisors": ["Mentorship", "Advisory", "Consulting"],
  "Access qualified lead lists for my target sector": ["Lead Generation", "Market Research", "Data"],
  "Understand regulatory and compliance requirements": ["Legal", "Compliance", "Regulatory"],
  // Startup
  "Find investors and venture capital firms": ["Investment", "Venture Capital", "Funding"],
  "Discover accelerators and incubator programs": ["Accelerator", "Incubator", "Startup"],
  "Connect with mentors and startup advisors": ["Mentorship", "Advisory", "Startup"],
  "Access growth-stage service providers (legal, finance, HR)": ["Legal", "Finance", "HR", "Accounting"],
  "Find co-working spaces and innovation hubs": ["Co-working", "Innovation Hub"],
  "Identify grant and government funding opportunities": ["Grants", "Government", "Funding"],
  "Access lead lists and customer acquisition resources": ["Lead Generation", "Marketing", "Sales"],
  "Connect with other founders and peer networks": ["Networking", "Community", "Founder"],
};

export interface GoalTagSource {
  /** v2 column: stable goal ids. Preferred. */
  goal_ids?: string[] | null;
  /** legacy column: long-label goal descriptions. Fallback. */
  services_needed?: string[] | null;
}

/**
 * Expand selected goals into the flat set of service tags used for `.cs.{}`
 * provider / mentor / lead matching.
 *
 * Resolution order:
 *   1. `goal_ids` via GOAL_SERVICE_TAGS_BY_ID (v2 rows, and legacy rows after backfill).
 *   2. If that yields nothing, `services_needed` via GOAL_SERVICE_TAGS_BY_LABEL
 *      (historical rows / pre-v2 form that only carry long labels).
 */
export function expandGoalsToServiceTags(source: GoalTagSource): string[] {
  const tags = new Set<string>();

  for (const id of source.goal_ids ?? []) {
    const mapped = GOAL_SERVICE_TAGS_BY_ID[id];
    if (mapped) for (const t of mapped) tags.add(t);
  }

  if (tags.size === 0) {
    for (const label of source.services_needed ?? []) {
      const mapped = GOAL_SERVICE_TAGS_BY_LABEL[label];
      if (mapped) for (const t of mapped) tags.add(t);
    }
  }

  return [...tags];
}

// ── Goal → report section mapping (D2: "keep all sections, emphasise picked") ──
// Each selected goal flags the report section(s) it feeds so generate-report can tell
// the model to make those sections especially specific/actionable. We deliberately do
// NOT hide unselected sections (full-report value is preserved) — this only emphasises.
// section_name values must match the report_templates.section_name set.
export const GOAL_SECTION_MAP: Record<string, string[]> = {
  // International
  find_providers: ["service_providers"],
  trade_agencies: ["service_providers"],               // agencies surface within the providers section
  case_studies: ["events_resources"],
  guides: ["events_resources"],
  market_research: ["executive_summary", "competitor_landscape"],
  associations: ["service_providers"],
  events: ["events_resources"],
  mentors_intl: ["mentor_recommendations"],
  lead_lists_intl: ["lead_list"],
  compliance: ["action_plan"],
  // Startup
  investors: ["investor_recommendations"],
  accelerators: ["service_providers"],                 // innovation hubs surface within providers
  mentors_startup: ["mentor_recommendations"],
  growth_providers: ["service_providers"],
  spaces: ["service_providers"],
  grants: ["action_plan"],
  lead_lists_startup: ["lead_list"],
  founders: ["mentor_recommendations", "events_resources"],
  guides_startup: ["events_resources"],
};

/** The set of report sections the user's selected goals map to (deduped). Empty for
 *  legacy rows with no goal_ids — emphasis is purely additive, so that degrades cleanly. */
export function goalsToPrioritisedSections(source: { goal_ids?: string[] | null }): string[] {
  const out = new Set<string>();
  for (const id of source.goal_ids ?? []) {
    for (const sec of GOAL_SECTION_MAP[id] ?? []) out.add(sec);
  }
  return [...out];
}
