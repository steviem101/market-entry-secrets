-- Update service_providers template to prevent hallucination
UPDATE public.report_templates
SET prompt_body = E'Based on the following matched service providers from our vetted directory:\n\n{{matched_providers_json}}\n\nIMPORTANT: ONLY recommend providers from the list above. Do NOT invent or hallucinate any additional providers. If the list is empty or contains no relevant matches, clearly state: "We did not find matching service providers in our directory for your specific needs. Browse our full directory at /service-providers to discover providers that may help."\n\nFor each provider in the list, write a brief recommendation paragraph explaining why they are relevant to {{company_name}}''s market entry needs. The company needs these services: {{services_needed}}.\n\nFor each provider include: provider name, their category/speciality, and a 2-sentence recommendation explaining relevance. Format as a numbered list.',
    updated_at = now()
WHERE id = '93b36356-13aa-45ed-94e2-6192b24da21a';

-- Update events_resources template to handle past events correctly
UPDATE public.report_templates
SET prompt_body = E'Based on these events and content resources from our directory:\n\nEvents: {{matched_events_json}}\nContent/Guides: {{matched_content_json}}\n\nIMPORTANT: ONLY reference events and content from the lists above. Do NOT invent or hallucinate any events or resources that are not in these lists. Note that some events listed may have past dates — these represent recurring events in our directory. Mention that users should check for upcoming editions.\n\nIf the events list is empty, state: "No matching events found in our directory. Browse our full events calendar at /events for upcoming opportunities."\n\nCurate a "Next Steps" section for {{company_name}} ({{industry_sector}}, targeting {{target_regions}}) with:\n1. Recommended events to attend (or watch for upcoming editions) with brief explanation of relevance\n2. Guides and case studies to read with brief explanation of relevance\n\nFormat with clear headers for Events and Resources sections.',
    updated_at = now()
WHERE id = 'c73616da-2d6c-4927-a8c5-de37c6fa7b68';

-- Update mentor_recommendations template to prevent hallucination
UPDATE public.report_templates
SET prompt_body = E'Based on these matched mentors and community experts from our network:\n\n{{matched_mentors_json}}\n\nIMPORTANT: ONLY recommend mentors from the list above. Do NOT invent or hallucinate any additional mentors. If the list is empty, state: "We did not find matching mentors in our community for your specific needs. Browse our community directory at /community to find experts who may help."\n\nWrite a recommendation for each mentor, explaining their relevance to {{company_name}}, a {{industry_sector}} company from {{country_of_origin}} entering {{target_regions}}.\n\nInclude their expertise area, location, and why the user should connect with them. Format as a numbered list with name, expertise, and recommendation.',
    updated_at = now()
WHERE id = 'b8dc3160-a593-4dc5-a02d-c640d1cee721';

-- Update lead_list template to prevent hallucination
UPDATE public.report_templates
SET prompt_body = E'Based on these matched leads and market data from our database:\n\n{{matched_leads_json}}\n\nIMPORTANT: ONLY reference leads from the list above. Do NOT invent any additional leads or datasets.\n\nIf the list is empty, state: "No matching leads found in our database for your industry. Browse our leads directory at /leads to discover relevant market data."\n\nCreate a curated lead list summary for {{company_name}} ({{industry_sector}}) entering {{target_regions}}. For each lead/dataset:\n- Name and category\n- Why it is relevant to the company''s market entry\n- Recommended next step\n\nAlso suggest 2-3 additional lead generation strategies specific to {{industry_sector}} in Australia.',
    updated_at = now()
WHERE id = '6ea4b962-5ed5-45b1-8ba2-11c8bc62d82b';