-- MES-210a: dedicated free "Case Studies & Guides" report section, split out of
-- events_resources. The MES-210 audit (docs/audits/mes-210-report-surfacing-audit.md)
-- measured only 31/146 case studies EVER surfacing and 39% of reports shipping with
-- zero case-study cards, because they competed with guides for ≤5 "resources" cards
-- buried in the events section. Coordinated pieces (the section/tier invariant):
--   1. This migration: idempotent report_templates insert (visibility_tier 'free')
--      + a SURGICAL, guarded edit narrowing events_resources to events only.
--   2. Frontend reportSectionConfig.ts + reportCardGroups.ts (same PR).
--   3. report-quality-loop rubric.ts SECTION_ORDER + SECTION_INTRODUCED_AT (same PR).
--   4. get_tier_gated_report / get_shared_report RPCs: NO change required — both
--      strip points enumerate only GATED sections and pass unlisted sections
--      through, and this section is free (same tier as events_resources today),
--      so entitlements are unchanged.
--
-- Deploy-skew safety (both directions):
--   • Old function + this template: the data-dependent halves below are wrapped in
--     {{#matched_case_studies_json}} / {{#matched_content_json}} conditional
--     blocks, which renderTemplate DROPS when the variable is missing or empty —
--     an old build that doesn't provide the variable renders the graceful
--     empty-state prose, never a literal mustache token.
--   • New function + missing template row: generate-report falls back to
--     rendering content under events_resources (legacyResources guard).
--
-- Timestamp note: originally authored as 20260718100000 (collided with
-- mes162_featured_logo_flags, renamed 20260718110000, applied only to the PR's
-- preview branch); renumbered to 20260718120000 with the corrected SQL so preview
-- and prod both run this exact version. Never applied to prod under any prior number.

-- 1. Section template — idempotent insert.
insert into public.report_templates (section_name, prompt_body, visibility_tier, is_active)
select
  'case_studies_guides',
  'You are presenting proof that companies comparable to {{company_name}} — a {{company_stage}} {{industry_sector}} company from {{country_of_origin}} focused on {{target_regions}} — have made the Australian market work, followed by the most useful preparation guides.

{{#matched_case_studies_json}}
Here are the like-for-like case studies matched to this company (each carries the company profiled, its origin country, target market, industry, outcome, and a match_reasons list explaining why it was matched — an empty match_reasons list means it is a recent example, NOT an established match):
{{matched_case_studies_json}}
{{/matched_case_studies_json}}

{{#matched_content_json}}
Here are relevant guides and other content resources:
{{matched_content_json}}
{{/matched_content_json}}

STRICT RULES:
1. Only reference case studies and content that appear in the lists above. Do NOT invent, import, or generalise other company examples, and never present a case study as more similar than its match_reasons support.
2. For any case study whose match_reasons list is EMPTY, present it as a recent, notable market story — do NOT claim it is similar or comparable to {{company_name}}.
3. Every case study or guide you mention by name MUST be present in the provided lists. If no lists appear above, write a short note that no closely matching case studies were found for this profile and recommend browsing the full case-study library at /case-studies.
4. Match the company''s situation: for an Australian-based company, frame these stories as growth and expansion proof; for an international company, frame them as market-entry proof. Never tell an Australian company how to "enter" Australia.
5. Do NOT include any numbered citation markers like [1], [2], [3] anywhere in your response.

Write the section so that:
- It opens with the strongest supported parallel: what the closest-matched company did, why it is relevant (origin, sector, or target market — use only its match_reasons), and the single most transferable lesson for {{company_name}}.
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

-- 2. Narrow the events_resources template to events only — SURGICAL string edits,
-- not a body replacement, so any prod-side prompt drift (rq-slack-actions accepted
-- proposals, admin edits) outside these exact substrings is preserved. Each
-- replace() no-ops when its target text is absent, and the WHERE guard (content
-- block still present) makes the whole statement — including the updated_at bump —
-- idempotent. On an empty preview DB this no-ops harmlessly (no row / no marker).
update public.report_templates
set prompt_body =
  replace(
    replace(
      replace(
        replace(
          replace(
            prompt_body,
            'You are recommending events and resources for',
            'You are recommending events for'
          ),
          '

Here are relevant content resources and case studies:
{{matched_content_json}}',
          ''
        ),
        ' If the events list is empty, write a short note that we did not match any events for the target region and skip ahead to the content resources.',
        ' If the events list is empty, write a short note that we did not match any events for the target region and recommend checking the events directory for new listings.'
      ),
      '
- Suggest the most relevant content resources for preparation (only from the provided list)',
      ''
    ),
    '**bold** for event/resource names',
    '**bold** for event names'
  ),
  version = coalesce(version, 1) + 1,
  updated_at = now()
where section_name = 'events_resources'
  and prompt_body like '%{{matched_content_json}}%';
