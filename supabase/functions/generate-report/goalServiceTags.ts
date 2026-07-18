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
//
// Vocabulary reconciliation (MES ticket "Reconcile intake goal-tags", 2026-07-09):
// the tags feed EXACT-match `.cs.{}` arms + the scorer's service-overlap boost, so a
// tag that exists in no directory row is a dead lever. The mentor goals' original
// tags ("Mentorship"/"Advisory") appear in ZERO community_members.specialties rows —
// that column's real vocabulary is archetypes ("Active Advisor" ×22, "Scaled
// Founder" ×15, "International Founder" ×47, "Cross-border" ×47, "Startup
// Advisor"/"Startup Ecosystem" ×2, prod snapshot 2026-07-09). Mentor-facing goals now
// carry those REAL terms so they influence mentor candidate fetch + ranking. The old
// generic tags are kept for the scorer's cross-table breadth (harmless when unmatched).
//
// Deliberately-semantic-only goals (no vocabulary exists — do NOT invent tags):
//   • grants — no grant-tagged rows anywhere; handled structurally via
//     trade_investment_agencies.grants_available (see the union-level boost in
//     index.ts) + the Perplexity grants research every report already runs.
//   • lead_lists_* — lead_databases matching is semantic + ICP-gated (leadMatchesIcp);
//     these tags only feed the scorer breadth.
//   • founders — no peer-founder data source; the goal's real mechanisms are the
//     mentor/events section emphasis + the "Scaled Founder" specialty term below.
export const GOAL_SERVICE_TAGS_BY_ID: Record<string, string[]> = {
  // International
  find_providers: ["Legal", "Tax", "HR", "Accounting", "Finance", "Immigration"],
  trade_agencies: ["Trade Advisory", "Government Relations", "Investment"],
  case_studies: ["Market Research", "Consulting"],
  guides: ["Market Research", "Consulting"],
  market_research: ["Market Research", "Consulting", "Data"],
  associations: ["Industry Association", "Chamber of Commerce"],
  events: ["Events", "Networking"],
  mentors_intl: ["Mentorship", "Advisory", "Consulting", "Active Advisor", "International Founder", "Cross-border"],
  lead_lists_intl: ["Lead Generation", "Market Research", "Data"],
  compliance: ["Legal", "Compliance", "Regulatory"],
  // Startup
  investors: ["Investment", "Venture Capital", "Funding"],
  accelerators: ["Accelerator", "Incubator", "Startup"],
  mentors_startup: ["Mentorship", "Advisory", "Startup", "Active Advisor", "Startup Advisor", "Scaled Founder"],
  growth_providers: ["Legal", "Finance", "HR", "Accounting"],
  spaces: ["Co-working", "Innovation Hub"],
  grants: ["Grants", "Government", "Funding"],
  lead_lists_startup: ["Lead Generation", "Marketing", "Sales"],
  founders: ["Networking", "Community", "Founder", "Scaled Founder", "Startup Ecosystem"],
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
  case_studies: ["case_studies_guides"],   // MES-210a: dedicated section, split from events
  guides: ["case_studies_guides"],
  market_research: ["executive_summary", "competitor_landscape"],
  associations: ["service_providers"],
  events: ["events_resources"],
  mentors_intl: ["mentor_recommendations"],
  lead_lists_intl: ["lead_list"],
  compliance: ["setup_compliance"],   // the report's dedicated regulatory/setup section
  // Startup
  investors: ["investor_recommendations"],
  accelerators: ["service_providers"],                 // innovation hubs surface within providers
  mentors_startup: ["mentor_recommendations"],
  growth_providers: ["service_providers"],
  spaces: ["service_providers"],
  grants: ["action_plan"],
  lead_lists_startup: ["lead_list"],
  founders: ["mentor_recommendations", "events_resources"],
  guides_startup: ["case_studies_guides"],
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

/**
 * Did the user select the "grants & government funding" goal? Used to boost
 * grants_available agencies (no grant tag vocabulary exists to match on). Reads the
 * v2 goal_id and the legacy long label. Pure — shared by both the overlap and union
 * paths so the predicate can't drift between them.
 */
export function goalSelectsGrants(source: { goal_ids?: string[] | null; services_needed?: string[] | null }): boolean {
  return (
    (source.goal_ids ?? []).includes("grants") ||
    (source.services_needed ?? []).includes("Identify grant and government funding opportunities")
  );
}

/**
 * Telemetry: per selected goal, how many MATCHED rows carry at least one of the
 * goal's service tags (exact match, mirroring the `.cs.{}` semantics). Stored in
 * report_json.metadata.goal_tag_hits so vocabulary drift is OBSERVABLE from
 * report_quality — a goal that keeps logging 0 across reports has dead tags (a
 * unit test cannot assert live-DB vocabulary, so telemetry is the honest guard).
 * Reads the tag-ish array fields present on matched/decorated rows.
 */
export function countGoalTagHits(
  goalIds: string[] | null | undefined,
  pools: Record<string, Array<Record<string, unknown>>>,
  // MES-148 Phase 5 (P5-1): optional service_terms expander. When the matcher
  // expanded goal tags into synonyms, count a row that carries a SYNONYM (e.g.
  // "Legal Services") as a hit for the goal whose tag ("Legal") expands to it —
  // otherwise the telemetry would understate the very matching improvement it's
  // meant to observe. Undefined = count against the raw goal tags (today's shape).
  expand?: (tags: string[]) => string[],
): Record<string, number> {
  const out: Record<string, number> = {};
  const rows = Object.values(pools || {}).flat().filter(Boolean);
  const rowTerms: Array<Set<string>> = rows.map((r) => {
    const terms = new Set<string>();
    for (const key of ["services", "specialties", "tags", "sector_tags"]) {
      const v = (r as Record<string, unknown>)[key];
      if (Array.isArray(v)) for (const t of v) if (typeof t === "string") terms.add(t);
    }
    return terms;
  });
  for (const id of goalIds ?? []) {
    const base = GOAL_SERVICE_TAGS_BY_ID[id];
    if (!base) continue;
    const tags = expand ? expand(base) : base;
    out[id] = rowTerms.filter((terms) => tags.some((t) => terms.has(t))).length;
  }
  return out;
}
