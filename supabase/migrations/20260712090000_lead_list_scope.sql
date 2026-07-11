-- Lead-list section scope fix (Daon report review).
--
-- The lead_list section is meant to recommend ONLY the purchasable lead datasets
-- from our directory (+ the custom-list request box). In practice, when few
-- datasets matched, the model padded the section with industry communities,
-- events, accelerators, service providers and mentors — all of which have their
-- OWN sections — duplicating the report under the Lead List heading (Daon: 1 lead
-- card, prose covering Cyber West / AISA / FinTechWA / Austrade / West Tech Fest).
--
-- The code half of this change (generate-report `leadScopeNote`) applies a hard
-- runtime scope guard on every lead_list run. This migration tightens the base
-- template so the section's own instructions match that scope even without the
-- runtime note.
--
-- Idempotency: guarded on the marker text not already being present; re-runs are
-- no-ops. Empty preview DB (no template rows): UPDATE matches 0 rows.
-- Reversal:
--   update public.report_templates
--     set prompt_body = split_part(prompt_body, E'\n\n--- STRICT SCOPE', 1)
--     where section_name = 'lead_list';

update public.report_templates
set
  prompt_body = prompt_body || E'\n\n--- STRICT SCOPE (this section only) ---\nWrite ONLY about the pre-built lead datasets in the matched leads data above, and the option to request a custom-built list. Do NOT discuss, list, or recommend industry communities, associations, networks, events, conferences, accelerators, incubators, co-working spaces, service providers, government/trade agencies, mentors, or investors — each of those has its OWN dedicated section elsewhere in this report, so covering them here duplicates the report. If the user''s stated priority points toward communities or networking, do NOT satisfy it in this section. If no dataset matches a given need, say so briefly and point to the custom-list request rather than substituting other entity types.',
  updated_at = now()
where section_name = 'lead_list'
  and is_active
  and position('STRICT SCOPE' in prompt_body) = 0;
