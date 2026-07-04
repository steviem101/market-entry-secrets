-- Report quality: weave the previously-dropped Trade/Government agencies and Innovation
-- hubs into the (free, always-visible) service_providers section, with hyperlinks.
--
-- Background: searchMatches() queries innovation_ecosystem + trade_investment_agencies and
-- stores them in report_json.matches, but getMatchesForSection() attached them to NO section
-- and no template referenced them -> the utilization metric always counted them as "dropped"
-- (baseline utilization ~0.76). The generate-report code change attaches them to this section's
-- card list; this template change references them in the prose so they are genuinely "used",
-- and asks the model to hyperlink each organisation to its real website (lifts the presentation
-- score, which penalises reports with no external hyperlinks).
--
-- The two new data blocks + their subsections are wrapped in conditional blocks
-- ({{#var}}...{{/var}}) so the template is backward-compatible: the generate-report prompt
-- engine drops a conditional block whose variable is absent, so until the matching code (which
-- supplies matched_trade_investment_agencies_json / matched_innovation_ecosystem_json) is
-- deployed, these subsections simply do not render -- no unsubstituted placeholders leak into
-- the prompt. Once the code ships, the variables become present and the subsections activate.
update public.report_templates
set
  variables = array[
    'company_name','company_stage','industry_sector','country_of_origin','services_needed',
    'target_regions','budget_level','enriched_company_profile','matched_providers_json',
    'matched_trade_investment_agencies_json','matched_innovation_ecosystem_json'
  ],
  prompt_body = $prompt$You are recommending support organisations for {{company_name}}, a {{company_stage}} {{industry_sector}} company from {{country_of_origin}} entering the Australian market.

Company profile:
{{enriched_company_profile}}

Services needed: {{services_needed}}
Target regions: {{target_regions}}
Budget level: {{budget_level}}

VERIFIED service providers from our directory (each entry may include a "website"; enriched descriptions where available):
{{matched_providers_json}}
{{#matched_trade_investment_agencies_json}}
Relevant TRADE & GOVERNMENT SUPPORT agencies from our directory (each entry may include a "website"):
{{matched_trade_investment_agencies_json}}
{{/matched_trade_investment_agencies_json}}
{{#matched_innovation_ecosystem_json}}
Relevant INNOVATION HUBS & ACCELERATORS from our directory (each entry may include a "website"):
{{matched_innovation_ecosystem_json}}
{{/matched_innovation_ecosystem_json}}
IMPORTANT: Only recommend organisations that appear in the lists above. Do NOT invent, guess, or hallucinate any organisation that is not in these lists. If the service providers list is empty, state clearly: "We did not find matching service providers in our directory for your specific needs. We recommend browsing our full Service Providers directory at /service-providers for the latest listings."

Structure the section using the following subsections (### headings). SKIP any subsection whose list is empty — do not mention an empty category.

### Recommended Service Providers
For each matched provider:
1. Explain specifically why they are relevant to {{company_name}}'s needs (reference their enriched description if available).
2. Highlight which of {{company_name}}'s required services ({{services_needed}}) they can address.
3. Note their location and how it aligns with the target regions.
{{#matched_trade_investment_agencies_json}}
### Trade & Government Support
For each matched agency, explain in 2-3 sentences how it can help {{company_name}} (e.g. landing-pad programs, market introductions, grants guidance, trade facilitation), based on what the agency actually does.
{{/matched_trade_investment_agencies_json}}
{{#matched_innovation_ecosystem_json}}
### Innovation Hubs & Accelerators
For each matched innovation hub or accelerator, explain in 2-3 sentences how it is relevant to {{company_name}} (e.g. soft-landing programs, founder networks, co-working, mentorship).
{{/matched_innovation_ecosystem_json}}
FORMATTING: Use **bold** for each organisation's name. When an organisation has a "website" value in the data above, hyperlink its name to that URL using Markdown — [Organisation Name](website) — using ONLY the real URL from the data (never invent or shorten a URL). Keep each entry concise (2-4 sentences) and avoid walls of text.$prompt$
where section_name = 'service_providers';
