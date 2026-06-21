-- Adds the "setup_compliance" report section (free tier): a practical Setup &
-- Compliance Guide grounded in country_faqs (visa/entity/tax/banking/employment)
-- for the user's country_of_origin. country_faqs + countries are embedded in the
-- KB but were previously unconsumed by the report; the generate-report edge
-- function now fetches them STRUCTURALLY (by country_id) and exposes them via the
-- {{country_profile_json}} and {{matched_country_faqs_json}} template variables.
--
-- Idempotent: only inserts if the section does not already exist.
-- Revert: DELETE FROM public.report_templates WHERE section_name = 'setup_compliance';

INSERT INTO public.report_templates (section_name, visibility_tier, is_active, variables, prompt_body)
SELECT 'setup_compliance', 'free', true,
  ARRAY['company_name','company_stage','industry_sector','country_of_origin','country_profile_json','matched_country_faqs_json']::text[],
  $PROMPT$You are writing the "Setup & Compliance Guide" section for {{company_name}}, a {{company_stage}} {{industry_sector}} company from {{country_of_origin}} establishing operations in Australia.

This section is the practical, operational playbook for setting up legally and staying compliant in Australia — company structure, registrations, tax, visas/immigration, banking, and employment — specific to founders coming from {{country_of_origin}}.

{{#country_profile_json}}
--- {{country_of_origin}} -> AUSTRALIA CORRIDOR PROFILE ---
Use this corridor context (trade relationship, key industries) for framing only:
{{country_profile_json}}
{{/country_profile_json}}

{{#matched_country_faqs_json}}
--- VERIFIED {{country_of_origin}} SETUP & COMPLIANCE Q&A (GROUND TRUTH) ---
The following are vetted, country-specific questions and answers for {{country_of_origin}} founders entering Australia. Treat these as the authoritative source for this section:
{{matched_country_faqs_json}}

STRICT GROUNDING RULES:
1. Base all specific facts — entity types, monetary thresholds (e.g. GST registration), tax/withholding rates, visa subclasses, treaty or trade-agreement names, and government agency names — ONLY on the Q&A above. Do NOT introduce specific figures, programmes, or rules that are not present in it.
2. Synthesise the Q&A into a flowing, well-organised guide; do NOT simply restate the questions verbatim.
3. Organise under these ### subsections where the Q&A supports them: Company Structure & Registration, Tax & GST, Visas & Immigration, Banking & Finance, Employment & Hiring, and Grants & Trade Agreements. Omit any subsection the Q&A does not cover.
{{/matched_country_faqs_json}}

If no verified {{country_of_origin}} Q&A is provided above, write a SHORT general orientation (3-4 sentences) covering the typical setup steps for a foreign company entering Australia (registering a company and obtaining an ABN, understanding GST and tax obligations, director and visa requirements, and opening local banking), and explicitly recommend engaging an Australian accountant and an immigration/legal adviser for {{country_of_origin}}-specific requirements. Do NOT fabricate country-specific thresholds, rates, visa subclasses, or treaty names.

FORMAT:
- Use ### for subsection headings, **bold** for key terms and figures, and bullet points for steps and requirements.
- Keep it practical and actionable — this is a doing guide, not a discussion.
- Do NOT include any numbered citation markers like [1], [2], [3] anywhere in your response.$PROMPT$
WHERE NOT EXISTS (SELECT 1 FROM public.report_templates WHERE section_name = 'setup_compliance');
