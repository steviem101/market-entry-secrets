-- =====================================================================
-- Re-activate the investor_recommendations report template.
--
-- The investor template was originally seeded by
-- 20260218000002_create_investors_table.sql at visibility_tier='growth',
-- but the row was subsequently removed (manually, no migration trail)
-- and the generate-report pipeline iterates only over
-- WHERE is_active = true. With no active row the section is never
-- written into report_json — even when 8 investors are successfully
-- matched (matches.investors is populated) and the user is on the
-- correct tier.
--
-- The frontend lists investor_recommendations as a Growth section, so
-- a Growth-tier user lands in ReportView.tsx Case 2 (requiredTier set
-- but content empty) and sees the ReportRegenerateSection placeholder
-- "Content Available with Your Plan — Generate a new report to see
-- the full Investor Recommendations analysis." Regenerating doesn't
-- help because the template still doesn't exist.
--
-- This migration upserts the row idempotently so the section is
-- generated on the next report run. The prompt is the corrected
-- version: it does NOT instruct the AI to emit numbered [N] citation
-- markers (Perplexity citations don't reach this template variable),
-- and the "VERIFIED" claim is removed (no verification flag exists
-- on the investors table) to avoid asserting curation that the data
-- layer doesn't support.
-- =====================================================================

-- section_name has no unique constraint on report_templates, so use an explicit
-- transactional delete-then-insert to keep the migration idempotent regardless
-- of whether the row exists, is inactive, or has stale prompt_body content.
BEGIN;

DELETE FROM public.report_templates WHERE section_name = 'investor_recommendations';

INSERT INTO public.report_templates (section_name, prompt_body, visibility_tier, variables, version, is_active)
VALUES (
  'investor_recommendations',
  $$You are recommending Australian investors for {{company_name}}, a {{company_stage}} {{industry_sector}} company from {{country_of_origin}} entering the Australian market.

Company profile:
{{enriched_company_profile}}

Their primary goals: {{primary_goals}}
Budget level: {{budget_level}}
Timeline: {{timeline}}

Here are matched investors from our directory:
{{matched_investors_json}}

INSTRUCTIONS:
1. Only recommend investors from the list above. Do NOT invent, guess, or hallucinate investor names, partner names, or check sizes. If the list is empty, state: "We did not find matching investors in our directory for your specific profile. We recommend browsing our full Investors directory at /investors for the latest listings." and end the section.
2. Use ONLY the fields present on each investor object (name, investor_type, location, sector_focus, stage_focus, check_size_min, check_size_max, description). Do NOT introduce any other facts about an investor that are not in the data.
3. Group recommendations by investor type (VCs, Angels/Syndicates, Accelerators, Grants, Venture Debt) — only include groups that have at least one matched investor.
4. For each investor, explain in 1-2 sentences WHY they are a fit based on stage_focus, sector_focus, and check_size range relative to the company's stage. Do NOT speculate about partner relationships or recent investments unless those are present in the description field.
5. Suggest a recommended approach order — which investors to contact first based on the company's current stage and needs. For very early-stage, prioritise grants, accelerators and angels. For growth-stage, prioritise VCs and venture debt.
6. Do NOT include numbered citation markers like [1], [2], [3] anywhere in the response — there is no source list to cite for this section.

Format as clean markdown with:
- H3 (###) headers for each investor type group
- Bullet points for each investor with name, why they are a fit, and the check size range (from the data)
- A "Recommended Approach Order" section at the end with numbered steps$$,
  'growth',
  ARRAY['company_name', 'company_stage', 'industry_sector', 'country_of_origin', 'enriched_company_profile', 'primary_goals', 'budget_level', 'timeline', 'matched_investors_json'],
  2,
  true
);

COMMIT;
