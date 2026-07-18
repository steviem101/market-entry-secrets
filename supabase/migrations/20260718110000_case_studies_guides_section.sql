-- MES-210a: dedicated free "Case Studies & Guides" report section, split out of
-- events_resources. The MES-210 audit (docs/audits/mes-210-report-surfacing-audit.md)
-- measured only 31/146 case studies EVER surfacing and 39% of reports shipping with
-- zero case-study cards, because they competed with guides for ≤5 "resources" cards
-- buried in the events section. Coordinated pieces (the section/tier invariant):
--   1. This migration: idempotent report_templates insert (visibility_tier 'free')
--      + events_resources template narrowed to events only.
--   2. Frontend reportSectionConfig.ts + reportCardGroups.ts (same PR).
--   3. report-quality-loop rubric.ts SECTION_ORDER (same PR).
--   4. get_tier_gated_report / get_shared_report RPCs: NO change required — both
--      strip points enumerate only GATED sections and pass unlisted sections
--      through, and this section is free (same tier as events_resources today),
--      so entitlements are unchanged.
--
-- The like-for-like matching data ({{matched_case_studies_json}}) is produced by
-- generate-report's new corridor-scored case-study pool (caseStudyMatch.ts):
-- origin country, sector, target market, and outcome from content_company_profiles.

-- 1. Section template — idempotent insert.
insert into public.report_templates (section_name, prompt_body, visibility_tier, is_active)
select
  'case_studies_guides',
  'You are presenting proof that companies like {{company_name}} — a {{company_stage}} {{industry_sector}} company from {{country_of_origin}} targeting {{target_regions}} — have successfully entered the Australian market, followed by the most useful preparation guides.

Here are the like-for-like case studies matched to this company (each carries the company profiled, its origin country, target market, industry, outcome, and a match_reasons list explaining why it was matched):
{{matched_case_studies_json}}

Here are relevant guides and other content resources:
{{matched_content_json}}

STRICT RULES:
1. Only reference case studies and content that appear in the lists above. Do NOT invent, import, or generalise other company examples, and never present a case study as more similar than its match_reasons support.
2. Every case study or guide you mention by name MUST be present in the provided lists. If both lists are empty, write a short note that no closely matching case studies were found for this profile and recommend browsing the full case-study library.
3. Do NOT include any numbered citation markers like [1], [2], [3] anywhere in your response.

Write the section so that:
- It opens with the strongest like-for-like parallel: what the closest-matched company did, why it is comparable (origin, sector, or target market — use the match_reasons), and the single most transferable lesson for {{company_name}}.
- Each remaining case study gets one short, specific takeaway tied to this company''s situation — never a generic summary.
- Guides are recommended for preparation with one line each on when to use them.

Use ### for subsection headings, **bold** for company/resource names, and bullet points for takeaways.

--- PRESENTATION RULES (report-quality) ---
- Present matched records as scannable cards, not walls of text: one record per bullet, maximum 3 sentences each.
- Where a record carries a website or profile link (its website, link, or url field), hyperlink the record''s name in markdown as [Name](url). If no link is present, bold the name instead. Never invent or guess URLs.
- Do not repeat the same record across multiple paragraphs, and do not pad entries with generic commentary.',
  'free',
  true
where not exists (
  select 1 from public.report_templates where section_name = 'case_studies_guides'
);

-- 2. Narrow the events_resources template to events only (case studies + guides now
-- have their own section above). Full-body replacement of the current prod prompt
-- with its content-resources half removed; idempotent by construction.
update public.report_templates
set prompt_body = 'You are recommending events for {{company_name}}, a {{company_stage}} {{industry_sector}} company from {{country_of_origin}} entering the Australian market targeting {{target_regions}}.

Company profile:
{{enriched_company_profile}}

Here are the relevant events from our directory:
{{matched_events_json}}

STRICT RULES:
1. Only reference events that appear in the list above. Do NOT invent, guess, or recommend event names that are not in the data. If the events list is empty, write a short note that we did not match any events for the target region and recommend checking the events directory for new listings.
2. If the matched_events_json is non-empty, every event you mention by name MUST be one of the events present in that list. Do not name "general industry event types to search for" — that practice produced uncited recommendations users could not verify.
3. Do NOT include any numbered citation markers like [1], [2], [3] anywhere in your response.

Write recommendations that:
- Highlight the most relevant events for networking and market entry (only from the provided list)
- Provide practical advice on how to maximise value from these events

Use ### for subsection headings, **bold** for event names, and bullet points for action items.

--- PRESENTATION RULES (report-quality) ---
- Present matched records as scannable cards, not walls of text: one record per bullet, maximum 3 sentences each.
- Where a record carries a website or profile link (its website, link, or url field), hyperlink the record''s name in markdown as [Name](url). If no link is present, bold the name instead. Never invent or guess URLs.
- Do not repeat the same record across multiple paragraphs, and do not pad entries with generic commentary.'
where section_name = 'events_resources';
