-- =====================================================================
-- Tighten the events_resources, executive_summary, swot_analysis,
-- competitor_landscape, and action_plan templates to:
--   1. Drop the "some events may be past editions" prompt hack on
--      events_resources — the generate-report function now hard-filters
--      events to `date >= now()`, so the apology is no longer needed and
--      it implicitly trained the model to recommend stale items anyway.
--   2. Forbid inventing events. The previous template instructed the
--      model to "recommend general industry event types to search for"
--      if the list was empty — which produced confident references to
--      Inside Construction Expo, SafetyFirst Conference, AI Build
--      Australia, Total Facilities, AusCERT, CeBIT, etc. that are not
--      in any user-facing system and that the user has no way to verify.
--   3. Forbid inventing client relationships, partnerships, and named
--      competitors across the analytical sections.
--   4. Forbid the model from labeling regulators, universities, law
--      firms, or research institutes as "competitors" in the competitor
--      landscape — they belong in an ecosystem subsection at most.
-- =====================================================================

BEGIN;

UPDATE public.report_templates SET
  prompt_body = $$You are recommending events and resources for {{company_name}}, a {{company_stage}} {{industry_sector}} company from {{country_of_origin}} entering the Australian market targeting {{target_regions}}.

Company profile:
{{enriched_company_profile}}

Here are the relevant events from our directory:
{{matched_events_json}}

Here are relevant content resources and case studies:
{{matched_content_json}}

STRICT RULES:
1. Only reference events and content that appear in the lists above. Do NOT invent, guess, or recommend event names that are not in the data. If the events list is empty, write a short note that we did not match any events for the target region and skip ahead to the content resources.
2. If the matched_events_json is non-empty, every event you mention by name MUST be one of the events present in that list. Do not name "general industry event types to search for" — that practice produced uncited recommendations users could not verify.
3. Do NOT include any numbered citation markers like [1], [2], [3] anywhere in your response.

Write recommendations that:
- Highlight the most relevant events for networking and market entry (only from the provided list)
- Suggest the most relevant content resources for preparation (only from the provided list)
- Provide practical advice on how to maximise value from these events

Use ### for subsection headings, **bold** for event/resource names, and bullet points for action items.$$,
  version = COALESCE(version, 1) + 1,
  updated_at = now()
WHERE section_name = 'events_resources';

-- Idempotent append: only add the anti-hallucination block if it isn't
-- already present. Without this guard a re-run (e.g. `supabase db reset`
-- after an out-of-band live apply) would append the block twice, growing
-- the prompt and confusing the model.
UPDATE public.report_templates SET
  prompt_body = prompt_body || E'\n\nADDITIONAL ANTI-HALLUCINATION RULES (applied across all analytical sections):\n- Do NOT name specific customers, clients, partners, or past investors of {{company_name}} unless they appear EXPLICITLY in the enriched_company_profile (in particular the key_clients array). If key_clients is empty, do NOT claim {{company_name}} has any named tier-1/named-account clients.\n- Do NOT invent named grant programs, FTA names, or regulatory frameworks not present in the provided market research variables.\n- Do NOT include any numbered citation markers like [1], [2], [3] unless market_research_citations is non-empty in your input.',
  version = COALESCE(version, 1) + 1,
  updated_at = now()
WHERE section_name IN ('executive_summary', 'swot_analysis', 'action_plan')
  AND prompt_body NOT LIKE '%ADDITIONAL ANTI-HALLUCINATION RULES%';

UPDATE public.report_templates SET
  prompt_body = prompt_body || E'\n\nCOMPETITOR-CATEGORY RULES:\n- A "competitor" must be a commercial vendor of an alternative product or service. Regulators (e.g. SafeWork NSW), government agencies, universities, research institutes, industry associations, law firms, and consultancies are NOT competitors — at most they are "ecosystem actors" and belong in a separate "Ecosystem Stakeholders" subsection.\n- Do NOT name a customer of the same category as a "competitor" (e.g. Alex Bank is a buyer of identity software, not a vendor competitor of an identity software firm).\n- Do NOT invent competitor names not present in the provided competitor_analysis_json or known_competitors_json.',
  version = COALESCE(version, 1) + 1,
  updated_at = now()
WHERE section_name = 'competitor_landscape'
  AND prompt_body NOT LIKE '%COMPETITOR-CATEGORY RULES%';

COMMIT;
