-- "Your Key Question — Answered" closing subsection on the executive summary.
--
-- The intake's final question ("what matters most to you from this report?" →
-- report_focus) previously fed a "lead with it" directive into EVERY section
-- prompt, which produced five sections opening with the identical key-question
-- framing (CreditLogic review) while the question itself was never answered
-- head-on anywhere. The code half of this change (generate-report focusNote)
-- now forbids formulaic openers; this data migration adds the dedicated answer:
-- the executive summary ends with a "### Your Key Question — Answered"
-- subsection quoting the user's question and answering it directly.
--
-- Mechanics:
--   * The block is wrapped in {{#report_focus}}…{{/report_focus}} — the
--     template renderer (promptTemplate.ts) drops it entirely when the user
--     gave no focus ("Not specified" counts as empty), so reports without a
--     key question are unchanged.
--   * report_focus is appended to the template's variables array (docs-only —
--     substitution keys off the runtime variables record) if not present.
--   * No new report section: the subsection lives INSIDE executive_summary
--     prose, so the 4-place section-truth rule (reportSectionConfig /
--     report_templates / rubric / get_tier_gated_report) is untouched.
--
-- Idempotency: guarded on the marker text not already being present; re-runs
-- are no-ops. Empty preview DB (no template rows): UPDATE matches 0 rows.
-- Reversal:
--   update public.report_templates
--     set prompt_body = split_part(prompt_body, '{{#report_focus}}' || E'\n\n--- YOUR KEY QUESTION', 1)
--     where section_name = 'executive_summary';

update public.report_templates
set
  prompt_body = prompt_body || E'{{#report_focus}}\n\n--- YOUR KEY QUESTION — ANSWERED (required closing subsection) ---\nWhen asked what matters most to them from this report, the user answered: "{{report_focus}}"\n\nEnd the executive summary with a final subsection headed exactly:\n### Your Key Question — Answered\nOpen the subsection by quoting their question as a markdown blockquote (> …), then answer it DIRECTLY in 100–150 words grounded ONLY in the research and data provided above: lead with a clear one-sentence answer, then the 2–3 most decision-relevant supporting facts. Do not restate the rest of the summary, do not pad with generic advice, and follow the same citation and anti-hallucination rules as the rest of the section.{{/report_focus}}',
  variables = case
    when 'report_focus' = any(variables) then variables
    else array_append(variables, 'report_focus')
  end,
  updated_at = now()
where section_name = 'executive_summary'
  and is_active
  and position('YOUR KEY QUESTION' in prompt_body) = 0;
