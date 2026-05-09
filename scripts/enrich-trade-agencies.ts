/**
 * Phase 3.4 — Trade & Investment Agencies enrichment orchestration.
 *
 * This file is the canonical artifact for the per-record research run.
 * It is structured so the same procedure can be replayed by either:
 *   (a) a Claude Code session dispatching `Task` sub-agents (the path used
 *       to populate the staging table the first time), or
 *   (b) an out-of-band runner using the Anthropic SDK with web search +
 *       web fetch tools enabled (re-run path; not wired here).
 *
 * Responsibilities:
 *   1. Define the strict zod schema returned by each per-record sub-agent.
 *   2. Define the per-record agent prompt template (single source of truth).
 *   3. Provide validate() + insertStaging() helpers used by either runner.
 *
 * The actual research dispatch happens via Claude Code `Task` calls,
 * one sub-agent per agency, in parallel batches of 10 with a 30s pause
 * between batches. Each sub-agent inserts directly into
 * trade_agencies_enrichment_staging via the Supabase MCP server, then
 * returns a brief confirmation to the parent session.
 *
 * See CLAUDE.md §1 for the in-scope Supabase project ID.
 */

import { z } from "zod";

// -----------------------------------------------------------------------------
// 1. Schema — must match the JSON contract in the agent prompt template below.
// -----------------------------------------------------------------------------

export const GovernmentLevelEnum = z.enum([
  "federal",
  "state",
  "local",
  "bilateral",
  "industry",
  "international",
  "none",
  "",
]);

export const StageEnum = z.enum([
  "pre-launch",
  "startup",
  "scaleup",
  "established",
  "enterprise",
]);

export const SupportTypeEnum = z.enum([
  "market_intelligence",
  "matchmaking",
  "networking",
  "trade_missions",
  "landing_program",
  "advocacy",
  "grants",
  "export_finance",
  "training",
  "regulatory_guidance",
]);

export const SectorEnum = z.enum([
  "Fintech",
  "Agritech",
  "Healthtech",
  "Cleantech",
  "Deep Tech",
  "Space",
  "Defence",
  "Mining",
  "Construction",
  "Foodtech",
  "Edtech",
  "Manufacturing",
  "Tourism",
  "Creative Industries",
  "Financial Services",
  "Sector Agnostic",
]);

export const EmployeesRangeEnum = z.enum([
  "1",
  "2-10",
  "11-50",
  "51-200",
  "201-500",
  "500+",
  "",
]);

export const ExperienceTileSchema = z.object({
  name: z.string().min(1),
  domain: z.string().min(1),
});

export const EnrichmentSchema = z.object({
  verified_website: z.string(),
  verified_domain: z.string(),
  tagline: z.string().max(120),
  description_short: z.string().max(320),
  description_full: z.string().max(1800),
  basic_info: z.string(),
  why_work_with_us: z.string(),
  founded_year: z.string(),
  employees_range: EmployeesRangeEnum,
  location_city: z.string(),
  location_state: z.string(),
  location_country_iso2: z.string().regex(/^[A-Z]{2}$|^$/),
  linkedin_url: z.string(),
  government_level: GovernmentLevelEnum,
  jurisdiction: z.array(z.string()),
  sectors_supported: z.array(SectorEnum.or(z.string())),
  target_company_stage: z.array(StageEnum),
  support_types: z.array(SupportTypeEnum),
  is_government_funded: z.boolean().nullable(),
  membership_required: z.boolean().nullable(),
  membership_fee_aud: z.number().nullable(),
  grants_available: z.boolean().nullable(),
  max_grant_aud: z.number().nullable(),
  experience_tiles: z.array(ExperienceTileSchema),
  research_notes: z.string(),
});

export type Enrichment = z.infer<typeof EnrichmentSchema>;

// -----------------------------------------------------------------------------
// 2. Per-record agent prompt template.
// -----------------------------------------------------------------------------

export interface AgencyForResearch {
  id: string;
  name: string;
  website_url: string | null;
  domain: string | null;
  organisation_type: string | null;
  category_slug: string | null;
  country_iso2: string | null;
  needs_re_research: boolean | null;
  description: string | null;
}

