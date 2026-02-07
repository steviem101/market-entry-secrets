-- Enhancement 2: Insert competitor_landscape report template (growth tier)
INSERT INTO public.report_templates (section_name, prompt_body, visibility_tier, variables, version)
VALUES (
  'competitor_landscape',
  'You are analyzing the competitive landscape for {{company_name}}, a {{company_stage}} {{industry_sector}} company from {{country_of_origin}} entering the Australian market targeting {{target_regions}}.

Company profile:
{{enriched_company_profile}}

Here are real competitors identified in the Australian market:
{{competitor_analysis_json}}

Market research context:
{{market_research_landscape}}

Write a competitive landscape analysis that:
1. Identifies the top 3-5 competitors in the Australian market (use ONLY the competitors listed above — do not invent or guess additional competitors)
2. For each competitor, describe their market position, strengths, and potential weaknesses
3. Compares {{company_name}}''s unique strengths against these competitors
4. Identifies market gaps and opportunities that {{company_name}} can exploit
5. Provides a strategic positioning recommendation

If the competitor list is empty, state that no direct competitors were identified through our research and instead provide general guidance on the competitive dynamics of the {{industry_sector}} sector in Australia based on the market research data.

Use ### for subsection headings, **bold** for company names and key terms, and bullet points for comparisons.',
  'growth',
  ARRAY['company_name', 'company_stage', 'industry_sector', 'country_of_origin', 'target_regions', 'enriched_company_profile', 'competitor_analysis_json', 'market_research_landscape'],
  1
);

-- Update service_providers template to use enriched descriptions and prevent hallucination
UPDATE public.report_templates
SET prompt_body = 'You are recommending service providers for {{company_name}}, a {{company_stage}} {{industry_sector}} company from {{country_of_origin}} entering the Australian market.

Company profile:
{{enriched_company_profile}}

Services needed: {{services_needed}}
Target regions: {{target_regions}}
Budget level: {{budget_level}}

Here are VERIFIED service providers from our directory (with enriched descriptions where available):
{{matched_providers_json}}

IMPORTANT: Only recommend providers from the list above. Do NOT invent, guess, or hallucinate additional providers not in this list. If the list is empty or contains no relevant providers, state clearly: "We did not find matching service providers in our directory for your specific needs. We recommend browsing our full Service Providers directory at /service-providers for the latest listings."

For each matched provider:
1. Explain specifically why they are relevant to {{company_name}}''s needs (reference their enriched_description if available)
2. Highlight which of {{company_name}}''s required services ({{services_needed}}) they can address
3. Note their location and how it aligns with the target regions

Use ### for subsection headings and **bold** for provider names.',
    variables = ARRAY['company_name', 'company_stage', 'industry_sector', 'country_of_origin', 'services_needed', 'target_regions', 'budget_level', 'enriched_company_profile', 'matched_providers_json'],
    updated_at = now()
WHERE section_name = 'service_providers' AND is_active = true;

-- Update events_resources template to clarify events are from directory
UPDATE public.report_templates
SET prompt_body = 'You are recommending events and resources for {{company_name}}, a {{company_stage}} {{industry_sector}} company from {{country_of_origin}} entering the Australian market targeting {{target_regions}}.

Company profile:
{{enriched_company_profile}}

Here are relevant events from our directory (note: check dates as some may be past editions — they represent recurring event types relevant to your industry):
{{matched_events_json}}

Here are relevant content resources and case studies:
{{matched_content_json}}

IMPORTANT: Only reference events and content from the lists above. Do NOT invent fictional events or resources.

Write recommendations that:
1. Highlight the most relevant events for networking and market entry
2. Suggest relevant content resources for preparation
3. Provide practical advice on how to maximize value from these events
4. If no events are listed, recommend general industry event types to search for in {{target_regions}}

Use ### for subsection headings, **bold** for event/resource names, and bullet points for action items.',
    variables = ARRAY['company_name', 'company_stage', 'industry_sector', 'country_of_origin', 'target_regions', 'enriched_company_profile', 'matched_events_json', 'matched_content_json'],
    updated_at = now()
WHERE section_name = 'events_resources' AND is_active = true;

-- Update executive_summary to use enriched company profile
UPDATE public.report_templates
SET prompt_body = 'Write an executive summary for {{company_name}}''s market entry into Australia.

Enriched company profile:
{{enriched_company_profile}}

Company context:
- Stage: {{company_stage}}
- Industry: {{industry_sector}}
- Origin: {{country_of_origin}}
- Target regions: {{target_regions}}
- Services needed: {{services_needed}}
- Timeline: {{timeline}}
- Budget: {{budget_level}}
- Goals: {{primary_goals}}
- Challenges: {{key_challenges}}

Market research:
{{market_research_landscape}}

Write a compelling 3-4 paragraph executive summary that:
1. Opens with a clear statement of {{company_name}}''s value proposition and market opportunity in Australia (use the enriched profile data for specifics)
2. Summarizes the key market conditions and opportunity size
3. Outlines the recommended approach and timeline
4. Concludes with expected outcomes and next steps

Use **bold** for key statistics and important terms. Reference specific products, clients, or USPs from the enriched profile where available.',
    variables = ARRAY['company_name', 'company_stage', 'industry_sector', 'country_of_origin', 'target_regions', 'services_needed', 'timeline', 'budget_level', 'primary_goals', 'key_challenges', 'enriched_company_profile', 'market_research_landscape'],
    updated_at = now()
WHERE section_name = 'executive_summary' AND is_active = true;

-- Update mentor_recommendations to prevent hallucination
UPDATE public.report_templates
SET prompt_body = 'You are recommending mentors and community connections for {{company_name}}, a {{company_stage}} {{industry_sector}} company from {{country_of_origin}} entering the Australian market.

Company profile:
{{enriched_company_profile}}

Services needed: {{services_needed}}
Target regions: {{target_regions}}

Here are VERIFIED community members from our directory:
{{matched_mentors_json}}

IMPORTANT: Only recommend mentors from the list above. Do NOT invent or hallucinate additional people. If the list is empty, state: "We did not find matching mentors in our community directory for your specific needs. We recommend browsing our Community page at /community to connect with experienced professionals."

For each matched mentor, explain why their expertise is relevant to {{company_name}}''s market entry needs.

Use ### for subsection headings and **bold** for mentor names.',
    variables = ARRAY['company_name', 'company_stage', 'industry_sector', 'country_of_origin', 'services_needed', 'target_regions', 'enriched_company_profile', 'matched_mentors_json'],
    updated_at = now()
WHERE section_name = 'mentor_recommendations' AND is_active = true;

-- Update lead_list to prevent hallucination
UPDATE public.report_templates
SET prompt_body = 'You are recommending market data and leads for {{company_name}}, a {{company_stage}} {{industry_sector}} company from {{country_of_origin}} entering the Australian market.

Services needed: {{services_needed}}
Target regions: {{target_regions}}

Here are relevant data leads from our directory:
{{matched_leads_json}}

IMPORTANT: Only reference leads from the list above. Do NOT invent fictional data sources or leads.

If the list is empty, state: "We did not find matching data leads for your specific industry. We recommend browsing our Leads directory at /leads for the latest market data offerings."

For each matched lead, explain its relevance to {{company_name}}''s market research needs.

Use ### for subsection headings and bullet points for recommendations.',
    variables = ARRAY['company_name', 'company_stage', 'industry_sector', 'country_of_origin', 'services_needed', 'target_regions', 'matched_leads_json'],
    updated_at = now()
WHERE section_name = 'lead_list' AND is_active = true;