export function buildAgentPrompt(record: AgencyForResearch): string {
  const fmt = (v: unknown) =>
    v === null || v === undefined || v === "" ? "(unknown)" : String(v);

  return `You are a research agent enriching ONE record in the Market Entry Secrets
trade & investment agencies database. Use web_search + web_fetch only —
do NOT call Perplexity, do NOT bundle multiple agencies.

AGENCY TO RESEARCH:
- Name: ${fmt(record.name)}
- Currently known website: ${fmt(record.website_url)}
- Currently known domain: ${fmt(record.domain)}
- Organisation type: ${fmt(record.organisation_type)}
- Category: ${fmt(record.category_slug)}
- Country (ISO-2): ${fmt(record.country_iso2)}
- needs_re_research flag: ${fmt(record.needs_re_research)}
- Existing description (may be truncated or wrong): ${fmt(record.description)}

RESEARCH STEPS:
1. Verify the website is correct. If needs_re_research = true OR domain is null,
   first find the canonical official website. Watch for impostor sites,
   link aggregators (linktr.ee, flow.page), and unrelated companies that
   may have been hallucinated previously.
2. web_fetch the homepage and About page to extract structured facts.
3. Cross-check key fields (founded year, employees, services) against
   one additional source (LinkedIn, Wikipedia, Crunchbase).
4. For ANZ-located offices of foreign agencies (KOTRA, JETRO, Enterprise
   Ireland), prioritize the AU/NZ office details over the global HQ.
5. NEVER fabricate. If a field cannot be confidently determined, use null
   for objects/numbers, "" for text, [] for arrays.

After research, INSERT one row into trade_agencies_enrichment_staging via
the Supabase MCP tool (project id xhziwveaiuhzdoutpgrh) using exactly
this SQL template (substitute your researched values, escape single quotes
by doubling them, JSON-encode the enrichment object):

  INSERT INTO trade_agencies_enrichment_staging
    (source_id, source_name, enrichment, research_notes, status)
  VALUES (
    '${record.id}'::uuid,
    $$${record.name.replace(/\$/g, "\\$")}$$,
    $$<JSON OBJECT>$$::jsonb,
    $$<RESEARCH NOTES>$$,
    'pending'
  )
  ON CONFLICT (source_id) DO UPDATE
    SET enrichment    = EXCLUDED.enrichment,
        research_notes = EXCLUDED.research_notes,
        status         = 'pending',
        created_at     = now();

The JSON OBJECT must conform to this schema exactly (allowed enum values
listed inline):

{
  "verified_website": "https://www.example.com",
  "verified_domain": "example.com",
  "tagline": "1 sentence positioning, max 80 chars",
  "description_short": "2-3 sentences, max 250 chars, market-entry value focused",
  "description_full": "5-7 sentences, max 1500 chars, comprehensive overview",
  "basic_info": "1 line e.g. 'Federal trade agency promoting Korean exports'",
  "why_work_with_us": "1-2 sentences value prop for international entrants to ANZ",
  "founded_year": "1962",
  "employees_range": "11-50",   // one of: 1, 2-10, 11-50, 51-200, 201-500, 500+
  "location_city": "Sydney",
  "location_state": "NSW",
  "location_country_iso2": "AU",
  "linkedin_url": "https://linkedin.com/company/...",
  "government_level": "federal", // federal | state | local | bilateral | industry | international | none
  "jurisdiction": ["NSW", "VIC"],
  "sectors_supported": ["Fintech", "Healthtech"],
  // allowed sector values: Fintech, Agritech, Healthtech, Cleantech, Deep Tech,
  // Space, Defence, Mining, Construction, Foodtech, Edtech, Manufacturing,
  // Tourism, Creative Industries, Financial Services, Sector Agnostic
  "target_company_stage": ["startup", "scaleup"],
  // allowed: pre-launch, startup, scaleup, established, enterprise
  "support_types": ["market_intelligence", "matchmaking"],
  // allowed: market_intelligence, matchmaking, networking, trade_missions,
  // landing_program, advocacy, grants, export_finance, training, regulatory_guidance
  "is_government_funded": true,
  "membership_required": false,
  "membership_fee_aud": 0,
  "grants_available": true,
  "max_grant_aud": 50000,
  "experience_tiles": [
    {"name": "Canva", "domain": "canva.com"},
    {"name": "Atlassian", "domain": "atlassian.com"}
  ]
}

GUIDANCE:
- For foreign trade agencies (Austrade, KOTRA, JETRO, Enterprise Ireland),
  list the local ANZ office in location_city, not the global HQ.
- For bilateral chambers (FACCI, AKBC, AmCham AU/NZ), jurisdiction is the
  bilateral country pair, government_level is "bilateral".
- For state bodies (Investment NSW, Trade & Invest Queensland), jurisdiction
  is the single state, government_level is "state".
- support_types should reflect what the agency ACTUALLY does. A small
  bilateral chamber may only do networking + advocacy.
- Be especially rigorous on records flagged needs_re_research = true.
  Their existing data is known to be wrong.

After the INSERT succeeds, reply with EXACTLY this format and NOTHING else:
  STAGED ${record.name} | website=<verified_website> | confidence=<low|medium|high>

If you cannot find any reliable information at all, INSERT with status='invalid'
and the best partial JSON you have, then reply:
  INVALID ${record.name} | reason=<short reason>
`;
}

// -----------------------------------------------------------------------------
// 3. Validation + staging helpers (used by the out-of-band runner; the CC
//    sub-agent path inserts directly via Supabase MCP).
// -----------------------------------------------------------------------------

export interface ValidateResult {
  ok: boolean;
  error?: string;
  data?: Enrichment;
}

export function validate(json: unknown): ValidateResult {
  const parsed = EnrichmentSchema.safeParse(json);
  if (parsed.success) return { ok: true, data: parsed.data };
  return { ok: false, error: parsed.error.toString() };
}

// SQL fragments — kept here as the source of truth.

export const FETCH_PENDING_SQL = `
SELECT id, name, website_url, domain, organisation_type,
       category_slug, country_iso2, needs_re_research, description
FROM trade_investment_agencies
WHERE id NOT IN (
  SELECT source_id
  FROM trade_agencies_enrichment_staging
  WHERE status IN ('applied','pending')
    AND source_id IS NOT NULL
)
ORDER BY needs_re_research DESC NULLS LAST, name ASC;
`;

export const STAGING_INSERT_SQL = `
INSERT INTO trade_agencies_enrichment_staging
  (source_id, source_name, enrichment, research_notes, status)
VALUES ($1::uuid, $2, $3::jsonb, $4, 'pending')
ON CONFLICT (source_id) DO UPDATE
  SET enrichment    = EXCLUDED.enrichment,
      research_notes = EXCLUDED.research_notes,
      status         = 'pending',
      created_at     = now();
`;

// Batching params used by the dispatcher.
export const BATCH_SIZE = 10;
export const PAUSE_BETWEEN_BATCHES_MS = 30_000;
